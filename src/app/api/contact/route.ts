import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_RECIPIENT = "of.northframe@gmail.com";
const MAX_FIELD_LENGTH = 4000;

type ContactPayload = {
  services?: unknown;
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  projectDetails?: unknown;
  website?: unknown;
};

function cleanText(value: unknown, max = MAX_FIELD_LENGTH) {
  return typeof value === "string"
    ? value.replace(/\0/g, "").trim().slice(0, max)
    : "";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function getGmailAccessToken() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Gmail OAuth environment variables are not configured.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Unable to refresh Gmail access token (${response.status}).`);
  }

  const data = (await response.json()) as { access_token?: string };

  if (!data.access_token) {
    throw new Error("Gmail access token was not returned.");
  }

  return data.access_token;
}

function buildEmail({
  name,
  phone,
  email,
  projectDetails,
  services,
  sender,
  recipient,
}: {
  name: string;
  phone: string;
  email: string;
  projectDetails: string;
  services: string[];
  sender: string;
  recipient: string;
}) {
  const subject = `New NORTHFRAME enquiry — ${name}`;
  const safeName = escapeHtml(name);
  const safePhone = escapeHtml(phone);
  const safeEmail = escapeHtml(email || "Not provided");
  const safeDetails = escapeHtml(projectDetails || "Not provided").replace(
    /\n/g,
    "<br />"
  );
  const safeServices = services.map(escapeHtml).join(", ");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border-collapse:collapse;">
            <tr>
              <td style="background:#05080b;padding:28px 32px;">
                <div style="font-size:12px;letter-spacing:2px;color:#1677ff;font-weight:700;">NORTHFRAME</div>
                <div style="margin-top:8px;font-size:26px;line-height:1.15;color:#ffffff;font-weight:700;">New website enquiry</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:0 0 18px;font-size:12px;letter-spacing:1.3px;text-transform:uppercase;color:#6b7280;">Name</td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 24px;font-size:18px;font-weight:700;color:#111111;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding:18px 0 8px;border-top:1px solid #ececec;font-size:12px;letter-spacing:1.3px;text-transform:uppercase;color:#6b7280;">Services</td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 24px;font-size:16px;color:#111111;">${safeServices}</td>
                  </tr>
                  <tr>
                    <td style="padding:18px 0 8px;border-top:1px solid #ececec;font-size:12px;letter-spacing:1.3px;text-transform:uppercase;color:#6b7280;">Contact</td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 6px;font-size:16px;color:#111111;"><strong>Phone:</strong> ${safePhone}</td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 24px;font-size:16px;color:#111111;"><strong>Email:</strong> ${safeEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding:18px 0 8px;border-top:1px solid #ececec;font-size:12px;letter-spacing:1.3px;text-transform:uppercase;color:#6b7280;">Project details</td>
                  </tr>
                  <tr>
                    <td style="padding:0;font-size:16px;line-height:1.65;color:#333333;">${safeDetails}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background:#1677ff;padding:16px 32px;font-size:12px;color:#ffffff;letter-spacing:.4px;">
                Sent from the NORTHFRAME website contact form.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    "NORTHFRAME — New website enquiry",
    "",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Email: ${email || "Not provided"}`,
    `Services: ${services.join(", ")}`,
    "",
    "Project details:",
    projectDetails || "Not provided",
  ].join("\n");

  const boundary = `northframe-${Date.now()}`;
  const replyTo = email && isEmail(email) ? safeHeader(email) : sender;
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject, "utf8").toString(
    "base64"
  )}?=`;

  return [
    `From: NORTHFRAME Website <${safeHeader(sender)}>`,
    `To: ${safeHeader(recipient)}`,
    `Reply-To: ${replyTo}`,
    `Subject: ${encodedSubject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    "",
    `--${boundary}--`,
  ].join("\r\n");
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ContactPayload;

    // Honeypot: bots commonly fill hidden website/company fields.
    if (cleanText(payload.website, 200)) {
      return NextResponse.json({ ok: true });
    }

    const services = Array.isArray(payload.services)
      ? payload.services
          .filter((item): item is string => typeof item === "string")
          .map((item) => cleanText(item, 80))
          .filter(Boolean)
          .slice(0, 10)
      : [];

    const name = cleanText(payload.name, 120);
    const phone = cleanText(payload.phone, 40);
    const email = cleanText(payload.email, 180);
    const projectDetails = cleanText(payload.projectDetails, 4000);

    if (!name || !phone || services.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Please complete the required fields." },
        { status: 400 }
      );
    }

    if (!/^\+?[0-9\s\-()]{7,20}$/.test(phone)) {
      return NextResponse.json(
        { ok: false, message: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    if (email && !isEmail(email)) {
      return NextResponse.json(
        { ok: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const sender =
      process.env.GMAIL_SENDER_EMAIL || process.env.CONTACT_TO_EMAIL;
    const recipient =
      process.env.CONTACT_TO_EMAIL || DEFAULT_RECIPIENT;

    if (!sender) {
      throw new Error("GMAIL_SENDER_EMAIL is not configured.");
    }

    const accessToken = await getGmailAccessToken();
    const raw = buildEmail({
      name,
      phone,
      email,
      projectDetails,
      services,
      sender,
      recipient,
    });

    const gmailResponse = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raw: toBase64Url(raw),
        }),
        cache: "no-store",
      }
    );

    if (!gmailResponse.ok) {
      const details = await gmailResponse.text();
      console.error("Gmail send failed:", gmailResponse.status, details);
      throw new Error("Unable to send enquiry email.");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          "We could not send your enquiry right now. Please try WhatsApp or email us directly.",
      },
      { status: 500 }
    );
  }
}
