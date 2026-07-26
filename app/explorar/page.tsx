import { ScrollToTop } from "@/components/navigation/scroll-to-top";
import { SiteShell } from "@/layouts/site-shell";
import { HomePageContent } from "@/sections/home/home-page-content";

export default function ExplorePage() {
  return (
    <SiteShell>
      <ScrollToTop />
      <HomePageContent />
    </SiteShell>
  );
}
