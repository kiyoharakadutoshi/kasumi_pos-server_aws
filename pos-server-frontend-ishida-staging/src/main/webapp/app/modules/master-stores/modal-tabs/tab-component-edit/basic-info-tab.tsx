import React, { useEffect } from 'react';
import { translate } from 'react-jhipster';
import { useAppDispatch, useAppSelector } from '@/config/store';
import { FormProvider, useForm } from 'react-hook-form';

// Components
import Dropdown from '@/components/dropdown/dropdown';
import CheckboxControl from '@/components/checkbox-button/checkbox-control';
import InputTextCustom from '@/components/input-text-custom/input-text-custom';

// Redux
import { handleChangeDataForm } from '@/reducers/master-stores-reducer';

// CONSTANT
import {
  BusinessTypeName,
  FormDataBasicInfo,
  IMasterStoreRecord,
  MasterStoreState,
} from '../../master-stores-interface';
import { EventKeyTabs } from '../../enum-master-stores';
import { isShowTabs } from '../../master-stores-funtion';

/**
 * BasicInfoTab component for managing basic information in the master store modal.
 */
const BasicInfoTab = ({ registerForm, keyEvent }) => {
  const dispatch = useAppDispatch();
  const formConfig = useForm<FormDataBasicInfo>({
    defaultValues: {
      initialData: null,
    },
  });

  const { watch, setValue } = formConfig;
  const masterStoresReducer: MasterStoreState = useAppSelector((state) => state.masterStoresReducer);
  const businessTypeName: BusinessTypeName[] = masterStoresReducer.businessTypeName;
  const dataSelected: IMasterStoreRecord = masterStoresReducer.masterStoreSelected?.row || [];

  useEffect(() => {
    registerForm(formConfig);
  }, [registerForm]);

  useEffect(() => {
    if (dataSelected) {
      const data: IMasterStoreRecord = {
        store_code: dataSelected.store_code,
        name: dataSelected.name,
        short_name: dataSelected.short_name,
        post_code: dataSelected.post_code,
        address1: dataSelected.address1,
        address2: dataSelected.address2,
        address3: dataSelected.address3,
        phone_number: dataSelected.phone_number,
        business_type_code: dataSelected.business_type_code,
        tran_relay_flag: dataSelected.tran_relay_flag,
      };
      setValue('initialData', data);
    }
  }, [dataSelected]);

  // Need re-render UI
  useEffect(() => { }, [watch('initialData')]);

  return (
    <FormProvider {...formConfig}>
      <div className={`container-modal-basic-info ${isShowTabs(keyEvent, EventKeyTabs.BASIC_INFO)}`}>
        <div className="wrap-modal-item">
          <div className="modal-item">
            <InputTextCustom
              disabled={watch('initialData.operation_type') !== 1}
              dataType="store_code"
              isRequire={true}
              labelText="masterStores.modal.storeCode"
              value={watch('initialData.store_code')}
              maxLength={5}
              onChange={(e: any) => {
                const inputValue = e.target.value.replace(/\D/g, '');
                dispatch(handleChangeDataForm({ key: 'store_code', value: inputValue }));
                setValue('initialData.store_code', inputValue);
              }}
              onBlur={(e: any) => {
                const inputValue = e.target.value.replace(/\D/g, '');
                dispatch(handleChangeDataForm({ key: 'store_code', value: inputValue }));
                setValue('initialData.store_code', inputValue);
              }}
            />
            <InputTextCustom
              dataType="name"
              isRequire={true}
              labelText="masterStores.modal.storeName"
              value={watch('initialData.name')}
              maxLength={50}
              onChange={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'name', value: e.target.value }));
                setValue('initialData.name', e.target.value);
              }}
              onBlur={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'name', value: e.target.value?.trim() }));
                setValue('initialData.name', e.target.value?.trim());
              }}
            />
            <InputTextCustom
              isRequire={true}
              labelText="masterStores.modal.storeAbbreviation"
              maxLength={30}
              value={watch('initialData.short_name')}
              onChange={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'short_name', value: e.target.value }));
                setValue('initialData.short_name', e.target.value);
              }}
              onBlur={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'short_name', value: e.target.value?.trim() }));
                setValue('initialData.short_name', e.target.value?.trim());
              }}
            />
            <InputTextCustom
              labelText="masterStores.modal.postCode"
              maxLength={8}
              value={watch('initialData.post_code')}
              onChange={(e: any) => {
                const inputValue = e.target.value.replace(/[^0-9-]/g, '');
                setValue('initialData.post_code', inputValue);
                dispatch(handleChangeDataForm({ key: 'post_code', value: inputValue }));
              }}
              onBlur={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'post_code', value: e.target.value?.trim() }));
                setValue('initialData.post_code', e.target.value?.trim());
              }}
            />
            <InputTextCustom
              labelText="masterStores.modal.address"
              maxLength={100}
              value={watch('initialData.address1')}
              onChange={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'address1', value: e.target.value }));
                setValue('initialData.address1', e.target.value);
              }}
              onBlur={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'address1', value: e.target.value?.trim() }));
                setValue('initialData.address1', e.target.value?.trim());
              }}
            />
            <InputTextCustom
              labelText="masterStores.modal.address2"
              maxLength={100}
              value={watch('initialData.address2')}
              onChange={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'address2', value: e.target.value }));
                setValue('initialData.address2', e.target.value);
              }}
              onBlur={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'address2', value: e.target.value?.trim() }));
                setValue('initialData.address2', e.target.value?.trim());
              }}
            />
            <InputTextCustom
              labelText="masterStores.modal.address3"
              maxLength={100}
              value={watch('initialData.address3')}
              onChange={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'address3', value: e.target.value }));
                setValue('initialData.address3', e.target.value);
              }}
              onBlur={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'address3', value: e.target.value?.trim() }));
                setValue('initialData.address3', e.target.value?.trim());
              }}
            />
          </div>
          <div className="modal-item">
            <InputTextCustom
              labelText="masterStores.modal.phone"
              maxLength={13}
              value={watch('initialData.phone_number')}
              onChange={(e: any) => {
                const inputValue = e.target.value.replace(/[^0-9-]/g, '');

                setValue('initialData.phone_number', inputValue);
              }}
              onBlur={(e: any) => {
                const inputValue = e.target.value.replace(/[^0-9-]/g, '');
                setValue('initialData.phone_number', inputValue?.trim());
              }}
            />
            <Dropdown
              value={String(watch('initialData.business_type_code'))}
              label="masterStores.modal.businessType"
              items={businessTypeName}
              hasBlankItem={true}
              onChange={(item) => {
                dispatch(handleChangeDataForm({ key: 'business_type_code', value: item?.value ?? '' }));
                setValue('initialData.business_type_code', String(item?.value ?? ''));
              }}
            />
            <div className="container-transaction-link">
              <div className="label">
                <label className="label-input">{translate('masterStores.modal.transactionLinked')}</label>
              </div>
              <div className="checkbox-options">
                <CheckboxControl id={'tran_relay_flag'} name={'initialData.tran_relay_flag'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default BasicInfoTab;
