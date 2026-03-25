"use client";

import { useMemo, useState } from "react";

type FeedbackItem = {
  category: string;
  comment: string;
  rating: number | null;
  question: string;
  timestamp: string;
};

type Props = {
  items: FeedbackItem[];
};

export default function FeedbackList({ items }: Props) {
  const [search, setSearch] = useState("");
  const [activeCommentCategory, setActiveCommentCategory] = useState<
    "Transportation" | "Meals"
  >("Transportation");

 const filteredItems = useMemo(() => {
  const keyword = search.trim().toLowerCase();

  return items.filter((item) => {
    const itemCategory = item.category?.toLowerCase().trim();
    const activeCategory = activeCommentCategory.toLowerCase().trim();

    const matchesCategory = itemCategory === activeCategory;

    const matchesSearch =
      !keyword ||
      item.comment.toLowerCase().includes(keyword) ||
      item.question.toLowerCase().includes(keyword) ||
      item.category.toLowerCase().includes(keyword);

    return matchesCategory && matchesSearch;
  });
}, [items, search, activeCommentCategory]);

  const transportationCount = items.filter(
  (item) => item.category?.toLowerCase().trim() === "transportation"
).length;

const mealsCount = items.filter(
  (item) => item.category?.toLowerCase().trim() === "meals"
).length;

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/8 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white">Feedback List</h2>
        <p className="text-sm text-slate-300">
          Comments only for the selected role
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCommentCategory("Transportation")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeCommentCategory === "Transportation"
                ? "bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.35)]"
                : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            Transportation ({transportationCount})
          </button>

          <button
            onClick={() => setActiveCommentCategory("Meals")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeCommentCategory === "Meals"
                ? "bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.35)]"
                : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            Meals ({mealsCount})
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feedback..."
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-white placeholder:text-slate-400 outline-none transition focus:border-cyan-300/40"
          />

          <span className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-slate-300">
            {filteredItems.length} comments
          </span>
        </div>
      </div>

      <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
        {filteredItems.length === 0 ? (
          <p className="text-slate-400">No comments available.</p>
        ) : (
          filteredItems.map((item, index) => (
            <div
              key={`${item.timestamp}-${index}`}
              className="rounded-2xl border border-white/10 bg-black/15 p-4 transition hover:border-cyan-300/20 hover:bg-cyan-400/5"
            >
              <div className="text-sm font-semibold text-cyan-300">
                {item.category}
              </div>

              <div className="mt-1 text-sm text-slate-400">{item.question}</div>

              <div className="mt-3 text-slate-100">{item.comment}</div>

              <div className="mt-3 text-sm text-slate-400">
                {item.timestamp}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}