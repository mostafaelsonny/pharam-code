import { Clock, CheckCircle2 } from "lucide-react";
export default function StatusBar() {
  return (
    <div className="  bg-white border border-slate-200/80 rounded-2xl px-5 py-3 shadow-sm flex flex-wrap items-center justify-between justify-self-center gap-4 text-xs font-semibold text-slate-700 mb-7 ">
      {" "}
      <div className="flex items-center gap-2">
        {" "}
        <span className="w-2 h-2 rounded-full bg-emerald-500" />{" "}
        <span className="text-slate-900 font-bold">
          {" "}
          بوابة الذكاء الصيدلي المباشر {" "}
        </span>{" "}
      </div>{" "}
      <div className="flex items-center gap-6">
        {" "}
        <div className="flex items-center gap-1.5 text-slate-600">
          {" "}
          <Clock className="w-4 h-4 text-emerald-600" />{" "}
          <span>
            {" "}
            متوسط وقت التحليل والرد:{" "}
            <strong className="text-slate-900"> 90 ثانية </strong>{" "}
          </span>{" "}
        </div>{" "}
        <div className=" hidden sm:flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full ">
          {" "}
          <CheckCircle2 className="w-4 h-4" />{" "}
          <span> صيادلة مرخصون متواجدون الآن </span>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
