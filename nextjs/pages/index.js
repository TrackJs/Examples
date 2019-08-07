import Link from 'next/link';

const Index = props => (
  <div>
    <h1>TrackJS NextJS Example</h1>
    <ul>
      <li>
        <Link href="/">
          <a>Home</a>
        </Link>
      </li>
      <li>
        <Link href="/with-error">
          <a>page with error</a>
        </Link>
      </li>
    </ul>
  </div>
);

export default Index;
