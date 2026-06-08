import type { GetServerSideProps } from "next";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// ── Age selector values (must match index.html <option> values) ────────────
const AGE_OPTIONS = [
  { value: "0-3m",  min: 0,   max: 3   },
  { value: "4m",    min: 4,   max: 4   },
  { value: "5m",    min: 5,   max: 5   },
  { value: "6m",    min: 6,   max: 6   },
  { value: "7m",    min: 7,   max: 7   },
  { value: "8m",    min: 8,   max: 8   },
  { value: "9m",    min: 9,   max: 9   },
  { value: "10m",   min: 10,  max: 10  },
  { value: "11m",   min: 11,  max: 11  },
  { value: "12m",   min: 12,  max: 12  },
  { value: "18m",   min: 18,  max: 18  },
  { value: "2y",    min: 24,  max: 24  },
  { value: "3y",    min: 36,  max: 36  },
  { value: "4y",    min: 48,  max: 48  },
  { value: "5y",    min: 60,  max: 60  },
  { value: "6y",    min: 72,  max: 72  },
  { value: "7-12y", min: 84,  max: 144 },
] as const;

// Which age selector options should show this activity?
function computeAgeRange(
  minMonths: number | null,
  maxMonths: number | null,
): string[] {
  const actMin = minMonths ?? 0;
  const actMax = maxMonths ?? 999;
  return AGE_OPTIONS.filter(
    (opt) => opt.min <= actMax && opt.max >= actMin,
  ).map((opt) => opt.value);
}

function computeAgeLabel(
  minMonths: number | null,
  maxMonths: number | null,
): string {
  if (minMonths === null && maxMonths === null) return "All ages";
  const a = minMonths ?? 0;
  const b = maxMonths ?? 999;
  if (b >= 144) return "All ages";
  const isYear = (m: number) => m >= 12 && m % 12 === 0;
  if (a === 0 && isYear(b)) return `0–${b / 12} year${b / 12 !== 1 ? "s" : ""}`;
  if (isYear(a) && isYear(b)) return `${a / 12}–${b / 12} year${b / 12 !== 1 ? "s" : ""}`;
  return `${a}–${b} months`;
}

// "10:30:00" → "10:30 AM"
function formatTime(timeStr: string): string {
  const [hh, mm] = timeStr.split(":").map(Number);
  const period = hh >= 12 ? "PM" : "AM";
  const h = hh % 12 || 12;
  return `${h}:${String(mm).padStart(2, "0")} ${period}`;
}

function councilToArea(council: string | null): string {
  return council === "city_of_sydney" ? "city-of-sydney" : "inner-west";
}

function costLabel(isFree: boolean, priceAmount: number | null): string {
  if (isFree) return "FREE";
  if (priceAmount != null) return `$${Math.round(priceAmount)}`;
  return "PAID";
}

// ── Supabase fetch ─────────────────────────────────────────────────────────

interface OccurrenceRow {
  id: string;
  date: string;
  start_time: string;
  activities: {
    id: string;
    name: string;
    description: string | null;
    is_free: boolean;
    price_amount: number | null;
    min_age_months: number | null;
    max_age_months: number | null;
    website_url: string | null;
    booking_url: string | null;
    booking_required: boolean | null;
    venues: {
      name: string;
      suburb: string | null;
      council_area: string | null;
      google_maps_url: string | null;
    } | null;
  } | null;
}

async function fetchActivities() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  const supabase = createClient(url, key);

  // 3 days back (so prev-day nav works on load) + 30 days ahead.
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - 3);
  const to = new Date(today);
  to.setDate(to.getDate() + 30);

  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const { data, error } = await supabase
    .from("occurrences")
    .select(
      `id, date, start_time,
       activities (
         id, name, description, is_free, price_amount,
         min_age_months, max_age_months,
         website_url, booking_url, booking_required,
         venues ( name, suburb, council_area, google_maps_url )
       )`
    )
    .eq("status", "scheduled")
    .gte("date", fmt(from))
    .lte("date", fmt(to))
    .order("date")
    .order("start_time");

  if (error || !data) return [];

  return (data as unknown as OccurrenceRow[])
    .filter((occ) => occ.activities && occ.activities.venues)
    .map((occ, i) => {
      const act = occ.activities!;
      const venue = act.venues!;
      const suburb = venue.suburb ? `, ${venue.suburb}` : "";
      return {
        id: i + 1,
        name: act.name,
        url: act.website_url ?? act.booking_url ?? "#",
        desc: act.description ?? "",
        time: formatTime(occ.start_time),
        cost: costLabel(act.is_free, act.price_amount),
        booking: act.booking_required ?? false,
        ageRange: computeAgeRange(act.min_age_months, act.max_age_months),
        ageLabel: computeAgeLabel(act.min_age_months, act.max_age_months),
        location: `${venue.name}${suburb}`,
        area: councilToArea(venue.council_area),
        date: occ.date,
      };
    });
}

// ── Next.js page ───────────────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Read from public/index.html (where the static HTML lives)
  const html = fs.readFileSync(
    path.join(process.cwd(), "public", "index.html"),
    "utf8",
  );

  const activities = await fetchActivities();

  // Replace the hardcoded mock activities array with live Supabase data.
  const injected = html.replace(
    /const activities = \[[\s\S]*?\n\];/,
    `const activities = ${JSON.stringify(activities, null, 2)};`,
  );

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(injected);
  return { props: {} };
};

export default function Home() {
  return null;
}
