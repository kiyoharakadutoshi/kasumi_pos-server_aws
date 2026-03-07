import { ModalMode } from '@/components/modal/default-modal/default-enum';
import DefaultModal from '@/components/modal/default-modal/default-modal';
import React, { useRef, useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
// Styles
import './modal-tabs-styles.scss';
import BasicInfoTab from './tab-component-add/basic-info-tab';
import BusinessHoursTab from './tab-component-add/business-hours-tab';
import PaymentTab from './tab-component-add/payment-tab';
import { IMasterStoreRecord, MasterStoreState, PaymentMethod, PaymentMethodParam } from '../master-stores-interface';
import { useAppDispatch, useAppSelector } from '@/config/store';
import { localizeString } from '@/helpers/utils';
import { handleCheckEmptyData, handleCheckExistedByFE } from '../master-stores-funtion/handleValidate';
import { addStore } from '@/reducers/master-stores-reducer';
import { sanitizePayload } from '../master-stores-funtion/convertoNull';
import { setError } from '@/reducers/error';
import { isMasterStoreExisted } from '@/services/master-stores-service';
import { translate } from 'react-jhipster';
import { checkEmptyBusinessHours } from '../master-stores-funtion/checkEmptyBusinessHours';
import { elementChangeKeyListener } from '@/hooks/keyboard-hook';
import { blockArrowKeys } from '../master-stores-funtion/blockArrowKeys';
import { EventKeyTabs } from '../enum-master-stores';

interface ModalTabsProps {
  handleCancelAction: () => void;
  setOpenModalAdd: (value: boolean) => void;
  openModalAdd?: boolean;
}

const ModalTabsAdd: React.FC<ModalTabsProps> = ({ handleCancelAction, setOpenModalAdd, openModalAdd }) => {
  const dispatch = useAppDispatch();
  const masterStoresReducer: MasterStoreState = useAppSelector((state) => state.masterStoresReducer);
  const masterStoresList: IMasterStoreRecord[] = masterStoresReducer.masterStoresList;
  const [key, setKey] = useState<string>(EventKeyTabs.BASIC_INFO);

  /* 
    Reload ui when chose new tab for tab , enter
  */
  elementChangeKeyListener(key, 350);
  elementChangeKeyListener(openModalAdd, 350);

  const addCondition = masterStoresReducer.masterStoreSaveCondition;

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
          setKey(tabKey);
          return;
        }
      }
    }

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
    const codePaymentMethods = allData?.[EventKeyTabs.PAYMENT]?.paymentMethods
      ?.filter((item: PaymentMethod) => item?.checked)
      .map((item_active: PaymentMethod) => item_active.code_no);

    const { code_pay_no_aeonpay, code_pay_no_etc, code_pay_no_aeongift } = allData?.[EventKeyTabs.PAYMENT] ?? {};
    const paymentParams = {
      payment_methods: codePaymentMethods,
      code_pay_no_aeonpay,
      code_pay_no_etc,
      code_pay_no_aeongift,
    };
    // handle tran_relay_flag into first tab
    const tranRelayFlag = allData?.[EventKeyTabs.BASIC_INFO]?.transactionLinked ? 1 : 0;
    // Check empty

    // Action add store
    handleAddStores(tranRelayFlag, paymentParams, businessDayParams);
  };

  /* 
    addCondition is data into fist tab and use redux 
    second and third tab use react hook form
  */
  const handleAddStores = (tranRelayFlag, paymentMethodParam: PaymentMethodParam, businessDayParams) => {
    const checkValidate = handleCheckEmptyData(addCondition, dispatch);
    const isExistedByFE = handleCheckExistedByFE(masterStoresList, addCondition, null, dispatch);
    // Check validate business hours
    if (checkEmptyBusinessHours(businessDayParams)) return;
    if (checkValidate && isExistedByFE) {
      // handle check isExisted
      dispatch(isMasterStoreExisted({ store_code: addCondition.store_code }))
        .unwrap()
        .then((res) => {
          const { data } = res;
          const storeCodePadStart = addCondition?.store_code.padStart(5, '0');
          if (data?.data?.existed || masterStoresReducer.masterStoresList.some((item) => item?.store_code === storeCodePadStart)) {
            dispatch(setError(translate('MSG_VAL_032')));
          } else {
            dispatch(
              addStore(
                sanitizePayload({
                  ...addCondition,
                  store_code: storeCodePadStart,
                  address: `${addCondition?.address1 || ''}${addCondition?.address2 || ''}${addCondition?.address3 || ''}`,
                  operation_type_before: 1,
                  tran_relay_flag: tranRelayFlag,
                  payment_methods: paymentMethodParam.payment_methods,
                  code_pay_no_aeonpay: paymentMethodParam?.code_pay_no_aeonpay,
                  code_pay_no_etc: paymentMethodParam?.code_pay_no_etc,
                  code_pay_no_aeongift: paymentMethodParam?.code_pay_no_aeongift,
                  ...businessDayParams,
                })
              )
            );
            setOpenModalAdd(false);
          }
        });
    }
  };

  return (
    <div className="container-modal">
      <DefaultModal
        titleModal="新規"
        headerType={ModalMode.Add}
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

export default ModalTabsAdd;
