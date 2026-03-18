import React, { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Translate } from 'react-jhipster';
import { toString } from 'lodash';

import Header from '@/components/header/header';
import { RadioButton } from '@/components/radio-button-component/radio-button';
import SidebarStore from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import FuncKeyDirtyCheckButton from '@/components/button/func-key-dirty-check/func-key-dirty-check-button';
import TooltipDatePickerControl from '@/components/date-picker/tooltip-date-picker/tooltip-date-picker-control';

import { useAppDispatch, useAppSelector } from '@/config/store';
import { isNullOrEmpty, isValidDate, localizeFormat, localizeString } from '@/helpers/utils';
import { convertDateServer } from '@/helpers/date-utils';

import TimeCashRegisterTable from './cash-register-table/time-cash-register-table';
import './check-time-cash-register.scss';

import worker_script from '@/modules/check-time-cash-register/cashWoker';
import CashPagination from '@/modules/check-time-cash-register/cash-pagination';
import {
  getTimePeriod,
  getTimePeriodExportCSV,
  getTimePeriodExportPDF,
} from '@/services/check-time-cash-register-service';

import {
  IRadioButtonBusinessType,
  TYPE_OPTION_LIST,
  BusinessTypeEnum,
} from '@/modules/check-time-cash-register/inteface-time-cash-register';
import { fullDateToSortDate, getDateFromDateWithMonth, getPreviousDate } from 'app/helpers/date-utils';
import { ListCashRegister } from 'app/services/check-time-cash-register-service';
import { saveAs } from 'file-saver';

let worker: Worker;

const INIT_CASH_TIMER = {
  type: TYPE_OPTION_LIST[0],
  data: [],
  startDate: convertDateServer(new Date()),
  endDate: convertDateServer(new Date()),
};

const CheckTimeCashRegister = () => {
  const dispatch = useAppDispatch();
  const locale = useAppSelector((state) => state.locale.currentLocale);
  const selectedStore = useAppSelector((state) => state.storeReducer.selectedStores)?.[0];

  const storeEmpty = isNullOrEmpty(selectedStore);
  const [isShowTable, setIsShowTable] = useState<boolean>(false);
  const [isShowNoRecord, setIsShowNoRecord] = useState<boolean>(false);
  const [message, setMessage] = useState('');
  const formConfig = useForm({ defaultValues: INIT_CASH_TIMER });
  const { getValues, setValue, watch, reset, setError } = formConfig;
  const type = watch('type');
  const disabledSearch = useMemo(() => {
    return (
      storeEmpty ||
      (type.type === BusinessTypeEnum.DailyNew &&
        (!isValidDate(getValues('startDate')) || !isValidDate(getValues('endDate'))))
    );
  }, [type, watch('startDate'), watch('endDate')]);

  const [totalPage, setTotalPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState<number | null>(null);
  const [dataFormated, setDataFormated] = useState([]);

  const maxDate = new Date();
  const minDate = getDateFromDateWithMonth(-3, maxDate);

  // Function to focus on the first element
  const focusFirstElement = (expand?: boolean) => {
    if (expand) return;
    const element: HTMLInputElement = document.querySelector('[name="checkTimeCashRegister.radio.breakingNew"]');
    element?.focus();
  };

  /**
   * Change business type to reset period date
   * @param (item) business type
   */
  const handleOnChangeBusinessType = (item: { name: string; type: 1 | 0 }) => {
    setValue('type', item);
    formConfig.clearErrors();

    if (item.type === 1) {
      const prevDate = getPreviousDate();
      setValue('startDate', convertDateServer(prevDate));
      setValue('endDate', convertDateServer(prevDate));
    } else {
      setValue('startDate', convertDateServer(new Date()));
      setValue('endDate', convertDateServer(new Date()));
    }
  };

  /**
   * Function to validate the period date
   * @param startDate
   * @param endDate
   */
  const handleValidatePeriod = (startDate: string, endDate: string) => {
    if (type.type === BusinessTypeEnum.BreakingNew) return true;

    if (startDate > endDate) {
      setError('startDate', {
        message: localizeFormat(
          'MSG_VAL_004',
          'listCashRegisterReport.startDateReport',
          'listCashRegisterReport.endDateReport'
        ),
      });
      return false;
    }
    return true;
  };

  /**
   * Function to handle the search for cash list
   */
  const handleSearchCashList = () => {
    const startDate = getValues('startDate');
    const endDate = getValues('endDate');

    formConfig.clearErrors();
    if (!handleValidatePeriod(startDate, endDate)) return;

    const payload = {
      selected_store: selectedStore,
      business_type: toString(getValues('type').type),
      start_period: fullDateToSortDate(startDate),
      end_period: fullDateToSortDate(endDate),
    };

    // API2901 get list data
    dispatch(getTimePeriod(payload))
      .unwrap()
      .then((response) => {
        const records: ListCashRegister[] = response.data.data?.items;
        setTotalRecord(records?.length);
        if (isNullOrEmpty(records)) {
          setMessage(localizeString('MSG_ERR_001'));
          setIsShowNoRecord(true);
          setIsShowTable(false);
          setCurrentPage(0);
          setTotalPage(0);
          setDataFormated([]);
          return;
        }
        handleCallWorker(records);
      })
      .catch(() => {});
  };

  // Initialize the web worker
  if (window.Worker) worker = new Worker(worker_script);

  // Function to handle the web worker
  const handleCallWorker = (records: ListCashRegister[]) => {
    // Handle paging with another thread
    worker.onmessage = (event) => {
      if (event.data.error) {
        console.error(event.data.error);
      } else {
        // Received data then set it to useState
        if (event.data.calcTotalPage > 0) {
          setCurrentPage(1);
          setTotalPage(event.data.calcTotalPage);
          setDataFormated(event.data.formatArr);
          setIsShowNoRecord(false);
          setIsShowTable(true);
        }
      }
      worker.terminate();
    };

    // worker.postMessage(dummyData.cash_register);
    if (records.length > 0) {
      worker.postMessage(records);
    }

    return () => {
      worker.terminate();
    };
  };

  // Function to handle export
  const handleExport = (exportType: 'PDF' | 'CSV') => {
    const startDate = getValues('startDate');
    const endDate = getValues('endDate');

    formConfig.clearErrors();
    if (!handleValidatePeriod(startDate, endDate)) return;

    const timePeriodParams = {
      selected_store: selectedStore,
      business_type: toString(getValues('type').type),
      start_period: fullDateToSortDate(startDate),
      end_period: fullDateToSortDate(endDate),
      lang: locale,
    };

    let fileName =
      `${localizeString('checkTimeCashRegister.title')}_${selectedStore}_` +
      `${timePeriodParams.start_period.replace(/\//g, '')}_${timePeriodParams.end_period.replace(/\//g, '')}`;
    if (exportType === 'PDF') {
      dispatch(getTimePeriodExportPDF(timePeriodParams))
        .unwrap()
        .then((response) => {
          fileName += '.pdf';
          saveAs(response.blob, fileName);
        })
        .catch(() => {});
    } else if (exportType === 'CSV') {
      dispatch(getTimePeriodExportCSV(timePeriodParams))
        .unwrap()
        .then((response) => {
          fileName += '.csv';
          saveAs(response.blob, fileName);
        })
        .catch(() => {});
    }
  };

  const handleExportPDF = () => handleExport('PDF');
  const handleExportCSV = () => handleExport('CSV');

  /**
   * Function clear data when click button Confirm
   */
  const clearData = () => {
    setCurrentPage(0);
    setTotalPage(0);
    setDataFormated([]);
    setIsShowNoRecord(false);
    setMessage('');
    setIsShowTable(false);
    setTotalRecord(null);
    reset();
    setTimeout(() => {
      focusFirstElement(false);
    }, 350);
  };

  return (
    <div className="cash-register-main">
      <FormProvider {...formConfig}>
        <SidebarStore
          onChangeCollapseExpand={focusFirstElement}
          actionConfirm={clearData}
          expanded={true}
          hasData={isShowTable}
        />
        <Header
          title="checkTimeCashRegister.title"
          hasESC={true}
          printer={{
            action: handleExportPDF,
            disabled: disabledSearch,
          }}
          exportCSVByApi={true}
          handleExportSCVByApi={handleExportCSV}
          csv={{ disabled: disabledSearch }}
        />
        <div className="cash-register-main__search">
          <div className="cash-register-main__search-radio">
            <label className="cash-register-main__type-label">
              <Translate contentKey={'checkTimeCashRegister.businessType'} />
              <label className="cash-register-main__required">*</label>
            </label>
            <div className="cash-register-main__list-type-item">
              {TYPE_OPTION_LIST.map((item: IRadioButtonBusinessType, index) => (
                <RadioButton
                  key={index}
                  id={item.name}
                  onChange={() => handleOnChangeBusinessType(item)}
                  textValue={localizeString(item.name)}
                  checked={item.type === type.type}
                  className={'cash-register-main__type-item'}
                  disabled={storeEmpty}
                />
              ))}
            </div>
          </div>

          <div className="date-container">
            <TooltipDatePickerControl
              required={true}
              name={'startDate'}
              labelText="checkTimeCashRegister.businessDay"
              disabled={type.type !== BusinessTypeEnum.DailyNew || storeEmpty}
              checkEmpty={true}
              keyError={'checkTimeCashRegister.MSG_VAL_004_dateFrom'}
              minDate={minDate}
              maxDate={maxDate}
              errorPlacement="right"
            />
            <span className="date-tilde">～</span>
            <TooltipDatePickerControl
              required={true}
              name={'endDate'}
              disabled={type.type !== BusinessTypeEnum.DailyNew || storeEmpty}
              checkEmpty={true}
              keyError={'checkTimeCashRegister.MSG_VAL_004_dateTo'}
              minDate={minDate}
              maxDate={maxDate}
              errorPlacement="right"
            />
          </div>

          <FuncKeyDirtyCheckButton
            funcKey={'F12'}
            text="action.f12Search"
            onClickAction={handleSearchCashList}
            disabled={disabledSearch}
            funcKeyListener={selectedStore}
          />
        </div>

        {isShowTable && <TimeCashRegisterTable data={dataFormated} currentPage={currentPage} totalPage={totalPage} />}
        {isShowNoRecord && <div className="no-record">{message}</div>}

        <CashPagination
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          totalPage={totalPage}
          totalRecord={totalRecord}
          isShowTable={isShowTable}
        />
      </FormProvider>
    </div>
  );
};

export default CheckTimeCashRegister;
