import type {
  Benefit,
  FaqItem,
  GalleryImage,
  NavigationItem,
  Testimonial,
} from "@/types/content";
import { imageAssets } from "@/lib/image-assets";

export const navigationItems: NavigationItem[] = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Tours", href: "/#tours" },
  { label: "Experiencias", href: "/#experiencias" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Galería", href: "/#galeria" },
  { label: "Preguntas frecuentes", href: "/#preguntas" },
  { label: "Contacto", href: "/#contacto" },
];

export const benefits: Benefit[] = [
  {
    icon: "compass",
    title: "Experiencias auténticas",
    description:
      "Rutas con carácter local, lejos de fórmulas impersonales.",
  },
  {
    icon: "users",
    title: "Guías locales",
    description:
      "Conocimiento del territorio contado por quienes lo viven.",
  },
  {
    icon: "heart",
    title: "Atención personalizada",
    description:
      "Escuchamos tu ritmo, intereses y forma de viajar.",
  },
  {
    icon: "shield",
    title: "Seguridad",
    description:
      "Planificación responsable y acompañamiento en cada etapa.",
  },
  {
    icon: "leaf",
    title: "Naturaleza y conexión",
    description:
      "Encuentros respetuosos con ecosistemas extraordinarios.",
  },
  {
    icon: "spark",
    title: "Grupos bien organizados",
    description:
      "Experiencias cuidadas para compartir sin perder cercanía.",
  },
];

export const galleryImages: GalleryImage[] = [
  {
    src: imageAssets.home.hero,
    alt: "Grupo contemplando montañas y selva de Costa Rica",
    caption: "Horizontes que transforman",
    className: "md:col-span-2 md:row-span-2",
  },
  {
    src: imageAssets.tours.waterfall,
    alt: "Paisaje montañoso oficial asociado a Ciudad Esmeralda",
    caption: "Ciudad Esmeralda",
    className: "",
  },
  {
    src: imageAssets.tours.volcano,
    alt: "Formación rocosa y cauce natural en la ruta del Volcán Platanar",
    caption: "Volcán Platanar",
    className: "md:row-span-2",
  },
  {
    src: imageAssets.home.welcome,
    alt: "Volcán Arenal al amanecer",
    caption: "La fuerza del Arenal",
    className: "",
  },
  {
    src: imageAssets.tours.rafting,
    alt: "Aventura de rafting en un río rodeado de selva",
    caption: "Ríos vivos",
    className: "md:col-span-2",
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "La organización se sintió cercana desde el primer mensaje y cada paisaje superó lo que imaginábamos.",
    author: "Ejemplo de viajero",
    context: "Contenido demostrativo · pendiente de testimonio real",
    isDemo: true,
  },
  {
    quote:
      "No fue solo una caminata: fue una forma distinta de entender el bosque y volver a conectar.",
    author: "Ejemplo de viajera",
    context: "Contenido demostrativo · pendiente de testimonio real",
    isDemo: true,
  },
  {
    quote:
      "El ritmo del grupo, la seguridad y el conocimiento local hicieron que todo se sintiera especial.",
    author: "Ejemplo de grupo",
    context: "Contenido demostrativo · pendiente de testimonio real",
    isDemo: true,
  },
];

export const faqs: FaqItem[] = [
  {
    question: "¿Cómo se realizará una reserva?",
    answer:
      "El sistema de reservas aún está en preparación. Por ahora puedes escribirnos para consultar fechas, disponibilidad y recibir atención personalizada.",
  },
  {
    question: "¿Qué métodos de pago estarán disponibles?",
    answer:
      "Las reservas pueden coordinarse mediante SINPE Móvil. Los datos oficiales de pago se muestran en cada experiencia y deben confirmarse antes de realizar una transferencia.",
  },
  {
    question: "¿Los tours incluyen transporte?",
    answer:
      "Dependerá de cada experiencia y del punto de salida. La ficha definitiva de cada tour indicará claramente traslados, horarios y lugares de recogida.",
  },
  {
    question: "¿Qué debo llevar?",
    answer:
      "Como base recomendamos calzado adecuado, ropa cómoda, hidratación y protección para lluvia y sol. Cada tour tendrá una lista específica según clima y dificultad.",
  },
  {
    question: "¿Cuál será la política de cancelaciones?",
    answer:
      "La política está en elaboración y se mostrará antes de confirmar cualquier reserva. Incluirá plazos, condiciones climáticas y posibles reprogramaciones.",
  },
  {
    question: "¿Necesito una condición física especial?",
    answer:
      "Cada experiencia indicará su nivel de dificultad. Antes de reservar podremos ayudarte a elegir una opción compatible con tu condición y experiencia.",
  },
];
