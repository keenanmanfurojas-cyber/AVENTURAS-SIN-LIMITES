import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { BenefitsSection } from "@/sections/home/benefits-section";
import { BrandExperienceSection } from "@/sections/home/brand-experience-section";
import { ContactSection } from "@/sections/home/contact-section";
import { FaqSection } from "@/sections/home/faq-section";
import { FeaturedToursSection } from "@/sections/home/featured-tours-section";
import { GallerySection } from "@/sections/home/gallery-section";
import { HomeHeroSection } from "@/sections/home/home-hero-section";
import { TestimonialsSection } from "@/sections/home/testimonials-section";

export function HomePageContent() {
  return (
    <>
      <SiteHeader />
      <HomeHeroSection />
      <FeaturedToursSection />
      <BenefitsSection />
      <BrandExperienceSection />
      <GallerySection />
      <TestimonialsSection />
      <FaqSection />
      <ContactSection />
      <SiteFooter />
    </>
  );
}
