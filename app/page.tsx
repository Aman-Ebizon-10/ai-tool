import type { Metadata } from "next";
import ScanForm from "@/app/components/ScanForm";

export const metadata: Metadata = {
  title: "ShopAudit — Complete Shopify Store Analysis",
  description:
    "Audit any Shopify store in seconds. Detect themes, installed apps, SEO health, and Core Web Vitals — no login required.",
};

const auditModules = [
  {
    color: "indigo" as const,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    title: "Theme Detection",
    description:
      "Identify the exact Shopify theme powering any store, including version details, publisher info, and customization depth.",
    checks: [
      "Theme name, version & publisher",
      "OS 2.0 vs. legacy architecture",
      "Custom sections & block detection",
      "Template overrides & modifications",
    ],
  },
  {
    color: "violet" as const,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
      </svg>
    ),
    title: "App Detection",
    description:
      "Discover which third-party apps are installed — from marketing tools and review widgets to loyalty programs.",
    checks: [
      "Email & SMS apps (Klaviyo, Omnisend)",
      "Review apps (Judge.me, Yotpo, Loox)",
      "Loyalty & rewards programs",
      "Live chat & support tools",
    ],
  },
  {
    color: "emerald" as const,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
      </svg>
    ),
    title: "SEO Audit",
    description:
      "Evaluate on-page SEO health across meta tags, structured data, sitemaps, and crawlability signals.",
    checks: [
      "Title tags & meta descriptions",
      "Structured data & schema markup",
      "Sitemap & robots.txt validation",
      "Canonical tags & redirect chains",
    ],
  },
  {
    color: "amber" as const,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "PageSpeed Insights",
    description:
      "Measure real-world performance with Core Web Vitals and surface exactly what's slowing your store down.",
    checks: [
      "Largest Contentful Paint (LCP)",
      "Cumulative Layout Shift (CLS)",
      "Interaction to Next Paint (INP)",
      "Mobile vs. desktop score comparison",
    ],
  },
];

const colorMap = {
  indigo: { card: "bg-indigo-50 hover:bg-indigo-100/70", icon: "bg-indigo-100 text-indigo-600", check: "text-indigo-500" },
  violet: { card: "bg-violet-50 hover:bg-violet-100/70", icon: "bg-violet-100 text-violet-600", check: "text-violet-500" },
  emerald: { card: "bg-emerald-50 hover:bg-emerald-100/70", icon: "bg-emerald-100 text-emerald-600", check: "text-emerald-500" },
  amber: { card: "bg-amber-50 hover:bg-amber-100/70", icon: "bg-amber-100 text-amber-600", check: "text-amber-500" },
};

const steps = [
  {
    num: "01",
    title: "Enter your store URL",
    desc: "Paste any Shopify store URL — your own store or a competitor's. No login or API key needed.",
  },
  {
    num: "02",
    title: "We run the audit",
    desc: "Our scanner analyzes the store across all four modules simultaneously in real time.",
  },
  {
    num: "03",
    title: "Review your report",
    desc: "Get a detailed, actionable report with scores and recommendations in under 30 seconds.",
  },
];

const stats = [
  { value: "10,000+", label: "Stores audited" },
  { value: "4", label: "Audit modules" },
  { value: "<30s", label: "Average scan time" },
  { value: "100%", label: "Free to use" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* ── Navbar ── */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </span>
            <span className="text-lg font-bold text-slate-900">ShopAudit</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How it works</a>
          </div>

          <a
            href="#scan"
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition-colors"
          >
            Get Started Free
          </a>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section id="scan" className="bg-white pb-28 pt-36">
        {/* Outer wrapper expands to 7xl so results card has room */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Hero text — keep centered and narrow */}
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
              Free Shopify Store Analyzer
            </div>

            <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl md:text-7xl leading-[1.08]">
              Audit Any Shopify Store{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent">
                in Seconds
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#475569]">
              Instantly uncover the theme, installed apps, SEO health, and Core Web Vitals for any Shopify store — no login required.
            </p>
          </div>

          {/* Form + results — expands with the 7xl outer wrapper */}
          <ScanForm variant="dark" />

          <p className="mt-5 text-center text-sm text-slate-400">
            No account needed &nbsp;·&nbsp; 100% free &nbsp;·&nbsp; Results in under 30 seconds
          </p>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 divide-x divide-slate-100 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center py-8 px-4 text-center">
                <dt className="text-2xl font-bold text-slate-900">{s.value}</dt>
                <dd className="mt-1 text-sm text-slate-500">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* ── Audit modules ── */}
      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">
              Audit Modules
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Four powerful insights, one scan
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500">
              Every module runs simultaneously so you get a complete picture the moment the scan finishes.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {auditModules.map((mod) => {
              const c = colorMap[mod.color];
              return (
                <div
                  key={mod.title}
                  className={`${c.card} rounded-2xl p-8 transition-colors`}
                >
                  <div className={`${c.icon} mb-5 flex h-12 w-12 items-center justify-center rounded-xl`}>
                    {mod.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900">{mod.title}</h3>
                  <p className="mb-5 leading-relaxed text-slate-500">{mod.description}</p>
                  <ul className="space-y-2.5">
                    {mod.checks.map((check) => (
                      <li key={check} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <svg
                          className={`${c.check} mt-0.5 h-4 w-4 shrink-0`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        {check}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="border-y border-slate-100 bg-slate-50 py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">
              Simple Process
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How it works
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center">
                {i < steps.length - 1 && (
                  <div
                    className="pointer-events-none absolute hidden md:block"
                    style={{ top: "2rem", left: "62%", right: "-12%", height: "1px", background: "linear-gradient(to right, #c7d2fe, transparent)" }}
                  />
                )}
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-indigo-100 bg-white shadow-sm">
                  <span className="text-xl font-black text-indigo-500">{step.num}</span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-24" style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)" }}>
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to audit your store?
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-lg text-indigo-200">
            Join thousands of Shopify merchants using ShopAudit to gain a competitive edge.
          </p>
          <a
            href="#scan"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-indigo-600 shadow-lg shadow-black/10 transition-colors hover:bg-indigo-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z"
              />
            </svg>
            Scan Your Store — It&apos;s Free
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500">
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </span>
              <span className="font-bold text-white">ShopAudit</span>
            </div>

            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} ShopAudit. All rights reserved.
            </p>

            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
