import React, { useState } from 'react';
import './modal-confirm-preset.scss';
import { Translate } from 'react-jhipster';
import { NormalRadioButton } from 'app/components/radio-button/radio-button';
import DefaultModal from 'app/components/modal/default-modal/default-modal';
import { ModalMode } from 'app/components/modal/default-modal/default-enum';
import { Action, IPresetExist } from 'app/modules/touch-menu/menu-preset/interface-preset';
import PopoverText from 'app/components/popover/popover';
import { formatValue } from 'app/helpers/utils';

interface ModalConfirmPresetProps {
  listPresetExist?: IPresetExist[];
  closeModal?: (listStoreCheckBox: any[]) => void;
}

export const ModalConfirmPreset: React.FC<ModalConfirmPresetProps> = ({ listPresetExist, closeModal }) => {
  const dataRadio = [
    { id: '1', checkBoxValue: 1, textValue: <Translate contentKey="modalCreatePresetLayout.radio.value_1" /> },
    { id: '2', checkBoxValue: 2, textValue: <Translate contentKey="modalCreatePresetLayout.radio.value_2" /> },
  ];

  const checkBoxStoreValue = listPresetExist?.map(store => {
    return {
      store_code: store.store_code,
      store_name: store.store_name,
      override: Action.create,
    };
  });

  const [listStoreCheckBoxValue, setListStoreCheckBoxValue] = useState(checkBoxStoreValue);
  const setValueCheckBoxStores = (isCreate: boolean, storeIndex: number) => {
    const updatedList = listStoreCheckBoxValue.map((item, index) => {
      if (index === storeIndex) {
        return {
          store_code: item.store_code,
          store_name: item.store_name,
          override: isCreate ? Action.create : Action.override,
        };
      }
      return item;
    });
    setListStoreCheckBoxValue(updatedList);
  };
  const handleClose = (isCancel: boolean) => {
    isCancel ? closeModal(null) : closeModal(listStoreCheckBoxValue);
  };

  const storeText = (storeCode: string, storeName: string) => {
    return <PopoverText
      text={formatValue(storeCode, storeName)}
      lineLimit={1}
      lineHeight={null}
    />
  };

  return (
    <DefaultModal
      headerType={ModalMode.Copy}
      titleModal="modalCreatePresetLayout.title"
      cancelAction={() => handleClose(true)}
      confirmAction={() => handleClose(false)}
    >
      <div className={'body-modal-confirm-preset'}>
        <div className="header-override">
          <Translate contentKey="modalCreatePresetLayout.textHeaderOverride" />
        </div>

        <div className={'list-store'}>
          {listStoreCheckBoxValue?.map((storeCheckBox, index) => (
            <div className="list-store__checkbox" key={index}>
              <NormalRadioButton
                widthText="500px"
                height={'32px'}
                text={storeText(storeCheckBox.store_code, storeCheckBox.store_name)}
                listCheckBox={dataRadio}
                nameGroupRadio={`checkbox-store-${storeCheckBox.store_code}-${index}`}
                value={storeCheckBox.override ? Action.create : Action.override}
                onChange={(value: number) => setValueCheckBoxStores(value === Number(Action.create), index)}
              />
            </div>
          ))}
        </div>
      </div>
    </DefaultModal>
  );
};

export default ModalConfirmPreset;
