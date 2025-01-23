import Script from "next/script";

export default function ConsoleError() {

  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <h1 className="mb-3 text-2xl font-semibold">Third-Party Errors</h1>
      <p className="">
        Often you&apos;ll have some third-party JavaScript in your app, such as analytics, payment, or social integrations.
      </p>
      <p>
        This page loads a third party with a few kinds of errors, captured to TrackJS.
      </p>
      <Script src="/third-party.js" />
    </div>
  );
}
