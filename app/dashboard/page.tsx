"use client";

import { useEffect, useState } from "react";
import RoleButtons from "@/src/components/RoleButtons";
import CategoryOverview from "@/src/components/CategoryOverview";
import FeedbackList from "@/src/components/FeedbackList";
import DetailsPanel from "@/src/components/DetailsPanel";

type RoleCount = {
  role: string;
  count: number;
};

type CategoryCard = {
  name: string;
  averageRating: number;
  count: number;
};

type FeedbackItem = {
  category: string;
  comment: string;
  rating: number | null;
  question: string;
  timestamp: string;
};

type DetailItem = {
  question: string;
  averageRating: number;
  totalResponses: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
};

type DashboardResponse = {
  role: string;
  selectedCategory: string;
  roleCounts: RoleCount[];
  categories: CategoryCard[];
  feedbackList: FeedbackItem[];
  details: DetailItem[];
};

export default function DashboardPage() {
  const [selectedRole, setSelectedRole] = useState("Athlete");
  const [selectedCategory, setSelectedCategory] = useState("Transportation");
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchDashboardData(role: string, category: string) {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        role,
        category,
      });

      const res = await fetch(`/api/feedback?${params.toString()}`, {
        cache: "no-store",
      });

      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData(selectedRole, selectedCategory);

    const interval = setInterval(() => {
      fetchDashboardData(selectedRole, selectedCategory);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedRole, selectedCategory]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#312e81,_#111827_38%,_#0f172a_70%,_#020617_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-5 xl:px-6 xl:py-8">
        <div className="sticky top-0 z-20 mb-6 rounded-[28px] border border-white/10 bg-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="rounded-t-[28px] bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-fuchsia-500/20 px-6 py-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="bg-gradient-to-r from-cyan-300 via-blue-200 to-fuchsia-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent xl:text-4xl">
                  Regional Sports Meet Participants Feedback
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Real-time feedback dashboard powered by Google Sheets
                </p>
              </div>

              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                {isLoading ? "Syncing live data..." : "Auto-sync every 5 seconds"}
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <RoleButtons
              selectedRole={selectedRole}
              onChange={(role) => {
                setSelectedRole(role);
                setSelectedCategory("Transportation");
              }}
              roleCounts={data?.roleCounts ?? []}
            />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white/95">Category Overview</h2>
          {isLoading && (
            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">
              Loading...
            </div>
          )}
        </div>

        <CategoryOverview
          categories={data?.categories ?? []}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <FeedbackList items={data?.feedbackList ?? []} isLoading={isLoading} />
          <DetailsPanel
            category={selectedCategory}
            items={data?.details ?? []}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-10 rounded-[28px] border border-white/10 bg-white/5 px-6 py-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <img
              src="/youth.png"
              alt="Youth Development Affairs Office"
              className="h-12 w-auto object-contain opacity-95"
            />
            <img
              src="/sports.png"
              alt="Cabuyao Sports Committee"
              className="h-12 w-auto object-contain opacity-95"
            />
            <img
              src="/seal.png"
              alt="City of Cabuyao Seal"
              className="h-12 w-auto object-contain opacity-95"
            />
            <img
              src="/bagongcabuyao.png"
              alt="Bagong Cabuyao"
              className="h-12 w-auto object-contain opacity-95"
            />
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-300">
              Developed by{" "}
              <span className="font-semibold text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
                A. Fojas
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Regional Sports Meet Participants Feedback System © 2026
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}