import {
  Navigation,
  HeroSection,
  UniqueValuePropositions,
  HowItWorks,
  FeatureShowcase,
  DataQuality,
  TargetUsers,
  Testimonials,
  CTASection,
  Footer,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <UniqueValuePropositions />
        <HowItWorks />
        <FeatureShowcase />
        <DataQuality />
        <TargetUsers />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
