import { ModalMode } from '@/components/modal/default-modal/default-enum';
import DefaultModal from '@/components/modal/default-modal/default-modal';
import React, { useRef, useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import {
  IMasterStoreRecord,
  MasterStoreSaveCondition,
  MasterStoreState,
  PaymentMethod,
  PaymentMethodParam,
} from '../master-stores-interface';
import { useAppDispatch, useAppSelector } from '@/config/store';
import { isEqualObjectData, localizeString } from '@/helpers/utils';
import { handleCheckEmptyData, handleCheckExistedByFE } from '../master-stores-funtion/handleValidate';
import { editStore } from '@/reducers/master-stores-reducer';
import { sanitizePayload } from '../master-stores-funtion/convertoNull';
import { setError } from '@/reducers/error';
import { isMasterStoreExisted } from '@/services/master-stores-service';
import { translate } from 'react-jhipster';
import BasicInfoTab from './tab-component-edit/basic-info-tab';
import BusinessHoursTab from './tab-component-edit/business-hours-tab';
import PaymentTab from './tab-component-edit/payment-tab';
import { checkEmptyBusinessHours } from '../master-stores-funtion/checkEmptyBusinessHours';
import { elementChangeKeyListener } from '@/hooks/keyboard-hook';
import { blockArrowKeys } from '../master-stores-funtion/blockArrowKeys';
import { EventKeyTabs } from '../enum-master-stores';

// Styles
import './modal-tabs-styles.scss';

const LIST_KEY_COMPARE = [
  'store_code',
  'name',
  'short_name',
  'post_code',
  'address1',
  'address2',
  'address3',
  'phone_number',
  'business_type_code',
  'tran_relay_flag',
  // Tab2 - Business hours
  'business_day_mon',
  'business_day_tue',
  'business_day_wed',
  'business_day_thu',
  'business_day_fri',
  'business_day_sat',
  'business_day_sun',
  // Tab3 - Payment method
  'payment_methods',
  'code_pay_no_aeonpay',
  'code_pay_no_etc',
  'code_pay_no_aeongift',
];

interface ModalTabsProps {
  handleCancelAction: () => void;
  setOpenModalEdit: (value: boolean) => void;
  openModalEdit?: boolean;
}

const ModalTabsEdit: React.FC<ModalTabsProps> = ({ handleCancelAction, setOpenModalEdit, openModalEdit }) => {
  const dispatch = useAppDispatch();
  const masterStoresReducer: MasterStoreState = useAppSelector((state) => state.masterStoresReducer);
  const masterStoresList: IMasterStoreRecord[] = masterStoresReducer.masterStoresList;
  const masterStoreListDefault: IMasterStoreRecord[] = masterStoresReducer.masterStoreListDefault;

  const [key, setKey] = useState<string>(EventKeyTabs.BASIC_INFO);
  /*
   * Reload ui when chose new tab for tab , enter
   */
  elementChangeKeyListener(key, 350);
  elementChangeKeyListener(openModalEdit, 350);
  const dataSelected: IMasterStoreRecord = masterStoresReducer.masterStoreSelected?.row || [];
  const formRefs = useRef({
    [EventKeyTabs.BASIC_INFO]: null,
    [EventKeyTabs.BUSINESS_HOURS]: null,
    [EventKeyTabs.PAYMENT]: null,
  });
  const registerForm = (tabKey: string, form: any) => {
    formRefs.current[tabKey] = form;
  };

  const handleSubmit = async () => {
    const allData: any = {};
    for (const tabKey in formRefs.current) {
      if (formRefs.current[tabKey]) {
        const isValid = await formRefs.current[tabKey].trigger();
        if (isValid) {
          allData[tabKey] = formRefs.current[tabKey].getValues();
        } else {
          setKey(tabKey as any);
          return;
        }
      }
    }

    const basicInfoData = allData?.[EventKeyTabs.BASIC_INFO]?.initialData;
    // Convert business hours
    const dataBusinessHours = allData?.[EventKeyTabs.BUSINESS_HOURS]?.businessDays;

    const businessDayParams = dataBusinessHours?.reduce(
      (acc, cur) => {
        acc[`business_day_${cur.day}`] = {
          business_day: cur.business_day,
          business_open: cur.business_open,
          business_close: cur.business_close,
        };
        return acc;
      },
      {} as Record<string, any>
    );

    // Convert payment methods
    const codePaymentMethods = allData?.[EventKeyTabs?.PAYMENT]?.paymentMethods
      ?.filter((item: PaymentMethod) => item?.checked)
      .map((item_active: PaymentMethod) => item_active.code_no);

    const { code_pay_no_aeonpay, code_pay_no_etc, code_pay_no_aeongift } = allData?.[EventKeyTabs.PAYMENT] ?? {};
    const paymentMethodParam = {
      payment_methods: codePaymentMethods,
      code_pay_no_aeonpay,
      code_pay_no_etc,
      code_pay_no_aeongift,
    };

    handleEditStores(basicInfoData, paymentMethodParam, businessDayParams);
  };

  /**
   * Handle edit store with all data from tabs
   * This function checks for empty data, validates if the store already exists,
   * @param basicInfoParam
   * @param paymentMethodParam
   * @param businessDayParams
   * @returns
   */
  const handleEditStores = (
    basicInfoParam: MasterStoreSaveCondition,
    paymentMethodParam: PaymentMethodParam,
    businessDayParams
  ) => {
    const checkValidate = handleCheckEmptyData(basicInfoParam, dispatch);
    const isExistedByFE = handleCheckExistedByFE(masterStoresList, basicInfoParam, dataSelected, dispatch);
    // Check validate business hours
    if (checkEmptyBusinessHours(businessDayParams)) return;
    const dataUpdate = {
      ...basicInfoParam,
      post_code: basicInfoParam.post_code || '',
      address: `${basicInfoParam?.address1 || ''}${basicInfoParam?.address2 || ''}${basicInfoParam?.address3 || ''}`,
      operation_type: basicInfoParam.operation_type || 2, // When created data and edit now
      operation_type_before: dataSelected.operation_type_before || 2,
      tran_relay_flag: basicInfoParam?.tran_relay_flag ? 1 : 0,
      payment_methods: paymentMethodParam.payment_methods,
      code_pay_no_aeonpay: paymentMethodParam?.code_pay_no_aeonpay,
      code_pay_no_etc: paymentMethodParam?.code_pay_no_etc,
      code_pay_no_aeongift: paymentMethodParam?.code_pay_no_aeongift,
      total_pos: dataSelected?.total_pos, // can not edit total pos
      ...businessDayParams,
    };

    /* Handle case when open modal edit but not edit anything and click button confirm */
    /* 
      dataSelectedBeforeSubmit different dataSelected
      when use || dataSelectedBeforeSubmit?.operation_type_before === 1 for case When created data and edit now before click submit
    */

    const dataSelectedBeforeSubmit = masterStoreListDefault?.find((item) => item.record_id === dataSelected.record_id);
    const checkEqualData = isEqualObjectData(dataUpdate, dataSelectedBeforeSubmit, LIST_KEY_COMPARE);
    if (checkEqualData) {
      delete dataUpdate.operation_type; // Remove operation_type when not edit anything
      delete dataUpdate.operation_type_before; // Remove operation_type_before when not edit anything
    }

    if (checkValidate && isExistedByFE) {
      // Handle check isExisted when just add and edit now
      if (basicInfoParam.operation_type === 1) {
        dispatch(isMasterStoreExisted({ store_code: dataUpdate.store_code }))
          .unwrap()
          .then((res) => {
            const { data } = res;
            if (data?.data?.existed) {
              dispatch(setError(translate('MSG_VAL_032')));
            } else {
              dispatch(editStore(sanitizePayload(dataUpdate)));
              setOpenModalEdit(false);
            }
          });
      } else {
        dispatch(editStore(sanitizePayload(dataUpdate)));
        setOpenModalEdit(false);
      }
    }
  };

  return (
    <div className="container-modal">
      <DefaultModal
        titleModal="masterStores.modal.title"
        headerType={ModalMode.Edit}
        cancelAction={handleCancelAction}
        confirmAction={() => {
          handleSubmit();
        }}
      >
        <Tabs
          id="controlled-tab"
          className="tabs-styles"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          onKeyDownCapture={blockArrowKeys}
        >
          <Tab eventKey={EventKeyTabs.BASIC_INFO} title={localizeString('masterStores.modal.basic')}>
            <BasicInfoTab keyEvent={key} registerForm={(form) => registerForm(EventKeyTabs.BASIC_INFO, form)} />
          </Tab>
          <Tab eventKey={EventKeyTabs.BUSINESS_HOURS} title={localizeString('masterStores.modal.businessHours')}>
            <BusinessHoursTab keyEvent={key} registerForm={(form) => registerForm(EventKeyTabs.BUSINESS_HOURS, form)} />
          </Tab>
          <Tab eventKey={EventKeyTabs.PAYMENT} title={localizeString('masterStores.modal.payment')}>
            <PaymentTab keyEvent={key} registerForm={(form) => registerForm(EventKeyTabs.PAYMENT, form)} />
          </Tab>
        </Tabs>
      </DefaultModal>
    </div>
  );
};

export default ModalTabsEdit;
