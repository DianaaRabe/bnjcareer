import type { Metadata } from "next";
import { PricingSection } from "./PricingSection";
import { LandingNavbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Tarifs — Collectif 95:59",
  description:
    "Découvrez nos formules d'abonnement pour booster votre employabilité à Madagascar et à l'international.",
};

export default function TarifsPage() {
  return (
    <div className="dark">
      <LandingNavbar />
      <PricingSection />
      <Footer />
    </div>
  );
}
