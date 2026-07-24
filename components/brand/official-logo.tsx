import Image from "next/image";

import { imageAssets } from "@/lib/image-assets";
import { siteConfig } from "@/lib/site-config";

type OfficialLogoProps = Readonly<{
  className?: string;
  priority?: boolean;
  sizes?: string;
}>;

export function OfficialLogo({
  className = "size-14",
  priority = false,
  sizes = "56px",
}: OfficialLogoProps) {
  return (
    <span
      className={`relative block aspect-square shrink-0 overflow-hidden ${className}`}
    >
      <Image
        alt={`Logo oficial de ${siteConfig.name}`}
        className="object-contain"
        fill
        priority={priority}
        sizes={sizes}
        src={imageAssets.brand.logo}
      />
    </span>
  );
}
