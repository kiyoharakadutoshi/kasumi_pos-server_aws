import './sc3101-list-cash-register-report.scss';
// Core
import React, { useEffect, useMemo } from 'react';
import { Translate } from 'react-jhipster';
import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { FormProvider, useForm } from 'react-hook-form';
// Interface
import {
  ICashRegisterReportState,
  ICashRegisterReportType,
  CashRegisterReportTypeEnum,
} from 'app/modules/sc31-report-quick-cashier/sc3102-detail-report/sc3102-detail-report-interface';

// Component
import { RadioButton } from 'app/components/radio-button-component/radio-button';
import TooltipDatePickerControl from 'app/components/date-picker/tooltip-date-picker/tooltip-date-picker-control';
import FuncKeyDirtyCheckButton from 'app/components/button/func-key-dirty-check/func-key-dirty-check-button';
import Header from 'app/components/header/header';
import TableData, { TableColumnDef } from 'app/components/table/table-data/table-data';
import SidebarStore from 'app/components/sidebar-store-default/sidebar-store/sidebar-store';
// API
import { getListCashRegisterReport, ICashRegisterReportParam } from 'app/services/cash-register-report-service';
import {
  clearQuickReport,
  IListCashRegisterReportState,
  setCashRegisterCode,
  setSearchState,
} from 'app/reducers/cash-register-report-reducer';
// Util
import {
  convertDateServer,
  convertShortDateServer,
  fullDateToSortDate,
  getDateFromDateWithMonth,
  getPreviousDate,
} from 'app/helpers/date-utils';
import {
  focusElementByName,
  formatValue,
  isNullOrEmpty,
  isValidDate,
  localizeFormat,
  localizeString,
} from 'app/helpers/utils';
import {
  getListCashRegisterReportDefault,
  ICashRegisterReportData,
  listRadioCashRegisterReport,
} from 'app/modules/sc31-report-quick-cashier/sc3101-list-cash-register-report/sc3101-list-cash-register-report-interface';
import { URL_MAPPING } from 'app/router/url-mapping';

/**
 * Sc3101ListCashRegisterReport: Component display list quick report, daily report
 * @constructor
 */
const Sc3101ListCashRegisterReport = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const selectedStores: string[] = useAppSelector((state) => state.storeReducer.selectedStores);
  const reducer: IListCashRegisterReportState = useAppSelector((state) => state.cashRegisterReportReducer);

  const noneStore = isNullOrEmpty(selectedStores);
  const formConfig = useForm({ defaultValues: getListCashRegisterReportDefault(reducer) });
  const { getValues, setValue, watch, setError, clearErrors } = formConfig;
  const type = watch('type');

  const maxDate = new Date();
  const minDate = getDateFromDateWithMonth(-3, maxDate);

  /**
   * useMemo disabledSearch
   */
  const disabledSearch = useMemo(() => {
    if (noneStore) return true;
    if (type.type !== CashRegisterReportTypeEnum.Daily) return false;
    const startDate = getValues('startDateReport');
    const endDate = getValues('endDateReport');
    return !isValidDate(startDate) || !isValidDate(endDate);
  }, [noneStore, watch('startDateReport'), watch('endDateReport')]);

  /**
   * useEffect: Focus first element
   */
  useEffect(() => {
    if (isNullOrEmpty(selectedStores)) return;
    setTimeout(() => {
      focusFirstElement();
    }, 100);
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
    if (businessType.type !== CashRegisterReportTypeEnum.Daily) return true;

    const startDateStr = getValues('startDateReport');
    const endDateStr = getValues('endDateReport');
    if (startDateStr > endDateStr) {
      setError('startDateReport', {
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
  const actionSearch = () => {
    if (!validateSearch()) return;

    clearErrors();
    // Get start_period, end_period
    let start_period: string;
    let end_period: string = null;
    if (type.type === CashRegisterReportTypeEnum.Daily) {
      start_period = fullDateToSortDate(getValues('startDateReport'));
      end_period = fullDateToSortDate(getValues('endDateReport'));
    } else {
      start_period = convertShortDateServer(new Date());
    }

    // Create param
    const param: Readonly<ICashRegisterReportParam> = {
      selected_store: selectedStores?.[0],
      business_type: type.type,
      start_period,
      end_period,
    };

    // API 3101
    dispatch(getListCashRegisterReport(param))
      .unwrap()
      .then((response) => {
        const items = response?.data?.data?.items;
        if (items?.length > 0) {
          setValue('reports', items);
          setValue('showNoData', false);
        } else {
          setValue('reports', []);
          setValue('showNoData', true);
        }
        saveSearchState(items);
      })
      .catch(() => {
        setValue('reports', []);
        setValue('showNoData', true);
      });
  };

  /**
   * saveSearchState: Save data to redux store, data saved used for back from Sc3102
   * @param items
   */
  const saveSearchState = (items: ICashRegisterReportData[]) => {
    const cash_registers = items?.map((item) => ({
      value: item.cash_register_code,
      name: isNullOrEmpty(item.cash_register_code)
        ? localizeString('detailCashRegisterReport.allStore')
        : item.cash_register_name,
      code: item.cash_register_code,
    }));

    const dataSearch: ICashRegisterReportState = {
      cash_register_code: null,
      selected_store: selectedStores?.[0],
      business_type: type.type,
      start_period: getValues('startDateReport'),
      end_period: getValues('endDateReport'),
      cash_registers,
    };
    dispatch(setSearchState(dataSearch));
  };

  /**
   * showDetail: Show SC3102 detail screen with navigation state
   * @param (row): Record when click button select on row of table
   */
  const showDetail = (row: ICashRegisterReportData) => {
    const state: Readonly<ICashRegisterReportState> = {
      ...reducer.searchState,
      cash_register_code: row.cash_register_code,
    };

    dispatch(setCashRegisterCode(row.cash_register_code));
    navigate(URL_MAPPING.DETAIL, { state });
  };

  /**
   * onChangeBusinessType: Set businessType and reset date
   * @param (item): ICashRegisterReportType
   */
  const onChangeBusinessType = (item: ICashRegisterReportType) => {
    setValue('type', item);
    clearErrors();
    if (item.type === CashRegisterReportTypeEnum.New) {
      const currentDate = convertDateServer(new Date());
      setValue('startDateReport', currentDate);
      setValue('endDateReport', currentDate);
    } else {
      const date = convertDateServer(getPreviousDate(maxDate));
      setValue('startDateReport', date);
      setValue('endDateReport', date);
    }
  };

  const searchReport = (
    <div className="list-cash-register-report__search-container">
      <div className="list-cash-register-report__type-container">
        <label className="list-cash-register-report__type-label">
          <Translate contentKey={'listCashRegisterReport.business'} />
          <label className="list-cash-register-report__required">*</label>
        </label>
        <div className="list-cash-register-report__list-type-item">
          {listRadioCashRegisterReport.map((item: ICashRegisterReportType, index) => (
            <RadioButton
              key={index}
              id={item.name}
              onChange={() => onChangeBusinessType(item)}
              textValue={localizeString(item.name)}
              checked={item.type === type.type}
              className={'cash-register-report__type-item'}
              disabled={noneStore}
            />
          ))}
        </div>
      </div>

      <div className="list-cash-register-report__date">
        <TooltipDatePickerControl
          required={true}
          name={'startDateReport'}
          labelText="listCashRegisterReport.startDateReport"
          disabled={type.type !== CashRegisterReportTypeEnum.Daily || noneStore}
          checkEmpty={true}
          keyError={'listCashRegisterReport.startDateReport'}
          maxDate={maxDate}
          minDate={minDate}
          errorPlacement={'left'}
        />
        ～
        <TooltipDatePickerControl
          required={true}
          name={'endDateReport'}
          labelText="listCashRegisterReport.endDateReport"
          disabled={type.type !== CashRegisterReportTypeEnum.Daily || noneStore}
          checkEmpty={true}
          keyError={'listCashRegisterReport.endDateReport'}
          maxDate={maxDate}
          minDate={minDate}
          errorPlacement={'right'}
        />
      </div>
      <FuncKeyDirtyCheckButton
        funcKey={'F12'}
        text="action.f12Search"
        onClickAction={actionSearch}
        disabled={disabledSearch}
        funcKeyListener={selectedStores}
      />
    </div>
  );

  const columns = React.useMemo<TableColumnDef<ICashRegisterReportData>[]>(
    () => [
      {
        accessorKey: 'cash_register_code',
        header: 'listCashRegisterReport.name',
        size: 34,
        type: 'text',
        textAlign: 'left',
        option(info) {
          const record = info?.row?.original;
          return { value: formatValue(record?.cash_register_code, record?.cash_register_name) };
        },
      },
      {
        accessorKey: 'sale_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'listCashRegisterReport.sale',
        size: 12,
        option(info) {
          return { value: info.row?.original?.sale_amount ?? 0 };
        },
      },
      {
        accessorKey: 'number_customers',
        type: 'text',
        textAlign: 'right',
        formatNumber: true,
        header: 'listCashRegisterReport.customer',
        size: 8,
        option(info) {
          return { value: info.row?.original?.number_customers ?? 0 };
        },
      },
      {
        accessorKey: 'number_products',
        type: 'text',
        textAlign: 'right',
        formatNumber: true,
        header: 'listCashRegisterReport.product',
        size: 8,
        option(info) {
          return { value: info.row?.original?.number_products ?? 0 };
        },
      },
      {
        accessorKey: 'exclude_tax_amount',
        type: 'text',
        textAlign: 'right',
        formatNumber: true,
        header: 'listCashRegisterReport.taxExclude',
        size: 8,
        option(info) {
          return { value: info.row?.original?.exclude_tax_amount ?? 0 };
        },
      },
      {
        accessorKey: 'include_tax_amount',
        type: 'text',
        textAlign: 'right',
        formatNumber: true,
        header: 'listCashRegisterReport.taxInclude',
        size: 8,
        option(info) {
          return { value: info.row?.original?.include_tax_amount ?? 0 };
        },
      },
      {
        accessorKey: 'average_product_amount',
        type: 'text',
        textAlign: 'right',
        formatNumber: true,
        numberFractionDigits: 1,
        fixedDigit: true,
        header: 'listCashRegisterReport.pricePerProduct',
        size: 8,
        option(info) {
          return { value: info.row?.original?.average_product_amount ?? 0 };
        },
      },
      {
        accessorKey: 'average_customer_amount',
        type: 'text',
        textAlign: 'right',
        formatNumber: true,
        numberFractionDigits: 1,
        fixedDigit: true,
        header: 'listCashRegisterReport.pricePerCustomer',
        size: 8,
        option(info) {
          return { value: info.row?.original?.average_customer_amount ?? 0 };
        },
      },
      {
        accessorKey: 'record_id',
        textAlign: 'center',
        type: 'button',
        header: '',
        buttonInput: { name: 'listCashRegisterReport.detail', onClick: showDetail },
        size: 6,
      },
    ],
    [selectedStores, reducer.searchState]
  );

  const clearData = () => {
    dispatch(clearQuickReport());
    formConfig.reset(getListCashRegisterReportDefault());

    setTimeout(() => {
      focusFirstElement(false);
    }, 350);
  };

  return (
    <div className="list-cash-register-report">
      <FormProvider {...formConfig}>
        <Header
          title={'listCashRegisterReport.title'}
          printer={{ disabled: true }}
          csv={{ disabled: true }}
          hasESC={true}
        />
        <SidebarStore
          onChangeCollapseExpand={focusFirstElement}
          expanded={true}
          hasData={watch('reports')?.length > 0}
          actionConfirm={clearData}
        />
        {searchReport}
        <TableData
          columns={columns}
          data={watch('reports')}
          enableSelectRow={false}
          rowConfig={(row) => {
            if (row.index === 0) return { className: 'row-total' };
          }}
          isExceedRecords={watch('isExceedRecords')}
        />
      </FormProvider>
    </div>
  );
};

export default Sc3101ListCashRegisterReport;
