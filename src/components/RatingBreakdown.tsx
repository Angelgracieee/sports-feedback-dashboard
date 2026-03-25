type Props = {
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
};

export default function RatingBreakdown({ breakdown }: Props) {
  const maxValue = Math.max(...Object.values(breakdown), 1);

  const items = [
    { label: "5 Stars", value: breakdown[5] },
    { label: "4 Stars", value: breakdown[4] },
    { label: "3 Stars", value: breakdown[3] },
    { label: "2 Stars", value: breakdown[2] },
    { label: "1 Star", value: breakdown[1] },
  ];

  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h2 className="mb-4 text-2xl font-bold text-blue-900">Rating Breakdown</h2>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="grid grid-cols-[90px_1fr_50px] items-center gap-4">
            <span className="text-slate-700">{item.label}</span>

            <div className="h-5 w-full rounded bg-slate-200">
              <div
                className="h-5 rounded bg-blue-600"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>

            <span className="text-right font-bold text-blue-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}