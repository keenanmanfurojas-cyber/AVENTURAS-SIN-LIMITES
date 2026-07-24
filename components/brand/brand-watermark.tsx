import Image from "next/image";

import { imageAssets } from "@/lib/image-assets";
import { siteConfig } from "@/lib/site-config";

type BrandWatermarkProps = Readonly<{
  className?: string;
  priority?: boolean;
  sizes?: string;
}>;

/**
 * The official watermark contains generous transparent spacing in its source
 * file. The source remains fully visible so the complete artwork and its
 * original proportions are preserved.
 */
export function BrandWatermark({
  className = "w-40",
  priority = false,
  sizes = "160px",
}: BrandWatermarkProps) {
  return (
    <span
      className={`relative block aspect-[2.3/1] shrink-0 overflow-visible ${className}`}
    >
      <Image
        alt={`Identidad oficial de ${siteConfig.name}`}
        className="absolute left-1/2 top-1/2 h-auto w-[156.5%] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
        height={1350}
        priority={priority}
        sizes={sizes}
        src={imageAssets.brand.watermark}
        width={1080}
      />
    </span>
  );
}
