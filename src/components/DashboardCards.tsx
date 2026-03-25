type Props = {
  totalResponses: number;
  averageRating: number;
  fiveStarCount: number;
  lowRatingCount: number;
};

export default function DashboardCards({
  totalResponses,
  averageRating,
  fiveStarCount,
  lowRatingCount,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-lg font-semibold text-slate-700">Total Responses</p>
        <h2 className="text-5xl font-bold text-blue-900">{totalResponses}</h2>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-lg font-semibold text-slate-700">Average Rating</p>
        <h2 className="text-5xl font-bold text-blue-900">{averageRating}</h2>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-lg font-semibold text-slate-700">5-Star Ratings</p>
        <h2 className="text-5xl font-bold text-blue-900">{fiveStarCount}</h2>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <p className="text-lg font-semibold text-slate-700">1-2 Star Ratings</p>
        <h2 className="text-5xl font-bold text-orange-600">{lowRatingCount}</h2>
      </div>
    </div>
  );
}