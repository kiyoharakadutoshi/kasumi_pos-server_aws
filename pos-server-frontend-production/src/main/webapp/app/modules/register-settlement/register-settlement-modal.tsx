import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAppDispatch } from '@/config/store';
import _ from 'lodash';

//COMPONENT
import { ModalMode } from 'app/components/modal/default-modal/default-enum';
import DefaultModal from 'app/components/modal/default-modal/default-modal';
import TooltipDatePicker from '@/components/date-picker/tooltip-date-picker/tooltip-date-picker';

// UNTIL
import { localizeString } from '@/helpers/utils';
import { saveAs } from 'file-saver';
import { subDays } from 'date-fns';
import { convertDateServer, toDateString } from '@/helpers/date-utils';

// CONSTANT
import { SERVER_DATE_FORMAT_COMPACT } from '@/constants/date-constants';

// SERVICE
import { exportCashRegister } from '@/services/register-settlement-service';

interface RegisterSettlementModalProps {
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  dateOffsetByRole: number;
  businessOpenDate: string;
  selectedStores: string;
}

const RegisterSettlementModal: React.FC<RegisterSettlementModalProps> = ({
  setOpenModal,
  businessOpenDate,
  dateOffsetByRole,
  selectedStores,
}) => {
  const dispatch = useAppDispatch();
  const [dateForPrint, setDateForPrint] = useState(businessOpenDate);
  const minDate = subDays(new Date(businessOpenDate), dateOffsetByRole);
  const maxDate = new Date(businessOpenDate);
  const handleCancelAction = () => {
    setOpenModal(false);
  };

  const formConfig = useForm({ defaultValues: null });

  const handleConfirm = () => {
    // Validate
    if (!dateForPrint || dateForPrint === 'Invalid Date') {
      return;
    }

    dispatch(
      exportCashRegister({
        selected_store: selectedStores[0],
        business_date: toDateString(new Date(dateForPrint), SERVER_DATE_FORMAT_COMPACT),
      })
    )
      .unwrap()
      .then((res) => {
        const { blob, headers } = res;
        const contentDisposition = headers.get('Content-Disposition');
        const todayString = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().replace(/[-T:]/g, '').slice(0, 12);
        let fileName = `レジ精算一覧表${todayString}.pdf`;
        if (contentDisposition && contentDisposition.includes('filename')) {
          const match = contentDisposition.match(/filename\*=(?:UTF-8'')?(.+)/);
          if (match && match[1]) {
            fileName = decodeURIComponent(match[1]);
          }
        }
        saveAs(blob, fileName);
      })
      .then(() => {
        handleCancelAction();
      })
      .catch(() => {});
  };

  return (
    <FormProvider {...formConfig}>
      <div className="container-category-modal">
        <DefaultModal
          titleModal="register-settlement.modal.titleModal"
          headerType={ModalMode.Edit}
          cancelAction={handleCancelAction}
          confirmAction={handleConfirm}
          hasBottomButton={true}
          confirmTitle={'OK'}
        >
          <div className={'modal-content-register'}>
            <TooltipDatePicker
              initValue={new Date(dateForPrint)}
              labelText="register-settlement.modal.titleDate"
              onChange={(date) => {
                setDateForPrint(convertDateServer(date));
              }}
              isShortDate={true}
              inputClassName="date-time-start-end__start-date"
              keyError={'register-settlement.modal.titleDate'}
              checkEmpty={true}
              required={true}
              errorPlacement={'right'}
              minDate={minDate}
              maxDate={maxDate}
              isValidateByRangeDays
            />
            <p className={'modal-content-infor'}>{localizeString('register-settlement.modal.textConfirm')}</p>
          </div>
        </DefaultModal>
      </div>
    </FormProvider>
  );
};

export default RegisterSettlementModal;
