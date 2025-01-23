import ErrorButton from "../../app/components/ErrorButton";

export default function Page() {
    return (
        <div className="flex min-h-screen flex-col items-center p-24">
          <h1 className="mb-3 text-2xl font-semibold">Client-Side Logic Errors</h1>
          <p className="mb-3">
            Bugs are inevitable. This page throws an error when clicking a button, which is captured by TrackJS.
          </p>
          <ErrorButton label={"💣 Simulate Logic Error"} />
        </div>
      );
}