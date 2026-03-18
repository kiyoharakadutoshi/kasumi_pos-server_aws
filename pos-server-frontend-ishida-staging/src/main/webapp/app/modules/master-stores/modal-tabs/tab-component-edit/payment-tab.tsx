import React, { useEffect, useMemo } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

// Components
import { FormDataPayment, IMasterStoreRecord, MasterStoreState } from '../../master-stores-interface';
import CheckboxControl from '@/components/checkbox-button/checkbox-control';
import TooltipInputTextControl from '@/components/input-text/input-text-control';

// API
import { getCodeMasterPayment } from '@/services/master-stores-service';

// Redux
import { useAppDispatch, useAppSelector } from '@/config/store';

// Utils
import { EventKeyTabs } from '../../enum-master-stores';
import { CODE_PAYMENT_METHOD_AEONPAY, isShowTabs } from '../../master-stores-funtion';

// Constants
import { REGEX_HALF_WIDTH_ONLY } from '@/constants/constants';

/**
 * PaymentTab component for managing payment methods in the master store modal.
 */
const PaymentTab = ({ registerForm, keyEvent }) => {
  const dispatch = useAppDispatch();
  const masterStoresReducer: MasterStoreState = useAppSelector((state) => state.masterStoresReducer);
  const dataSelected: IMasterStoreRecord = masterStoresReducer.masterStoreSelected?.row || [];

  const formConfig = useForm<FormDataPayment>({
    defaultValues: {
      paymentMethods: null,
      code_pay_no_aeonpay: '',
      code_pay_no_etc: '',
      code_pay_no_aeongift: '',
    },
  });
  const { watch, setValue, control } = formConfig;
  const { fields: paymentMethods } = useFieldArray({
    control,
    name: 'paymentMethods',
  });

  useEffect(() => {
    registerForm(formConfig);
  }, [registerForm]);

  // get list payment method
  useEffect(() => {
    dispatch(getCodeMasterPayment({ master_code: 'MC0008' }))
      .unwrap()
      .then((response) => {
        const paymentMethodList = response?.data?.data?.items;
        if (paymentMethodList) {
          setValue('paymentMethods', paymentMethodList);
        }
      })
      .catch(() => {});
  }, []);

  // Update status list checkbox payment method
  useEffect(() => {
    setTimeout(() => {
      if (dataSelected) {
        const paymentMethodActive = dataSelected?.payment_methods;
        const paymentMethodList = watch('paymentMethods');
        const newPaymentMethodList = paymentMethodList?.map((item) => {
          return { ...item, checked: paymentMethodActive?.includes(item.code_no) };
        });
        setValue('paymentMethods', newPaymentMethodList);
        setValue('code_pay_no_aeonpay', dataSelected?.code_pay_no_aeonpay);
        setValue('code_pay_no_etc', dataSelected?.code_pay_no_etc);
        setValue('code_pay_no_aeongift', dataSelected?.code_pay_no_aeongift);
      }
    }, 500);
  }, [dataSelected]);

  /**
   * Check if payment methods contain code_no '3' (AEONPAY)
   */
  const hasCodeNo3 = useMemo(() => {
    return paymentMethods?.some((item) => item.code_no === CODE_PAYMENT_METHOD_AEONPAY);
  }, [paymentMethods]);

  return (
    <FormProvider {...formConfig}>
      <div className={`container-modal-payment ${isShowTabs(keyEvent, EventKeyTabs.PAYMENT)}`}>
        <div className="modal-payment-item checkbox">
          {paymentMethods &&
            paymentMethods?.map((item, index) => {
              if (item?.code_no === '3') {
                return (
                  <div key={item.code_no} className="wrap-payment-checkbox-input">
                    <CheckboxControl
                      key={item.code_no}
                      id={item.code_no}
                      className={(index + 1) % 3 === 0 && 'third-item'}
                      name={`paymentMethods[${index}].checked`}
                      textValue={item.code_value}
                    />
                    <div className="wrap-input">
                      <TooltipInputTextControl
                        name="code_pay_no_aeonpay"
                        title={'masterStores.modal.aeonPayTitle'}
                        width={'100%'}
                        height={'50px'}
                        maxLength={11}
                        regex={REGEX_HALF_WIDTH_ONLY}
                        hasTrimSpace={true}
                      />
                      <TooltipInputTextControl
                        name="code_pay_no_etc"
                        title={'masterStores.modal.otherPayTitle'}
                        width={'100%'}
                        height={'50px'}
                        maxLength={11}
                        regex={REGEX_HALF_WIDTH_ONLY}
                        hasTrimSpace={true}
                      />
                      <TooltipInputTextControl
                        name="code_pay_no_aeongift"
                        title={'masterStores.modal.codePayNoAeongift'}
                        width={'100%'}
                        height={'50px'}
                        maxLength={11}
                        regex={REGEX_HALF_WIDTH_ONLY}
                        hasTrimSpace={true}
                      />
                    </div>
                  </div>
                );
              }
              return (
                <CheckboxControl
                  key={item.code_no}
                  id={item.code_no}
                  className={(index + 1) % 3 === 0 && 'third-item'}
                  name={`paymentMethods[${index}].checked`}
                  textValue={item.code_value}
                />
              );
            })}
        </div>
        <div className="modal-payment-item input-text">
          {!hasCodeNo3 && (
            <div className="wrap-input">
              <TooltipInputTextControl
                name="code_pay_no_aeonpay"
                title={'masterStores.modal.aeonPayTitle'}
                width={'100%'}
                height={'50px'}
                maxLength={11}
                regex={REGEX_HALF_WIDTH_ONLY}
                hasTrimSpace={true}
              />
              <TooltipInputTextControl
                name="code_pay_no_etc"
                title={'masterStores.modal.otherPayTitle'}
                width={'100%'}
                height={'50px'}
                maxLength={11}
                regex={REGEX_HALF_WIDTH_ONLY}
                hasTrimSpace={true}
              />
              <TooltipInputTextControl
                name="code_pay_no_aeongift"
                title={'masterStores.modal.codePayNoAeongift'}
                width={'100%'}
                height={'50px'}
                maxLength={11}
                regex={REGEX_HALF_WIDTH_ONLY}
                hasTrimSpace={true}
              />
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
};

export default PaymentTab;
