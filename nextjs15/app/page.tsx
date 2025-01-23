import Image from "next/image";
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Tracking Errors in NextJS 15+ Demo
        </p>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/trackjs.svg"
          alt="TrackJS Logo"
          width={300}
          height={60}
          priority
        />
      </div>

      <div>
        <h2 className="text-3xl font-semibold">App Router Examples</h2>
        <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
          <Link
            href="/client-error"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            prefetch={false}
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Client Logic Errors
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              See how TrackJS captures client-side logic errors
            </p>
          </Link>

          <Link
            href="/network-error"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            prefetch={false}
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Network Errors
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              See how TrackJS captures network errors
            </p>
          </Link>

          <Link
            href="/third-party"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            prefetch={false}
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Third Party Errors
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              See how TrackJS captures errors in third-party code
            </p>
          </Link>

          <Link
            href="/server-error?shouldThrow=1"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            prefetch={false}
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Server Errors
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              See how TrackJS captures errors from the server-side.
            </p>
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-semibold">Pages Router Examples</h2>
        <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
          <Link
            href="/pages/client-error"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            prefetch={false}
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Client Logic Errors
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              See how TrackJS captures client-side logic errors
            </p>
          </Link>

          <Link
            href="/pages/server-error?shouldThrow=1"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            prefetch={false}
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Server Errors
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              See how TrackJS captures errors from the server-side.
            </p>
          </Link>
        </div>
      </div>

    </main>
  );
}
