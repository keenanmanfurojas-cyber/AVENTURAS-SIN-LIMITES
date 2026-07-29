export const phoneCountryOptions = [
  { code: "+506", label: "Costa Rica (+506)" },
  { code: "+1", label: "Estados Unidos / Canadá (+1)" },
  { code: "+502", label: "Guatemala (+502)" },
  { code: "+503", label: "El Salvador (+503)" },
  { code: "+504", label: "Honduras (+504)" },
  { code: "+505", label: "Nicaragua (+505)" },
  { code: "+507", label: "Panamá (+507)" },
  { code: "+52", label: "México (+52)" },
  { code: "+34", label: "España (+34)" },
] as const;

export function normalizeEmail(value: string) {
  return value.trim().toLocaleLowerCase("en-US");
}

export function emailIsValid(value: string) {
  const normalized = normalizeEmail(value);
  return (
    normalized.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized)
  );
}

export function normalizePhoneToE164(
  value: string,
  defaultCountryCode = "+506",
) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");
  const countryDigits = defaultCountryCode.replace(/\D/g, "");
  const normalized = trimmed.startsWith("+")
    ? `+${digits}`
    : `+${countryDigits}${digits}`;

  return /^\+[1-9]\d{7,14}$/.test(normalized) ? normalized : null;
}

export function phoneIsValid(value: string, defaultCountryCode = "+506") {
  return normalizePhoneToE164(value, defaultCountryCode) !== null;
}

export function inferPhoneCountryCode(value: string) {
  return (
    phoneCountryOptions.find(({ code }) => value.trim().startsWith(code))?.code ??
    "+506"
  );
}

export function maskEmail(value: string) {
  const [local = "", domain = ""] = normalizeEmail(value).split("@");
  if (!local || !domain) return "***";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(2, local.length - visible.length))}@${domain}`;
}

export function phoneDigitsForWhatsApp(value: string) {
  return normalizePhoneToE164(value)?.slice(1) ?? null;
}
