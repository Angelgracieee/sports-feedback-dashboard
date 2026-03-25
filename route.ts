import { NextResponse } from "next/server";
import { getSheetRows } from "@/src/lib/sheets";
import { buildAnalytics, buildFilteredAnalytics } from "@/src/lib/analytics";

const FIXED_CATEGORIES = [
  "Transportation",
  "Meals",
  "Accommodation",
  "Uniforms",
  "Equipment",
  "Medical Team",
  "Security",
  "Allowance",
  "CYSDO Sports Unit",
];

const FIXED_ROLES = ["Athlete", "Coach", "Staff"];

function normalizeHeaderText(header: string) {
  return header
    .toLowerCase()
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCategoryFromHeader(header: string) {
  const text = normalizeHeaderText(header);

  if (text.includes("security") || text.includes("safe") || text.includes("secure")) return "Security";
  if (text.includes("medical")) return "Medical Team";
  if (text.includes("allowance")) return "Allowance";
  if (text.includes("uniform")) return "Uniforms";
  if (text.includes("equipment")) return "Equipment";
  if (text.includes("transport") || text.includes("driver")) return "Transportation";
  // Expanded keywords for Meals
  if (text.includes("meal") || text.includes("food") || text.includes("diet") || text.includes("eat") || text.includes("cater")) return "Meals";
  if (text.includes("accommodation") || text.includes("accomodation")) return "Accommodation";
  if (text.includes("cysdo")) return "CYSDO Sports Unit";

  return null;
}

function isCommentHeader(header: string) {
  const text = normalizeHeaderText(header);
  // Returns true if it contains feedback keywords OR if it's a known category name (handling direct comment boxes)
  const isFeedbackWord = text.includes("remark") || text.includes("suggestion") || text.includes("comment") || text.includes("feedback") || text.includes("opinion");
  const isDirectCategoryMatch = FIXED_CATEGORIES.some(cat => text === cat.toLowerCase());
  
  return isFeedbackWord || isDirectCategoryMatch;
}

function getCategoryFromCommentHeader(header: string) {
  const category = getCategoryFromHeader(header);
  if (category) return category;

  const text = normalizeHeaderText(header);
  if (text.includes("security") || text.includes("safe") || text.includes("secure")) return "Security";
  if (text.includes("transport") || text.includes("driver")) return "Transportation";
  if (text.includes("meal") || text.includes("food") || text.includes("diet") || text.includes("cater")) return "Meals";
  if (text.includes("accommodation") || text.includes("accomodation")) return "Accommodation";
  if (text.includes("uniform")) return "Uniforms";
  if (text.includes("equipment")) return "Equipment";
  if (text.includes("medical")) return "Medical Team";
  if (text.includes("allowance")) return "Allowance";
  if (text.includes("cysdo")) return "CYSDO Sports Unit";

  return "Other";
}

function extractQuestionLabel(header: string) {
  const parts = header
    .replace(/\r/g, "")
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return parts[parts.length - 1] || header;
}

function buildCommentCategoryMap(headers: string[]) {
  const map: string[] = [];
  let currentCategory = "Other";

  headers.forEach((header, index) => {
    const questionCategory = getCategoryFromHeader(header);
    const commentCategory = getCategoryFromCommentHeader(header);

    if (questionCategory) {
      currentCategory = questionCategory;
      map[index] = questionCategory;
    } else if (isCommentHeader(header)) {
      map[index] = (commentCategory && commentCategory !== "Other") ? commentCategory : currentCategory;
    } else {
      map[index] = currentCategory;
    }
  });

  return map;
}

export async function GET(req: Request) {
  try {
    const rows = await getSheetRows();
    if (!rows || rows.length === 0) throw new Error("No data found");

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "Athlete";
    const selectedCategory = searchParams.get("category") || "Transportation";

    const headers = rows[0];
    const dataRows = rows.slice(1);
    const commentCategoryMap = buildCommentCategoryMap(headers);

    // Finding indexes dynamically to handle minor header naming differences
    const categoryIndex = headers.findIndex((h) => normalizeHeaderText(h).includes("category"));
    const emailIndex = headers.findIndex((h) => normalizeHeaderText(h).includes("email"));
    const timestampIndex = headers.findIndex((h) => normalizeHeaderText(h).includes("timestamp"));

    const roleCounts = FIXED_ROLES.map((roleName) => {
      const seen = new Set<string>();
      dataRows.forEach((row) => {
        const rowRole = (row[categoryIndex] || "").trim();
        if (rowRole.toLowerCase() !== roleName.toLowerCase()) return;
        const uniqueKey = (emailIndex >= 0 ? row[emailIndex] : "") || (timestampIndex >= 0 ? row[timestampIndex] : "");
        if (uniqueKey) seen.add(uniqueKey);
      });
      return { role: roleName, count: seen.size };
    });

    const categories = FIXED_CATEGORIES.map((category) => {
      const categoryHeaders = headers.filter((h) => getCategoryFromHeader(h) === category);
      const ratings: number[] = [];
      const respondentSet = new Set<string>();

      dataRows.forEach((row) => {
        const rowRole = (row[categoryIndex] || "").trim();
        if (role !== "All" && rowRole.toLowerCase() !== role.toLowerCase()) return;

        const uniqueKey = (emailIndex >= 0 ? row[emailIndex] : "") || (timestampIndex >= 0 ? row[timestampIndex] : "");
        let hasRating = false;

        categoryHeaders.forEach((h) => {
          const hIdx = headers.indexOf(h);
          const val = Number(row[hIdx]);
          if (!Number.isNaN(val) && val >= 1 && val <= 5) {
            ratings.push(val);
            hasRating = true;
          }
        });

        if (hasRating && uniqueKey) respondentSet.add(uniqueKey);
      });

      const avg = ratings.length > 0 ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)) : 0;
      return { name: category, averageRating: avg, count: respondentSet.size };
    });

    const feedbackList: any[] = [];
    const feedbackSeen = new Set<string>();
    const detailsMap = new Map<string, any>();

    dataRows.forEach((row) => {
      const rowRole = (row[categoryIndex] || "").trim();
      if (role !== "All" && rowRole.toLowerCase() !== role.toLowerCase()) return;

      const timestamp = timestampIndex >= 0 ? row[timestampIndex] : "";

      headers.forEach((header, headerIndex) => {
        // Process Comments
        if (isCommentHeader(header)) {
          const comment = (row[headerIndex] || "").trim();
          if (comment && comment.toLowerCase() !== "n/a" && isNaN(Number(comment))) {
            const category = commentCategoryMap[headerIndex] || "Other";
            const question = extractQuestionLabel(header);
            const uniqueFeedbackKey = `${rowRole}|${header}|${comment}|${timestamp}`;

            if (!feedbackSeen.has(uniqueFeedbackKey)) {
              feedbackSeen.add(uniqueFeedbackKey);
              feedbackList.push({ category, comment, rating: null, question, timestamp });
            }
          }
        }

        // Process Ratings for Details
        const category = getCategoryFromHeader(header);
        if (category === selectedCategory) {
          const val = Number(row[headerIndex]);
          if (!Number.isNaN(val) && val >= 1 && val <= 5) {
            const question = extractQuestionLabel(header);
            if (!detailsMap.has(question)) {
              detailsMap.set(question, { question, totalResponses: 0, breakdown: { 5:0, 4:0, 3:0, 2:0, 1:0 } });
            }
            const item = detailsMap.get(question);
            item.totalResponses += 1;
            item.breakdown[val as 1|2|3|4|5] += 1;
          }
        }
      });
    });

    const details = Array.from(detailsMap.values()).map((item) => {
      const totalScore = Object.entries(item.breakdown).reduce((acc, [rating, count]) => acc + (Number(rating) * (count as number)), 0);
      return {
        ...item,
        averageRating: item.totalResponses > 0 ? Number((totalScore / item.totalResponses).toFixed(2)) : 0,
      };
    });

    return NextResponse.json({
      role,
      selectedCategory,
      roleCounts,
      categories,
      feedbackList,
      details,
      summary: buildAnalytics(rows),
      roleAnalytics: buildFilteredAnalytics(rows, { category: role === "All" ? undefined : role }),
    });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json({ error: "Failed to load feedback data" }, { status: 500 });
  }
}