import Head from "next/head";

// Middleware (src/middleware.ts) rewrites / → /index.html (public/).
// This file is a fallback only — it should never render in production.
export default function Home() {
  return (
    <>
      <Head>
        <title>Bad Night Good Day</title>
        <meta name="description" content="Activities for parents and kids in Sydney's Inner West" />
      </Head>
      {/* Returning null or minimal UI as it's a fallback */}
      <main>
        <p>Loading...</p>
      </main>
    </>
  );
}
