import { LandingNavbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { CTA } from "@/components/landing/CTA";
import { SocialProof } from "@/components/landing/SocialProof";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="dark">
      {/* Fixed navbar overlays the hero */}
      <LandingNavbar />
      <Hero />
      <Features />
      <CTA />
      <SocialProof />
      <Footer />
    </div>
  );
}
