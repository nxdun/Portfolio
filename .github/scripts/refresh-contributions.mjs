/* eslint-disable no-console */
// ─── Config ──────────────────────────────────────────────────────────
const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const SCHEMA_VERSION = 1;
const PROVIDER = "github";
const CACHE_TTL_SECONDS = 10800; // 3 hours

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const LEGEND_LABELS = [
  "No contributions",
  "Low",
  "Medium",
  "High",
  "Very high",
];

// Colors match Rust backend exactly
// Note: Level 0 uses 8-char hex with alpha (#2b2c3494)
const CONTRIBUTION_COLORS = [
  "#2b2c3494", // Level 0 (None)
  "#9be9a8", // Level 1 (Low)
  "#40c463", // Level 2 (Medium)
  "#30a14e", // Level 3 (High)
  "#216e39", // Level 4 (Very High)
];

const LEVEL_MAP = {
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

// ─── GraphQL Query (exact match of Rust backend) ─────────────
const CONTRIBUTIONS_QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              weekday
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

// ─── Step 1: Fetch from GitHub GraphQL ───────────────────────────────
async function fetchContributions(username, pat) {
  const resp = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pat}`,
      "Content-Type": "application/json",
      "User-Agent": "contributions-gha-refresh",
    },
    body: JSON.stringify({
      query: CONTRIBUTIONS_QUERY,
      variables: { username },
    }),
  });

  if (!resp.ok) {
    throw new Error(`GitHub API returned ${resp.status}: ${await resp.text()}`);
  }

  const json = await resp.json();

  if (json.errors?.length) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  const calendar =
    json.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) {
    throw new Error("User not found or missing contributionCalendar");
  }

  return calendar;
}

// ─── Step 2: Transform (1:1 port of Rust transform_calendar) ────────
function transformCalendar(username, calendar, fetchedAt) {
  const cells = [];
  const months = [];
  let maxDailyCount = 0;
  let lastMonth = null;

  // Track min/max per level for legend
  const levelMins = [0, Infinity, Infinity, Infinity, Infinity];
  const levelMaxs = [0, 0, 0, 0, 0];

  // "Today" in UTC for isFuture / isInCurrentMonth
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1; // 1-based
  const currentDay = now.getUTCDate();
  const currentDateStr = `${String(currentYear).padStart(4, "0")}-${String(currentMonth).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}`;

  const totalContributions = calendar.totalContributions;
  const totalWeeks = calendar.weeks.length;

  for (let weekIdx = 0; weekIdx < calendar.weeks.length; weekIdx++) {
    const week = calendar.weeks[weekIdx];
    let monthAddedThisWeek = false;

    for (const day of week.contributionDays) {
      if (day.contributionCount > maxDailyCount) {
        maxDailyCount = day.contributionCount;
      }

      // Parse date "YYYY-MM-DD"
      const yDay = parseInt(day.date.slice(0, 4), 10);
      const mDay = parseInt(day.date.slice(5, 7), 10);

      // Detect month transitions
      if (!monthAddedThisWeek && lastMonth !== mDay) {
        months.push({
          label: MONTH_LABELS[mDay - 1] || "",
          weekIndex: weekIdx,
        });
        monthAddedThisWeek = true;
      }
      lastMonth = mDay;

      const isFuture = day.date > currentDateStr;
      const isInCurrentMonth = mDay === currentMonth && yDay === currentYear;

      // Level mapping
      const level = LEVEL_MAP[day.contributionLevel] ?? 0;

      // Track min/max for legend
      if (level >= 1 && level <= 4) {
        levelMins[level] = Math.min(levelMins[level], day.contributionCount);
        levelMaxs[level] = Math.max(levelMaxs[level], day.contributionCount);
      }

      cells.push({
        date: day.date,
        weekIndex: weekIdx,
        weekday: day.weekday,
        weekdayLabel: WEEKDAY_LABELS[day.weekday] || "",
        count: day.contributionCount,
        level,
        color: CONTRIBUTION_COLORS[level],
        isFuture,
        isInCurrentMonth,
      });
    }
  }

  // Finalize legend
  const legend = Array.from({ length: 5 }, (_, i) => ({
    level: i,
    label: LEGEND_LABELS[i],
    min: levelMins[i] === Infinity ? 0 : levelMins[i],
    max: levelMaxs[i],
    color: CONTRIBUTION_COLORS[i],
  }));

  return {
    username,
    range: {
      from: cells[0]?.date ?? "",
      to: cells[cells.length - 1]?.date ?? "",
      timezone: "UTC",
    },
    summary: {
      totalContributions,
      totalWeeks,
      maxDailyCount,
    },
    legend,
    months,
    cells,
    meta: {
      provider: PROVIDER,
      cached: true, // Always "cached" since it's served from KV
      cacheTtlSeconds: CACHE_TTL_SECONDS,
      fetchedAt: fetchedAt.toISOString().replace(/\.\d{3}Z$/, "Z"),
      schemaVersion: SCHEMA_VERSION,
    },
  };
}

// ─── Step 3: Write to Cloudflare KV via REST API ─────────────────────
async function writeToKV(data, accountId, namespaceId, apiToken) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/contributions`;

  const resp = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`CF KV write failed (${resp.status}): ${body}`);
  }

  const result = await resp.json();
  if (!result.success) {
    throw new Error(`CF KV write error: ${JSON.stringify(result.errors)}`);
  }
}

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  const GITHUB_PAT =
    process.env.GITHUB_PAT ||
    process.env.GH_CONTRIBUTIONS_PAT ||
    process.env.GITHUB_TOKEN;
  const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "nxdun";
  const CF_ACCOUNT_ID =
    process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID;
  const CF_KV_NAMESPACE_ID =
    process.env.CF_KV_NAMESPACE_ID || process.env.CLOUDFLARE_KV_NAMESPACE_ID;
  const CF_API_TOKEN =
    process.env.CLOUDFLARE_API_TOKEN ||
    process.env.CLOUDFLARE_TOKEN ||
    process.env.CF_API_TOKEN;

  // Validate all required env vars
  const required = {
    GITHUB_PAT,
    GITHUB_USERNAME,
    CF_ACCOUNT_ID,
    CF_KV_NAMESPACE_ID,
    CF_API_TOKEN,
  };
  for (const [key, val] of Object.entries(required)) {
    if (!val?.trim()) {
      console.error(`Missing required env var: ${key}`);
      process.exit(1);
    }
  }

  const fetchedAt = new Date();
  console.log(
    `[${fetchedAt.toISOString()}] Fetching contributions for ${GITHUB_USERNAME}...`
  );

  // 1. Fetch
  const calendar = await fetchContributions(GITHUB_USERNAME, GITHUB_PAT);
  console.log(`  Total contributions: ${calendar.totalContributions}`);
  console.log(`  Weeks: ${calendar.weeks.length}`);

  // 2. Transform
  const payload = transformCalendar(GITHUB_USERNAME, calendar, fetchedAt);
  const jsonSize = JSON.stringify(payload).length;
  console.log(`  Cells: ${payload.cells.length}`);
  console.log(`  JSON size: ${(jsonSize / 1024).toFixed(1)} KB`);

  // 3. Write to CF KV
  await writeToKV(payload, CF_ACCOUNT_ID, CF_KV_NAMESPACE_ID, CF_API_TOKEN);
  console.log(`  Written to CF KV successfully.`);
  console.log(`[${new Date().toISOString()}] Done.`);
}

main().catch(err => {
  console.error("FATAL:", err.message);
  process.exit(1);
});
