import { useRouter } from "next/router";

export default function Page() {
    var a = null;

    const router = useRouter()

    if (router.query.shouldThrow == "1") {
        var b = (a as any).toString();
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

export async function getServerSideProps() {
    return { props: {} }
}