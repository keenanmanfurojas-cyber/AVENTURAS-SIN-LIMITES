import { imageAssets } from "@/lib/image-assets";
import type { Tour } from "@/types/content";

const ciudadEsmeraldaPolicy = [
  "La reserva no es reembolsable si el tour se realiza y la persona no asiste.",
  "Si las condiciones climáticas o de seguridad impiden realizar el tour, se coordinará una nueva fecha.",
  "Toda salida está sujeta a condiciones climáticas, disponibilidad y valoración de seguridad.",
];

const platanarEquipment = [
  "Calzado antideslizante.",
  "Preferiblemente calzado de caña alta o botas de hule.",
  "Ropa térmica y cómoda.",
  "Chaqueta impermeable (jacket).",
  "Poncho.",
  "Medias adicionales.",
  "Camiseta térmica adicional.",
  "Guantes térmicos.",
  "Gorro o gorra.",
  "Lentes.",
  "Bastones.",
  "Accesorios personales adecuados para montaña.",
];

const platanarWhatToBring = [
  "Mochila impermeable.",
  "Mínimo 2 litros de agua por persona.",
  "Snacks personales.",
  "Bebidas o hidratantes personales.",
  "Medicamentos o equipo médico personal requerido.",
];

const platanarDates = [
  {
    label:
      "Salida: sábado 22 de agosto de 2026 · Amanecer: domingo 23 de agosto de 2026",
    date: "2026-08-22",
    secondaryDate: "2026-08-23",
  },
  {
    label:
      "Salida: sábado 26 de septiembre de 2026 · Amanecer: domingo 27 de septiembre de 2026",
    date: "2026-09-26",
    secondaryDate: "2026-09-27",
  },
];

const platanarPhysicalNotice =
  "Esta es una actividad avanzada y técnica. La persona debe informar previamente condiciones médicas, lesiones, alergias, medicamentos y limitaciones físicas. La participación puede estar sujeta a valoración de seguridad.";

export const tours: Tour[] = [
  {
    id: "ciudad-esmeralda-sin-transporte",
    slug: "canon-ciudad-esmeralda-sin-transporte",
    name: "Tour al Cañón Ciudad Esmeralda",
    category: "Aventura acuática",
    modality:
      "Elige entre un tour privado con llegada al punto de encuentro o una salida grupal con transporte desde la GAM.",
    modalityLabel: "Sin transporte",
    location: "Sucre, Ciudad Quesada, San Carlos, Costa Rica",
    meetingPoint:
      "La Vieja Adventures, Sucre, Ciudad Quesada, Costa Rica",
    mapsQuery:
      "La Vieja Adventures, Sucre, Ciudad Quesada, Costa Rica",
    parking: "Disponible, con espacio para más de 40 vehículos.",
    availabilityType:
      "El tour privado se coordina previamente. Las salidas grupales con transporte desde la GAM se realizan en fechas programadas. Todas las modalidades están sujetas a disponibilidad, condiciones climáticas y seguridad de la ruta.",
    officialDates: [
      {
        label: "Domingo 30 de agosto de 2026",
        date: "2026-08-30",
      },
      {
        label: "Domingo 20 de septiembre de 2026",
        date: "2026-09-20",
      },
    ],
    startTime: "Entre 7:00 a. m. y 8:00 a. m.",
    temperature: null,
    distance: "6 km en total, ida y vuelta",
    duration: "Entre 3 y 4 horas, aproximadamente",
    difficulty: "Intermedia - Técnica",
    priceCrc: 28000,
    priceUsd: null,
    reservationAmountCrc: 10000,
    mainImage: imageAssets.tours.ciudadEsmeralda,
    imageAlt:
      "Vista oficial del paisaje montañoso asociado al Tour al Cañón Ciudad Esmeralda",
    gallery: [],
    shortDescription:
      "Una experiencia acuática técnica de 6 km con modalidad privada o transporte grupal desde la GAM.",
    fullDescription:
      "Recorrido de aventura acuática en el Cañón Ciudad Esmeralda, en Sucre de Ciudad Quesada. Una experiencia entre naturaleza, agua y paisajes extraordinarios, sujeta a disponibilidad, condiciones climáticas y valoración de seguridad de la ruta.",
    includes: ["Entrada.", "Equipo de seguridad.", "Guías locales.", "Contenido audiovisual."],
    excludes: ["Gastos personales.", "Artículos no especificados."],
    whatToBring: [
      "Mochila impermeable.",
      "Mínimo 1,5 litros de agua por persona.",
      "Snacks personales.",
      "Bebidas o hidratantes personales.",
    ],
    recommendedEquipment: [
      "Calzado antideslizante.",
      "Ropa deportiva y cómoda.",
      "Chaqueta impermeable (jacket).",
      "Accesorios personales adecuados para la actividad.",
    ],
    departurePoints: [],
    departureNotice: null,
    physicalNotice: null,
    weatherNotice:
      "La salida está sujeta a condiciones climáticas, disponibilidad y valoración de seguridad. Si no es seguro realizarla, se coordinará una nueva fecha.",
    cancellationPolicy: ciudadEsmeraldaPolicy,
    transportation:
      "La modalidad grupal incluye transporte desde la GAM. En la modalidad privada, el grupo llega directamente al punto de encuentro.",
    meals:
      "La modalidad grupal incluye alimentación. En la modalidad privada puede agregarse como extra opcional.",
    whatsappMessage:
      "Hola, deseo información para reservar el Tour al Cañón Ciudad Esmeralda. ¿Podrían ayudarme a elegir la modalidad adecuada?",
    active: true,
    temporaryImage: false,
  },
  {
    id: "ciudad-esmeralda-transporte-gam",
    slug: "canon-ciudad-esmeralda-transporte-gam",
    name: "Tour Grupal al Cañón Ciudad Esmeralda con transporte",
    category: "Aventura acuática",
    modality: "Salida grupal programada con transporte desde la GAM",
    modalityLabel: "Con transporte",
    location: "Sucre, Ciudad Quesada, San Carlos, Costa Rica",
    meetingPoint: null,
    mapsQuery: null,
    parking: null,
    availabilityType:
      "Salida grupal en fechas oficiales programadas, sujeta a condiciones climáticas, seguridad de la ruta y confirmación previa.",
    officialDates: [
      {
        label: "Domingo 30 de agosto de 2026",
        date: "2026-08-30",
      },
      {
        label: "Domingo 20 de septiembre de 2026",
        date: "2026-09-20",
      },
    ],
    startTime: "Entre 7:00 a. m. y 8:00 a. m.",
    temperature: null,
    distance: "6 km en total, ida y vuelta",
    duration: "Entre 3 y 4 horas, aproximadamente",
    difficulty: "Intermedia - Técnica",
    priceCrc: 42000,
    priceUsd: null,
    reservationAmountCrc: 10000,
    mainImage: imageAssets.tours.ciudadEsmeralda,
    imageAlt:
      "Vista oficial del paisaje montañoso asociado al Tour Grupal al Cañón Ciudad Esmeralda",
    gallery: [],
    shortDescription:
      "Salida grupal programada al Cañón Ciudad Esmeralda con transporte y alimentación incluidos desde la GAM.",
    fullDescription:
      "Experiencia grupal de aventura acuática en Sucre, Ciudad Quesada. Incluye transporte desde puntos programados en la GAM, alimentación, guías locales y equipo de seguridad.",
    includes: [
      "Entrada.",
      "Equipo de seguridad.",
      "Guías locales.",
      "Alimentación.",
      "Transporte desde la GAM.",
      "Contenido audiovisual.",
    ],
    excludes: [],
    whatToBring: [
      "Mochila impermeable.",
      "Mínimo 1,5 litros de agua por persona.",
      "Snacks personales.",
      "Bebidas o hidratantes personales.",
    ],
    recommendedEquipment: [
      "Calzado antideslizante.",
      "Ropa deportiva y cómoda.",
      "Chaqueta impermeable (jacket).",
      "Accesorios personales adecuados para la actividad.",
    ],
    departurePoints: [
      { time: "5:00 a. m.", place: "San José, Teatro Nacional" },
      { time: "5:25 a. m.", place: "Heredia, Oxígeno" },
      { time: "5:45 a. m.", place: "Alajuela, Rosti / Casino" },
      { time: "6:00 a. m.", place: "Entronque de Grecia" },
    ],
    departureNotice:
      "Las rutas, los horarios y los puntos de salida requieren confirmación previa al viaje.",
    physicalNotice: null,
    weatherNotice:
      "Si las condiciones climáticas o de seguridad impiden realizar el tour, se reprogramará para otra fecha disponible.",
    cancellationPolicy: [
      "La reserva es de ₡10.000 por persona.",
      "La reserva no es reembolsable si el tour se realiza y la persona no asiste.",
      "Si las condiciones climáticas o de seguridad impiden realizar el tour, se reprogramará para otra fecha disponible.",
      "Las rutas, los horarios y los puntos de salida pueden requerir confirmación previa al viaje.",
    ],
    transportation:
      "Incluye transporte grupal desde los puntos programados en la GAM.",
    meals: "Incluye alimentación.",
    whatsappMessage:
      "Hola, deseo información para reservar el Tour Grupal al Cañón Ciudad Esmeralda con transporte. ¿Podrían ayudarme a elegir una de las fechas programadas y confirmarme disponibilidad?",
    active: false,
    temporaryImage: false,
  },
  {
    id: "volcan-platanar-sin-transporte",
    slug: "amanecer-volcan-platanar-sin-transporte",
    name: "Tour Amanecer en Volcán Platanar",
    category: "Senderismo de montaña y amanecer",
    modality:
      "Llegada al punto de encuentro / sin transporte desde la GAM",
    modalityLabel: "Sin transporte",
    location: "San Vicente, Ciudad Quesada, San Carlos, Costa Rica",
    meetingPoint: null,
    mapsQuery: null,
    parking: null,
    availabilityType:
      "Puede reservarse en las fechas oficiales o coordinarse otra fecha para una salida privada, sujeta a disponibilidad, clima y seguridad.",
    officialDates: platanarDates,
    startTime: "Entre 1:40 a. m. y 2:00 a. m.",
    temperature: "Entre 14 °C y 20 °C",
    distance: "Aproximadamente 12 km, ida y vuelta",
    duration: "Aproximadamente 9 horas, ida y vuelta",
    difficulty: "Avanzada - Técnica",
    priceCrc: 24000,
    priceUsd: null,
    reservationAmountCrc: 10000,
    mainImage: imageAssets.tours.volcanPlatanar,
    imageAlt:
      "Vista oficial de una formación rocosa y cauce natural en la ruta del Volcán Platanar",
    gallery: [],
    shortDescription:
      "Senderismo avanzado de amanecer en Volcán Platanar, con una ruta aproximada de 12 km y llegada directa.",
    fullDescription:
      "Experiencia técnica de montaña para contemplar el amanecer en Volcán Platanar. Puede realizarse en fechas oficiales o coordinarse como salida privada, siempre sujeta al clima, la disponibilidad y la valoración de seguridad.",
    includes: [
      "Entrada.",
      "Acceso a cascadas según la ruta y las condiciones.",
      "Equipo de seguridad.",
      "Guías locales.",
      "Contenido audiovisual.",
      "Alimentación.",
    ],
    excludes: [
      "Transporte desde la GAM.",
      "Equipo personal.",
      "Artículos no especificados.",
      "Gastos personales.",
    ],
    whatToBring: platanarWhatToBring,
    recommendedEquipment: platanarEquipment,
    departurePoints: [],
    departureNotice: null,
    physicalNotice: platanarPhysicalNotice,
    weatherNotice:
      "El itinerario puede ajustarse por clima, estado del terreno y criterio de los guías. Si no es seguro realizar el tour, se coordinará una nueva fecha.",
    cancellationPolicy: [
      "La reserva es de ₡10.000 por persona.",
      "La reserva no es reembolsable si el tour se realiza y la persona no asiste.",
      "Si las condiciones climáticas o de seguridad impiden realizar el tour, se coordinará una nueva fecha.",
      "El itinerario puede ajustarse por clima, estado del terreno y criterio de los guías.",
    ],
    transportation:
      "No incluye transporte desde la GAM. El punto de encuentro está pendiente de confirmación.",
    meals: "Incluye alimentación.",
    whatsappMessage:
      "Hola, deseo información para reservar el Tour Amanecer en Volcán Platanar sin transporte. Deseo elegir una fecha oficial o consultar una fecha privada sujeta a disponibilidad. ¿Podrían confirmarme las opciones?",
    active: true,
    temporaryImage: false,
  },
  {
    id: "volcan-platanar-transporte-gam",
    slug: "amanecer-volcan-platanar-transporte-gam",
    name: "Tour Amanecer en Volcán Platanar con transporte",
    category: "Senderismo de montaña y amanecer",
    modality: "Salida con transporte desde la GAM",
    modalityLabel: "Con transporte",
    location: "San Vicente, Ciudad Quesada, San Carlos, Costa Rica",
    meetingPoint: null,
    mapsQuery: null,
    parking: null,
    availabilityType:
      "Fechas oficiales programadas. Otras fechas privadas pueden coordinarse, sujetas a disponibilidad, clima, cupo mínimo y logística de transporte.",
    officialDates: platanarDates,
    startTime: "Entre 1:40 a. m. y 2:00 a. m.",
    temperature: "Entre 14 °C y 20 °C",
    distance: "Aproximadamente 12 km, ida y vuelta",
    duration: "Aproximadamente 9 horas, ida y vuelta",
    difficulty: "Avanzada - Técnica",
    priceCrc: 34000,
    priceUsd: null,
    reservationAmountCrc: 10000,
    mainImage: imageAssets.tours.volcanPlatanar,
    imageAlt:
      "Vista oficial de una formación rocosa y cauce natural en la ruta del Volcán Platanar",
    gallery: [],
    shortDescription:
      "Salida de amanecer al Volcán Platanar con transporte desde la GAM, alimentación y acompañamiento local.",
    fullDescription:
      "Experiencia técnica de montaña para contemplar el amanecer en Volcán Platanar, con transporte desde la GAM. Los horarios y puntos de salida se confirman antes de reservar.",
    includes: [
      "Entrada.",
      "Acceso a cascadas según la ruta y las condiciones.",
      "Equipo de seguridad.",
      "Guías locales.",
      "Contenido audiovisual.",
      "Alimentación.",
      "Transporte desde la GAM.",
    ],
    excludes: [],
    whatToBring: platanarWhatToBring,
    recommendedEquipment: platanarEquipment,
    departurePoints: [],
    departureNotice:
      "Los puntos y horarios de salida serán confirmados antes de reservar.",
    physicalNotice: platanarPhysicalNotice,
    weatherNotice:
      "Si las condiciones climáticas o de seguridad impiden realizar el tour, se coordinará una nueva fecha.",
    cancellationPolicy: [
      "La reserva es de ₡10.000 por persona.",
      "La reserva no es reembolsable si el tour se realiza y la persona no asiste.",
      "Si las condiciones climáticas o de seguridad impiden realizar el tour, se coordinará una nueva fecha.",
      "Los horarios del transporte deben confirmarse antes de finalizar la reserva.",
    ],
    transportation:
      "Incluye transporte desde la GAM. Los puntos y horarios de salida serán confirmados antes de reservar.",
    meals: "Incluye alimentación.",
    whatsappMessage:
      "Hola, deseo información para reservar el Tour Amanecer en Volcán Platanar con transporte. Deseo elegir una fecha programada o consultar una fecha privada. ¿Podrían confirmarme disponibilidad y los puntos de salida?",
    active: true,
    temporaryImage: false,
  },
  {
    id: "entre-volcanes-guatemala",
    slug: "entre-volcanes-guatemala",
    name: "Entre Volcanes Guatemala",
    category: "Expedición internacional",
    modality: "Viví historia, cultura y mucha aventura.",
    modalityLabel: "Paquete internacional",
    location: "Guatemala",
    meetingPoint: null,
    mapsQuery: null,
    parking: null,
    availabilityType: "Disponible en las fechas oficiales publicadas.",
    officialDates: [
      {
        label: "Del 23 al 26 de noviembre",
        date: "23-26-noviembre",
      },
      {
        label: "Del 9 al 12 de diciembre",
        date: "9-12-diciembre",
      },
      {
        label: "Del 13 al 16 de enero",
        date: "13-16-enero",
      },
    ],
    startTime: "",
    temperature: null,
    distance: "",
    duration: "4 días y 3 noches",
    difficulty: "Intermedio – avanzado",
    priceCrc: 0,
    priceUsd: 790,
    installmentPriceUsd: 815,
    reservationAmountCrc: 0,
    mainImage: imageAssets.tours.entreVolcanesGuatemala,
    imageAlt: "Volcán de Fuego en Guatemala durante una expedición nocturna",
    gallery: [],
    shortDescription:
      "Una expedición entre volcanes, historia y cultura guatemalteca, diseñada para vivir una aventura intensa entre naturaleza, ciudades y paisajes inolvidables.",
    fullDescription:
      "Una expedición entre volcanes, historia y cultura guatemalteca, diseñada para vivir una aventura intensa entre naturaleza, ciudades y paisajes inolvidables.",
    includes: [
      "Boletos de avión, ida y vuelta",
      "Transporte privado, ida y vuelta",
      "Merienda",
      "Entradas a las actividades",
      "Guías y coordinadores",
      "Contenido",
      "Hospedaje privado",
      "Campamento en el volcán",
      "Alimentación de tres tiempos en el volcán",
      "Visita a ciudades y otras experiencias",
    ],
    excludes: [],
    whatToBring: [],
    recommendedEquipment: [],
    departurePoints: [],
    departureNotice: null,
    physicalNotice: null,
    weatherNotice: "",
    cancellationPolicy: [],
    transportation: "Incluye transporte privado, ida y vuelta.",
    meals:
      "Incluye merienda y alimentación de tres tiempos en el volcán.",
    whatsappMessage:
      "Hola, quiero recibir información y reservar el paquete Entre Volcanes Guatemala.",
    active: true,
    temporaryImage: false,
  },
];

const comingSoonTourSlugs = new Set([
  "amanecer-volcan-platanar-sin-transporte",
  "amanecer-volcan-platanar-transporte-gam",
  "entre-volcanes-guatemala",
  "volcan-platanar-sin-transporte",
  "volcan-platanar-transporte-gam",
  "tour amanecer en volcán platanar",
  "tour amanecer en volcán platanar con transporte",
  "entre volcanes guatemala",
  "volcán de fuego",
]);

const ciudadEsmeraldaBookingIdentifiers = new Set([
  "ciudad-esmeralda",
  "canon-ciudad-esmeralda-sin-transporte",
  "canon-ciudad-esmeralda-transporte-gam",
  "tour ciudad esmeralda",
  "tour al cañón ciudad esmeralda",
  "tour grupal al cañón ciudad esmeralda con transporte",
]);

export function getTourBySlug(slug: string) {
  return tours.find((tour) => tour.slug === slug);
}

export function isTourComingSoon(
  tour: Pick<Tour, "slug"> | string,
) {
  return comingSoonTourSlugs.has(
    (typeof tour === "string" ? tour : tour.slug).trim().toLocaleLowerCase("es"),
  );
}

export function isCiudadEsmeraldaBookingIdentifier(value: string) {
  return ciudadEsmeraldaBookingIdentifiers.has(
    value.trim().toLocaleLowerCase("es"),
  );
}
