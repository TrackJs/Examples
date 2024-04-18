"use client";

import NextError from "next/error";
import { useEffect } from "react";
import { TrackJS, TrackJSInstall } from "./trackjs-loader";

TrackJSInstall();

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    TrackJS.track(error);
  }, [error]);

  return (
    <html>
      <body>
        {/* This is the default Next.js error component. */}
        <NextError statusCode={undefined as any} />
      </body>
    </html>
  );
}