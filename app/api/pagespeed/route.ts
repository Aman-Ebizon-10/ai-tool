import { fetchPageSpeedMobile, fetchPageSpeedDesktop } from "@/app/lib/pagespeed";

export const maxDuration = 60;

const hasApiKey = !!(
  process.env.GOOGLE_PAGESPEED_API_KEY ?? process.env.PAGESPEED_API_KEY
);
console.log(
  `[/api/pagespeed] Loaded — API key ${hasApiKey ? "present" : "missing (set GOOGLE_PAGESPEED_API_KEY in .env.local)"}`
);

const BLOCKED_HOSTS =
  /^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1|0\.0\.0\.0)/i;

export async function POST(request: Request) {
  let url: string;
  try {
    const body = await request.json();
    url = typeof body?.url === "string" ? body.url.trim() : "";
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!url) {
    return Response.json({ error: "URL is required" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
  } catch {
    return Response.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(target.protocol)) {
    return Response.json({ error: "Only HTTP/HTTPS URLs are allowed" }, { status: 400 });
  }

  if (BLOCKED_HOSTS.test(target.hostname)) {
    return Response.json({ error: "URL not allowed" }, { status: 403 });
  }

  const [mobileResult, desktopResult] = await Promise.allSettled([
    fetchPageSpeedMobile(target.toString()),
    fetchPageSpeedDesktop(target.toString()),
  ]);

  const mobileRes = mobileResult.status === "fulfilled" ? mobileResult.value : null;
  const desktopRes = desktopResult.status === "fulfilled" ? desktopResult.value : null;

  if (!mobileRes && !desktopRes) {
    const firstError =
      mobileResult.status === "rejected"
        ? (mobileResult.reason as Error)?.message
        : (desktopResult as PromiseRejectedResult).reason?.message;

    console.error("[/api/pagespeed] Both strategies failed:", firstError);

    const apiKeyHint = hasApiKey
      ? ""
      : " Add GOOGLE_PAGESPEED_API_KEY to .env.local to avoid rate limits.";

    return Response.json(
      {
        error: `PageSpeed API unavailable — ${firstError ?? "unknown error"}.${apiKeyHint}`,
      },
      { status: 503 }
    );
  }

  return Response.json({ mobile: mobileRes, desktop: desktopRes });
}
