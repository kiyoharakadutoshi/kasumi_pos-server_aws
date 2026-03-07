import React, { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAppDispatch } from '@/config/store';
import { useLocation, useNavigate } from 'react-router';

// Components
import { AGE_VERIFICATION_OPTIONS, MASTER_COMPANY_VALUE_FORM } from './defaultValueCompany';
import { HeaderControl } from '@/components/header/header';
import CheckboxControl from '@/components/checkbox-button/checkbox-control';
import TooltipInputTextControl from '@/components/input-text/input-text-control';
import CompareForm from '@/components/compare-form/compare-form';
import RadioControl from '@/components/control-form/radio-control';
import ButtonBottomCommon from '@/components/bottom-button/button-bottom-common';

// Hooks
import { elementChangeKeyListener } from '@/hooks/keyboard-hook';

// Utils
import { URL_MAPPING } from '@/router/url-mapping';
import { focusElementByName, localizeString } from '@/helpers/utils';

// Service
import { getCompanyInfo, updateCompanyInfo } from '@/services/master-company-service';
import { getMasters } from '@/services/master-service';

// Styles
import './styles.scss';


// Constants
const AGE_VERIFICATION_DEFAULT = 2;

/**
 * SC0001: Master Company Settings
 *
 * Allows editing company name, registration number, age verification, etc.
 * Submits data to the server and updates form state after saving.
 */
const MasterCompanySettings = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const formConfig = useForm({
    defaultValues: MASTER_COMPANY_VALUE_FORM,
  });

  // state store mode info
  const { state } = useLocation();

  const { getValues, watch, setValue } = formConfig;

  // Retrieve the elements to be managed on the screen when get payment method and change mode.
  elementChangeKeyListener(getValues('paymentMethods'));
  elementChangeKeyListener(state);

  /**
   * Focuses the first input field (company name) after a short delay.
   * Useful for setting initial focus when the form loads.
   */
  const focusFirstInput = () => {
    setTimeout(() => {
      focusElementByName('valueForm.companyName');
    }, 100);
  };

  /**
   * Retrieves the payment status based on active payments.
   *
   * @param {string[]} activePayments - List of active payment.
   * @returns {string[]} - paymentMethodStatus: List of boolean values indicating the status of each payment method.
   */
  const getPaymentStatus = (activePaymentCodes: string[]) => {
    const paymentMethods = getValues('paymentMethods');
    return paymentMethods?.map((payment) => activePaymentCodes?.includes(payment.paymentCode));
  };

  /**
   * Change to mode edit
   */
  const changeToModeEdit = () => {
    navigate(URL_MAPPING.SLASH_PATH + URL_MAPPING.SC9901, {
      state: { isEditMode: true },
    });
  };

  /**
   * Set form value to initial value
   */
  const handleResetForm = () => {
    setValue('valueForm', getValues('defaultForm'));
  };

  /**
   * Focus first element mode edit
   */
  const focusFirstElement = () => {
    const element: HTMLElement = document.querySelector('input[name="valueForm.companyName"]');
    element?.focus();
  };

  /**
   * Update company infor when click confirm button.
   */
  const confirmAction = () => {
    const { valueForm } = getValues();
    // handle map data payment method
    const paymentMethodStatus = getValues('valueForm.paymentMethodStatus');
    const paymentMethods = getValues('paymentMethods');
    const paymentCodes = paymentMethods
      ?.filter((_, index) => paymentMethodStatus[index])
      ?.map((paymentMethod) => paymentMethod.paymentCode);

    dispatch(
      updateCompanyInfo({
        company_name: valueForm.companyName,
        company_name_official: valueForm.companyNameOfficial,
        company_name_official_short: valueForm.companyNameOfficialShort,
        age_verification_ptn: valueForm.ageVerification,
        registration_number: valueForm.registrationNumber,
        payment_ids: paymentCodes || [],
      })
    )
      .unwrap()
      .then(() => {
        setValue('disableConfirm', true);
        setValue('isDirty', false);
        setValue('defaultForm', getValues('valueForm'));

        // Navigate to menu screen when update sucessfully
        navigate(URL_MAPPING.SLASH_PATH);
      })
      .catch(() => { });
  };

  // get list payment method
  useEffect(() => {
    dispatch(getMasters({ master_code: ['MC0008'] }))
      .unwrap()
      .then((res) => {
        const paymentMethods = res.data?.data
          ?.flatMap((entry) => entry.items)
          ?.map((item) => ({ paymentName: item.event_group_name, paymentCode: item.setting_data_type }));
        setValue('paymentMethods', paymentMethods);
      })
      .then(() => {
        dispatch(getCompanyInfo())
          .unwrap()
          .then((response) => {
            if (response?.data) {
              const dataResponse = response.data.data;
              const paymentMethodStatus = getPaymentStatus(dataResponse.payment_ids);
              const value = {
                companyCode: dataResponse.company_code,
                companyName: dataResponse.company_name,
                companyNameOfficial: dataResponse.company_name_official,
                companyNameOfficialShort: dataResponse.company_name_official_short,
                ageVerification: dataResponse.age_verification_ptn,
                registrationNumber: dataResponse.registration_number,
                paymentMethodStatus,
              };
              setValue('valueForm', value);
              setValue('defaultForm', value);
              focusFirstInput();
            }
          })
          .catch(() => { });
      });
  }, []);

  useEffect(() => {
    setValue('valueForm', getValues('defaultForm'));

    // focus first input: company name
    if (state?.isEditMode) {
      focusFirstElement();
    }
  }, [state]);

  return (
    <FormProvider {...formConfig}>
      <div className="master-company">
        <div className="master-company__header">
          <HeaderControl
            isHiddenCSV={false}
            dirtyCheckName="isDirty"
            isHiddenPrinter={false}
            printer={{ disabled: true }}
            csv={{ disabled: true }}
            title="masterCompany.header.title"
            hasESC={true}
            confirmBack={!watch('isDirty')}

          />
        </div>
        <div className="master-company__form">
          <div className="master-company__form-item">
            <TooltipInputTextControl
              name="valueForm.companyCode"
              title={'masterCompany.companyCode'}
              width={'100%'}
              disabled
            />
          </div>
          <div className={`master-company__form-item`}>
            <TooltipInputTextControl
              name="valueForm.companyName"
              title={'masterCompany.companyName'}
              width={'100%'}
              maxLength={50}
              hasTrimSpace
              disabled={!state?.isEditMode}
            />
          </div>
          <div className={`master-company__form-item`}>
            <TooltipInputTextControl
              name="valueForm.companyNameOfficial"
              title={'masterCompany.companyNameOfficial'}
              width={'100%'}
              maxLength={50}
              hasTrimSpace
              disabled={!state?.isEditMode}
            />
          </div>
          <div className={`master-company__form-item`}>
            <TooltipInputTextControl
              name="valueForm.companyNameOfficialShort"
              title={'masterCompany.companyNameOfficialShort'}
              width={'100%'}
              maxLength={50}
              hasTrimSpace
              disabled={!state?.isEditMode}
            />
          </div>

          <div className="master-company__form-item">
            <div className="wrap-radio">
              <p className="label-radio">{localizeString('masterCompany.ageVerification')}</p>
              <RadioControl
                isVertical={false}
                name="valueForm.ageVerification"
                value={watch('valueForm.ageVerification') || AGE_VERIFICATION_DEFAULT}
                listValues={AGE_VERIFICATION_OPTIONS.map((item) => ({
                  id: item.id,
                  textValue: `${item.name}`,
                }))}
                disabled={!state?.isEditMode}
              />
            </div>
          </div>
          <div className={`master-company__form-item`}>
            <TooltipInputTextControl
              name="valueForm.registrationNumber"
              title={'masterCompany.registrationNumber'}
              width={'100%'}
              hasTrimSpace
              maxLength={14}
              disabled={!state?.isEditMode}
            />
          </div>
          <div className={`master-company__form-payment`}>
            <div className="label">
              <label className="label-input">{localizeString('masterCompany.paymentMethod')}</label>
            </div>
            <div className="checkbox-options">
              {getValues('valueForm.paymentMethodStatus') &&
                getValues('valueForm.paymentMethodStatus')?.map((_, index) => (
                  <div key={index} className="check-box-item">
                    <CheckboxControl
                      id={String(index)}
                      name={`valueForm.paymentMethodStatus[${index}]`}
                      textValue={getValues(`paymentMethods`)?.[index]?.paymentName}
                      disabled={!state?.isEditMode}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div className="master-company__footer">
          <ButtonBottomCommon
            clearAction={state?.isEditMode && handleResetForm}
            editAction={!state?.isEditMode && changeToModeEdit}
            confirmAction={state?.isEditMode && confirmAction}
            disableConfirm={watch('disableConfirm')}
            disabledClear={state?.isEditMode && watch('disableConfirm')}
            disableEdit={state?.isEditMode}
            canKeyDown={true}
          ></ButtonBottomCommon>
        </div>
        <MasterCompanyCompare />
      </div>
    </FormProvider>
  );
};

export default MasterCompanySettings;

const MasterCompanyCompare = () => {
  const listParamsEqual = [
    'companyName',
    'companyNameOfficial',
    'companyNameOfficialShort',
    'ageVerification',
    'registrationNumber',
    'paymentTypes',
  ];

  return <CompareForm name="valueForm" nameCompare="defaultForm" paramsEqual={listParamsEqual} />;
};
