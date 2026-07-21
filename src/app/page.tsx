import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import ProductPreview from "@/components/landing/ProductPreview";
import ProblemSolutionSection from "@/components/landing/ProblemSolutionSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ProductShowcase from "@/components/landing/ProductShowcase";
import SecuritySection from "@/components/landing/SecuritySection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTA from "@/components/landing/FinalCTA";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <main>
        <HeroSection />
        <ProductPreview />
        <ProblemSolutionSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ProductShowcase />
        <SecuritySection />
        <PricingSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </>
  );
}
