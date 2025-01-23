/**
 * This file simulates a third-party script, such as analytics, social, or payment system
 * that throws various forms of errors during operation.
 */
(function () {

  console.error("a config problem was printed to the console");

  // Access a property that doesn't exist
  setTimeout(() => {
    var x = undef.foo;
  }, 100);

  // Make a bad network request
  fetch("/bad-url")

})();