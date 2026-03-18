import { UseFormReturn } from 'react-hook-form';
import { useEffect, useMemo, useRef } from 'react';
import { focusElementByName, isNullOrEmpty, isValidDate, localizeFormat, localizeString } from '@/helpers/utils';
import { IBatchReportState, IBatchReportSearchType, IBatchReport } from '@/modules/batch-report/batch-report-interface';
import { useAppDispatch } from '@/config/store';
import { convertDateServer, secondsBetween, toDateString } from '@/helpers/date-utils';
import { getBatchReports, IBatchReportSearch } from '@/services/batch-report-service';
import { APP_TIMESTAMP_FORMAT, SERVER_DATE_FORMAT_DASH } from '@/constants/date-constants';
import { batchReportState, recordType } from '@/modules/batch-report/batch-report-constants';
import { IPagingResponseList } from '@/services/base-service';
import { BatchReportSearchType } from '@/modules/batch-report/batch-report-types';

const useHook = (formConfig: UseFormReturn<IBatchReportState>, storeCode: string) => {
  const dispatch = useAppDispatch();
  const { getValues, setValue, watch, setError, clearErrors } = formConfig;
  const maxDate = new Date();
  const rowCountRef = useRef<number>(10);

  /**
   * useMemo disabledSearch
   */
  const disabledSearch = useMemo(() => {
    const { type, startDate, endDate } = getValues();

    if (isNullOrEmpty(storeCode)) return true;
    if (type !== BatchReportSearchType.Daily) return false;
    return !isValidDate(startDate) || !isValidDate(endDate);
  }, [storeCode, watch('startDate'), watch('endDate')]);

  /**
   * useEffect: Focus first element
   */
  useEffect(() => {
    if (isNullOrEmpty(storeCode)) return;
    setTimeout(() => {
      focusFirstElement();
    }, 100);
  }, []);

  /**
   * Calculate row count table
   */
  useEffect(() => {
    const rowCount = Math.floor((window.innerHeight - 292) / 44); // height row: 44px, view height without table: 296px - 4px offset
    rowCountRef.current = Math.max(rowCount, 10);
  }, []);

  /**
   * focusFirstElement: if sidebar store don't show, focus first element
   * @param expand
   */
  const focusFirstElement = (expand?: boolean) => {
    if (expand) return;
    focusElementByName('detailCashRegisterReport.new');
  };

  /**
   * validateSearch: validate date search if business type = daily
   */
  const validateSearch = (): boolean => {
    const businessType = getValues('type');
    if (businessType !== BatchReportSearchType.Daily) return true;

    const startDateStr = getValues('startDate');
    const endDateStr = getValues('endDate');
    if (startDateStr > endDateStr) {
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
   * actionSearch: handle get list quick report
   */
  const actionSearch = (type?: 'first' | 'next' | 'prev' | 'last') => {
    if (!validateSearch()) return;

    clearErrors();

    const { endDate, startDate, type: searchType } = getValues();

    // Create param
    const today = toDateString(new Date(), SERVER_DATE_FORMAT_DASH);
    const formatDate = (d?: string) => d?.replace(/\//g, '-');
    const useToday = searchType === BatchReportSearchType.New;

    const param: IBatchReportSearch = {
      page: getPage(type),
      start_date: useToday ? today : formatDate(startDate),
      end_date: useToday ? today : formatDate(endDate),
      size: rowCountRef.current,
      store_code: storeCode,
    };

    // API get list records
    dispatch(getBatchReports(param))
      .unwrap()
      .then((res) => handleResponseSearch(res.data.data, param.page))
      .catch(() => {
        setValue('hasNoData', true);
        setValue('currentPage', batchReportState.currentPage);
        setValue('records', batchReportState.records);
        setValue('totalItem', batchReportState.totalItem);
        setValue('totalPage', batchReportState.totalPage);
      });
  };

  /**
   * Get page need search
   * @param type paging action
   */
  const getPage = (type?: 'first' | 'next' | 'prev' | 'last') => {
    const { currentPage, totalPage } = getValues();

    switch (type) {
      case 'next':
        return currentPage + 1;
      case 'prev':
        return currentPage - 1;
      case 'last':
        return totalPage;
      default:
        return 1;
    }
  };

  /**
   * handle response search from API 3401
   * @param data IPagingResponseList<IBatchReport>
   * @param page number
   */
  const handleResponseSearch = (data: IPagingResponseList<IBatchReport>, page: number) => {
    setValue('currentPage', page);
    setValue('totalPage', data.total_page);
    setValue('totalItem', data.total_record);
    setValue('hasNoData', isNullOrEmpty(data.items));

    const records: IBatchReport[] = data.items.map((item) => {
      const startDateTime = new Date(item.start_date_time);
      const endDateTime = new Date(item.end_date_time);
      const duration = Math.max(secondsBetween(startDateTime, endDateTime), 0.1);

      return {
        ...item,
        start_date_time: toDateString(startDateTime, APP_TIMESTAMP_FORMAT),
        end_date_time: toDateString(endDateTime, APP_TIMESTAMP_FORMAT),
        type: localizeString(recordType[item.type]),
        duration,
        speed: item.total_record / duration,
      };
    });

    setValue('records', records);
  };

  /**
   * onChangeType: Set type and reset date
   * @param (item): IBatchReportSearchType
   */
  const onChangeType = (item: IBatchReportSearchType) => {
    setValue('type', item.type);
    clearErrors();
    const currentDate = convertDateServer(new Date());
    setValue('startDate', currentDate);
    setValue('endDate', currentDate);
  };

  const clearData = () => {
    formConfig.reset();

    setTimeout(() => {
      focusFirstElement(false);
    }, 350);
  };

  return { maxDate, disabledSearch, clearData, actionSearch, focusFirstElement, onChangeType };
};

export default useHook;
