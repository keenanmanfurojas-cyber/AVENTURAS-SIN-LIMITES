import Image from "next/image";

type AdventurePassStatus = "confirmed" | "pending" | "review";

export type AdventurePassData = {
  code: string;
  date: string;
  explorers: number;
  heroImage: string;
  meetingPoint: string;
  qrImage?: string;
  recommendations: string[];
  status: AdventurePassStatus;
  time: string;
  tourName: string;
};

type AdventurePassProps = Readonly<{
  data: AdventurePassData;
}>;

type PassIconName = "calendar" | "clock" | "pin" | "users";

const statusContent: Record<
  AdventurePassStatus,
  { label: string; tone: string }
> = {
  confirmed: {
    label: "Expedición confirmada",
    tone: "border-[#b7e34b]/45 bg-[#b7e34b]/10 text-[#d8ff7c]",
  },
  pending: {
    label: "Validación en curso",
    tone: "border-[#d9bd8b]/40 bg-[#d9bd8b]/10 text-[#f3d8a8]",
  },
  review: {
    label: "Ajuste rápido",
    tone: "border-[#c97955]/45 bg-[#c97955]/10 text-[#f1b294]",
  },
};

function PassIcon({ name }: Readonly<{ name: PassIconName }>) {
  const paths = {
    calendar: (
      <>
        <path d="M7 3v3M17 3v3M4 9h16" />
        <rect height="17" rx="2" width="16" x="4" y="4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    users: (
      <>
        <path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 20v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

function MockQrCode() {
  const pattern = [
    "111111101010101111111",
    "100000101110101000001",
    "101110100010101011101",
    "101110101101101011101",
    "101110100111101011101",
    "100000101000101000001",
    "111111101010101111111",
    "000000001101100000000",
    "101011111011111010101",
    "011100001010001110010",
    "110111101111101011111",
    "001001010001001001000",
    "111010111101111110101",
    "000000001011001010010",
    "111111101101111011101",
    "100000101010001010000",
    "101110101111111111101",
    "101110100001001001010",
    "101110101111101111111",
    "100000100100101000101",
    "111111101111111101111",
  ];
  const cells = pattern.flatMap((row, rowIndex) =>
    [...row].map((cell, columnIndex) =>
      cell === "1" ? (
        <rect
          height="1"
          key={`${rowIndex}-${columnIndex}`}
          width="1"
          x={columnIndex}
          y={rowIndex}
        />
      ) : null,
    ),
  );
  return (
    <svg
      aria-label="Código QR visual de demostración"
      className="size-full"
      fill="currentColor"
      role="img"
      shapeRendering="crispEdges"
      viewBox="-2 -2 25 25"
    >
      {cells}
    </svg>
  );
}

function PassDetail({
  icon,
  label,
  value,
  wide = false,
}: Readonly<{
  icon: PassIconName;
  label: string;
  value: string;
  wide?: boolean;
}>) {
  return (
    <div
      className={`border-t border-[#17382c]/15 py-5 ${wide ? "sm:col-span-2" : ""}`}
    >
      <div className="flex gap-3">
        <span className="mt-0.5 text-[#b45437]">
          <PassIcon name={icon} />
        </span>
        <div>
          <dt className="pass-microtype text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-[#667064]">
            {label}
          </dt>
          <dd className="mt-1.5 text-sm font-extrabold leading-6 text-[#17382c] sm:text-base">
            {value}
          </dd>
        </div>
      </div>
    </div>
  );
}

export function AdventurePass({ data }: AdventurePassProps) {
  const status = statusContent[data.status];
  return (
    <article className="adventure-pass-print relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] bg-[#f0ebdf] text-[#1f241f] shadow-[0_45px_120px_rgba(0,0,0,0.42)]">
      <div className="adventure-pass-grid grid lg:grid-cols-[1.52fr_0.68fr]">
        <div className="min-w-0">
          <header className="adventure-pass-hero relative min-h-[28rem] overflow-hidden sm:min-h-[34rem]">
            <Image
              alt=""
              className="object-cover object-center"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 72vw"
              src={data.heroImage}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,25,18,0.05)_8%,rgba(8,25,18,0.3)_52%,rgba(8,25,18,0.94)_100%)]" />
            <div className="absolute inset-0 opacity-20 [background-image:repeating-radial-gradient(ellipse_at_110%_-10%,transparent_0,transparent_38px,rgba(255,255,255,.28)_39px,transparent_40px)]" />
            <div className="adventure-pass-hero-inner relative flex min-h-[28rem] flex-col justify-between p-6 sm:min-h-[34rem] sm:p-10">
              <div className="flex items-start justify-between gap-5">
                <Image
                  alt="Aventuras Sin Límites"
                  className="h-auto w-36 sm:w-44"
                  height={128}
                  src="/images/brand/logo-aventuras-sin-limites.png"
                  width={240}
                />
                <span className="pass-microtype border-l border-white/50 pl-4 text-right text-[0.58rem] font-extrabold uppercase leading-4 tracking-[0.22em] text-white">
                  Costa Rica
                  <br />
                  Expedition Series
                </span>
              </div>
              <div>
                <p className="pass-microtype text-[0.65rem] font-extrabold uppercase tracking-[0.28em] text-[#b7e34b]">
                  Adventure Pass
                </p>
                <h1 className="mt-3 max-w-3xl font-sans text-4xl font-extrabold uppercase leading-[0.95] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                  {data.tourName}
                </h1>
                <div
                  className={`pass-microtype mt-6 inline-flex border px-3.5 py-2 text-[0.62rem] font-extrabold uppercase tracking-[0.16em] ${status.tone}`}
                >
                  {status.label}
                </div>
              </div>
            </div>
          </header>

          <div className="adventure-pass-body relative px-6 py-8 sm:px-10 sm:py-10">
            <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:repeating-radial-gradient(ellipse_at_100%_5%,transparent_0,transparent_31px,rgba(23,56,44,.08)_32px,transparent_33px)]" />
            <div className="relative">
              <div className="flex flex-col justify-between gap-5 border-b-[3px] border-[#17382c] pb-6 sm:flex-row sm:items-end">
                <div>
                  <p className="pass-microtype text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-[#667064]">
                    Código de expedición
                  </p>
                  <p className="mt-2 font-mono text-2xl font-bold tracking-[0.08em] text-[#17382c] sm:text-3xl">
                    {data.code}
                  </p>
                </div>
                <p className="max-w-xs text-xs font-semibold leading-5 text-[#667064] sm:text-right">
                  Pase oficial de acceso. Preséntalo al equipo al iniciar la
                  experiencia.
                </p>
              </div>
              <dl className="grid sm:grid-cols-2 sm:gap-x-10">
                <PassDetail
                  icon="calendar"
                  label="Fecha"
                  value={data.date}
                />
                <PassDetail icon="clock" label="Hora" value={data.time} />
                <PassDetail
                  icon="users"
                  label="Exploradores"
                  value={`${data.explorers} ${data.explorers === 1 ? "persona" : "personas"}`}
                />
                <PassDetail
                  icon="pin"
                  label="Punto de encuentro"
                  value={data.meetingPoint}
                />
              </dl>
            </div>
          </div>
        </div>

        <aside className="adventure-pass-aside relative flex flex-col bg-[#17382c] text-white lg:border-l lg:border-dashed lg:border-[#f0ebdf]/40">
          <div className="absolute -left-4 top-[-1rem] hidden size-8 rounded-full bg-[#070606] lg:block" />
          <div className="absolute -left-4 bottom-[-1rem] hidden size-8 rounded-full bg-[#070606] lg:block" />
          <div className="adventure-pass-aside-body flex-1 p-6 sm:p-10 lg:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-6">
              <div>
                <p className="pass-microtype text-[0.58rem] font-extrabold uppercase tracking-[0.2em] text-[#9eac9e]">
                  Validación
                </p>
                <p className="mt-2 text-sm font-extrabold uppercase tracking-[0.08em]">
                  Pase individual
                </p>
              </div>
              <span className="size-2.5 rounded-full bg-[#b7e34b] shadow-[0_0_18px_rgba(183,227,75,.65)]" />
            </div>

            <div className="adventure-pass-qr mx-auto mt-8 aspect-square w-full max-w-[13rem] bg-[#f8f4e9] p-4 text-[#17382c]">
              {data.qrImage ? (
                // El QR es una imagen generada en servidor a partir del enlace
                // firmado de Mi Reserva. No contiene datos personales.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt="Código QR para consultar Mi Reserva"
                  className="size-full"
                  src={data.qrImage}
                />
              ) : (
                <MockQrCode />
              )}
            </div>
            <p className="pass-microtype mt-4 text-center font-mono text-[0.62rem] font-bold uppercase tracking-[0.15em] text-[#9eac9e]">
              {data.qrImage ? "Escanear · Mi Reserva" : "QR visual · datos mock"}
            </p>

            <div className="adventure-pass-recommendations mt-10 border-t border-white/15 pt-7">
              <p className="pass-microtype text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-[#b7e34b]">
                Prepárate para explorar
              </p>
              <ul className="mt-5 space-y-4">
                {data.recommendations.map((recommendation, index) => (
                  <li
                    className="pass-microtype flex gap-3 text-xs font-semibold leading-5 text-[#d6ddd5]"
                    key={recommendation}
                  >
                    <span className="font-mono text-[#c97955]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <footer className="adventure-pass-footer border-t border-white/15 bg-[#102c22] px-6 py-6 sm:px-10 lg:px-8">
            <div className="flex items-center justify-between gap-5">
              <Image
                alt="Aventuras Sin Límites"
                className="h-auto w-24 opacity-90"
                height={80}
                src="/images/brand/logo-aventuras-sin-limites.png"
                width={160}
              />
              <p className="pass-microtype text-right text-xs font-bold uppercase leading-4 tracking-[0.14em] text-[#8f9c90]">
                Naturaleza sin fronteras
                <br />
                San Carlos · Costa Rica
              </p>
            </div>
          </footer>
        </aside>
      </div>
    </article>
  );
}
