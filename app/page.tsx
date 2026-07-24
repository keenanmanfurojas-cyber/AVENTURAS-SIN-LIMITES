import { SiteShell } from "@/layouts/site-shell";
import { HomePageContent } from "@/sections/home/home-page-content";
import { WelcomeExperience } from "@/sections/welcome/welcome-experience";

export default function HomePage() {
  return (
    <SiteShell>
      <WelcomeExperience>
        <HomePageContent />
      </WelcomeExperience>
    </SiteShell>
  );
}
