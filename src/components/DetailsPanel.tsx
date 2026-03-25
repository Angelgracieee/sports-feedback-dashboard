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

type Props = {
  category: string;
  items: DetailItem[];
  isLoading?: boolean;
};

function renderStars(count: number) {
  return "⭐".repeat(count);
}

export default function DetailsPanel({
  category,
  items,
  isLoading = false,
}: Props) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/8 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Details Panel</h2>
          <p className="text-sm text-slate-300">Selected category details only</p>
        </div>

        <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-200">
          {category}
        </span>
      </div>

      <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="h-4 w-40 rounded bg-white/10" />
                <div className="mt-3 h-3 w-28 rounded bg-white/10" />
                <div className="mt-2 h-3 w-24 rounded bg-white/10" />
                <div className="mt-2 h-3 w-48 rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-slate-400">No details available for this category.</p>
        ) : (
          items.map((item, index) => (
            <div
              key={`${item.question}-${index}`}
              className="rounded-2xl border border-white/10 bg-black/15 p-4 transition hover:border-cyan-300/20 hover:bg-cyan-400/5"
            >
              <div className="font-semibold text-white">{item.question}</div>

              <div className="mt-3 text-slate-200">
                Average Rating: {item.averageRating}
              </div>
              <div className="mt-1 text-slate-400">
                Total Responses: {item.totalResponses}
              </div>

              <div className="mt-4 space-y-2 text-slate-200">
                <div>{renderStars(5)} - {item.breakdown[5]} responses</div>
                <div>{renderStars(4)} - {item.breakdown[4]} responses</div>
                <div>{renderStars(3)} - {item.breakdown[3]} responses</div>
                <div>{renderStars(2)} - {item.breakdown[2]} responses</div>
                <div>{renderStars(1)} - {item.breakdown[1]} responses</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}