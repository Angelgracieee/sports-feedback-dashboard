type RoleCount = {
  role: string;
  count: number;
};

type Props = {
  selectedRole: string;
  onChange: (role: string) => void;
  roleCounts: RoleCount[];
};

const ROLES = ["Athlete", "Coach", "Officials", "Staff"];

export default function RoleButtons({
  selectedRole,
  onChange,
  roleCounts,
}: Props) {
  function getCount(role: string) {
    return roleCounts.find((item) => item.role === role)?.count ?? 0;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {ROLES.map((role) => {
        const active = selectedRole === role;

        return (
          <button
            key={role}
            onClick={() => onChange(role)}
            className={`rounded-2xl border px-5 py-2.5 font-semibold transition duration-200 ${
              active
                ? "border-cyan-300/40 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_25px_rgba(34,211,238,0.35)]"
                : "border-white/10 bg-white/5 text-white hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/10"
            }`}
          >
            {role} ({getCount(role)})
          </button>
        );
      })}
    </div>
  );
}