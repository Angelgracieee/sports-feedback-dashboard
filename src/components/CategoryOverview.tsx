type CategoryCard = {
  name: string;
  averageRating: number;
  count: number;
};

type Props = {
  categories: CategoryCard[];
  selectedCategory: string;
  onSelect: (category: string) => void;
};

export default function CategoryOverview({
  categories,
  selectedCategory,
  onSelect,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => {
        const active = selectedCategory === category.name;

        return (
          <button
            key={category.name}
            onClick={() => onSelect(category.name)}
            className={`group rounded-[26px] border p-5 text-left transition duration-200 ${
              active
                ? "border-cyan-300/30 bg-gradient-to-br from-cyan-400/25 via-blue-500/20 to-fuchsia-500/20 text-white shadow-[0_0_30px_rgba(59,130,246,0.25)]"
                : "border-white/10 bg-white/8 text-white shadow-[0_8px_24px_rgba(0,0,0,0.22)] hover:-translate-y-1 hover:border-cyan-300/20 hover:bg-white/10"
            } backdrop-blur-xl`}
          >
            <div className="text-xl font-bold">{category.name}</div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-3xl font-bold">{category.averageRating}</span>
            </div>

            <div className={`mt-2 text-sm ${active ? "text-cyan-100" : "text-slate-300"}`}>
              {category.count} responses
            </div>
          </button>
        );
      })}
    </div>
  );
}