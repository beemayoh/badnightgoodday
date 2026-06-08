import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Bad Night Good Day</title>
        <meta name="description" content="Activities for parents and kids in Sydney's Inner West" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <main style={{ fontFamily: "Nunito, sans-serif" }} className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
        <h1 className="text-4xl font-bold text-center" style={{ color: "#7c3aed" }}>
          Bad Night Good Day
        </h1>
        <p className="mt-4 text-lg text-center text-gray-600 max-w-md">
          Activities for parents and little ones in Sydney&apos;s Inner West. Coming soon.
        </p>
      </main>
    </>
  );
}
