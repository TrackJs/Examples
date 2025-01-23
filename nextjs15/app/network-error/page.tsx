import NetworkButton from "../components/NetworkButton";

export default function NetworkError() {

  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <h1 className="mb-3 text-2xl font-semibold">Network Errors</h1>
      <p className="mb-3">
        Networks are volatile. This page captures a 404 response from a FETCH request.
      </p>
      <NetworkButton label={"💣 Trigger Network Error"} />
    </div>
  );
}
