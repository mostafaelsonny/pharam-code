import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type AppDispatch, type RootState } from '../../../store';
import { checkPrescriptionStatusThunk } from '../../../store/prescriptionSlice';
import { UploadPrescriptionForm } from './UploadPrescriptionForm';
import { PrescriptionResult } from './PrescriptionResult';
import { ProcessSteps } from '../../../components/banners/ProcessSteps';

export const PrescriptionWorkspace: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentPrescription } = useSelector((state: RootState) => state.prescription);

  useEffect(() => {
    const savedId = localStorage.getItem('active_prescription_id');
    if (savedId && !currentPrescription) {
      dispatch(checkPrescriptionStatusThunk(savedId));
    }
  }, [dispatch, currentPrescription]);

  return (
    <div className="space-y-6 dir-rtl">
      {/* شريط الخطوات المتزامن تلقائياً مع Redux */}
      <ProcessSteps />

      {/* واجهة رفع الروشتة وعرض النتيجة */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-5 flex flex-col gap-6">
          <UploadPrescriptionForm />
        </section>

        <section className="lg:col-span-7 flex flex-col gap-6">
          <PrescriptionResult />
        </section>
      </div>
    </div>
  );
};

export default PrescriptionWorkspace;