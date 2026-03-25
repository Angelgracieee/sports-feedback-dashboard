type Row = Record<string, string>;

function normalizeHeader(text: string) {
  return text.replace(/\r/g, "").trim();
}

function isCommentColumn(header: string) {
  const h = normalizeHeader(header).toLowerCase();

  return (
    h.includes("comment") ||
    h.includes("suggestion") ||
    h.includes("remark") ||
    h.includes("feedback")
  );
}

function isIgnoredHeader(header: string) {
  const h = normalizeHeader(header).toLowerCase();

  return (
    !h ||
    h === "timestamp" ||
    h === "email address" ||
    h === "category:" ||
    h === "name (optional)" ||
    h === "sports event" ||
    h.includes("data privacy act") ||
    h.includes("by proceeding with this form")
  );
}

function isRatingValue(value: string) {
  const num = Number(value);
  return !Number.isNaN(num) && num >= 1 && num <= 5;
}

export function buildFilterOptions(rows: string[][]) {
  if (!rows.length) {
    return {
      categories: [],
      sections: [],
      questions: [],
    };
  }

  const headers = rows[0].map((h) => normalizeHeader(h));
  const dataRows = rows.slice(1);

  const categoryIndex = headers.findIndex((h) => h === "Category:");

  const categories =
    categoryIndex >= 0
      ? [...new Set(dataRows.map((r) => (r[categoryIndex] || "").trim()).filter(Boolean))]
      : [];

  const questionHeaders = headers.filter((header) => {
    if (isIgnoredHeader(header)) return false;
    if (isCommentColumn(header)) return false;
    return true;
  });

  const sectionMap = new Map<string, string[]>();

  questionHeaders.forEach((header) => {
    const lower = header.toLowerCase();
    let section = "Other";

    if (lower.includes("transportation")) {
      section = "Transportation";
    } else if (lower.includes("meals")) {
      section = "Meals";
    } else if (lower.includes("driver")) {
      section = "Driver";
    }

    if (!sectionMap.has(section)) {
      sectionMap.set(section, []);
    }

    sectionMap.get(section)!.push(header);
  });

  const sections = Array.from(sectionMap.keys());

  const questions = Array.from(sectionMap.entries()).flatMap(([section, groupHeaders]) =>
    groupHeaders.map((header) => {
      const parts = header.split("\n").map((p) => p.trim()).filter(Boolean);
      const label = parts[parts.length - 1] || header;

      return {
        section,
        header,
        label,
      };
    })
  );

  return {
    categories,
    sections,
    questions,
  };
}

export function buildAnalytics(rows: string[][]) {
  if (!rows.length) {
    return {
      totalResponses: 0,
      averageRating: 0,
      fiveStarCount: 0,
      lowRatingCount: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      comments: [],
    };
  }

  const headers = rows[0].map((h) => normalizeHeader(h));
  const dataRows = rows.slice(1);

  const mapped: Row[] = dataRows.map((row) => {
    const obj: Row = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || "";
    });
    return obj;
  });

  const commentColumns = headers.filter(isCommentColumn);
  const options = buildFilterOptions(rows);
  const ratingHeaders = options.questions.map((q) => q.header);

  const allRatings: number[] = [];
  const comments: { rating: number; comment: string; date: string }[] = [];

  mapped.forEach((row) => {
    let firstValidRating = 0;

    ratingHeaders.forEach((col) => {
      const value = row[col];
      const num = Number(value);

      if (!Number.isNaN(num) && num >= 1 && num <= 5) {
        allRatings.push(num);
        if (!firstValidRating) {
          firstValidRating = num;
        }
      }
    });

    commentColumns.forEach((col) => {
      const text = row[col]?.trim();
      if (text) {
        comments.push({
          rating: firstValidRating || 0,
          comment: text,
          date: row["Timestamp"] || "",
        });
      }
    });
  });

  const breakdown = {
    5: allRatings.filter((r) => r === 5).length,
    4: allRatings.filter((r) => r === 4).length,
    3: allRatings.filter((r) => r === 3).length,
    2: allRatings.filter((r) => r === 2).length,
    1: allRatings.filter((r) => r === 1).length,
  };

  const averageRating =
    allRatings.length > 0
      ? Number((allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1))
      : 0;

  return {
    totalResponses: mapped.length,
    averageRating,
    fiveStarCount: breakdown[5],
    lowRatingCount: breakdown[1] + breakdown[2],
    breakdown,
    comments: comments.slice(0, 20),
  };
}

export function buildFilteredAnalytics(
  rows: string[][],
  options: {
    category?: string;
    section?: string;
    question?: string;
  }
) {
  if (!rows.length) {
    return {
      totalResponses: 0,
      averageRating: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const headers = rows[0].map((h) => normalizeHeader(h));
  const dataRows = rows.slice(1);

  const mapped: Row[] = dataRows.map((row) => {
    const obj: Row = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || "";
    });
    return obj;
  });

  let filtered = mapped;

  if (options.category && options.category !== "All") {
    filtered = filtered.filter((r) => r["Category:"]?.trim() === options.category);
  }

  const filterOptions = buildFilterOptions(rows);

  let targetQuestions: string[] = [];

  if (options.question) {
    targetQuestions = [options.question];
  } else if (options.section) {
    targetQuestions = filterOptions.questions
      .filter((q) => q.section === options.section)
      .map((q) => q.header);
  } else {
    targetQuestions = filterOptions.questions.map((q) => q.header);
  }

  const ratings: number[] = [];

  filtered.forEach((row) => {
    targetQuestions.forEach((questionHeader) => {
      const value = row[questionHeader];
      if (isRatingValue(value)) {
        ratings.push(Number(value));
      }
    });
  });

  const breakdown = {
    5: ratings.filter((r) => r === 5).length,
    4: ratings.filter((r) => r === 4).length,
    3: ratings.filter((r) => r === 3).length,
    2: ratings.filter((r) => r === 2).length,
    1: ratings.filter((r) => r === 1).length,
  };

  const averageRating =
    ratings.length > 0
      ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2))
      : 0;

  return {
    totalResponses: filtered.length,
    averageRating,
    breakdown,
  };
}