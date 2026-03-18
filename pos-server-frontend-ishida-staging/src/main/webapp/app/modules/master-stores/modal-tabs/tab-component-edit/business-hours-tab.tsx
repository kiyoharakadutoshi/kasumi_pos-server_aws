import React, { useEffect } from 'react';
import { array, object, string } from 'yup';
import { translate } from 'react-jhipster';
import { useAppSelector } from '@/config/store';
import { FormProvider, Resolver, useFieldArray, useForm } from 'react-hook-form';

// Components
import {
  BusinessDay,
  FormDataBusinessHours,
  IMasterStoreRecord,
  MasterStoreState,
} from '../../master-stores-interface';
import RadioControl from '@/components/control-form/radio-control';
import TooltipTimePickerControl from '@/components/time-picker/tooltip-time-picker/tooltip-time-picker-control';

// Utils
import { localizeString } from '@/helpers/utils';
import { yupResolver } from '@hookform/resolvers/yup';
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
  { day: 'mon', business_day: 1, business_open: '09:00', business_close: '23:59' },
  { day: 'tue', business_day: 1, business_open: '09:00', business_close: '23:00' },
  { day: 'wed', business_day: 1, business_open: '09:00', business_close: '23:59' },
  { day: 'thu', business_day: 1, business_open: '09:00', business_close: '23:00' },
  { day: 'fri', business_day: 1, business_open: '09:00', business_close: '23:00' },
  { day: 'sat', business_day: 1, business_open: '09:00', business_close: '23:00' },
  { day: 'sun', business_day: 1, business_open: '09:00', business_close: '23:00' },
];

/**
 * BusinessHoursTab component for managing business hours in the master store modal.
 */
const BusinessHoursTab = ({ registerForm, keyEvent }) => {
  const masterStoresReducer: MasterStoreState = useAppSelector((state) => state.masterStoresReducer);

  const dataSelected: IMasterStoreRecord = masterStoresReducer.masterStoreSelected?.row || [];

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

  const formConfig = useForm<FormDataBusinessHours>({
    defaultValues: {
      businessDays: defaultBusinessDays,
    },
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormDataBusinessHours>,
  });

  const { watch, getValues, setValue, control, clearErrors, trigger } = formConfig;
  const { fields: listBusinessDay } = useFieldArray({
    control,
    name: 'businessDays',
  });

  useEffect(() => {
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const initialBusinessHours = days.map((item) => {
      return {
        day: item,
        business_day: dataSelected[`business_day_${item}`]?.business_day,
        business_open: dataSelected[`business_day_${item}`]?.business_open,
        business_close: dataSelected[`business_day_${item}`]?.business_close,
      };
    });
    setValue('businessDays', initialBusinessHours);
    // Value initial
    setValue('businessDaysDefault', initialBusinessHours);
  }, [dataSelected]);

  // Re-render UI
  useEffect(() => {}, [watch('businessDays')]);

  // Register react hook form
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
    const defaultValue = getValues('businessDaysDefault');
    if (disabledTimePicker(index)) {
      setValue(`businessDays[${index}].business_open` as any, defaultValue[index]?.business_open);
      setValue(`businessDays[${index}].business_close` as any, defaultValue[index]?.business_close);
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
