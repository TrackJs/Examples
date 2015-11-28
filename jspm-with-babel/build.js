"format global";
(function(global) {

  var defined = {};

  // indexOf polyfill for IE8
  var indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++)
      if (this[i] === item)
        return i;
    return -1;
  }

  var getOwnPropertyDescriptor = true;
  try {
    Object.getOwnPropertyDescriptor({ a: 0 }, 'a');
  }
  catch(e) {
    getOwnPropertyDescriptor = false;
  }

  var defineProperty;
  (function () {
    try {
      if (!!Object.defineProperty({}, 'a', {}))
        defineProperty = Object.defineProperty;
    }
    catch (e) {
      defineProperty = function(obj, prop, opt) {
        try {
          obj[prop] = opt.value || opt.get.call(obj);
        }
        catch(e) {}
      }
    }
  })();

  function register(name, deps, declare) {
    if (arguments.length === 4)
      return registerDynamic.apply(this, arguments);
    doRegister(name, {
      declarative: true,
      deps: deps,
      declare: declare
    });
  }

  function registerDynamic(name, deps, executingRequire, execute) {
    doRegister(name, {
      declarative: false,
      deps: deps,
      executingRequire: executingRequire,
      execute: execute
    });
  }

  function doRegister(name, entry) {
    entry.name = name;

    // we never overwrite an existing define
    if (!(name in defined))
      defined[name] = entry;

    // we have to normalize dependencies
    // (assume dependencies are normalized for now)
    // entry.normalizedDeps = entry.deps.map(normalize);
    entry.normalizedDeps = entry.deps;
  }


  function buildGroups(entry, groups) {
    groups[entry.groupIndex] = groups[entry.groupIndex] || [];

    if (indexOf.call(groups[entry.groupIndex], entry) != -1)
      return;

    groups[entry.groupIndex].push(entry);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = defined[depName];

      // not in the registry means already linked / ES6
      if (!depEntry || depEntry.evaluated)
        continue;

      // now we know the entry is in our unlinked linkage group
      var depGroupIndex = entry.groupIndex + (depEntry.declarative != entry.declarative);

      // the group index of an entry is always the maximum
      if (depEntry.groupIndex === undefined || depEntry.groupIndex < depGroupIndex) {

        // if already in a group, remove from the old group
        if (depEntry.groupIndex !== undefined) {
          groups[depEntry.groupIndex].splice(indexOf.call(groups[depEntry.groupIndex], depEntry), 1);

          // if the old group is empty, then we have a mixed depndency cycle
          if (groups[depEntry.groupIndex].length == 0)
            throw new TypeError("Mixed dependency cycle detected");
        }

        depEntry.groupIndex = depGroupIndex;
      }

      buildGroups(depEntry, groups);
    }
  }

  function link(name) {
    var startEntry = defined[name];

    startEntry.groupIndex = 0;

    var groups = [];

    buildGroups(startEntry, groups);

    var curGroupDeclarative = !!startEntry.declarative == groups.length % 2;
    for (var i = groups.length - 1; i >= 0; i--) {
      var group = groups[i];
      for (var j = 0; j < group.length; j++) {
        var entry = group[j];

        // link each group
        if (curGroupDeclarative)
          linkDeclarativeModule(entry);
        else
          linkDynamicModule(entry);
      }
      curGroupDeclarative = !curGroupDeclarative; 
    }
  }

  // module binding records
  var moduleRecords = {};
  function getOrCreateModuleRecord(name) {
    return moduleRecords[name] || (moduleRecords[name] = {
      name: name,
      dependencies: [],
      exports: {}, // start from an empty module and extend
      importers: []
    })
  }

  function linkDeclarativeModule(entry) {
    // only link if already not already started linking (stops at circular)
    if (entry.module)
      return;

    var module = entry.module = getOrCreateModuleRecord(entry.name);
    var exports = entry.module.exports;

    var declaration = entry.declare.call(global, function(name, value) {
      module.locked = true;

      if (typeof name == 'object') {
        for (var p in name)
          exports[p] = name[p];
      }
      else {
        exports[name] = value;
      }

      for (var i = 0, l = module.importers.length; i < l; i++) {
        var importerModule = module.importers[i];
        if (!importerModule.locked) {
          for (var j = 0; j < importerModule.dependencies.length; ++j) {
            if (importerModule.dependencies[j] === module) {
              importerModule.setters[j](exports);
            }
          }
        }
      }

      module.locked = false;
      return value;
    });

    module.setters = declaration.setters;
    module.execute = declaration.execute;

    // now link all the module dependencies
    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      var depEntry = defined[depName];
      var depModule = moduleRecords[depName];

      // work out how to set depExports based on scenarios...
      var depExports;

      if (depModule) {
        depExports = depModule.exports;
      }
      else if (depEntry && !depEntry.declarative) {
        depExports = depEntry.esModule;
      }
      // in the module registry
      else if (!depEntry) {
        depExports = load(depName);
      }
      // we have an entry -> link
      else {
        linkDeclarativeModule(depEntry);
        depModule = depEntry.module;
        depExports = depModule.exports;
      }

      // only declarative modules have dynamic bindings
      if (depModule && depModule.importers) {
        depModule.importers.push(module);
        module.dependencies.push(depModule);
      }
      else
        module.dependencies.push(null);

      // run the setter for this dependency
      if (module.setters[i])
        module.setters[i](depExports);
    }
  }

  // An analog to loader.get covering execution of all three layers (real declarative, simulated declarative, simulated dynamic)
  function getModule(name) {
    var exports;
    var entry = defined[name];

    if (!entry) {
      exports = load(name);
      if (!exports)
        throw new Error("Unable to load dependency " + name + ".");
    }

    else {
      if (entry.declarative)
        ensureEvaluated(name, []);

      else if (!entry.evaluated)
        linkDynamicModule(entry);

      exports = entry.module.exports;
    }

    if ((!entry || entry.declarative) && exports && exports.__useDefault)
      return exports['default'];

    return exports;
  }

  function linkDynamicModule(entry) {
    if (entry.module)
      return;

    var exports = {};

    var module = entry.module = { exports: exports, id: entry.name };

    // AMD requires execute the tree first
    if (!entry.executingRequire) {
      for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
        var depName = entry.normalizedDeps[i];
        var depEntry = defined[depName];
        if (depEntry)
          linkDynamicModule(depEntry);
      }
    }

    // now execute
    entry.evaluated = true;
    var output = entry.execute.call(global, function(name) {
      for (var i = 0, l = entry.deps.length; i < l; i++) {
        if (entry.deps[i] != name)
          continue;
        return getModule(entry.normalizedDeps[i]);
      }
      throw new TypeError('Module ' + name + ' not declared as a dependency.');
    }, exports, module);

    if (output)
      module.exports = output;

    // create the esModule object, which allows ES6 named imports of dynamics
    exports = module.exports;
 
    if (exports && exports.__esModule) {
      entry.esModule = exports;
    }
    else {
      entry.esModule = {};
      
      // don't trigger getters/setters in environments that support them
      if (typeof exports == 'object' || typeof exports == 'function') {
        if (getOwnPropertyDescriptor) {
          var d;
          for (var p in exports)
            if (d = Object.getOwnPropertyDescriptor(exports, p))
              defineProperty(entry.esModule, p, d);
        }
        else {
          var hasOwnProperty = exports && exports.hasOwnProperty;
          for (var p in exports) {
            if (!hasOwnProperty || exports.hasOwnProperty(p))
              entry.esModule[p] = exports[p];
          }
         }
       }
      entry.esModule['default'] = exports;
      defineProperty(entry.esModule, '__useDefault', {
        value: true
      });
    }
  }

  /*
   * Given a module, and the list of modules for this current branch,
   *  ensure that each of the dependencies of this module is evaluated
   *  (unless one is a circular dependency already in the list of seen
   *  modules, in which case we execute it)
   *
   * Then we evaluate the module itself depth-first left to right 
   * execution to match ES6 modules
   */
  function ensureEvaluated(moduleName, seen) {
    var entry = defined[moduleName];

    // if already seen, that means it's an already-evaluated non circular dependency
    if (!entry || entry.evaluated || !entry.declarative)
      return;

    // this only applies to declarative modules which late-execute

    seen.push(moduleName);

    for (var i = 0, l = entry.normalizedDeps.length; i < l; i++) {
      var depName = entry.normalizedDeps[i];
      if (indexOf.call(seen, depName) == -1) {
        if (!defined[depName])
          load(depName);
        else
          ensureEvaluated(depName, seen);
      }
    }

    if (entry.evaluated)
      return;

    entry.evaluated = true;
    entry.module.execute.call(global);
  }

  // magical execution function
  var modules = {};
  function load(name) {
    if (modules[name])
      return modules[name];

    // node core modules
    if (name.substr(0, 6) == '@node/')
      return require(name.substr(6));

    var entry = defined[name];

    // first we check if this module has already been defined in the registry
    if (!entry)
      throw "Module " + name + " not present.";

    // recursively ensure that the module and all its 
    // dependencies are linked (with dependency group handling)
    link(name);

    // now handle dependency execution in correct order
    ensureEvaluated(name, []);

    // remove from the registry
    defined[name] = undefined;

    // exported modules get __esModule defined for interop
    if (entry.declarative)
      defineProperty(entry.module.exports, '__esModule', { value: true });

    // return the defined module object
    return modules[name] = entry.declarative ? entry.module.exports : entry.esModule;
  };

  return function(mains, depNames, declare) {
    return function(formatDetect) {
      formatDetect(function(deps) {
        var System = {
          _nodeRequire: typeof require != 'undefined' && require.resolve && typeof process != 'undefined' && require,
          register: register,
          registerDynamic: registerDynamic,
          get: load, 
          set: function(name, module) {
            modules[name] = module; 
          },
          newModule: function(module) {
            return module;
          }
        };
        System.set('@empty', {});

        // register external dependencies
        for (var i = 0; i < depNames.length; i++) (function(depName, dep) {
          if (dep && dep.__esModule)
            System.register(depName, [], function(_export) {
              return {
                setters: [],
                execute: function() {
                  for (var p in dep)
                    if (p != '__esModule' && !(typeof p == 'object' && p + '' == 'Module'))
                      _export(p, dep[p]);
                }
              };
            });
          else
            System.registerDynamic(depName, [], false, function() {
              return dep;
            });
        })(depNames[i], arguments[i]);

        // register modules in this bundle
        declare(System);

        // load mains
        var firstLoad = load(mains[0]);
        if (mains.length > 1)
          for (var i = 1; i < mains.length; i++)
            load(mains[i]);

        if (firstLoad.__useDefault)
          return firstLoad['default'];
        else
          return firstLoad;
      });
    };
  };

})(typeof self != 'undefined' ? self : global)
/* (['mainModule'], ['external-dep'], function($__System) {
  System.register(...);
})
(function(factory) {
  if (typeof define && define.amd)
    define(['external-dep'], factory);
  // etc UMD / module pattern
})*/

(['1'], [], function($__System) {

(function(__global) {
  var loader = $__System;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++)
      if (this[i] === item)
        return i;
    return -1;
  }

  function readMemberExpression(p, value) {
    var pParts = p.split('.');
    while (pParts.length)
      value = value[pParts.shift()];
    return value;
  }

  // bare minimum ignores for IE8
  var ignoredGlobalProps = ['_g', 'sessionStorage', 'localStorage', 'clipboardData', 'frames', 'external', 'mozAnimationStartTime', 'webkitStorageInfo', 'webkitIndexedDB'];

  var globalSnapshot;

  function forEachGlobal(callback) {
    if (Object.keys)
      Object.keys(__global).forEach(callback);
    else
      for (var g in __global) {
        if (!hasOwnProperty.call(__global, g))
          continue;
        callback(g);
      }
  }

  function forEachGlobalValue(callback) {
    forEachGlobal(function(globalName) {
      if (indexOf.call(ignoredGlobalProps, globalName) != -1)
        return;
      try {
        var value = __global[globalName];
      }
      catch (e) {
        ignoredGlobalProps.push(globalName);
      }
      callback(globalName, value);
    });
  }

  loader.set('@@global-helpers', loader.newModule({
    prepareGlobal: function(moduleName, exportName, globals) {
      // disable module detection
      var curDefine = __global.define;
       
      __global.define = undefined;
      __global.exports = undefined;
      if (__global.module && __global.module.exports)
        __global.module = undefined;

      // set globals
      var oldGlobals;
      if (globals) {
        oldGlobals = {};
        for (var g in globals) {
          oldGlobals[g] = globals[g];
          __global[g] = globals[g];
        }
      }

      // store a complete copy of the global object in order to detect changes
      if (!exportName) {
        globalSnapshot = {};

        forEachGlobalValue(function(name, value) {
          globalSnapshot[name] = value;
        });
      }

      // return function to retrieve global
      return function() {
        var globalValue;

        if (exportName) {
          globalValue = readMemberExpression(exportName, __global);
        }
        else {
          var singleGlobal;
          var multipleExports;
          var exports = {};

          forEachGlobalValue(function(name, value) {
            if (globalSnapshot[name] === value)
              return;
            if (typeof value == 'undefined')
              return;
            exports[name] = value;

            if (typeof singleGlobal != 'undefined') {
              if (!multipleExports && singleGlobal !== value)
                multipleExports = true;
            }
            else {
              singleGlobal = value;
            }
          });
          globalValue = multipleExports ? exports : singleGlobal;
        }

        // revert globals
        if (oldGlobals) {
          for (var g in oldGlobals)
            __global[g] = oldGlobals[g];
        }
        __global.define = curDefine;

        return globalValue;
      };
    }
  }));

})(typeof self != 'undefined' ? self : global);

$__System.registerDynamic("2", [], false, function(__require, __exports, __module) {
  var _retrieveGlobal = $__System.get("@@global-helpers").prepareGlobal(__module.id, null, null);
  (function() {
    window._trackJs = {token: "eric"};
  })();
  return _retrieveGlobal();
});

$__System.registerDynamic("3", [], true, function(req, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  "format cjs";
  (function(h, q, k) {
    "use awesome";
    if (h.trackJs)
      h.console && h.console.warn && h.console.warn("TrackJS global conflict");
    else {
      var l = function(a, b, c, d, e) {
        this.util = a;
        this.onError = b;
        this.onFault = c;
        this.options = e;
        e.enabled && this.initialize(d);
      };
      l.prototype = {
        initialize: function(a) {
          a.addEventListener && (this.wrapAndCatch(a.Element.prototype, "addEventListener", 1), this.wrapAndCatch(a.XMLHttpRequest.prototype, "addEventListener", 1), this.wrapRemoveEventListener(a.Element.prototype), this.wrapRemoveEventListener(a.XMLHttpRequest.prototype));
          this.wrapAndCatch(a, "setTimeout", 0);
          this.wrapAndCatch(a, "setInterval", 0);
        },
        wrapAndCatch: function(a, b, c) {
          var d = this,
              e = a[b];
          d.util.hasFunction(e, "apply") && (a[b] = function() {
            try {
              var f = Array.prototype.slice.call(arguments),
                  g = f[c],
                  v,
                  h;
              if (d.options.bindStack)
                try {
                  throw Error();
                } catch (k) {
                  h = k.stack, v = d.util.isoNow();
                }
              if ("addEventListener" === b && (this._trackJsEvt || (this._trackJsEvt = new m), this._trackJsEvt.getWrapped(f[0], g, f[2])))
                return;
              g && d.util.hasFunction(g, "apply") && (f[c] = function() {
                try {
                  return g.apply(this, arguments);
                } catch (a) {
                  throw d.onError("catch", a, {
                    bindTime: v,
                    bindStack: h
                  }), d.util.wrapError(a);
                }
              }, "addEventListener" === b && this._trackJsEvt.add(f[0], g, f[2], f[c]));
              return e.apply(this, f);
            } catch (l) {
              a[b] = e, d.onFault(l);
            }
          });
        },
        wrapRemoveEventListener: function(a) {
          if (a && a.removeEventListener && this.util.hasFunction(a.removeEventListener, "call")) {
            var b = a.removeEventListener;
            a.removeEventListener = function(a, d, e) {
              if (this._trackJsEvt) {
                var f = this._trackJsEvt.getWrapped(a, d, e);
                f && this._trackJsEvt.remove(a, d, e);
                return b.call(this, a, f, e);
              }
              return b.call(this, a, d, e);
            };
          }
        }
      };
      var m = function() {
        this.events = [];
      };
      m.prototype = {
        add: function(a, b, c, d) {
          -1 >= this.indexOf(a, b, c) && this.events.push([a, b, !!c, d]);
        },
        remove: function(a, b, c) {
          a = this.indexOf(a, b, !!c);
          0 <= a && this.events.splice(a, 1);
        },
        getWrapped: function(a, b, c) {
          a = this.indexOf(a, b, !!c);
          return 0 <= a ? this.events[a][3] : k;
        },
        indexOf: function(a, b, c) {
          for (var d = 0; d < this.events.length; d++)
            if (this.events[d][0] === a && this.events[d][1] === b && this.events[d][2] === !!c)
              return d;
          return -1;
        }
      };
      var u = function(a, b) {
        this.util = a;
        this.initCurrent(b);
      };
      u.prototype = {
        current: {},
        initOnly: {
          application: "",
          enabled: !0,
          token: !0,
          callback: {enabled: !0},
          console: {enabled: !0},
          network: {enabled: !0},
          visitor: {enabled: !0},
          window: {enabled: !0}
        },
        defaults: {
          application: "",
          enabled: !0,
          onError: function() {
            return !0;
          },
          serialize: function(a) {
            return a === k ? "undefined" : null === a ? "null" : "number" === typeof a && isNaN(a) ? "NaN" : "" === a ? "Empty String" : 0 === a ? "0" : !1 === a ? "false" : a && a.toString ? a.toString() : "unknown";
          },
          sessionId: "",
          token: "",
          userId: "",
          version: "",
          callback: {
            enabled: !0,
            bindStack: !1
          },
          console: {
            enabled: !0,
            display: !0,
            error: !0,
            watch: ["log", "debug", "info", "warn", "error"]
          },
          network: {
            enabled: !0,
            error: !0
          },
          visitor: {enabled: !0},
          window: {enabled: !0}
        },
        initCurrent: function(a) {
          if (this.validate(a, this.defaults, "config", {}))
            return this.current = this.util.extend(this.current, this.defaults, a), !0;
          this.current = this.util.extend(this.current, this.defaults);
          return !1;
        },
        setCurrent: function(a) {
          return this.validate(a, this.defaults, "config", this.initOnly) ? (this.current = this.util.extend(this.current, a), !0) : !1;
        },
        validate: function(a, b, c, d) {
          var e = !0;
          c = c || "";
          d = d || {};
          for (var f in a)
            if (a.hasOwnProperty(f))
              if (b.hasOwnProperty(f)) {
                var g = typeof b[f];
                g !== typeof a[f] ? (console.warn(c + "." + f + ": property must be type " + g + "."), e = !1) : "[object Array]" !== Object.prototype.toString.call(a[f]) || this.validateArray(a[f], b[f], c + "." + f) ? "[object Object]" === Object.prototype.toString.call(a[f]) ? e = this.validate(a[f], b[f], c + "." + f, d[f]) : d.hasOwnProperty(f) && (console.warn(c + "." + f + ": property cannot be set after load."), e = !1) : e = !1;
              } else
                console.warn(c + "." + f + ": property not supported."), e = !1;
          return e;
        },
        validateArray: function(a, b, c) {
          var d = !0;
          c = c || "";
          for (var e = 0; e < a.length; e++)
            this.util.contains(b, a[e]) || (console.warn(c + "[" + e + "]: invalid value: " + a[e] + "."), d = !1);
          return d;
        }
      };
      var r = function(a, b, c, d, e, f, g) {
        this.util = a;
        this.log = b;
        this.onError = c;
        this.onFault = d;
        this.serialize = e;
        g.enabled && (f.console = this.wrapConsoleObject(f.console, g));
      };
      r.prototype = {
        wrapConsoleObject: function(a, b) {
          a = a || {};
          var c = a.log || function() {},
              d = this,
              e;
          for (e = 0; e < b.watch.length; e++)
            (function(e) {
              var g = a[e] || c;
              a[e] = function() {
                try {
                  var a = Array.prototype.slice.call(arguments);
                  d.log.add("c", {
                    timestamp: d.util.isoNow(),
                    severity: e,
                    message: d.serialize(a)
                  });
                  if (b.error && "error" === e)
                    try {
                      throw Error(d.serialize(a));
                    } catch (c) {
                      d.onError("console", c);
                    }
                  b.display && (d.util.hasFunction(g, "apply") ? g.apply(this, a) : g(a[0], a[1], a[2]));
                } catch (h) {
                  d.onFault(h);
                }
              };
            })(b.watch[e]);
          return a;
        },
        report: function() {
          return this.log.all("c");
        }
      };
      var s = function(a, b, c, d, e) {
        this.config = a;
        this.util = b;
        this.log = c;
        this.window = d;
        this.document = e;
        this.correlationId = this.token = null;
        this.initialize();
      };
      s.prototype = {
        initialize: function() {
          this.token = this.getCustomerToken();
          this.correlationId = this.getCorrelationId();
        },
        getCustomerToken: function() {
          if (this.config.current.token)
            return this.config.current.token;
          var a = this.document.getElementsByTagName("script");
          return a[a.length - 1].getAttribute("data-token");
        },
        getCorrelationId: function() {
          var a;
          try {
            a = this.document.cookie.replace(/(?:(?:^|.*;\s*)TrackJS\s*\=\s*([^;]*).*$)|^.*$/, "$1"), a || (a = this.util.uuid(), this.document.cookie = "TrackJS=" + a + "; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/");
          } catch (b) {
            a = this.util.uuid();
          }
          return a;
        },
        report: function() {
          return {
            application: this.config.current.application,
            correlationId: this.correlationId,
            sessionId: this.config.current.sessionId,
            token: this.token,
            userId: this.config.current.userId,
            version: this.config.current.version
          };
        }
      };
      var t = function(a) {
        this.loadedOn = (new Date).getTime();
        this.window = a;
      };
      t.prototype = {
        discoverDependencies: function() {
          var a,
              b = {};
          this.window.jQuery && (this.window.jQuery.fn && this.window.jQuery.fn.jquery) && (b.jQuery = this.window.jQuery.fn.jquery);
          this.window.jQuery && (this.window.jQuery.ui && this.window.jQuery.ui.version) && (b.jQueryUI = this.window.jQuery.ui.version);
          this.window.angular && (this.window.angular.version && this.window.angular.version.full) && (b.angular = this.window.angular.version.full);
          for (a in this.window)
            if ("_trackJs" !== a && "_trackJS" !== a && "_trackjs" !== a && "webkitStorageInfo" !== a && "webkitIndexedDB" !== a && "top" !== a && "parent" !== a && "frameElement" !== a)
              try {
                if (this.window[a]) {
                  var c = this.window[a].version || this.window[a].Version || this.window[a].VERSION;
                  "string" === typeof c && (b[a] = c);
                }
              } catch (d) {}
          return b;
        },
        report: function() {
          return {
            age: (new Date).getTime() - this.loadedOn,
            dependencies: this.discoverDependencies(),
            userAgent: this.window.navigator.userAgent,
            viewportHeight: this.window.document.documentElement.clientHeight,
            viewportWidth: this.window.document.documentElement.clientWidth
          };
        }
      };
      var w = function(a) {
        this.util = a;
        this.appender = [];
        this.maxLength = 30;
      };
      w.prototype = {
        all: function(a) {
          var b = [],
              c,
              d;
          for (d = 0; d < this.appender.length; d++)
            (c = this.appender[d]) && c.category === a && b.push(c.value);
          return b;
        },
        clear: function() {
          this.appender.length = 0;
        },
        truncate: function() {
          this.appender.length > this.maxLength && (this.appender = this.appender.slice(Math.max(this.appender.length - this.maxLength, 0)));
        },
        add: function(a, b) {
          var c = this.util.uuid();
          this.appender.push({
            key: c,
            category: a,
            value: b
          });
          this.truncate();
          return c;
        },
        get: function(a, b) {
          var c,
              d;
          for (d = 0; d < this.appender.length; d++)
            if (c = this.appender[d], c.category === a && c.key === b)
              return c.value;
          return !1;
        }
      };
      var x = function(a, b, c, d, e, f) {
        this.util = a;
        this.log = b;
        this.onError = c;
        this.onFault = d;
        this.window = e;
        this.options = f;
        f.enabled && this.initialize(e);
      };
      x.prototype = {
        initialize: function(a) {
          a.XMLHttpRequest && this.util.hasFunction(a.XMLHttpRequest.prototype.open, "apply") && this.watchNetworkObject(a.XMLHttpRequest);
          a.XDomainRequest && this.util.hasFunction(a.XDomainRequest.prototype.open, "apply") && this.watchNetworkObject(a.XDomainRequest);
        },
        watchNetworkObject: function(a) {
          var b = this,
              c = a.prototype.open,
              d = a.prototype.send;
          a.prototype.open = function(a, b) {
            0 > b.indexOf("localhost:0") && (this._trackJs = {
              method: a,
              url: b
            });
            return c.apply(this, arguments);
          };
          a.prototype.send = function() {
            try {
              if (!this._trackJs)
                return d.apply(this, arguments);
              this._trackJs.logId = b.log.add("n", {
                startedOn: b.util.isoNow(),
                method: this._trackJs.method,
                url: this._trackJs.url
              });
              b.listenForNetworkComplete(this);
            } catch (a) {
              b.onFault(a);
            }
            return d.apply(this, arguments);
          };
          return a;
        },
        listenForNetworkComplete: function(a) {
          var b = this;
          b.window.ProgressEvent && a.addEventListener && a.addEventListener("readystatechange", function() {
            4 === a.readyState && b.finalizeNetworkEvent(a);
          }, !0);
          a.addEventListener ? a.addEventListener("load", function() {
            b.finalizeNetworkEvent(a);
            b.checkNetworkFault(a);
          }, !0) : setTimeout(function() {
            try {
              var c = a.onload;
              a.onload = function() {
                b.finalizeNetworkEvent(a);
                b.checkNetworkFault(a);
                "function" === typeof c && b.util.hasFunction(c, "apply") && c.apply(a, arguments);
              };
              var d = a.onerror;
              a.onerror = function() {
                b.finalizeNetworkEvent(a);
                b.checkNetworkFault(a);
                "function" === typeof oldOnError && d.apply(a, arguments);
              };
            } catch (e) {
              b.onFault(e);
            }
          }, 0);
        },
        finalizeNetworkEvent: function(a) {
          if (a._trackJs) {
            var b = this.log.get("n", a._trackJs.logId);
            b && (b.completedOn = this.util.isoNow(), b.statusCode = 1223 == a.status ? 204 : a.status, b.statusText = 1223 == a.status ? "No Content" : a.statusText);
          }
        },
        checkNetworkFault: function(a) {
          if (this.options.error && 400 <= a.status && 1223 != a.status) {
            var b = a._trackJs || {};
            this.onError("ajax", a.status + " " + a.statusText + ": " + b.method + " " + b.url);
          }
        },
        report: function() {
          return this.log.all("n");
        }
      };
      var n = function(a) {
        this.util = a;
        this.disabled = !1;
        this.throttleStats = {
          attemptCount: 0,
          throttledCount: 0,
          lastAttempt: (new Date).getTime()
        };
        h.JSON && h.JSON.stringify || (this.disabled = !0);
      };
      n.prototype = {
        errorEndpoint: function(a) {
          var b = "https://capture.trackjs.com/capture";
          this.util.testCrossdomainXhr() || -1 !== h.location.protocol.indexOf("https") || (b = "http://capture.trackjs.com/capture");
          return b + "?token=" + a;
        },
        usageEndpoint: function(a) {
          return this.appendObjectAsQuery(a, "https://usage.trackjs.com/usage.gif");
        },
        trackerFaultEndpoint: function(a) {
          return this.appendObjectAsQuery(a, "https://usage.trackjs.com/fault.gif");
        },
        appendObjectAsQuery: function(a, b) {
          b += "?";
          for (var c in a)
            a.hasOwnProperty(c) && (b += encodeURIComponent(c) + "=" + encodeURIComponent(a[c]) + "&");
          return b;
        },
        getCORSRequest: function(a, b) {
          var c;
          this.util.testCrossdomainXhr() ? (c = new h.XMLHttpRequest, c.open(a, b), c.setRequestHeader("Content-Type", "text/plain")) : "undefined" !== typeof h.XDomainRequest ? (c = new h.XDomainRequest, c.open(a, b)) : c = null;
          return c;
        },
        sendTrackerFault: function(a) {
          this.throttle(a) || ((new Image).src = this.trackerFaultEndpoint(a));
        },
        sendUsage: function(a) {
          (new Image).src = this.usageEndpoint(a);
        },
        sendError: function(a, b) {
          var c = this;
          if (!this.disabled && !this.throttle(a))
            try {
              var d = this.getCORSRequest("POST", this.errorEndpoint(b));
              d.onreadystatechange = function() {
                4 === d.readyState && 200 !== d.status && (c.disabled = !0);
              };
              d._trackJs = k;
              d.send(h.JSON.stringify(a));
            } catch (e) {
              throw this.disabled = !0, e;
            }
        },
        throttle: function(a) {
          var b = (new Date).getTime();
          this.throttleStats.attemptCount++;
          if (this.throttleStats.lastAttempt + 1E3 >= b) {
            if (this.throttleStats.lastAttempt = b, 10 < this.throttleStats.attemptCount)
              return this.throttleStats.throttledCount++, !0;
          } else
            a.throttled = this.throttleStats.throttledCount, this.throttleStats.attemptCount = 0, this.throttleStats.lastAttempt = b, this.throttleStats.throttledCount = 0;
          return !1;
        }
      };
      var y = function(a) {
        this.window = a;
      };
      y.prototype = {
        bind: function(a, b) {
          return function() {
            return a.apply(b, Array.prototype.slice.call(arguments));
          };
        },
        contains: function(a, b) {
          var c;
          for (c = 0; c < a.length; c++)
            if (a[c] === b)
              return !0;
          return !1;
        },
        defer: function(a, b) {
          setTimeout(function() {
            a.apply(b);
          });
        },
        extend: function(a) {
          for (var b,
              c = Array.prototype.slice.call(arguments, 1),
              d = 0; d < c.length; d++)
            for (b in c[d])
              null === c[d][b] || c[d][b] === k ? a[b] = c[d][b] : "[object Object]" === Object.prototype.toString.call(c[d][b]) ? (a[b] = a[b] || {}, this.extend(a[b], c[d][b])) : a[b] = c[d][b];
          return a;
        },
        hasFunction: function(a, b) {
          try {
            return !!a[b];
          } catch (c) {
            return !1;
          }
        },
        isBrowserIE: function() {
          var a = this.window.navigator.userAgent,
              b = a.match(/Trident\/([\d.]+)/);
          return b && "7.0" === b[1] ? 11 : (a = a.match(/MSIE ([\d.]+)/)) ? parseInt(a[1], 10) : !1;
        },
        isBrowserSupported: function() {
          var a = this.isBrowserIE();
          return !a || 8 <= a;
        },
        isoNow: function() {
          var a = new Date;
          return a.toISOString ? a.toISOString() : a.getUTCFullYear() + "-" + this.pad(a.getUTCMonth() + 1) + "-" + this.pad(a.getUTCDate()) + "T" + this.pad(a.getUTCHours()) + ":" + this.pad(a.getUTCMinutes()) + ":" + this.pad(a.getUTCSeconds()) + "." + String((a.getUTCMilliseconds() / 1E3).toFixed(3)).slice(2, 5) + "Z";
        },
        pad: function(a) {
          a = String(a);
          1 === a.length && (a = "0" + a);
          return a;
        },
        testCrossdomainXhr: function() {
          return "withCredentials" in new XMLHttpRequest;
        },
        uuid: function() {
          return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(a) {
            var b = 16 * Math.random() | 0;
            return ("x" == a ? b : b & 3 | 8).toString(16);
          });
        },
        wrapError: function(a) {
          if (a.innerError)
            return a;
          var b = Error("TrackJS Caught: " + (a.message || a));
          b.description = "TrackJS Caught: " + a.description;
          b.file = a.file;
          b.line = a.line || a.lineNumber;
          b.column = a.column || a.columnNumber;
          b.stack = a.stack;
          b.innerError = a;
          return b;
        }
      };
      var z = function(a, b, c, d, e, f) {
        this.util = a;
        this.log = b;
        this.onError = c;
        this.onFault = d;
        this.options = f;
        this.document = e;
        f.enabled && this.initialize(e);
      };
      z.prototype = {
        initialize: function(a) {
          var b = this.util.bind(this.onDocumentClicked, this),
              c = this.util.bind(this.onInputChanged, this);
          a.addEventListener ? (a.addEventListener("click", b, !0), a.addEventListener("blur", c, !0)) : a.attachEvent && (a.attachEvent("onclick", b), a.attachEvent("onfocusout", c));
        },
        onDocumentClicked: function(a) {
          try {
            var b = this.getElementFromEvent(a);
            b && b.tagName && (this.isDescribedElement(b, "a") || this.isDescribedElement(b, "button") || this.isDescribedElement(b, "input", ["button", "submit"]) ? this.writeVisitorEvent(b, "click") : this.isDescribedElement(b, "input", ["checkbox", "radio"]) && this.writeVisitorEvent(b, "input", b.value, b.checked));
          } catch (c) {
            this.onFault(c);
          }
        },
        onInputChanged: function(a) {
          try {
            var b = this.getElementFromEvent(a);
            if (b && b.tagName)
              if (this.isDescribedElement(b, "textarea"))
                this.writeVisitorEvent(b, "input", b.value);
              else if (this.isDescribedElement(b, "select") && b.options && b.options.length)
                this.onSelectInputChanged(b);
              else
                this.isDescribedElement(b, "input") && !this.isDescribedElement(b, "input", ["button", "submit", "hidden", "checkbox", "radio"]) && this.writeVisitorEvent(b, "input", b.value);
          } catch (c) {
            this.onFault(c);
          }
        },
        onSelectInputChanged: function(a) {
          if (a.multiple)
            for (var b = 0; b < a.options.length; b++)
              a.options[b].selected && this.writeVisitorEvent(a, "input", a.options[b].value);
          else
            0 <= a.selectedIndex && a.options[a.selectedIndex] && this.writeVisitorEvent(a, "input", a.options[a.selectedIndex].value);
        },
        writeVisitorEvent: function(a, b, c, d) {
          "password" === this.getElementType(a) && (c = k);
          this.log.add("v", {
            timestamp: this.util.isoNow(),
            action: b,
            element: {
              tag: a.tagName.toLowerCase(),
              attributes: this.getElementAttributes(a),
              value: this.getMetaValue(c, d)
            }
          });
        },
        getElementFromEvent: function(a) {
          return a.target || q.elementFromPoint(a.clientX, a.clientY);
        },
        isDescribedElement: function(a, b, c) {
          if (a.tagName.toLowerCase() !== b.toLowerCase())
            return !1;
          if (!c)
            return !0;
          a = this.getElementType(a);
          for (b = 0; b < c.length; b++)
            if (c[b] === a)
              return !0;
          return !1;
        },
        getElementType: function(a) {
          return (a.getAttribute("type") || "").toLowerCase();
        },
        getElementAttributes: function(a) {
          for (var b = {},
              c = 0; c < a.attributes.length; c++)
            "value" !== a.attributes[c].name.toLowerCase() && (b[a.attributes[c].name] = a.attributes[c].value);
          return b;
        },
        getMetaValue: function(a, b) {
          return a === k ? k : {
            length: a.length,
            pattern: this.matchInputPattern(a),
            checked: b
          };
        },
        matchInputPattern: function(a) {
          return "" === a ? "empty" : /^[a-z0-9!#$%&'*+=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(a) ? "email" : /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/.test(a) || /^(\d{4}[\/\-](0?[1-9]|1[012])[\/\-]0?[1-9]|[12][0-9]|3[01])$/.test(a) ? "date" : /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/.test(a) ? "usphone" : /^\s*$/.test(a) ? "whitespace" : /^\d*$/.test(a) ? "numeric" : /^[a-zA-Z]*$/.test(a) ? "alpha" : /^[a-zA-Z0-9]*$/.test(a) ? "alphanumeric" : "characters";
        },
        report: function() {
          return this.log.all("v");
        }
      };
      var A = function(a, b, c, d, e) {
        this.onError = a;
        this.onFault = b;
        this.serialize = c;
        e.enabled && this.watchWindowErrors(d);
      };
      A.prototype = {watchWindowErrors: function(a) {
          var b = this;
          a.onerror = function(a, d, e, f, g) {
            try {
              g = g || {}, g.message = g.message || b.serialize(a), g.file = g.file || b.serialize(d), g.line = g.line || parseInt(e, 10) || null, g.column = g.column || parseInt(f, 10) || null, b.onError("window", g);
            } catch (h) {
              b.onFault(h);
            }
          };
        }};
      var B = function(a, b, c, d, e, f, g, h, k, l, m, n, q, u, r, s) {
        try {
          if (this.window = r, this.document = s, this.util = new m(this.window), this.onError = this.util.bind(this.onError, this), this.onFault = this.util.bind(this.onFault, this), this.serialize = this.util.bind(this.serialize, this), this.transmitter = new l(this.util), this.config = new d(this.util, a), this.log = new h(this.util), this.api = new b(this.config, this.util, this.onError, this.serialize), this.environment = new g(this.window), this.customer = new f(this.config, this.util, this.log, this.window, this.document), this.customer.token && (this.apiConsoleWatcher = new e(this.util, this.log, this.onError, this.onFault, this.serialize, this.api, this.config.defaults.console), this.config.current.enabled && (this.windowConsoleWatcher = new e(this.util, this.log, this.onError, this.onFault, this.serialize, this.window, this.config.current.console), this.util.isBrowserSupported()))) {
            this.callbackWatcher = new c(this.util, this.onError, this.onFault, this.window, this.config.current.callback);
            this.visitorWatcher = new n(this.util, this.log, this.onError, this.onFault, this.document, this.config.current.visitor);
            this.networkWatcher = new k(this.util, this.log, this.onError, this.onFault, this.window, this.config.current.network);
            this.windowWatcher = new q(this.onError, this.onFault, this.serialize, this.window, this.config.current.window);
            var p = this;
            setTimeout(function() {
              p.transmitter.sendUsage({
                token: p.customer.token,
                correlationId: p.customer.correlationId,
                application: p.config.current.application,
                x: p.util.uuid()
              });
            }, 1E3);
          }
        } catch (t) {
          this.onFault(t);
        }
      };
      B.prototype = {
        reveal: function() {
          if (this.customer.token)
            return this.api;
          this.window.console && this.window.console.warn && this.window.console.warn("TrackJS could not find a token");
          return k;
        },
        onError: function() {
          var a = !1;
          return function(b, c, d) {
            if (this.util.isBrowserSupported() && this.config.current.enabled)
              try {
                c = c || {};
                d = d || {
                  bindStack: null,
                  bindTime: null,
                  force: !1
                };
                var e = c.message || this.serialize(c, d.force);
                if (e && e.indexOf) {
                  if (-1 !== e.indexOf("TrackJS Caught"))
                    return;
                  if (a && -1 !== e.indexOf("Script error")) {
                    a = !1;
                    return;
                  }
                }
                var f = this.util.extend({}, {
                  bindStack: d.bindStack,
                  bindTime: d.bindTime,
                  column: c.column || c.columnNumber,
                  console: this.windowConsoleWatcher.report(),
                  customer: this.customer.report(),
                  entry: b,
                  environment: this.environment.report(),
                  file: c.file || c.fileName,
                  line: c.line || c.lineNumber,
                  message: e,
                  network: this.networkWatcher.report(),
                  url: (h.location || "").toString(),
                  stack: c.stack,
                  timestamp: this.util.isoNow(),
                  visitor: this.visitorWatcher.report(),
                  version: "2.1.14"
                });
                if (!d.force)
                  try {
                    if (!this.config.current.onError(f, c))
                      return;
                  } catch (g) {
                    f.console.push({
                      timestamp: this.util.isoNow(),
                      severity: "error",
                      message: g.message
                    });
                    var k = this;
                    setTimeout(function() {
                      k.onError("catch", g, {force: !0});
                    }, 0);
                  }
                this.log.clear();
                setTimeout(function() {
                  a = !1;
                });
                a = !0;
                this.transmitter.sendError(f, this.customer.token);
              } catch (l) {
                console.log(l), this.onFault(l);
              }
          };
        }(),
        onFault: function(a) {
          var b = this.transmitter || new n;
          a = a || {};
          a = {
            token: this.customer.token,
            file: a.file || a.fileName,
            msg: a.message || "unknown",
            stack: (a.stack || "unknown").substr(0, 500),
            url: this.window.location,
            v: "2.1.14",
            x: this.util.uuid()
          };
          b.sendTrackerFault(a);
        },
        serialize: function(a, b) {
          if (this.config.current.serialize && !b)
            try {
              return this.config.current.serialize(a);
            } catch (c) {
              this.onError("catch", c, {force: !0});
            }
          return this.config.defaults.serialize(a);
        }
      };
      l = new B(h._trackJs || h._trackJS || h._trackjs || {}, function(a, b, c, d) {
        return {
          attempt: function(a, d) {
            try {
              var g = Array.prototype.slice.call(arguments, 2);
              return a.apply(d || this, g);
            } catch (h) {
              throw c("catch", h), b.wrapError(h);
            }
          },
          configure: function(b) {
            return a.setCurrent(b);
          },
          track: function(a) {
            a = a || {};
            if (!a.stack)
              try {
                throw Error(d(a));
              } catch (b) {
                a = b;
              }
            c("direct", a);
          },
          watch: function(a, d) {
            return function() {
              try {
                var g = Array.prototype.slice.call(arguments, 0);
                return a.apply(d || this, g);
              } catch (h) {
                throw c("catch", h), b.wrapError(h);
              }
            };
          },
          watchAll: function(a) {
            var d = Array.prototype.slice.call(arguments, 1),
                g;
            for (g in a)
              "function" === typeof a[g] && (b.contains(d, g) || function() {
                var d = a[g];
                a[g] = function() {
                  try {
                    var a = Array.prototype.slice.call(arguments, 0);
                    return d.apply(this, a);
                  } catch (e) {
                    throw c("catch", e), b.wrapError(e);
                  }
                };
              }());
            return a;
          },
          version: "2.1.14"
        };
      }, l, u, r, s, t, w, x, n, y, z, A, m, h, q);
      h.trackJs = l.reveal();
    }
  })(window, document);
  global.define = __define;
  return module.exports;
});

$__System.registerDynamic("4", ["3"], true, function(req, exports, module) {
  ;
  var global = this,
      __define = global.define;
  global.define = undefined;
  module.exports = req('3');
  global.define = __define;
  return module.exports;
});

$__System.register("5", [], function (_export) {
	"use strict";

	var Car;
	return {
		setters: [],
		execute: function () {
			Car = function Car(make, model) {
				this.make = make;
				this.model = model;
			};

			Car.prototype = {
				start: function start() {

					console.log(this.toString() + " is starting...");
				},

				toString: function toString() {
					return this.make + " " + this.model;
				},

				drive: function drive() {
					this.start();
					this.accelerate();
				}
			};

			_export("default", Car);
		}
	};
});
$__System.register("1", ["2", "4", "5"], function (_export) {
  "use strict";

  var Car, car;
  return {
    setters: [function (_) {}, function (_2) {}, function (_3) {
      Car = _3["default"];
    }],
    execute: function () {
      car = new Car("Tesla", "Model S");

      car.drive();
    }
  };
});
})
(function(factory) {
  factory();
});
//# sourceMappingURL=build.js.map