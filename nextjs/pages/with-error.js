import Link from 'next/link';

const WithError = props => (
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

WithError.getInitialProps = async function() {
  throw new Error("Oops3");
};

export default WithError;
