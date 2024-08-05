import SketchPage from "@/components/SketchPage";
import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Phi Protocol Terminal</title>
        <meta name="description" content="Link to Phi Protocol Terminal" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <SketchPage />
        </div>
        <Link
          className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
          href="https://base-sepolia.terminal.phiprotocol.xyz/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h3 className="text-2xl font-bold">Go to Terminal →</h3>
          <div className="text-lg">
            Click here to access the Phi Protocol Terminal on Base Sepolia.
          </div>
        </Link>
      </main>
    </>
  );
}
