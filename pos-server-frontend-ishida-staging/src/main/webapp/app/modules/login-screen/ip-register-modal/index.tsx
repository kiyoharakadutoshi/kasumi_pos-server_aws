import React from 'react';

import { localizeString } from '@/helpers/utils';

// Component
import './ip-register-modal.scss';
import { FormProvider, useForm } from 'react-hook-form';
import DefaultModal from 'app/components/modal/default-modal/default-modal';
import { ModalMode } from 'app/components/modal/default-modal/default-enum';

interface IpRegisterModalProps {
  onClose: () => void
}

const IpRegisterModal: React.FC<IpRegisterModalProps> = ({ onClose }) => {
  const formConfig = useForm({ defaultValues: null });
  return (
    <FormProvider {...formConfig}>
      <div className="container-category-modal">
        <DefaultModal
          titleModal=""
          headerType={ModalMode.Edit}
          confirmAction={onClose}
          hasBottomButton={true}
          confirmTitle={localizeString('loginScreen.modal.registration')}
        >
          <div className={'modal-content-register'}>
            <p className={'modal-content-infor'}>{localizeString('loginScreen.modal.message')}</p>
            <p className={'modal-content-infor'}>{localizeString('loginScreen.modal.phone')}</p>
            <p className={'modal-content-infor'}>{localizeString('loginScreen.modal.email')}</p>
          </div>
        </DefaultModal>
      </div>
    </FormProvider>
  );
};

export default IpRegisterModal;
