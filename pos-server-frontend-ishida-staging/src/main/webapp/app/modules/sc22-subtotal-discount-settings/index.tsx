import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, Resolver, useForm } from 'react-hook-form';
import { array, object, string, ValidationError } from 'yup';
import { getDaysInMonth } from 'date-fns';

// Components
import Header from '@/components/header/header';
import BottomButton from '@/components/bottom-button/bottom-button';
import CheckboxControl from '@/components/checkbox-button/checkbox-control';
import SidebarStore from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import TooltipNumberInputTextControl from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import TooltipDatePickerControl from '@/components/date-picker/tooltip-date-picker/tooltip-date-picker-control';

// Modules
import SubtotalDiscountStore from './exclude-stores';

// Utils
import { focusElementByName, isEqualObject, isNullOrEmpty, localizeFormat, localizeString } from '@/helpers/utils';

// Redux
import { useAppSelector } from '@/config/store';
import { yupResolver } from '@hookform/resolvers/yup';
import { IStoreInfo } from '@/reducers/store-reducer';

// Hooks
import { elementChangeKeyListener } from '@/hooks/keyboard-hook';

// Styles
import './styles.scss';

interface FormData {
  selectedStore: string;
  date: Date;
  percentDiscount: string;
  targetDates: string[];
  contentDays: boolean[];
  excludedStores: IStoreInfo[];
  defaultData: {
    percentDiscount: string;
    targetDates: string[];
    contentDays: boolean[];
    excludedStores: IStoreInfo[];
  };
}

const DEFAULT_VALUE: FormData = {
  selectedStore: '',
  date: new Date(),
  percentDiscount: '',
  targetDates: Array.from({ length: 16 }, () => null),
  contentDays: Array.from({ length: 7 }, () => false),
  excludedStores: [],
  defaultData: {
    percentDiscount: null,
    targetDates: null,
    contentDays: null,
    excludedStores: null,
  },
};

// const STORE_09999 = '09999';
const STORE_09999 = '00009';

const CONTENT_DAY_LIST = ['月', '火', '水', '木', '金', '土', '日'];

const isValidateDate = (day: number) => {
  return day >= 1 && day <= getDaysInMonth(new Date());
};

const SubtotalDiscountSettings = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [clearData, setClearData] = useState<boolean>(false);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];

  elementChangeKeyListener(selectedStores[0]);

  const validationSchema = object<FormData>().shape({
    targetDates: array()
      .of(
        string()
          .nullable()
          .test({
            name: 'valid-day',
            test(value, context) {
              if (!value) return true;
              if (!isValidateDate(Number(value))) {
                throw new ValidationError(localizeString('MSG_VAL_076'), value, context.path);
              }
              return true;
            },
          })
      )
      .test({
        name: 'unique-dates',
        test(value, context) {
          if (!value) return true;
          const list = new Map();
          const errors = [];
          value.forEach((item, index) => {
            if (isNullOrEmpty(item)) {
              return;
            }
            if (list.has(item)) {
              errors.push(new ValidationError(localizeString('MSG_VAL_077'), value, `${context.path}[${index}]`));
            }
            list.set(item, true);
          });
          if (errors.length) throw new ValidationError(errors);
          return true;
        },
      }),
  });
  const formConfig = useForm<FormData>({
    defaultValues: DEFAULT_VALUE,
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
  });

  const { getValues, setValue, setError, watch, reset } = formConfig;

  // Handle change store
  useEffect(() => {
    if (selectedStores[0] === STORE_09999) {
      setIsVisible(true);
      return;
    }
    setIsVisible(false);
  }, [selectedStores[0]]);

  const disabledClear = useMemo(() => {
    const currentData = getValues();

    const isSameExcludedStores = currentData.excludedStores?.every((item, index) =>
      isEqualObject(item, DEFAULT_VALUE.excludedStores?.[index])
    );

    const isSameOthersInput = isEqualObject(DEFAULT_VALUE, currentData, [
      'percentDiscount',
      'targetDates',
      'contentDays',
    ]);

    return isSameExcludedStores && isSameOthersInput;
  }, [watch()]);

  const disabledConfirm = useMemo(() => {
    if (disabledClear) {
      return true;
    }
    const currentData = getValues();
    const defaultData = getValues('defaultData');

    const isSameExcludedStores = currentData.excludedStores?.every((item, index) =>
      isEqualObject(item, defaultData.excludedStores?.[index])
    );

    const isSameOthersInput = isEqualObject(defaultData, currentData, [
      'percentDiscount',
      'targetDates',
      'contentDays',
    ]);

    return isSameExcludedStores && isSameOthersInput;
  }, [watch()]);

  // Focus first input
  const formRef = useRef<HTMLDivElement>(null);
  const focusInput = () => {
    setTimeout(() => {
      focusElementByName('percentDiscount');
    }, 500);
  };

  function handleSelectedStores(stores: IStoreInfo[]): void {
    setValue('excludedStores', stores);
  }

  // F11 Confirm
  const handleConfirmAction = async () => {
    const targetDates = getValues('targetDates');
    try {
      await validationSchema.validate({ targetDates }, { abortEarly: false });
      return true;
    } catch (e) {
      if (e instanceof ValidationError) {
        let fieldName = '';
        let message = '';
        if (e.inner.length > 0) {
          e.inner.map((item) => {
            fieldName = item?.path ?? '';
            message = item?.message;
            setError(`${fieldName}` as any, {
              message: localizeFormat(message),
            });
          });
        } else {
          fieldName = e.path;
          message = e.message;
          setError(`${fieldName}` as any, {
            message: localizeFormat(message),
          });
        }
        return;
      }
      return false;
    }
  };

  // F8 Clear data
  const handleClearData = () => {
    reset();
    setClearData(!clearData);
    setIsFirstRender(false);
    if (!isFirstRender) {
      // Call API get list subtotal discount credit
    }
  };

  const handleCollapseSidebar = (isExpanded, stores) => {
    if (isFirstRender && !isExpanded) {
      // Call API get list subtotal discount credit
      setIsFirstRender(false);
    }
    focusInput();
  };

  return (
    <FormProvider {...formConfig}>
      <div className={'subtotal-discount'}>
        <Header
          csv={{ disabled: true }}
          printer={{ disabled: true }}
          title={'title'}
          hasESC={true}
          confirmBack={!disabledConfirm}
        />
        <SidebarStore
          expanded={true}
          onChangeCollapseExpand={(isExpanded, isDirty, stores) => handleCollapseSidebar(isExpanded, stores)}
          clearData={handleClearData}
          hasData={!disabledConfirm}
          actionConfirm={handleClearData}
        />
        <div className="subtotal-discount-wapper">
          <div className={'subtotal-discount-left'}>
            <div className="subtotal-discount-left__item">
              <div className="label">
                <label className="label-input">{localizeString('date')}</label>
              </div>
              <div className="content">
                <TooltipDatePickerControl required name="date" inputClassName="content__date" disabled={true} />
              </div>
            </div>
            <div className="subtotal-discount-left__item">
              <div className="label">
                <label className="label-input">{localizeString('percentDiscount')}</label>
              </div>
              <div className="content" ref={formRef}>
                <TooltipNumberInputTextControl
                  name="percentDiscount"
                  className="input_right"
                  width={'150px'}
                  maxLength={2}
                  type="number"
                />
                <span className={'percent'}>％</span>
              </div>
            </div>
            <div className="subtotal-discount-left__item">
              <div className="label">
                <label className="label-input">{localizeString('targetDate')}</label>
              </div>
              <div className="content target_date">
                {Array.from({ length: 16 }, (_, i) => (
                  <TooltipNumberInputTextControl
                    key={i}
                    name={`targetDates[${i}]`}
                    width={'150px'}
                    maxLength={2}
                    addZero={true}
                    type="number"
                    // maxValue={31}
                    minValue={1}
                  />
                ))}
              </div>
            </div>
            <div className="subtotal-discount-left__item">
              <div className="label">
                <label className="label-input">{localizeString('contentDay')}</label>
              </div>
              <div className="content set_day">
                {CONTENT_DAY_LIST &&
                  CONTENT_DAY_LIST.map((item, index) => (
                    <div key={index} className="content__day">
                      <label>{item}</label>
                      <CheckboxControl name={`contentDays[${index}]`} disabled={false} />
                    </div>
                  ))}
              </div>
            </div>
          </div>
          <div className={'subtotal-discount-right'}>
            {isVisible && (
              <SubtotalDiscountStore
                onClickSearch={() => {}}
                selectMultiple={true}
                selectedExcludedStores={handleSelectedStores}
                clearData={clearData}
              />
            )}
          </div>
        </div>
        <BottomButton
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          confirmAction={handleConfirmAction}
          disableConfirm={disabledConfirm}
          // disableConfirm={true}
          clearAction={handleClearData}
          disabledClear={disabledClear}
        />
      </div>
    </FormProvider>
  );
};

export default SubtotalDiscountSettings;
