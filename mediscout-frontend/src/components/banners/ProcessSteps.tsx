import React from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store';
import ProcessBanner from './ProcessBanner';
import { Upload, Stethoscope, CheckCircle2 } from 'lucide-react';

export const ProcessSteps: React.FC = () => {
  const { currentPrescription, isLoading } = useSelector(
    (state: RootState) => state.prescription
  );

  // حساب الخطوة النشطة بناءً على حالة الروشتة
  const isPendingReview = currentPrescription?.status === 'PENDING_PHARMACIST_REVIEW';
  const isApproved = currentPrescription && !isPendingReview;

  let activeStep = 1;
  if (isLoading || isPendingReview) {
    activeStep = 2;
  } else if (isApproved) {
    activeStep = 3;
  }

  const steps = [
    {
      step: 1,
      label: 'الخطوة 1',
      title: 'رفع الروشتة',
      description: 'إدخال صورة الروشتة وبيانات المريض',
      icon: Upload,
    },
    {
      step: 2,
      label: 'الخطوة 2',
      title: 'الذكاء الاصطناعي والصيدلي',
      description: 'فحص التفاعلات ومراجعة الصيدلي',
      icon: Stethoscope,
    },
    {
      step: 3,
      label: 'الخطوة 3',
      title: 'جاهز للصرف',
      description: 'تأكيد الطلب ونقل الأدوية للسلة',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 dir-rtl">
      {steps.map((s) => (
        <ProcessBanner
          key={s.step}
          label={s.label}
          title={s.title}
          description={s.description}
          icon={s.icon}
          active={activeStep === s.step}
        />
      ))}
    </div>
  );
};