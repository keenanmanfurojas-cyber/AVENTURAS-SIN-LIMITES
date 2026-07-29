export type EmailProgressState = "active" | "complete" | "muted" | "warning";

export type EmailProgressStep = {
  label: string;
  state: EmailProgressState;
};

export type EmailDetail = {
  featured?: boolean;
  label: string;
  value: string;
};

export type EmailAction = {
  href: string;
  label: string;
  secondary?: boolean;
};

export type PremiumEmailLayoutInput = {
  actions: EmailAction[];
  appUrl: string;
  badge: string;
  badgeColor: string;
  callout?: {
    label: string;
    text: string;
  };
  code: string;
  details: EmailDetail[];
  eyebrow: string;
  heading: string;
  heroUrl: string;
  intro: string;
  logoUrl: string;
  nextSteps: string[];
  progress: EmailProgressStep[];
};

const palette = {
  charcoal: "#211f1a",
  cream: "#f3eee3",
  creamDark: "#e6ddcc",
  forest: "#163b2d",
  ink: "#20241f",
  lime: "#b7e34b",
  muted: "#686b62",
  sand: "#d9bd8b",
  terracotta: "#c97955",
  white: "#fffdf7",
};

export function escapeEmailHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character]!,
  );
}

function renderProgress(steps: EmailProgressStep[]) {
  return steps
    .map((step, index) => {
      const complete = step.state === "complete";
      const active = step.state === "active";
      const warning = step.state === "warning";
      const color = complete
        ? palette.forest
        : active
          ? palette.lime
          : warning
            ? palette.terracotta
            : "#b8b4a9";
      const labelColor =
        active || complete || warning ? palette.ink : palette.muted;
      return `<td align="${index === 0 ? "left" : index === steps.length - 1 ? "right" : "center"}" style="width:33.333%;vertical-align:top">
        <div style="background:${color};height:5px;margin:${index === 0 ? "0 2px 0 0" : index === steps.length - 1 ? "0 0 0 2px" : "0 2px"}"></div>
        <div style="color:${labelColor};font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:800;letter-spacing:.08em;line-height:15px;margin-top:9px;text-transform:uppercase">${escapeEmailHtml(step.label)}</div>
      </td>`;
    })
    .join("");
}

function renderDetails(details: EmailDetail[]) {
  return details
    .map(
      (detail, index) => `<tr>
        <td style="border-top:${index === 0 ? "0" : `1px solid ${palette.creamDark}`};padding:17px 0;vertical-align:middle">
          <div style="color:${palette.muted};font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase">${escapeEmailHtml(detail.label)}</div>
        </td>
        <td align="right" style="border-top:${index === 0 ? "0" : `1px solid ${palette.creamDark}`};padding:17px 0 17px 18px;vertical-align:middle">
          <div style="color:${palette.ink};font-family:${detail.featured ? "'Arial Narrow','Helvetica Neue Condensed',Impact,sans-serif" : "Arial,Helvetica,sans-serif"};font-size:${detail.featured ? "22px" : "15px"};font-weight:800;line-height:${detail.featured ? "26px" : "22px"};text-transform:${detail.featured ? "uppercase" : "none"}">${escapeEmailHtml(detail.value)}</div>
        </td>
      </tr>`,
    )
    .join("");
}

function renderActions(actions: EmailAction[]) {
  return actions
    .map((action) =>
      action.secondary
        ? `<tr><td align="center" style="padding:7px 0">
          <a href="${escapeEmailHtml(action.href)}" style="border-bottom:1px solid #879086;color:${palette.forest};display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:800;line-height:20px;padding:3px 1px;text-decoration:none">${escapeEmailHtml(action.label)} &nbsp;→</a>
        </td></tr>`
        : `<tr><td align="center" style="padding:7px 0">
          <a href="${escapeEmailHtml(action.href)}" style="background:${palette.lime};border-radius:9px;color:#142018;display:block;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:900;letter-spacing:.08em;line-height:20px;padding:16px 22px;text-align:center;text-decoration:none;text-transform:uppercase">${escapeEmailHtml(action.label)} &nbsp;→</a>
        </td></tr>`,
    )
    .join("");
}

export function renderPremiumBookingEmail(input: PremiumEmailLayoutInput) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light only">
  <title>${escapeEmailHtml(input.heading)}</title>
  <style>
    @media only screen and (max-width:620px){
      .email-shell{width:100%!important}
      .email-pad{padding-left:22px!important;padding-right:22px!important}
      .hero{padding:28px 22px 30px!important}
      .hero-space{height:130px!important}
      .hero-title{font-size:37px!important;line-height:38px!important}
      .ticket-code{font-size:23px!important}
    }
  </style>
</head>
<body style="background:${palette.charcoal};margin:0;padding:0">
  <div style="display:none;max-height:0;overflow:hidden">${escapeEmailHtml(input.heading)} · ${escapeEmailHtml(input.code)}</div>
  <table role="presentation" style="background:${palette.charcoal};border-collapse:collapse;width:100%">
    <tr><td align="center" style="padding:22px 10px 34px">
      <table class="email-shell" role="presentation" style="border-collapse:separate;border-spacing:0;max-width:680px;overflow:hidden;width:100%">
        <tr><td class="hero" style="background-color:${palette.forest};background-image:linear-gradient(180deg,rgba(10,24,18,.06) 12%,rgba(10,24,18,.88) 82%),url('${escapeEmailHtml(input.heroUrl)}');background-position:center 44%;background-size:cover;border-radius:4px 4px 0 0;padding:32px 38px 34px">
          <table role="presentation" style="border-collapse:collapse;width:100%">
            <tr>
              <td><a href="${escapeEmailHtml(input.appUrl)}"><img alt="Aventuras Sin Límites" src="${escapeEmailHtml(input.logoUrl)}" style="display:block;height:auto;max-width:165px;width:46%"></a></td>
              <td align="right" style="color:#e8eadf;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase">Costa Rica<br>Expediciones</td>
            </tr>
          </table>
          <div class="hero-space" style="height:180px"></div>
          <div style="border-left:4px solid ${input.badgeColor};padding-left:16px">
            <div style="color:${input.badgeColor};font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:900;letter-spacing:.17em;text-transform:uppercase">${escapeEmailHtml(input.badge)}</div>
            <h1 class="hero-title" style="color:${palette.white};font-family:'Arial Narrow','Helvetica Neue Condensed',Impact,sans-serif;font-size:49px;font-stretch:condensed;letter-spacing:.01em;line-height:48px;margin:9px 0 0;text-transform:uppercase">${escapeEmailHtml(input.heading)}</h1>
          </div>
        </td></tr>
        <tr><td class="email-pad" style="background-color:${palette.cream};background-image:repeating-radial-gradient(ellipse at 110% 12%,transparent 0,transparent 20px,rgba(22,59,45,.045) 21px,transparent 22px);padding:34px 38px 42px">
          <div style="color:${palette.terracotta};font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:900;letter-spacing:.17em;text-transform:uppercase">${escapeEmailHtml(input.eyebrow)}</div>
          <p style="color:#3f433c;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:27px;margin:11px 0 0">${escapeEmailHtml(input.intro)}</p>

          <table role="presentation" style="border-collapse:collapse;margin-top:25px;width:100%">
            <tr>
              <td style="background:${palette.forest};border-radius:3px 0 0 3px;padding:19px 20px">
                <div style="color:#aebcaf;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase">Adventure pass · Código</div>
                <div class="ticket-code" style="color:${palette.white};font-family:'Courier New',monospace;font-size:27px;font-weight:700;letter-spacing:.08em;margin-top:7px">${escapeEmailHtml(input.code)}</div>
              </td>
              <td style="background:${input.badgeColor};border-left:2px dashed ${palette.forest};border-radius:0 3px 3px 0;padding:14px 11px;width:58px">
                <div style="color:${palette.forest};font-family:'Arial Narrow',Arial,sans-serif;font-size:10px;font-weight:900;letter-spacing:.08em;text-align:center;text-transform:uppercase;transform:rotate(-90deg);white-space:nowrap">Expedición</div>
              </td>
            </tr>
          </table>

          <table role="presentation" style="border-collapse:collapse;margin-top:27px;width:100%"><tr>${renderProgress(input.progress)}</tr></table>

          ${input.callout ? `<div style="background:#efe1cf;border-left:4px solid ${palette.terracotta};margin-top:27px;padding:19px 20px">
            <div style="color:#77442f;font-family:'Arial Narrow','Helvetica Neue Condensed',Impact,sans-serif;font-size:18px;font-weight:800;letter-spacing:.03em;text-transform:uppercase">${escapeEmailHtml(input.callout.label)}</div>
            <div style="color:#5e5047;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:23px;margin-top:7px">${escapeEmailHtml(input.callout.text)}</div>
          </div>` : ""}

          <div style="border-bottom:3px solid ${palette.forest};color:${palette.forest};font-family:'Arial Narrow','Helvetica Neue Condensed',Impact,sans-serif;font-size:20px;font-weight:800;letter-spacing:.05em;margin-top:30px;padding-bottom:9px;text-transform:uppercase">Detalles de la expedición</div>
          <table role="presentation" style="border-collapse:collapse;width:100%">${renderDetails(input.details)}</table>

          <table role="presentation" style="border-collapse:collapse;margin-top:28px;width:100%">
            <tr>
              <td style="border-top:1px solid ${palette.sand};padding-top:22px">
                <div style="color:${palette.forest};font-family:'Arial Narrow','Helvetica Neue Condensed',Impact,sans-serif;font-size:22px;font-weight:800;letter-spacing:.04em;text-transform:uppercase">¿Qué sigue?</div>
                <table role="presentation" style="border-collapse:collapse;margin-top:10px;width:100%">
                  ${input.nextSteps.map((step, index) => `<tr>
                    <td style="color:${palette.terracotta};font-family:'Courier New',monospace;font-size:12px;font-weight:700;padding:7px 12px 7px 0;vertical-align:top">0${index + 1}</td>
                    <td style="color:#454a42;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;padding:7px 0">${escapeEmailHtml(step)}</td>
                  </tr>`).join("")}
                </table>
              </td>
            </tr>
          </table>

          <table role="presentation" style="border-collapse:collapse;margin-top:24px;width:100%">${renderActions(input.actions)}</table>
          <div style="border-top:1px solid ${palette.creamDark};color:${palette.muted};font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;margin-top:24px;padding-top:18px;text-align:center">
            Conserva este correo: es parte de tu pase de expedición y contiene el código para consultar tu reserva.
          </div>
        </td></tr>
        <tr><td class="email-pad" style="background:${palette.forest};border-radius:0 0 4px 4px;padding:27px 38px">
          <table role="presentation" style="border-collapse:collapse;width:100%">
            <tr>
              <td style="vertical-align:middle"><img alt="Aventuras Sin Límites" src="${escapeEmailHtml(input.logoUrl)}" style="display:block;height:auto;max-width:118px;width:100%"></td>
              <td align="right" style="color:#c7d0c5;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;vertical-align:middle">
                ¿Necesitas ayuda? Estamos para acompañarte.<br>
                <a href="${escapeEmailHtml(input.actions.find((action) => action.label.includes("WhatsApp"))?.href ?? input.appUrl)}" style="color:${palette.lime};font-weight:800;text-decoration:none">Escríbenos por WhatsApp</a>
              </td>
            </tr>
          </table>
          <div style="border-top:1px solid rgba(255,255,255,.14);color:#87958a;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:17px;margin-top:20px;padding-top:15px;text-align:center">Aventuras Sin Límites · San Carlos, Costa Rica · Naturaleza sin fronteras</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
