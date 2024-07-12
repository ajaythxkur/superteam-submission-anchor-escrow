import dynamic from "next/dynamic";
import { Body } from "./home/Body";
import Link from "next/link";
import { PROJECT_GITHUB_LINK } from "@/utils/constant";

export default function Home() {
  return (
    <main className="">
      <Header />
      <Body />
      <Footer />
    </main>
  );
}

function Header() {
  return (
    <nav className="container py-3 d-flex align-items-center justify-content-between">
      <h4 className="mb-0 text-capitalize text-cyan">smart escrow</h4>
      <WalletButtons />
    </nav>
  )
}

const WalletButtons = dynamic(
  async () => {
    const { WalletButtons } = await import("@/components/WalletButtons");
    return { default: WalletButtons };
  },
  {
    loading: () => (
      <div className="px-5 py-3 rounded bg-blue-900 opacity-50 cursor-not-allowed">
        Loading...
      </div>
    ),
    ssr: false,
  }
);

function Footer(){
  return(
    <footer className="d-flex justify-content-center mt-4">
      <Link href={PROJECT_GITHUB_LINK}>Github</Link>
    </footer>
  )
}