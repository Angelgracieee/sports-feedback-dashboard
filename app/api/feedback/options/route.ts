import { NextResponse } from "next/server";
import { getSheetRows } from "@/src/lib/sheets";
import { buildAnalytics, buildFilteredAnalytics } from "@/src/lib/analytics";

export async function GET(req: Request) {
  try {
    const rows = await getSheetRows();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const section = searchParams.get("section") || undefined;
    const question = searchParams.get("question") || undefined;

    if (category || section || question) {
      const filteredData = buildFilteredAnalytics(rows, {
        category,
        section,
        question,
      });

      return NextResponse.json(filteredData);
    }

    const analytics = buildAnalytics(rows);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json(
      { error: "Failed to load feedback data" },
      { status: 500 }
    );
  }
}