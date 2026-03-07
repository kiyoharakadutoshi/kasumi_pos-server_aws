import Dropdown from 'app/components/dropdown/dropdown';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import { ModalMode } from 'app/components/modal/default-modal/default-enum';
import DefaultModal from 'app/components/modal/default-modal/default-modal';
import React from 'react';
import { businessTypeValue } from '../option-dropdown';
import { translate } from 'react-jhipster';
import TimePickerCustom from 'app/components/time-picker/time-picker-custom';

const MasterStoresCopy = ({ handleCancelAction, setOpenModalCopy }) => {
  return (
    <div className="container-modal">
      <DefaultModal
        titleModal="action.copy"
        headerType={ModalMode.Copy}
        cancelAction={handleCancelAction}
        confirmAction={() => {}}
      >
        <InputTextCustom isRequire={true} labelText="masterStores.modal.storeCode" />
        <InputTextCustom isRequire={true} labelText="masterStores.modal.storeName" />
        <InputTextCustom isRequire={true} labelText="masterStores.modal.storeAbbreviation" />
        <InputTextCustom labelText="masterStores.modal.postCode" />
        <InputTextCustom labelText="masterStores.modal.address" />
        <InputTextCustom labelText="masterStores.modal.address2" />
        <InputTextCustom labelText="masterStores.modal.address3" />
        <InputTextCustom labelText="masterStores.modal.phone" />
        <Dropdown label="masterStores.modal.businessType" items={businessTypeValue} hasBlankItem={true} />
        <div className="container-time-picker">
          <p className="time-picker-title">{translate('masterStores.modal.openTime')}</p>
          <TimePickerCustom />
        </div>
        <div className="container-time-picker">
          <p className="time-picker-title">{translate('masterStores.modal.closeTime')}</p>
          <TimePickerCustom />
        </div>
        <InputTextCustom labelText="masterStores.modal.copiedFromStore" />
      </DefaultModal>
    </div>
  );
};

export default MasterStoresCopy;
