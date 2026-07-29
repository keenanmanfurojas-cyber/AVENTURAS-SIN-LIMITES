export const acceptedPaymentProofTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const maximumOriginalPaymentProofBytes = 3 * 1024 * 1024;
export const maximumFinalPaymentProofBytes = 1.5 * 1024 * 1024;
export const maximumPaymentProofDimension = 1600;

export function paymentProofTypeIsAccepted(type: string) {
  return acceptedPaymentProofTypes.includes(
    type as (typeof acceptedPaymentProofTypes)[number],
  );
}
