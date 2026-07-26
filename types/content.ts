export type NavigationItem = {
  label: string;
  href: "/" | `/explorar#${string}`;
};

export type TourOfficialDate = {
  label: string;
  date: string;
  secondaryDate?: string;
};

export type TourDeparturePoint = {
  time: string | null;
  place: string;
};

export type Tour = {
  id: string;
  slug: string;
  name: string;
  category: string;
  modality: string;
  modalityLabel: "Con transporte" | "Sin transporte" | "Paquete internacional";
  location: string;
  meetingPoint: string | null;
  mapsQuery: string | null;
  parking: string | null;
  availabilityType: string;
  officialDates: TourOfficialDate[];
  startTime: string;
  temperature: string | null;
  distance: string;
  duration: string;
  difficulty: string;
  priceCrc: number;
  priceUsd: number | null;
  installmentPriceUsd?: number | null;
  reservationAmountCrc: number;
  mainImage: string;
  imageAlt: string;
  gallery: string[];
  shortDescription: string;
  fullDescription: string;
  includes: string[];
  excludes: string[];
  whatToBring: string[];
  recommendedEquipment: string[];
  departurePoints: TourDeparturePoint[];
  departureNotice: string | null;
  physicalNotice: string | null;
  weatherNotice: string;
  cancellationPolicy: string[];
  transportation: string;
  meals: string;
  whatsappMessage: string;
  active: boolean;
  temporaryImage: boolean;
};

export type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
  className: string;
};

export type Testimonial = {
  quote: string;
  author: string;
  context: string;
  rating: number;
  satisfaction: number;
  isDemo: true;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type IconName =
  | "arrow"
  | "availability"
  | "calendar"
  | "camera"
  | "canyon"
  | "compass"
  | "difficulty"
  | "distance"
  | "duration"
  | "equipment"
  | "food"
  | "guide"
  | "heart"
  | "hiking"
  | "leaf"
  | "mail"
  | "map"
  | "message"
  | "mountain"
  | "payment"
  | "pin"
  | "shield"
  | "spark"
  | "transport"
  | "users"
  | "video"
  | "viewpoint"
  | "volcano"
  | "waterfall"
  | "weather"
  | "whatsapp";
