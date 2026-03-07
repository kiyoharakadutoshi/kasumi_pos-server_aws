/* eslint-disable @typescript-eslint/no-shadow */
import React, { useState } from 'react';
import './modal-styled.scss';
import DefaultModal from 'app/components/modal/default-modal/default-modal';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import { businessTypeValue } from '../option-dropdown';
import Dropdown from 'app/components/dropdown/dropdown';
import { ModalMode } from 'app/components/modal/default-modal/default-enum';
import TimePickerCustom from 'app/components/time-picker/time-picker-custom';
import { translate } from 'react-jhipster';
import { IMasterStores, MasterStoreState } from '../master-stores-interface';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import {
  addStore,
  handleChangeAddressCondition,
  handleChangeBusinessTypeCondition,
  handleChangeCodeCondition,
  handleChangeDefaultPointCondition,
  handleChangeEndTimeCondition,
  handleChangeNameCondition,
  handleChangePhoneCondition,
  handleChangePostCodeCondition,
  handleChangeShortNameCondition,
  handleChangeStartTimeCondition,
} from 'app/reducers/master-stores-reducer';
import { getHoursAndMinutes } from '../master-stores-funtion/getHoursAndMinutes';
import { handleCheckEmptyData, handleCheckExistedByFE } from '../master-stores-funtion/handleValidate';
import { isMasterStoreExisted } from 'app/services/master-stores-service';
import { setError } from 'app/reducers/error';
import { sanitizePayload } from '../master-stores-funtion/convertoNull';

const MasterStoresAdd = ({ handleCancelAction, setOpenModalAdd }) => {
  const dispatch = useAppDispatch();
  const masterStoresReducer: MasterStoreState = useAppSelector((state) => state.masterStoresReducer);
  const masterStoresList: IMasterStores[] = masterStoresReducer.masterStoresList;
  const addCondition = masterStoresReducer.masterStoreSaveCondition;
  const [startTime] = useState<Date>(new Date(new Date().setHours(9, 0, 0, 0)));
  const [endTime] = useState<Date>(new Date(new Date().setHours(22, 0, 0, 0)));
  const [formattedStoreCode, setFormattedStoreCode] = useState('');

  const handleAddStores = () => {
    const checkValidate = handleCheckEmptyData(addCondition, dispatch);
    const isExistedByFE = handleCheckExistedByFE(masterStoresList, addCondition, null, dispatch);
    if (checkValidate && isExistedByFE) {
      // handle check isExisted
      dispatch(isMasterStoreExisted({ store_code: addCondition.code }))
        .unwrap()
        .then((res) => {
          const { data } = res;
          if (data?.data?.existed) {
            dispatch(setError(translate('MSG_VAL_032')));
          } else {
            dispatch(
              addStore(
                sanitizePayload({
                  ...addCondition,
                  address: `${addCondition?.address1 || ''}${addCondition?.address2 || ''}${addCondition?.address3 || ''}`,
                  operation_type_before: 1,
                })
              )
            );
            setOpenModalAdd(false);
          }
        });
    }
  };

  const updateDateTime = (
    type: 'start-date' | 'end-date' | 'start-time' | 'end-time',
    date?: Date,
    hour?: number,
    min?: number
  ) => {
    switch (type) {
      case 'start-time': {
        const dateStart = new Date(startTime);
        if (hour !== null) {
          dateStart.setHours(hour, min);
        }
        dispatch(handleChangeStartTimeCondition(getHoursAndMinutes(dateStart)));
        break;
      }
      case 'end-time': {
        const dateEnd = new Date(endTime);
        if (hour !== null) {
          dateEnd.setHours(hour, min);
        }
        dispatch(handleChangeEndTimeCondition(getHoursAndMinutes(dateEnd)));
        break;
      }

      default:
        break;
    }
  };
  return (
    <div className="container-modal">
      <DefaultModal
        titleModal="action.addMain"
        headerType={ModalMode.Add}
        cancelAction={handleCancelAction}
        confirmAction={() => {
          handleAddStores();
        }}
      >
        <InputTextCustom
          dataType="code"
          isRequire={true}
          labelText="masterStores.modal.storeCode"
          value={formattedStoreCode}
          maxLength={5}
          onChange={(e: any) => {
            const inputValue = e.target.value.replace(/\D/g, '');
            setFormattedStoreCode(inputValue);
            dispatch(handleChangeCodeCondition(inputValue));
          }}
          onBlur={(e: any) => {
            const inputValue = e.target.value.replace(/\D/g, '');
            setFormattedStoreCode(inputValue ? e.target.value.padStart(5, '0') : inputValue);
            dispatch(handleChangeCodeCondition(inputValue ? e.target.value.padStart(5, '0') : inputValue));
          }}
        />
        <InputTextCustom
          dataType="name"
          isRequire={true}
          labelText="masterStores.modal.storeName"
          value={addCondition.name}
          maxLength={50}
          onChange={(e: any) => {
            dispatch(handleChangeNameCondition(e.target.value));
          }}
          onBlur={(e: any) => {
            dispatch(handleChangeNameCondition(e.target.value?.trim()));
          }}
        />
        <InputTextCustom
          isRequire={true}
          labelText="masterStores.modal.storeAbbreviation"
          maxLength={30}
          value={addCondition.short_name}
          onChange={(e: any) => {
            dispatch(handleChangeShortNameCondition(e.target.value));
          }}
          onBlur={(e: any) => {
            dispatch(handleChangeShortNameCondition(e.target.value?.trim()));
          }}
        />
        <InputTextCustom
          labelText="masterStores.modal.postCode"
          maxLength={8}
          value={addCondition.post_code}
          onChange={(e: any) => {
            const inputValue = e.target.value.replace(/[^0-9-]/g, '');
            dispatch(handleChangePostCodeCondition(inputValue));
          }}
          onBlur={(e: any) => {
            dispatch(handleChangePostCodeCondition(e.target.value?.trim()));
          }}
        />
        <InputTextCustom
          labelText="masterStores.modal.address"
          maxLength={100}
          value={addCondition.address1}
          onChange={(e: any) => {
            dispatch(handleChangeAddressCondition({ fieldName: 'address1', value: e.target.value }));
          }}
          onBlur={(e: any) => {
            dispatch(handleChangeAddressCondition({ fieldName: 'address1', value: e.target.value?.trim() }));
          }}
        />
        <InputTextCustom
          labelText="masterStores.modal.address2"
          maxLength={100}
          value={addCondition.address2}
          onChange={(e: any) => {
            dispatch(handleChangeAddressCondition({ fieldName: 'address2', value: e.target.value }));
          }}
          onBlur={(e: any) => {
            dispatch(handleChangeAddressCondition({ fieldName: 'address2', value: e.target.value?.trim() }));
          }}
        />
        <InputTextCustom
          labelText="masterStores.modal.address3"
          maxLength={100}
          value={addCondition.address3}
          onChange={(e: any) => {
            dispatch(handleChangeAddressCondition({ fieldName: 'address3', value: e.target.value }));
          }}
          onBlur={(e: any) => {
            dispatch(handleChangeAddressCondition({ fieldName: 'address3', value: e.target.value?.trim() }));
          }}
        />
        <InputTextCustom
          labelText="masterStores.modal.phone"
          maxLength={13}
          value={addCondition.phone_number}
          onChange={(e: any) => {
            const inputValue = e.target.value.replace(/[^0-9-]/g, '');
            // update new phone
            dispatch(handleChangePhoneCondition(inputValue));
          }}
          onBlur={(e: any) => {
            const inputValue = e.target.value.replace(/[^0-9-]/g, '');
            // update new phone
            dispatch(handleChangePhoneCondition(inputValue?.trim()));
          }}
        />
        <Dropdown
          label="masterStores.modal.businessType"
          items={businessTypeValue}
          hasBlankItem={true}
          onChange={(item) => dispatch(handleChangeBusinessTypeCondition(item?.value as any))}
        />
        <InputTextCustom
          labelText="masterStores.modal.basicPoint"
          maxLength={6}
          value={addCondition.default_point}
          onChange={(e: any) => {
            dispatch(handleChangeDefaultPointCondition(e.target.value));
          }}
          onBlur={(e: any) => {
            dispatch(handleChangeDefaultPointCondition(e.target.value?.trim()));
          }}
          type="number"
        />
        <div className="container-time-picker">
          <p className="time-picker-title">{translate('masterStores.modal.openTime')}</p>
          <TimePickerCustom
            initValue={startTime}
            timePicked={(hour, min) => updateDateTime('start-time', null, hour, min)}
          />
        </div>
        <div className="container-time-picker">
          <p className="time-picker-title">{translate('masterStores.modal.closeTime')}</p>
          <TimePickerCustom
            initValue={endTime}
            timePicked={(hour, min) => updateDateTime('end-time', null, hour, min)}
          />
        </div>
      </DefaultModal>
    </div>
  );
};

export default MasterStoresAdd;
