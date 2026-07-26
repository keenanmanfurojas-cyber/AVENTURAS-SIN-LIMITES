export type BookingMode = "direct" | "gam_transport" | "private";
export type BookingStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "cancelled";
export type AvailabilityStatus = "available" | "low" | "sold_out";
export type CalendarSyncStatus =
  | "not_requested"
  | "pending"
  | "synced"
  | "failed";
export type YesNo = "" | "no" | "yes";

export type BookingBuyer = {
  email: string;
  fullName: string;
  isParticipant: boolean;
  phone: string;
};

export type Buyer = BookingBuyer;

export type BookingParticipant = {
  email: string;
  fitness: string;
  fullName: string;
  hasMedicalCondition: YesNo;
  id: string;
  medicalDetails: string;
  phone: string;
};

export type Participant = BookingParticipant;

export type GamTransportDetails = {
  departurePoint: string;
  dietaryDetails: string;
  hasDietaryRestriction: YesNo;
  requiresMeal: YesNo;
};

export type PrivateTourDetails = {
  pickupZone: string;
  requiresMeal: YesNo;
};

export type DirectArrivalDetails = {
  arrivalTime: string;
  transportMethod: string;
};

export type BookingModeDetails = {
  direct: DirectArrivalDetails;
  gam_transport: GamTransportDetails;
  private: PrivateTourDetails;
};

export type BookingPayment = {
  receiptName: string;
  receiptSize: number;
  receiptType: string;
};

export type BookingDraft = {
  buyer: BookingBuyer;
  mode: BookingMode | "";
  modeDetails: BookingModeDetails;
  participantCount: number;
  participants: BookingParticipant[];
  selectedDate: string;
  termsAccepted: boolean;
};

export type PaymentProof = {
  id: string;
  name: string;
  size: number;
  type: string;
};

export type AdminAction = {
  action: "approve" | "reject" | "cancel" | "update_notes";
  adminId: string | null;
  bookingId: string;
  createdAt: string;
  id: string;
  notes: string | null;
  previousStatus: BookingStatus | null;
  resultingStatus: BookingStatus;
};

export type BookingRecord = {
  id: string;
  bookingCode: string;
  tourSlug: string;
  tourName: string;
  selectedDate: string;
  mode: BookingMode;
  quantity: number;
  buyer: BookingBuyer;
  participants: BookingParticipant[];
  transportDetails: BookingModeDetails;
  foodDetails: {
    dietaryDetails: string;
    hasDietaryRestriction: YesNo;
    requiresMeal: YesNo;
  };
  total: number;
  sinpeAccountNumber: string;
  sinpeAccountHolder: string;
  paymentProof: PaymentProof;
  status: BookingStatus;
  rejectionReason: string | null;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  cancelledAt: string | null;
  pricePerPersonCrc: number;
};

export type Booking = BookingRecord;

export type AvailableDate = {
  date: string;
  capacity: number;
  availableSpots: number;
  status: AvailabilityStatus;
  temporary: boolean;
};

export type TourDate = AvailableDate;

export type BookingModeOption = {
  description: string;
  id: BookingMode;
  label: string;
  minimumParticipants: number;
  pricePerPersonCrc: number;
  singleParticipantPriceCrc?: number;
};

export type BookingConfig = {
  availableDates: AvailableDate[];
  modes: BookingModeOption[];
  privateMealExtraCrc: number;
  sinpeAccountHolder: string;
  sinpeNumber: string;
  storageKey: string;
  tourId: string;
  tourName: string;
  whatsappBaseUrl: string;
};

export type BookingErrors = Record<string, string>;
