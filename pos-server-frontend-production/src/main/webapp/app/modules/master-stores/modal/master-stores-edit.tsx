/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import React, { ChangeEvent, useEffect, useState } from 'react';
import { translate } from 'react-jhipster';

// Components
import DefaultModal from '@/components/modal/default-modal/default-modal';
import InputTextCustom from '@/components/input-text-custom/input-text-custom';
import { businessTypeValue } from '../option-dropdown';
import Dropdown from '@/components/dropdown/dropdown';
import { ModalMode } from '@/components/modal/default-modal/default-enum';
import TimePickerCustom from '@/components/time-picker/time-picker-custom';

// Functions
import { sanitizePayload } from '../master-stores-funtion/convertoNull';
import { getHoursAndMinutes } from '../master-stores-funtion/getHoursAndMinutes';
import { IMasterStores, MasterStoreState } from '../master-stores-interface';
import { handleCheckEmptyData, handleCheckExistedByFE } from '../master-stores-funtion/handleValidate';

// Redux
import { setError } from '@/reducers/error';
import { editStore } from '@/reducers/master-stores-reducer';
import { useAppDispatch, useAppSelector } from '@/config/store';

// API
import { isMasterStoreExisted } from '@/services/master-stores-service';

// Styles
import './modal-styled.scss';

const MasterStoresEdit = ({ handleCancelAction, setOpenModalEdit }) => {
  const dispatch = useAppDispatch();
  const masterStoresReducer: MasterStoreState = useAppSelector((state) => state.masterStoresReducer);
  const dataSelected: IMasterStores = masterStoresReducer.masterStoreSelected?.row || [];
  const masterStoresList: IMasterStores[] = masterStoresReducer.masterStoresList;

  const [startTime, setStartTime] = useState<Date>(new Date(new Date().setHours(9, 0, 0, 0)));
  const [endTime, setEndTime] = useState<Date>(new Date(new Date().setHours(22, 0, 0, 0)));

  const [masterStores, setMasterStores] = useState<IMasterStores>(dataSelected);

  useEffect(() => {
    const [startHours, startMinutes] = dataSelected?.start_hours?.split(':').map(Number);

    const [endHours, endMinutes] = dataSelected?.end_hours?.split(':').map(Number);

    setStartTime(new Date(new Date().setHours(startHours, startMinutes, 0, 0)));
    setEndTime(new Date(new Date().setHours(endHours, endMinutes, 0, 0)));
  }, []);

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
        setMasterStores({
          ...masterStores,
          start_hours: getHoursAndMinutes(dateStart),
        });
        break;
      }
      case 'end-time': {
        const dateEnd = new Date(endTime);
        if (hour !== null) {
          dateEnd.setHours(hour, min);
        }
        setMasterStores({
          ...masterStores,
          end_hours: getHoursAndMinutes(dateEnd),
        });

        break;
      }

      default:
        break;
    }
  };

  const handleEditStores = () => {
    const checkValidate = handleCheckEmptyData(masterStores as any, dispatch);
    const isExistedByFE = handleCheckExistedByFE(masterStoresList, masterStores, dataSelected, dispatch);
    const dataUpdate = {
      ...masterStores,
      address: `${masterStores?.address1 || ''}${masterStores?.address2 || ''}${masterStores?.address3 || ''}`,
      operation_type: masterStores.operation_type || 2, // When created data and edit now
      operation_type_before: masterStores.operation_type || 2,
    };

    if (checkValidate && isExistedByFE) {
      // Handle check isExisted when just add and edit now
      if (masterStores.operation_type === 1) {
        dispatch(isMasterStoreExisted({ store_code: dataUpdate.code }))
          .unwrap()
          .then((res) => {
            const { data } = res;
            if (data?.data?.existed) {
              dispatch(setError(translate('MSG_VAL_032')));
            } else {
              dispatch(editStore(sanitizePayload(dataUpdate as any)));
              setOpenModalEdit(false);
            }
          });
      } else {
        dispatch(editStore(sanitizePayload(dataUpdate as any)));
        setOpenModalEdit(false);
      }
    }
  };

  return (
    <div className="container-modal">
      <DefaultModal
        titleModal="action.edit"
        headerType={ModalMode.Edit}
        cancelAction={handleCancelAction}
        confirmAction={() => {
          handleEditStores();
        }}
      >
        <InputTextCustom
          isRequire={true}
          labelText="masterStores.modal.storeCode"
          maxLength={5}
          value={masterStores.code}
          onChange={(e: any) => {
            const inputValue = e.target.value.replace(/\D/g, '');
            setMasterStores({ ...masterStores, code: inputValue });
          }}
          onBlur={(e: any) => {
            const inputValue = e.target.value.replace(/\D/g, '');
            setMasterStores({
              ...masterStores,
              code: inputValue ? e.target.value.padStart(5, '0') : inputValue,
            });
          }}
          disabled={masterStores.operation_type !== 1}
        />
        <InputTextCustom
          isRequire={true}
          labelText="masterStores.modal.storeName"
          maxLength={50}
          onChange={(e: any) => {
            setMasterStores({ ...masterStores, name: e.target.value });
          }}
          onBlur={(e: any) => {
            setMasterStores({ ...masterStores, name: e.target.value?.trim() });
          }}
          value={masterStores.name}
        />
        <InputTextCustom
          isRequire={true}
          labelText="masterStores.modal.storeAbbreviation"
          maxLength={30}
          onChange={(e: any) => {
            setMasterStores({ ...masterStores, short_name: e.target.value });
          }}
          onBlur={(e: any) => {
            setMasterStores({ ...masterStores, short_name: e.target.value?.trim() });
          }}
          value={masterStores.short_name}
        />
        <InputTextCustom
          labelText="masterStores.modal.postCode"
          maxLength={8}
          value={masterStores?.post_code}
          onChange={(e: any) => {
            const inputValue = e.target.value.replace(/[^0-9-]/g, '');
            setMasterStores({
              ...masterStores,
              post_code: inputValue,
            });
          }}
        />
        <InputTextCustom
          labelText="masterStores.modal.address"
          maxLength={100}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setMasterStores({ ...masterStores, address1: e.target.value });
          }}
          onBlur={(e: ChangeEvent<HTMLInputElement>) => {
            setMasterStores({ ...masterStores, address1: e.target.value?.trim() });
          }}
          value={masterStores.address1}
        />
        <InputTextCustom
          labelText="masterStores.modal.address2"
          maxLength={100}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setMasterStores({ ...masterStores, address2: e.target.value });
          }}
          onBlur={(e: ChangeEvent<HTMLInputElement>) => {
            setMasterStores({ ...masterStores, address2: e.target.value?.trim() });
          }}
          value={masterStores.address2}
        />
        <InputTextCustom
          labelText="masterStores.modal.address3"
          maxLength={100}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setMasterStores({ ...masterStores, address3: e.target.value });
          }}
          onBlur={(e: ChangeEvent<HTMLInputElement>) => {
            setMasterStores({ ...masterStores, address3: e.target.value?.trim() });
          }}
          value={masterStores.address3}
        />
        <InputTextCustom
          labelText="masterStores.modal.phone"
          maxLength={13}
          value={masterStores.phone_number}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value.replace(/[^0-9-]/g, '');
            setMasterStores({
              ...masterStores,
              phone_number: inputValue,
            });
          }}
        />
        <Dropdown
          label="masterStores.modal.businessType"
          items={businessTypeValue}
          hasBlankItem={true}
          onChange={(item) =>
            setMasterStores({
              ...masterStores,
              business_type_code: item?.value as any,
            })
          }
          value={Number(masterStores.business_type_code)}
        />
        <InputTextCustom
          labelText="masterStores.modal.basicPoint"
          type="number"
          maxLength={6}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setMasterStores({ ...masterStores, default_point: Number(e.target.value) || null });
          }}
          onBlur={(e: ChangeEvent<HTMLInputElement>) => {
            setMasterStores({ ...masterStores, default_point: Number(e.target.value?.trim()) || null });
          }}
          value={masterStores.default_point}
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

export default MasterStoresEdit;
