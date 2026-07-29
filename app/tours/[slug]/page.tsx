import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { TourDetailPage } from "@/components/tours/tour-detail-page";
import { siteConfig } from "@/lib/site-config";
import {
  getTourBySlug,
  isTourComingSoon,
  tours,
} from "@/lib/tours-data";

type TourPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return tours
    .filter((tour) => tour.active)
    .map((tour) => ({ slug: tour.slug }));
}

export async function generateMetadata({
  params,
}: TourPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tour = getTourBySlug(slug);

  if (!tour || isTourComingSoon(tour)) {
    return {};
  }

  return {
    title: tour.name,
    description: tour.shortDescription,
    openGraph: {
      title: `${tour.name} | ${siteConfig.name}`,
      description: tour.shortDescription,
    },
  };
}

export default async function TourPage({ params }: TourPageProps) {
  const { slug } = await params;
  const tour = getTourBySlug(slug);

  if (tour && isTourComingSoon(tour)) {
    redirect("/explorar#tours");
  }
  if (!tour || !tour.active) {
    notFound();
  }

  return <TourDetailPage tour={tour} />;
}
