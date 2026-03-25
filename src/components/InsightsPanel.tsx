import { FaThumbsUp, FaExclamationTriangle } from "react-icons/fa";

type Props = {
  positives: string[];
  improvements: string[];
};

export default function InsightsPanel({ positives, improvements }: Props) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="text-2xl font-bold text-blue-900">Feedback Insights</h3>
      <div className="my-4 border-t border-slate-200" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-4 text-xl font-bold text-white">
            Top Positive Feedback
          </div>

          <div className="bg-white p-4">
            {positives.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 border-b border-slate-200 py-4 last:border-b-0"
              >
                <FaThumbsUp className="text-2xl text-green-500" />
                <span className="text-2xl text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-4 text-xl font-bold text-white">
            Areas for Improvement
          </div>

          <div className="bg-white p-4">
            {improvements.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 border-b border-slate-200 py-4 last:border-b-0"
              >
                <FaExclamationTriangle className="text-2xl text-orange-500" />
                <span className="text-2xl text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}