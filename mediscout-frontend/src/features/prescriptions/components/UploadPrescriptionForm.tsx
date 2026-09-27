import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../../store";
import { processPrescriptionThunk } from "../../../store/prescriptionSlice";
import { CameraCapture } from "../../../components/camera/CameraCapture";
import {
  processPrescriptionSchema,
  type ProcessPrescriptionFormValues,
} from "../schemas/prescriptionSchema";
import {
  getActivePharmacistsAPI,
  type PharmacistUser,
} from "../services/prescriptionService";


import {
  Camera,
  FolderOpen,
  Loader2,
  FileText,
  User,
  Smartphone,
  Truck,
  Mail,
  ImagePlus,
  Trash2,
  UserCheck,
  Clock,
} from "lucide-react";




export const UploadPrescriptionForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, currentPrescription } = useSelector(
    (state: RootState) => state.prescription
  );
  const isPendingPharmacistReview =
    currentPrescription?.status === "PENDING_PHARMACIST_REVIEW";

  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
  } | null>(null);
  const [pharmacists, setPharmacists] = useState<PharmacistUser[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isLoadingPharmacists, setIsLoadingPharmacists] =
    useState<boolean>(true);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProcessPrescriptionFormValues>({
    resolver: zodResolver(processPrescriptionSchema),
  });


  useEffect(() => {
    if (currentPrescription?.status === "READY_FOR_CART") {
      reset();
      setSelectedFile(null);
    }
  }, [currentPrescription?.status, reset]);

  useEffect(() => {
    const fetchPharmacists = async () => {
      try {
        setIsLoadingPharmacists(true);
        const data = await getActivePharmacistsAPI();
        setPharmacists(data);
      } catch (err) {
        console.error("فشل في جلب قائمة الصيادلة", err);
      } finally {
        setIsLoadingPharmacists(false);
      }
    };
    fetchPharmacists();
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      setValue("image", files);
      const sizeMB = (files[0].size / (1024 * 1024)).toFixed(2);
      setSelectedFile({ name: files[0].name, size: `${sizeMB} MB` });
    }
  };

  const onSubmit = async (data: ProcessPrescriptionFormValues) => {
    const file = data.image[0];
    const imageBase64 = await fileToBase64(file);

    dispatch(
      processPrescriptionThunk({
        imageBase64,
        mimeType: file.type || "image/jpeg",
        patientName: data.patientName,
        phone: data.phone,
        address: data.address,
        email: data.email || "",
        pharmacistId: data.pharmacistId,
      }),
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl flex flex-col gap-6 shadow-sm border border-slate-200/80">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <ImagePlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900">
              إرسال روشتة للتحليل
            </h2>
            <span className="text-xs text-slate-500">
              اختر الصيدلي وأرسل الروشتة للمراجعة
            </span>
          </div>
        </div>
      </div>

      {/* Upload Dropzone Area */}
      <div className="relative group bg-slate-50/80 hover:bg-emerald-50/40 border-2 border-dashed border-slate-300 hover:border-emerald-400 transition-all duration-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-3 group-hover:scale-105 group-hover:border-emerald-300 transition-all shadow-sm">
          <FileText className="text-emerald-600 w-7 h-7" />
        </div>
        <span className="font-bold text-slate-900 text-base mb-1">
          صورة الروشتة المطلوبة
        </span>
        <p className="text-xs text-slate-500 max-w-xs mb-4 leading-relaxed">
          التقط صورة واضحة بكاميرا الهاتف أو استعرض الملفات
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="cursor-pointer px-4 py-2 rounded-full bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
          >
            <Camera className="w-4 h-4" />
            <span>التقاط بالكاميرا</span>
          </button>
          <label className="cursor-pointer px-4 py-2 rounded-full bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center gap-1.5 shadow-sm">
            <FolderOpen className="w-4 h-4" />
            <span>استعراض الملفات</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files)}
            />
          </label>
        </div>

        {errors.image && (
          <p className="text-rose-600 text-xs font-bold mt-3">
            {errors.image.message as string}
          </p>
        )}

        {selectedFile && !errors.image && (
          <div className="w-full mt-4 flex items-center justify-between bg-white border border-emerald-200 p-2.5 rounded-xl text-right shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <FileText className="text-emerald-600 w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs text-slate-800 truncate max-w-[150px]">
                  {selectedFile.name}
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  تم الرفع ({selectedFile.size})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setValue("image", undefined as any);
              }}
              className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Form Details */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* اختيار الصيدلي */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 pr-1">
            اختيار الصيدلي المسؤول *
          </label>
          <div className="relative flex items-center">
            <UserCheck className="absolute right-3.5 text-slate-400 w-5 h-5" />
            <select
              {...register("pharmacistId")}
              disabled={isLoadingPharmacists}
              className={`w-full bg-slate-50 border ${errors.pharmacistId ? "border-rose-300 ring-1 ring-rose-300" : "border-slate-200"} text-slate-900 pr-11 pl-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer`}
            >
              <option value="">
                -- اختر الصيدلي الذي تود إرسال الروشتة له --
              </option>
              {pharmacists.map((pharmacist) => (
                <option key={pharmacist._id} value={pharmacist._id}>
                  د. {pharmacist.name}
                </option>
              ))}
            </select>
          </div>
          {errors.pharmacistId && (
            <span className="text-xs text-rose-500 font-bold">
              {errors.pharmacistId.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 pr-1">
            اسم المريض بالكامل *
          </label>
          <div className="relative flex items-center">
            <User className="absolute right-3.5 text-slate-400 w-5 h-5" />
            <input
              {...register("patientName")}
              className={`w-full bg-slate-50 border ${errors.patientName ? "border-rose-300 ring-1 ring-rose-300" : "border-slate-200"} text-slate-900 pr-11 pl-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all`}
            />
          </div>
          {errors.patientName && (
            <span className="text-xs text-rose-500 font-bold">
              {errors.patientName.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 pr-1">
            رقم الهاتف *
          </label>
          <div className="relative flex items-center">
            <Smartphone className="absolute right-3.5 text-slate-400 w-5 h-5" />
            <input
              {...register("phone")}
              dir="ltr"
              className={`w-full text-right bg-slate-50 border ${errors.phone ? "border-rose-300 ring-1 ring-rose-300" : "border-slate-200"} text-slate-900 pr-11 pl-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all`}
            />
          </div>
          {errors.phone && (
            <span className="text-xs text-rose-500 font-bold">
              {errors.phone.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 pr-1">
            عنوان التسليم *
          </label>
          <div className="relative flex items-center">
            <Truck className="absolute right-3.5 text-slate-400 w-5 h-5" />
            <input
              {...register("address")}
              className={`w-full bg-slate-50 border ${errors.address ? "border-rose-300 ring-1 ring-rose-300" : "border-slate-200"} text-slate-900 pr-11 pl-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all`}
            />
          </div>
          {errors.address && (
            <span className="text-xs text-rose-500 font-bold">
              {errors.address.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 pr-1">
            البريد الإلكتروني (اختياري)
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute right-3.5 text-slate-400 w-5 h-5" />
            <input
              {...register("email")}
              dir="ltr"
              className={`w-full text-right bg-slate-50 border ${errors.email ? "border-rose-300 ring-1 ring-rose-300" : "border-slate-200"} text-slate-900 pr-11 pl-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all`}
            />
          </div>
          {errors.email && (
            <span className="text-xs text-rose-500 font-bold">
              {errors.email.message}
            </span>
          )}
        </div>

        {isPendingPharmacistReview && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
            <span>
              لديك روشتة قيد مراجعة الصيدلي حالياً. يرجى الانتظار حتى تنتهي المراجعة وتظهر النتيجة قبل إرسال روشتة جديدة.
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || isPendingPharmacistReview}
          className="w-full mt-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/30 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isPendingPharmacistReview ? (
            <Clock className="w-5 h-5" />
          ) : (
            <Truck className="w-5 h-5" />
          )}
          <span>
            {isLoading
              ? "جاري التحليل والتدقيق..."
              : isPendingPharmacistReview
              ? "في انتظار رد ومراجعة الصيدلي..."
              : "إرسال الروشتة للصيدلي"}
          </span>
        </button>
      </form>
      <CameraCapture
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(file) => {
          const fileList = new DataTransfer();

          fileList.items.add(file);

          handleFileChange(fileList.files);
        }}
      />
    </div>
  );
};
