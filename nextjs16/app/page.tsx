import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/trackjs.svg"
          alt="TrackJS Logo"
          width={300}
          height={60}
          priority
        />

        <div>
          <p>
            Tracking Errors in NextJS 16+ Demo
          </p>
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
    </div>
  );
}
