import Link from 'next/link';

function WithError({ data }) {
  return (
    <div>
      <h1>TrackJS NextJS Example</h1>
      <ul>
        <li>
          <Link href="/">
            <a>Home</a>
          </Link>
        </li>
      </ul>
    </div>
  );
}

export async function getServerSideProps() {
  throw new Error("Oopsie");
  return {
    props: {}
  };
};

export default WithError;
