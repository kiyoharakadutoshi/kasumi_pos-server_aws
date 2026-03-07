import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, Resolver, useForm } from 'react-hook-form';

// Components
import Header from '@/components/header/header';
import BottomButton from '@/components/bottom-button/bottom-button';
import CheckboxControl from '@/components/checkbox-button/checkbox-control';
import TooltipInputTextControl from '@/components/input-text/input-text-control';
import SidebarStore from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import TooltipTimePickerControl from '@/components/time-picker/tooltip-time-picker/tooltip-time-picker-control';
import TooltipNumberInputTextControl from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';

// Modules
import { contentDayList } from '@/modules/sc3801-morning-discount-settings/default-data';
import MorningDiscountStore from '@/modules/sc3801-morning-discount-settings/exclude-stores';

// Utils
import { delay, focusElementByName, isEqualObject, localizeFormat, localizeString } from '@/helpers/utils';

// Redux
import { useAppSelector } from '@/config/store';
import { yupResolver } from '@hookform/resolvers/yup';
import { IStoreInfo } from '@/reducers/store-reducer';

// Hooks
import { elementChangeKeyListener } from '@/hooks/keyboard-hook';

// Styles
import './styles.scss';

enum Status {
  InProgress = '実施中',
  Completed = '終了中',
  NA = '',
}
interface FormData {
  selectedStore: string;
  percentDiscount: string;
  status: Status;
  targetDates: string[];
  contentDays: boolean[];
  startTime: string;
  endTime: string;
  excludedGroups: {
    groupCode: string;
    groupCodeName: string;
  }[];
  excludedStores: IStoreInfo[];
  defaultData: {
    percentDiscount: string;
    status: Status;
    targetDates: string[];
    contentDays: boolean[];
    excludedGroups: {
      groupCode: string;
      groupCodeName: string;
    }[];
    startTime: string;
    endTime: string;
    excludedStores: IStoreInfo[];
  };
}

const DEFAULT_VALUE: FormData = {
  selectedStore: '',
  percentDiscount: '',
  status: Status.NA,
  targetDates: Array.from({ length: 16 }, () => null),
  contentDays: Array.from({ length: 7 }, () => false),
  startTime: '',
  endTime: '',
  excludedGroups: Array.from({ length: 8 }, () => ({
    groupCode: null,
    groupCodeName: null,
  })),
  excludedStores: [],
  defaultData: {
    percentDiscount: null,
    status: null,
    targetDates: null,
    contentDays: null,
    startTime: '',
    endTime: '',
    excludedGroups: null,
    excludedStores: null,
  },
};

const parseTimeToMinutes = (time: string = ''): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// const STORE_09999 = '09999';
const STORE_09999 = '00009';

const MorningDiscountSettings = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [clearData, setClearData] = useState<boolean>(false);
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];

  elementChangeKeyListener(selectedStores[0]);
  const formConfig = useForm<FormData>({
    defaultValues: DEFAULT_VALUE,
    resolver: yupResolver(null) as unknown as Resolver<FormData>,
  });

  const { getValues, setValue, setError, watch, reset } = formConfig;

  // Handle change store
  useEffect(() => {
    reset();

    if (selectedStores[0] === STORE_09999) {
      setIsVisible(true);
      return;
    }
    setIsVisible(false);
  }, [selectedStores[0]]);

  const disabledClear = useMemo(() => {
    const currentData = getValues();
    const isSameExcludedGroups = currentData.excludedGroups?.every((item, index) =>
      isEqualObject(item, DEFAULT_VALUE.excludedGroups?.[index])
    );

    const isSameExcludedStores = currentData.excludedStores?.every((item, index) =>
      isEqualObject(item, DEFAULT_VALUE.excludedStores?.[index])
    );

    const isSameOthersInput = isEqualObject(DEFAULT_VALUE, currentData, [
      'percentDiscount',
      'status',
      'targetDates',
      'contentDays',
      'startTime',
      'endTime',
    ]);

    return isSameExcludedGroups && isSameExcludedStores && isSameOthersInput;
  }, [watch()]);

  const disabledConfirm = useMemo(() => {
    if (disabledClear) {
      return true;
    }
    const currentData = getValues();
    const defaultData = getValues('defaultData');
    const isSameExcludedGroups = currentData.excludedGroups?.every((item, index) =>
      isEqualObject(item, defaultData.excludedGroups?.[index])
    );

    const isSameExcludedStores = currentData.excludedStores?.every((item, index) =>
      isEqualObject(item, defaultData.excludedStores?.[index])
    );

    const isSameOthersInput = isEqualObject(defaultData, currentData, [
      'percentDiscount',
      'status',
      'targetDates',
      'contentDays',
      'startTime',
      'endTime',
    ]);

    return isSameExcludedGroups && isSameExcludedStores && isSameOthersInput;
  }, [watch()]);

  // Focus first input
  const formRef = useRef<HTMLDivElement>(null);
  const focusInput = () => {
    setTimeout(() => {
      focusElementByName('percentDiscount');
    }, 500);
  };

  function handleSelectetStores(stores: IStoreInfo[]): void {
    setValue('excludedStores', stores);
  }

  // F11 Confirm
  const handleConfirmAction = () => { };

  // F8 Clear data
  const handleClearData = () => {
    reset(); // Todo
    setClearData(!clearData);
  };

  const validateTime = async (time: string, nameTime: string) => {
    const startTime = watch('startTime');
    const endTime = watch('endTime');
    if (parseTimeToMinutes(time) > 11 * 60 - 1) {
      await delay(50);
      setError(nameTime as keyof FormData, {
        message: localizeFormat('MSG_VAL_016', 'discountTimes.startTime'),
      });
      return;
    }

    await delay(50);
    setError('startTime', {
      message: parseTimeToMinutes(startTime) > parseTimeToMinutes(endTime) ? localizeString('MSG_VAL_051') : null,
    });
  };

  return (
    <FormProvider {...formConfig}>
      <div className={'morning-discount'}>
        <Header
          csv={{ disabled: true }}
          printer={{ disabled: true }}
          title={'title'}
          hasESC={true}
          confirmBack={!disabledConfirm}
          mode="edit"
        />
        <SidebarStore
          expanded={true}
          onChangeCollapseExpand={focusInput}
          // clearData={handleClearData}
          hasData={!disabledConfirm}
        />
        <div className="morning-discount-wapper">
          <div className={'morning-discount-left'}>
            <div className="morning-discount-left__item">
              <div className="label">
                <label className="label-input">{localizeString('percentDiscount')}</label>
              </div>
              <div className="content" ref={formRef}>
                <TooltipNumberInputTextControl
                  name="percentDiscount"
                  className="input_right"
                  width={'135px'}
                  maxLength={2}
                  type="number"
                />
                <span className={'percent'}>％</span>
              </div>
            </div>
            <div className="morning-discount-left__item">
              <div className="label">
                <label className="label-input">{localizeString('status')}</label>
              </div>
              <div className="content">
                <TooltipInputTextControl name="status" width={'135px'} disabled={true} />
              </div>
            </div>
            <div className="morning-discount-left__item">
              <div className="label">
                <label className="label-input">{localizeString('targetDate')}</label>
              </div>
              <div className="content target_date">
                {Array.from({ length: 16 }, (_, i) => (
                  <TooltipNumberInputTextControl
                    key={i}
                    name={`targetDates[${i}]`}
                    width={'135px'}
                    maxLength={2}
                    addZero={true}
                    type="number"
                    maxValue={31}
                    minValue={1}
                  />
                ))}
              </div>
            </div>
            <div className="morning-discount-left__item">
              <div className="label">
                <label className="label-input">{localizeString('contentDay')}</label>
              </div>
              <div className="content set_day">
                {contentDayList &&
                  contentDayList.map((item, index) => (
                    <div key={index} className="content__day">
                      <label>{item}</label>
                      <CheckboxControl name={`contentDays[${index}]`} disabled={false} />
                    </div>
                  ))}
              </div>
            </div>
            <div className="morning-discount-left__item morning-discount-left__discount-time">
              <div className="label">
                <label className="label-input">{localizeString('discountTimes')}</label>
              </div>
              <div className="content">
                <div className="content__discount-time">
                  <TooltipTimePickerControl name="startTime" keyError="discountTimes.startTime" checkEmpty onChange={(_, timeStr) => {
                    validateTime(timeStr, 'startTime');
                  }} />
                </div>
                <span className="discount-time-separation"> ～ </span>
                <div className="content__discount-time">
                  <TooltipTimePickerControl name="endTime" keyError="discountTimes.endTime" checkEmpty onChange={(_, timeStr) => {
                    validateTime(timeStr, 'endTime');
                  }} />
                </div>
              </div>
            </div>
            <div className="morning-discount-left__item morning-discount-left__exclusion">
              <div className="label">
                <label className="label-input">{localizeString('excludedGroups')}</label>
              </div>
              <div className="content">
                {Array.from({ length: 8 }, (_, index) => (
                  <div className="content__exclusion" key={index}>
                    <TooltipNumberInputTextControl
                      name={`excludedGroups[${index}].groupCode`}
                      width="130px"
                      maxLength={2}
                      type="number"
                      addZero={true}
                    />
                    <TooltipInputTextControl
                      name={`excludedGroups[${index}].groupCodeName`}
                      disabled={true}
                      width="980px"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={'morning-discount-right'}>
            {isVisible && (
              <MorningDiscountStore
                onClickSearch={() => { }}
                selectMultiple={true}
                selectedExcludedStores={handleSelectetStores}
                clearData={clearData}
              />
            )}
          </div>
        </div>
        <BottomButton
          confirmAction={handleConfirmAction}
          // disableConfirm={disabledConfirm}
          disableConfirm={true}
          clearAction={handleClearData}
          disabledClear={disabledClear}
          deleteAction={() => { }}
          disableDelete={watch('status') === Status.InProgress ? false : true}
        />
      </div>
    </FormProvider>
  );
};

export default MorningDiscountSettings;
