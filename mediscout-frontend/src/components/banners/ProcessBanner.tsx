import { ArrowRight, type LucideIcon } from "lucide-react";

interface ProcessBannerProps {
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  active?: boolean;
}

export default function ProcessBanner({
  label,
  title,
  description,
  icon: Icon,
  active = false,
}: ProcessBannerProps) {
  return (
    <div
      className={` ${
        active
          ? "bg-emerald-50/60 border-emerald-200/80"
          : "bg-white border-slate-200/80"
      } border p-4 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all `}
    >
      <div className="flex items-center gap-3">
        <div
          className={` w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
            active
              ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
              : "bg-slate-50 border border-slate-200 text-slate-700"
          } `}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <span
            className={` text-[10px] font-bold block ${
              active ? "text-emerald-700" : "text-slate-400"
            } `}
          >
            {label} {active && " (نشطة الآن)"}
          </span>
          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
            {title}
          </h4>
          <p className="text-[11px] text-slate-500"> {description} </p>
        </div>
      </div>
      {active ? (
        <span className=" text-emerald-600 font-bold text-xs bg-white px-2.5 py-1 rounded-full border border-emerald-200 shadow-sm ">
          الحالية
        </span>
      ) : (
        <span className=" text-slate-300 group-hover:text-emerald-500 transition-colors ">
          <ArrowRight className="w-5 h-5" />
        </span>
      )}
    </div>
  );
}