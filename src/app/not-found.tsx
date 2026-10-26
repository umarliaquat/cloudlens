import Link from "next/link";
export default function NotFound() {
  return (
    <main className="fatal">
      <p className="eyebrow">404 / NOT FOUND</p>
      <h1>This view isn’t available.</h1>
      <p>The link may have changed. Return to your client overview.</p>
      <Link className="button primary" href="/">
        Back to overview
      </Link>
    </main>
  );
}
