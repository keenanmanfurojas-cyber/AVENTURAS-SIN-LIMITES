import type {
  FaqItem,
  GalleryImage,
  NavigationItem,
  Testimonial,
} from "@/types/content";
import { imageAssets } from "@/lib/image-assets";

export const navigationItems: NavigationItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Tours", href: "/explorar#tours" },
  { label: "Experiencias", href: "/explorar#experiencias" },
  { label: "Nosotros", href: "/explorar#nosotros" },
  { label: "Galería", href: "/explorar#galeria" },
  { label: "Preguntas frecuentes", href: "/explorar#preguntas" },
  { label: "Contacto", href: "/explorar#contacto" },
];

export const galleryImages: GalleryImage[] = [
  {
    src: imageAssets.tours.ciudadEsmeralda,
    alt: "Paisaje montañoso verde entre nubes de Ciudad Esmeralda",
    caption: "Ciudad Esmeralda",
    className: "md:row-span-2",
  },
  {
    src: imageAssets.tours.volcanPlatanar,
    alt: "Grieta rocosa entre bosque en la ruta del Volcán Platanar",
    caption: "Volcán Platanar",
    className: "md:row-span-2",
  },
  {
    src: imageAssets.tours.entreVolcanesGuatemala,
    alt: "Volcán de Fuego en Guatemala durante una expedición nocturna",
    caption: "Entre Volcanes Guatemala",
    className: "md:row-span-2",
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "La organización se sintió cercana desde el primer mensaje y cada paisaje superó lo que imaginábamos.",
    author: "Laura M.",
    context: "Contenido demostrativo",
    rating: 5,
    satisfaction: 98,
    isDemo: true,
  },
  {
    quote:
      "No fue solo una caminata: fue una forma distinta de entender el bosque y volver a conectar.",
    author: "Andrés C.",
    context: "Contenido demostrativo",
    rating: 5,
    satisfaction: 96,
    isDemo: true,
  },
  {
    quote:
      "El ritmo del grupo, la seguridad y el conocimiento local hicieron que todo se sintiera especial.",
    author: "Sofía R.",
    context: "Contenido demostrativo",
    rating: 5,
    satisfaction: 99,
    isDemo: true,
  },
  {
    quote:
      "Cada detalle estuvo bien coordinado y pudimos concentrarnos en disfrutar la aventura.",
    author: "Daniel R.",
    context: "Contenido demostrativo",
    rating: 5,
    satisfaction: 97,
    isDemo: true,
  },
  {
    quote:
      "Caminar entre montañas y respirar aire puro convirtió el viaje en un recuerdo inolvidable.",
    author: "María G.",
    context: "Contenido demostrativo",
    rating: 5,
    satisfaction: 100,
    isDemo: true,
  },
  {
    quote:
      "Los guías transmitieron confianza, conocimiento y una pasión genuina por cada sendero.",
    author: "Carlos V.",
    context: "Contenido demostrativo",
    rating: 5,
    satisfaction: 98,
    isDemo: true,
  },
  {
    quote:
      "La experiencia frente al volcán fue intensa, segura y mucho más emocionante de lo esperado.",
    author: "Fernanda P.",
    context: "Contenido demostrativo",
    rating: 5,
    satisfaction: 99,
    isDemo: true,
  },
  {
    quote:
      "Todo el recorrido tuvo un ritmo agradable y espacios para conectar de verdad con la naturaleza.",
    author: "José A.",
    context: "Contenido demostrativo",
    rating: 5,
    satisfaction: 96,
    isDemo: true,
  },
  {
    quote:
      "La seguridad y la atención del equipo hicieron que disfrutara cada tramo del senderismo.",
    author: "Valeria C.",
    context: "Contenido demostrativo",
    rating: 5,
    satisfaction: 98,
    isDemo: true,
  },
  {
    quote:
      "Paisajes increíbles, buena organización y una energía de grupo que hizo especial el camino.",
    author: "Gabriel M.",
    context: "Contenido demostrativo",
    rating: 5,
    satisfaction: 97,
    isDemo: true,
  },
  {
    quote:
      "Volví con una conexión más profunda con el bosque y recuerdos que quiero conservar siempre.",
    author: "Paula R.",
    context: "Contenido demostrativo",
    rating: 5,
    satisfaction: 100,
    isDemo: true,
  },
  {
    quote:
      "La aventura combinó desafío, naturaleza y acompañamiento profesional en todo momento.",
    author: "Diego S.",
    context: "Contenido demostrativo",
    rating: 5,
    satisfaction: 95,
    isDemo: true,
  },
  {
    quote:
      "Cada vista recompensó el esfuerzo y los guías hicieron que la ruta se sintiera cercana y segura.",
    author: "Natalia H.",
    context: "Contenido demostrativo",
    rating: 5,
    satisfaction: 99,
    isDemo: true,
  },
  {
    quote:
      "Fue una experiencia completa: aventura, aprendizaje y momentos únicos en plena naturaleza.",
    author: "Luis C.",
    context: "Contenido demostrativo",
    rating: 5,
    satisfaction: 98,
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
