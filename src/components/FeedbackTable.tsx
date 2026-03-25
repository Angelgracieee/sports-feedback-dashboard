"use client";

import { useMemo, useState } from "react";
import { FaSearch, FaStar } from "react-icons/fa";

type CommentItem = {
  rating: number;
  comment: string;
  date: string;
};

type Props = {
  comments: CommentItem[];
};

export default function FeedbackTable({ comments }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredComments = useMemo(() => {
    return comments.filter((item) => {
      const matchesSearch = item.comment.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All"
          ? true
          : filter === "5 Stars"
          ? item.rating === 5
          : filter === "4 Stars"
          ? item.rating === 4
          : filter === "3 Stars"
          ? item.rating === 3
          : item.rating <= 2;

      return matchesSearch && matchesFilter;
    });
  }, [comments, search, filter]);

  const filters = ["All", "5 Stars", "4 Stars", "3 Stars", "1-2 Stars"];

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="text-2xl font-bold text-blue-900">Comments & Suggestions</h3>
      <div className="my-4 border-t border-slate-200" />

      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex w-full max-w-xl items-center rounded-lg border border-slate-300 bg-white px-4 py-3">
          <FaSearch className="mr-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {filters.map((item) => {
            const active = filter === item;

            return (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-md border px-5 py-2 text-lg font-semibold ${
                  active
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                {item !== "All" && <FaStar className="mr-2 inline text-yellow-400" />}
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full">
          <thead className="bg-slate-100">
            <tr className="text-left text-xl text-blue-900">
              <th className="px-5 py-4">Rating</th>
              <th className="px-5 py-4">Comment</th>
              <th className="px-5 py-4">Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredComments.map((item, index) => (
              <tr key={index} className="border-t border-slate-200">
                <td className="px-5 py-4">
                  <div className="flex gap-1">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <FaStar key={i} className="text-yellow-400" />
                    ))}
                  </div>
                </td>

                <td className="px-5 py-4 text-lg text-slate-700">{item.comment}</td>
                <td className="px-5 py-4 text-lg text-slate-600">{item.date}</td>
              </tr>
            ))}

            {filteredComments.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-slate-500">
                  No feedback found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}