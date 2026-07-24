import type { IconName } from "@/types/content";

type IconProps = Readonly<{
  className?: string;
  name: IconName;
}>;

const paths: Record<IconName, React.ReactNode> = {
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  availability: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </>
  ),
  calendar: (
    <>
      <path d="M6 3v3m12-3v3M4 9h16" />
      <rect height="17" rx="2" width="18" x="3" y="4" />
    </>
  ),
  camera: (
    <>
      <path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9H2V9a2 2 0 0 1 2-2Z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </>
  ),
  canyon: (
    <>
      <path d="M3 4c4 3 4 6 2 16m16-16c-4 3-4 6-2 16" />
      <path d="M8 4c2 5 1 9-1 16m9-16c-2 5-1 9 1 16M9 19h6" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  difficulty: (
    <>
      <path d="M4 19V9m6 10V5m6 14v-7m4 7V3" />
      <path d="M2 19h20" />
    </>
  ),
  distance: (
    <>
      <path d="M5 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm14-4a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M8 14c3 3 5-5 8-4" />
    </>
  ),
  duration: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M9 2h6m-3 3v8l4 2" />
    </>
  ),
  equipment: (
    <>
      <path d="M8 6V4h8v2m-9 0h10l2 4v10H5V10l2-4Z" />
      <path d="M5 11h14M9 15h6" />
    </>
  ),
  food: (
    <>
      <path d="M7 3v8m-3-8v5a3 3 0 0 0 6 0V3M7 11v10" />
      <path d="M16 3v18m0-18c4 2 4 8 0 10" />
    </>
  ),
  guide: (
    <>
      <circle cx="12" cy="7" r="3" />
      <path d="M6 21v-4a6 6 0 0 1 12 0v4m-3-8 3-3 3 2" />
    </>
  ),
  heart: <path d="M20.8 5.7a5.5 5.5 0 0 0-7.8 0L12 6.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z" />,
  hiking: (
    <>
      <circle cx="13" cy="4" r="2" />
      <path d="m11 8-3 5 3 2 2 6m-2-8 4-1 2 4m-9 5 3-6m5-3 2 9" />
    </>
  ),
  leaf: (
    <>
      <path d="M20.5 3.5C13 3.5 5 7 5 14a6 6 0 0 0 6 6c7 0 9.5-8 9.5-16.5Z" />
      <path d="M4 21c3-5 7-8 12-11" />
    </>
  ),
  mail: (
    <>
      <rect height="16" rx="2" width="20" x="2" y="4" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
  map: (
    <>
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
      <path d="M9 3v15m6-12v15" />
    </>
  ),
  message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.7-5A8 8 0 1 1 21 15Z" />,
  mountain: (
    <>
      <path d="m3 19 7-12 4 6 2-3 5 9H3Z" />
      <path d="m8.5 9.5 1.5 2 1.5-2" />
    </>
  ),
  payment: (
    <>
      <rect height="15" rx="2" width="20" x="2" y="5" />
      <path d="M2 10h20m-15 5h4" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-5" />,
  spark: <path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2Zm7 14 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />,
  transport: (
    <>
      <path d="M4 16V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9H4Z" />
      <path d="M4 11h16M7 19h.01M17 19h.01M6 16v4m12-4v4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20v-2a6 6 0 0 1 12 0v2m1-15a3 3 0 0 1 0 6m2 2a5 5 0 0 1 3 5v2" />
    </>
  ),
  video: (
    <>
      <rect height="14" rx="2" width="15" x="2" y="5" />
      <path d="m17 10 5-3v10l-5-3v-4Z" />
    </>
  ),
  viewpoint: (
    <>
      <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  volcano: (
    <>
      <path d="m3 21 7-12h4l7 12H3Z" />
      <path d="m10 9 2 3 2-3M9 5c1-2 2-2 3 0s2 2 3 0" />
    </>
  ),
  waterfall: (
    <>
      <path d="M7 3h10m-8 0v9c0 3-2 4-2 6a3 3 0 0 0 6 0c0-2-2-3-2-6V3m4 0v8" />
      <path d="M15 14c2 2 2 4 0 7" />
    </>
  ),
  weather: (
    <>
      <path d="M7 17H5a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1A4.5 4.5 0 1 1 18 17H7Z" />
      <path d="M9 20h6" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M20.5 11.5A8.5 8.5 0 0 1 7.8 19L3 21l1.8-4.5A8.5 8.5 0 1 1 20.5 11.5Z" />
      <path d="M8.5 8.5c.5 3 2 4.5 5 5l1.5-1 2 1.5c-.5 2-2 2.5-4 2-3.5-1-6-3.5-7-7-.5-2 0-3.5 2-4l1.5 2-1 1.5Z" />
    </>
  ),
};

export function Icon({ className = "size-5", name }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}
