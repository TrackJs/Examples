
export default function ServerError({
  params,
  searchParams
}: {
  params: { slug: string },
  searchParams: { [key: string]: string }
}) {

  if (searchParams.shouldThrow) {
    throw new Error("server thrown error");
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <h1 className="mb-3 text-2xl font-semibold">Server Errors</h1>
      <p className="mb-3">
        Generates a server error when using ?shouldThrow=1 in the querystring.
      </p>
    </div>
  )

}
