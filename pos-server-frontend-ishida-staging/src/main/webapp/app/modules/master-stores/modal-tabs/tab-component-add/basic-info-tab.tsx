import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/config/store';
import { FormProvider, useForm } from 'react-hook-form';
import { translate } from 'react-jhipster';

// Components
import Dropdown from '@/components/dropdown/dropdown';
import CheckboxControl from '@/components/checkbox-button/checkbox-control';
import InputTextCustom from '@/components/input-text-custom/input-text-custom';

// CONSTANT
import { BusinessTypeName, FormDataBasicInfo, MasterStoreState } from '../../master-stores-interface';

// Redux
import { handleChangeDataForm } from '@/reducers/master-stores-reducer';

// Utils
import { EventKeyTabs } from '../../enum-master-stores';
import { isShowTabs } from '../../master-stores-funtion';

/**
 * BasicInfoTab component for managing basic information in the master store modal.
 */
const BasicInfoTab = ({ registerForm, keyEvent }) => {
  const masterStoresReducer: MasterStoreState = useAppSelector((state) => state.masterStoresReducer);
  const addCondition = masterStoresReducer.masterStoreSaveCondition;
  const businessTypeName: BusinessTypeName[] = masterStoresReducer.businessTypeName;
  const dispatch = useAppDispatch();
  const formConfig = useForm<FormDataBasicInfo>({
    defaultValues: {
      initialData: null,
    },
  });

  /**
   * Register form for Basic Info tab
   */
  useEffect(() => {
    registerForm(formConfig);
  }, [registerForm]);

  return (
    <FormProvider {...formConfig}>
      <div className={`container-modal-basic-info ${isShowTabs(keyEvent, EventKeyTabs.BASIC_INFO)}`}>
        <div className="wrap-modal-item">
          <div className="modal-item">
            <InputTextCustom
              dataType="store_code"
              isRequire={true}
              labelText="masterStores.modal.storeCode"
              value={addCondition.store_code}
              maxLength={5}
              onChange={(e: any) => {
                const inputValue = e.target.value.replace(/\D/g, '');
                dispatch(handleChangeDataForm({ key: 'store_code', value: inputValue }));
              }}
              onBlur={(e: any) => {
                const inputValue = e.target.value.replace(/\D/g, '');
                dispatch(handleChangeDataForm({ key: 'store_code', value: inputValue }));
              }}
            />
            <InputTextCustom
              dataType="name"
              isRequire={true}
              labelText="masterStores.modal.storeName"
              value={addCondition.name}
              maxLength={50}
              onChange={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'name', value: e.target.value }));
              }}
              onBlur={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'name', value: e.target.value?.trim() }));
              }}
            />
            <InputTextCustom
              isRequire={true}
              labelText="masterStores.modal.storeAbbreviation"
              maxLength={30}
              value={addCondition.short_name}
              onChange={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'short_name', value: e.target.value }));
              }}
              onBlur={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'short_name', value: e.target.value?.trim() }));
              }}
            />
            <InputTextCustom
              labelText="masterStores.modal.postCode"
              maxLength={8}
              value={addCondition.post_code}
              onChange={(e: any) => {
                const inputValue = e.target.value.replace(/[^0-9-]/g, '');

                dispatch(handleChangeDataForm({ key: 'post_code', value: inputValue }));
              }}
              onBlur={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'post_code', value: e.target.value?.trim() }));
              }}
            />
            <InputTextCustom
              labelText="masterStores.modal.address"
              maxLength={100}
              value={addCondition.address1}
              onChange={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'address1', value: e.target.value }));
              }}
              onBlur={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'address1', value: e.target.value?.trim() }));
              }}
            />
            <InputTextCustom
              labelText="masterStores.modal.address2"
              maxLength={100}
              value={addCondition.address2}
              onChange={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'address2', value: e.target.value }));
              }}
              onBlur={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'address2', value: e.target.value?.trim() }));
              }}
            />
            <InputTextCustom
              labelText="masterStores.modal.address3"
              maxLength={100}
              value={addCondition.address3}
              onChange={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'address3', value: e.target.value }));
              }}
              onBlur={(e: any) => {
                dispatch(handleChangeDataForm({ key: 'address3', value: e.target.value?.trim() }));
              }}
            />
          </div>
          <div className="modal-item">
            <InputTextCustom
              labelText="masterStores.modal.phone"
              maxLength={13}
              value={addCondition.phone_number}
              onChange={(e: any) => {
                const inputValue = e.target.value.replace(/[^0-9-]/g, '');
                // update new phone
                dispatch(handleChangeDataForm({ key: 'phone_number', value: inputValue }));
              }}
              onBlur={(e: any) => {
                const inputValue = e.target.value.replace(/[^0-9-]/g, '');
                // update new phone
                dispatch(handleChangeDataForm({ key: 'phone_number', value: inputValue?.trim() }));
              }}
            />
            <Dropdown
              value={addCondition.business_type_code}
              label="masterStores.modal.businessType"
              items={businessTypeName}
              hasBlankItem={true}
              onChange={(item) => {
                dispatch(handleChangeDataForm({ key: 'business_type_code', value: item?.value ?? '' }));
              }}
            />
            <div className="container-transaction-link">
              <div className="label">
                <label className="label-input">{translate('masterStores.modal.transactionLinked')}</label>
              </div>
              <div className="checkbox-options">
                <CheckboxControl id={'transactionLinked'} name={`transactionLinked`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default BasicInfoTab;
