import React, { useEffect } from 'react';
import { translate } from 'react-jhipster';
import { array, object, string } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, Resolver, useFieldArray, useForm } from 'react-hook-form';

// Utils
import { localizeString } from '@/helpers/utils';

// Components
import RadioControl from '@/components/control-form/radio-control';
import { BusinessDay, FormDataBusinessHours } from '../../master-stores-interface';
import TooltipTimePickerControl from '@/components/time-picker/tooltip-time-picker/tooltip-time-picker-control';
import { EventKeyTabs } from '../../enum-master-stores';
import { isShowTabs } from '../../master-stores-funtion';

export const BUSINESS_DAY_STATUS = [
  {
    id: 0,
    value: 0,
    name: '店休日',
  },
  {
    id: 1,
    value: 1,
    name: '営業日',
  },
];

const defaultBusinessDays: BusinessDay[] = [
  { day: 'mon', business_day: 1, business_open: '00:00', business_close: '23:59' },
  { day: 'tue', business_day: 1, business_open: '00:00', business_close: '23:59' },
  { day: 'wed', business_day: 1, business_open: '00:00', business_close: '23:59' },
  { day: 'thu', business_day: 1, business_open: '00:00', business_close: '23:59' },
  { day: 'fri', business_day: 1, business_open: '00:00', business_close: '23:59' },
  { day: 'sat', business_day: 1, business_open: '00:00', business_close: '23:59' },
  { day: 'sun', business_day: 1, business_open: '00:00', business_close: '23:59' },
];

/**
 * BusinessHoursTab component for managing business hours in a form.
 */
const BusinessHoursTab = ({ registerForm, keyEvent }) => {
  /**
   * Create schema for validation of business hours form
   */
  const validationSchema = object<FormDataBusinessHours>().shape({
    businessDays: array().of(
      object().shape({
        business_open: string().required(),
        business_close: string()
          .required()
          .test('is-greater', translate('MSG_VAL_080'), function (value) {
            const { business_open, business_day } = this.parent;
            if (business_day === 0) return true;
            if (!business_open || !value) return true;
            return business_open <= value;
          }),
      })
    ),
  });

  /**
   * Initialize form configuration using react-hook-form
   */
  const formConfig = useForm<FormDataBusinessHours>({
    defaultValues: {
      businessDays: defaultBusinessDays,
    },
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormDataBusinessHours>,
  });

  const { watch, control, setValue, clearErrors, trigger } = formConfig;
  const { fields: listBusinessDay } = useFieldArray({
    control,
    name: 'businessDays',
  });

  /**
   * Register the form configuration with the parent component.
   */
  useEffect(() => {
    registerForm(formConfig);
  }, [registerForm]);

  /**
   * Check if the time picker should be disabled based on the business day status.
   * @param index Index of the business day to check if the time picker should be disabled
   * @returns
   */
  const disabledTimePicker = (index: number) => {
    return watch(`businessDays[${index}].business_day` as any) === 0;
  };

  const handleOnChangeRadio = (index) => {
    if (disabledTimePicker(index)) {
      setValue(`businessDays[${index}].business_open` as any, defaultBusinessDays[index]?.business_open);
      setValue(`businessDays[${index}].business_close` as any, defaultBusinessDays[index]?.business_close);
    }
  };

  // Re render UI and value after change radio
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name?.startsWith('businessDays')) {
        clearErrors(name);
      }

      // Trigger err business_close when change business open
      const nameTrigger = name?.replace(/\.business_open$/, '.business_close');
      trigger(nameTrigger as any);
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <FormProvider {...formConfig}>
      <div className={`container-modal-business-hours ${isShowTabs(keyEvent, EventKeyTabs.BUSINESS_HOURS)}`}>
        {listBusinessDay?.map((item, index) => {
          return (
            <div key={index} className="wrap-option-time">
              <div className="wrap-radio">
                <p className="label-radio">{localizeString(`masterStores.titleDayOfWeek.${item.day}`)}</p>
                <RadioControl
                  isVertical={false}
                  name={`businessDays[${index}].business_day`}
                  value={listBusinessDay[index].business_day}
                  listValues={BUSINESS_DAY_STATUS.map((businessDay) => ({
                    id: businessDay.id,
                    textValue: `${businessDay.name}`,
                  }))}
                  onChange={() => {
                    handleOnChangeRadio(index);
                  }}
                />
              </div>
              <div className="wrap-time-picker">
                <div className="container-time-picker">
                  <TooltipTimePickerControl
                    disabled={disabledTimePicker(index)}
                    labelText="masterStores.modal.startTime"
                    name={`businessDays[${index}].business_open`}
                    checkEmpty
                    keyError="masterStores.modal.startTime"
                    errorPlacement="right"
                    timePlacement="right"
                    isPopover
                  />
                </div>
                <div className="container-time-picker">
                  <TooltipTimePickerControl
                    disabled={disabledTimePicker(index)}
                    labelText="masterStores.modal.endTime"
                    name={`businessDays[${index}].business_close`}
                    checkEmpty
                    keyError="masterStores.modal.endTime"
                    errorPlacement="right"
                    timePlacement="right"
                    isPopover
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </FormProvider>
  );
};

export default BusinessHoursTab;
