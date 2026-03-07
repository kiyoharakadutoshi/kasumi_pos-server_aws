import './sc3102-detail-report.scss';
// Core
import React, { useEffect } from 'react';
import { useLocation } from 'react-router';
import { Translate } from 'react-jhipster';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import Header from 'app/components/header/header';
import { useAppDispatch, useAppSelector } from 'app/config/store';
// Redux
import { selectStore } from 'app/reducers/store-reducer';
// Component
import TooltipDatePickerControl from 'app/components/date-picker/tooltip-date-picker/tooltip-date-picker-control';
import { RadioButton } from 'app/components/radio-button-component/radio-button';
import {
  ICashRegisterReportItem,
  ICashRegisterReportState,
  ICashRegisterReportTableProps,
  ICashRegisterReportType,
  CashRegisterReportInfo,
  cashRegisterReportTabs,
  CashRegisterReportTypeEnum,
  CashRegisterReportTypeInfo,
  cashRegisterReportTypes,
  createDetailCashRegisterReportFormData,
} from 'app/modules/sc31-report-quick-cashier/sc3102-detail-report/sc3102-detail-report-interface';
import FuncKeyDirtyCheckButton from 'app/components/button/func-key-dirty-check/func-key-dirty-check-button';
import SelectControl from 'app/components/control-form/select-control';
import TableData, { TableColumnDef } from 'app/components/table/table-data/table-data';
// API
import {
  exportCashRegisterReport,
  getDetailCashRegisterReport,
  IDetailCashRegisterReportParam,
  ICashRegisterReportPDFParam,
} from 'app/services/cash-register-report-service';
// Utils
import { KEYDOWN } from 'app/constants/constants';
import {
  convertDateServer,
  convertShortDateServer,
  dropDownMonth,
  fullDateToSortDate,
  getDateFromDateWithMonth,
  getPreviousDate,
} from 'app/helpers/date-utils';
import { isNullOrEmpty, isValidDate, localizeFormat, localizeString } from 'app/helpers/utils';
import { saveAs } from 'file-saver';

const Sc3102DetailReport = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const state: ICashRegisterReportState = location.state;
  const formConfig = useForm({ defaultValues: createDetailCashRegisterReportFormData(state) });
  const { setValue, setError, watch, getValues, clearErrors, resetField } = formConfig;

  const lang = useAppSelector((stateStore) => stateStore.locale.currentLocale);

  const type = watch('type');
  const tab: CashRegisterReportInfo = watch('tab');
  const indexTab = cashRegisterReportTabs.findIndex((item) => item.type === tab.type);

  const maxDate = new Date();
  const minDate = getDateFromDateWithMonth(-3, maxDate);

  const disabledSearch =
    type.type === CashRegisterReportTypeEnum.Daily &&
    (!isValidDate(watch('startDateReport')) || !isValidDate(watch('endDateReport')));

  /**
   * useEffect: Save store if refreshed, focus radio, get detail report
   */
  useEffect(() => {
    if (state?.selected_store) {
      dispatch(selectStore(state?.selected_store));
    }

    focusFirstElement();
    getDetailReport();
  }, []);

  /**
   * Focus radio business type quick report
   * @param (expand) is expand sidebar store
   */
  const focusFirstElement = (expand?: boolean) => {
    if (expand) return;
    const element: HTMLInputElement = document.querySelector('[name="detailCashRegisterReport.new"]');
    element?.focus();
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

  const createParamSearch = () => {
    // Get start_period, end_period
    let start_period: string;
    let end_period: string = null;
    switch (type.type) {
      case CashRegisterReportTypeEnum.Daily:
        start_period = fullDateToSortDate(getValues('startDateReport'));
        end_period = fullDateToSortDate(getValues('endDateReport'));
        break;
      case CashRegisterReportTypeEnum.New:
        start_period = convertShortDateServer(new Date());
        break;
      case CashRegisterReportTypeEnum.Monthly:
        start_period = getValues('month');
        break;
      default:
        break;
    }

    // Create param
    const param: Readonly<IDetailCashRegisterReportParam> = {
      cash_register_code: getValues('cash_register_code'),
      selected_store: state?.selected_store,
      business_type: type.type,
      start_period,
      end_period,
    };

    return param;
  };

  /**
   * getDetailReport: API 3102 get list quick report
   */
  const getDetailReport = () => {
    if (!validateSearch()) return;

    clearErrors();
    const param = createParamSearch();

    // API 3101
    dispatch(getDetailCashRegisterReport(param))
      .unwrap()
      .then((response) => {
        setValue('tab', cashRegisterReportTabs[0]);
        setValue('reportTable', response.data?.data);
      })
      .catch(() => {});
  };

  /**
   * onChangeBusinessType: Set businessType and reset date
   * @param (item): ICashRegisterReportType
   */
  const onChangeBusinessType = (item: ICashRegisterReportType) => {
    setValue('type', item);
    clearErrors();
    switch (item.type) {
      case CashRegisterReportTypeEnum.New: {
        const currentDate = convertDateServer(new Date());
        setValue('startDateReport', currentDate);
        setValue('endDateReport', currentDate);
        break;
      }
      case CashRegisterReportTypeEnum.Daily: {
        const date = convertDateServer(getPreviousDate(maxDate));
        setValue('startDateReport', date);
        setValue('endDateReport', date);
        break;
      }
      case CashRegisterReportTypeEnum.Monthly:
        resetField('month');
        break;
      default:
        break;
    }
  };

  /**
   * printPDF: handle API 3103 to print PDF
   */
  const printPDF = () => {
    if (!validateSearch()) return;

    const cash_register_code = getValues('cash_register_code');
    const cash_register =
      state?.cash_registers?.find((item) => item.value === cash_register_code) ?? state?.cash_registers?.[0];
    const cash_register_name = isNullOrEmpty(cash_register?.value)
      ? localizeString('detailCashRegisterReport.allStore')
      : cash_register?.name;
    const param: ICashRegisterReportPDFParam = { ...createParamSearch(), cash_register_name, lang };

    dispatch(exportCashRegisterReport(param))
      .unwrap()
      .then((response) => {
        const cash_register_codePDF = isNullOrEmpty(cash_register_code)
          ? localizeString('detailCashRegisterReport.allStore')
          : cash_register_code;
        const fileName = `PR3101_${localizeString('listCashRegisterReport.title')}_${cash_register_codePDF}.pdf`;
        saveAs(response.blob, fileName);
      })
      .catch(() => {});
  };

  const searchReport = (
    <div className="detail-cash-register-report__search-container">
      <div className="detail-cash-register-report__type-container">
        <label className="detail-cash-register-report__type-label">
          <Translate contentKey={'detailCashRegisterReport.type'} />
          <label className="detail-cash-register-report__required">*</label>
        </label>
        <div className="detail-cash-register-report__list-type-item">
          {cashRegisterReportTypes.map((item: ICashRegisterReportType, index) => (
            <RadioButton
              key={index}
              id={item.name}
              onChange={() => onChangeBusinessType(item)}
              textValue={localizeString(item.name)}
              checked={item.type === type.type}
              className={'detail-cash-register-report__type-item'}
            />
          ))}
        </div>
      </div>

      {type.type !== CashRegisterReportTypeEnum.Monthly ? (
        <div className="list-cash-register-report__date">
          <TooltipDatePickerControl
            required={true}
            name={'startDateReport'}
            labelText="listCashRegisterReport.startDateReport"
            disabled={type.type !== CashRegisterReportTypeEnum.Daily}
            checkEmpty={true}
            keyError={'listCashRegisterReport.startDateReport'}
            maxDate={maxDate}
            minDate={minDate}
          />
          ～
          <TooltipDatePickerControl
            required={true}
            name={'endDateReport'}
            labelText="listCashRegisterReport.endDateReport"
            disabled={type.type !== CashRegisterReportTypeEnum.Daily}
            checkEmpty={true}
            keyError={'listCashRegisterReport.endDateReport'}
            maxDate={maxDate}
            minDate={minDate}
          />
        </div>
      ) : (
        <SelectControl
          label="detailCashRegisterReport.targetMonth"
          name={'month'}
          items={dropDownMonth()}
          className="detail-cash-register-report__target-month"
          isRequired={true}
        />
      )}
      <SelectControl
        name={'cash_register_code'}
        label="detailCashRegisterReport.cashier"
        items={state?.cash_registers ?? []}
        className="detail-cash-register-report__cashier-select"
        isRequired={true}
      />
      <FuncKeyDirtyCheckButton
        funcKey={'F12'}
        text="action.f12Search"
        onClickAction={getDetailReport}
        disabled={disabledSearch}
      />
    </div>
  );

  /**
   * Keydown tab table report, press space to select tab
   * @param (event) event keyboard
   * @param (item) tab table can select
   */
  const onKeydownTab = (event: React.KeyboardEvent, item: CashRegisterReportInfo) => {
    if (event.key === KEYDOWN.Space) {
      event.stopPropagation();
      event.preventDefault();
      setValue('tab', item);
    }
  };

  const tabReport = (
    <div
      className="detail-cash-register-report__tab-menu"
      style={{ gridTemplateColumns: cashRegisterReportTabs.map(() => '1fr').join(' ') }}
    >
      {cashRegisterReportTabs.map((item, index) => (
        <div
          key={index}
          className={`detail-cash-register-report__tab-item-container ${index === indexTab - 1 ? 'detail-cash-register-report__previous-selected-tab' : ''}`}
        >
          <div
            onKeyDown={(event) => onKeydownTab(event, item)}
            tabIndex={0}
            className={`detail-cash-register-report__tab-item ${index === indexTab ? 'detail-cash-register-report__selected-tab-item' : ''}`}
            onClick={() => setValue('tab', item)}
          >
            {localizeString(item.name)}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="detail-cash-register-report">
      <FormProvider {...formConfig}>
        <Header
          title="detailCashRegisterReport.title"
          csv={{ disabled: true }}
          hasESC={true}
          printer={{ action: printPDF, disabled: disabledSearch }}
        />
        {searchReport}
        {tabReport}
        <div className="detail-cash-register-report__content">
          <div className="detail-cash-register-report__table-report-container">
            {(() => {
              switch (tab.type) {
                case CashRegisterReportTypeInfo.Sale:
                  return (
                    <>
                      <TableCategory />
                      <TableTotalSales />
                    </>
                  );
                case CashRegisterReportTypeInfo.Tax:
                  return (
                    <>
                      <TableTax />
                      <TableSettlement />
                    </>
                  );
                case CashRegisterReportTypeInfo.Payment:
                  return (
                    <>
                      <TableCashIn />
                      <TableCashOut />
                    </>
                  );
                case CashRegisterReportTypeInfo.Money:
                  return (
                    <>
                      <TableCash />
                      <TableDiscount />
                    </>
                  );
                case CashRegisterReportTypeInfo.Cashier:
                  return (
                    <>
                      <TableOperate />
                      <TableStamp />
                    </>
                  );
                default:
                  return <></>;
              }
            })()}
          </div>
        </div>
      </FormProvider>
    </div>
  );
};

const TableCategory = () => {
  const columns = React.useMemo<TableColumnDef<ICashRegisterReportItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '',
        type: 'text',
        size: 30,
        textAlign: 'center',
      },
      {
        accessorKey: 'total_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.amount',
        size: 17.5,
      },
      {
        accessorKey: 'total_count',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.points',
        size: 17.5,
      },
      {
        accessorKey: 'this_month_total_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.this_month_total_amount',
        size: 17.5,
      },
      {
        accessorKey: 'this_month_total_count',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.cumulativePointsMonth',
        size: 17.5,
      },
    ],
    []
  );

  return <TableReport columns={columns} dataName="reportTable.category_info_list" leftTitle="departmentSales" />;
};

const TableTotalSales = () => {
  const columns = React.useMemo<TableColumnDef<ICashRegisterReportItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '',
        type: 'text',
        size: 30,
        textAlign: 'center',
      },
      {
        accessorKey: 'total_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.amount',
        size: 17.5,
      },
      {
        accessorKey: 'total_count',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.points',
        size: 17.5,
      },
      {
        accessorKey: 'customer_count',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.countCustomer',
        size: 17.5,
      },
      {
        accessorKey: 'average_per_product',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        numberFractionDigits: 1,
        fixedDigit: true,
        header: 'detailCashRegisterReport.pricePerPoint',
        size: 17.5,
      },
      {
        accessorKey: 'average_per_customer',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        numberFractionDigits: 1,
        fixedDigit: true,
        header: 'detailCashRegisterReport.pricePerCustomer',
        size: 17.5,
      },
    ],
    []
  );

  return (
    <TableReport columns={columns} dataName="reportTable.sale_info_list" leftTitle="totalSales" rightTitle="topRow" />
  );
};

const TableTax = () => {
  const columns = React.useMemo<TableColumnDef<ICashRegisterReportItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '',
        type: 'text',
        size: 30,
        textAlign: 'center',
      },
      {
        accessorKey: 'total_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.tax',
        size: 17.5,
      },
      {
        accessorKey: 'target_total_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.saleAmount',
        size: 17.5,
      },
      {
        accessorKey: 'this_month_total_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.taxPerMonth',
        size: 17.5,
      },
      {
        accessorKey: 'this_month_target_total_amount',
        textAlign: 'right',
        type: 'text',
        header: 'detailCashRegisterReport.targetAmountMonth',
        formatNumber: true,
        size: 17.5,
      },
    ],
    []
  );

  return <TableReport columns={columns} dataName="reportTable.tax_info_list" leftTitle="taxTitle" />;
};

const TableSettlement = () => {
  const columns = React.useMemo<TableColumnDef<ICashRegisterReportItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '',
        type: 'text',
        size: 30,
        textAlign: 'center',
      },
      {
        accessorKey: 'total_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.amount',
        size: 17.5,
      },
      {
        accessorKey: 'total_count',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.cashCard',
        size: 17.5,
      },
      {
        accessorKey: 'this_month_total_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.this_month_total_amount',
        size: 17.5,
      },
      {
        accessorKey: 'this_month_total_count',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.totalCases',
        size: 17.5,
      },
    ],
    []
  );

  return <TableReport columns={columns} dataName="reportTable.settlement_info_list" leftTitle="settlement" />;
};

const TableCashIn = () => {
  const columns = React.useMemo<TableColumnDef<ICashRegisterReportItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '',
        type: 'text',
        size: 30,
        textAlign: 'center',
      },
      {
        accessorKey: 'total_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.amount',
        size: 17.5,
      },
      {
        accessorKey: 'total_count',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.total_count',
        size: 17.5,
      },
      {
        accessorKey: 'this_month_total_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.this_month_total_amount',
        size: 17.5,
      },
      {
        accessorKey: 'this_month_total_count',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.this_month_total_count',
        size: 17.5,
      },
    ],
    []
  );

  return <TableReport columns={columns} dataName="reportTable.cash_in_info_list" leftTitle="deposit" />;
};

const TableCashOut = () => {
  const columns = React.useMemo<TableColumnDef<ICashRegisterReportItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '',
        type: 'text',
        size: 30,
        textAlign: 'center',
      },
      {
        accessorKey: 'total_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.amount',
        size: 17.5,
      },
      {
        accessorKey: 'total_count',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.total_count',
        size: 17.5,
      },
      {
        accessorKey: 'this_month_total_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.this_month_total_amount',
        size: 17.5,
      },
      {
        accessorKey: 'this_month_total_count',
        textAlign: 'right',
        formatNumber: true,
        type: 'text',
        header: 'detailCashRegisterReport.this_month_total_count',
        size: 17.5,
      },
    ],
    []
  );

  return <TableReport columns={columns} dataName="reportTable.cash_out_info_list" leftTitle="withdraw" />;
};

const TableCash = () => {
  const columns = React.useMemo<TableColumnDef<ICashRegisterReportItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '',
        type: 'text',
        size: 40,
        textAlign: 'center',
      },
      {
        accessorKey: 'total_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.amount',
        size: 30,
      },
      {
        accessorKey: 'total_count',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.total_count',
        size: 30,
      },
    ],
    []
  );

  return <TableReport columns={columns} dataName="reportTable.cash_info_list" leftTitle="money" />;
};

const TableDiscount = () => {
  const columns = React.useMemo<TableColumnDef<ICashRegisterReportItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '',
        type: 'text',
        size: 30,
        textAlign: 'center',
      },
      {
        accessorKey: 'total_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.amount',
        size: 17.5,
      },
      {
        accessorKey: 'total_count',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.total_count',
        size: 17.5,
      },
      {
        accessorKey: 'this_month_total_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.this_month_total_amount',
        size: 17.5,
      },
      {
        accessorKey: 'this_month_total_count',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.this_month_total_count',
        size: 17.5,
      },
    ],
    []
  );

  return <TableReport columns={columns} dataName="reportTable.discount_info_list" leftTitle="discount" />;
};

const TableOperate = () => {
  const columns = React.useMemo<TableColumnDef<ICashRegisterReportItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '',
        type: 'text',
        size: 30,
        textAlign: 'center',
      },
      {
        accessorKey: 'total_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.amount',
        size: 17.5,
      },
      {
        accessorKey: 'total_count',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.total_count',
        size: 17.5,
      },
      {
        accessorKey: 'this_month_total_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.this_month_total_amount',
        size: 17.5,
      },
      {
        accessorKey: 'this_month_total_count',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.this_month_total_count',
        size: 17.5,
      },
    ],
    []
  );

  return <TableReport columns={columns} dataName="reportTable.operation_info_list" leftTitle="operate" />;
};

const TableStamp = () => {
  const columns = React.useMemo<TableColumnDef<ICashRegisterReportItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: '',
        type: 'text',
        size: 30,
        textAlign: 'center',
      },
      {
        accessorKey: 'total_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.amount',
        size: 17.5,
      },
      {
        accessorKey: 'total_count',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.total_count',
        size: 17.5,
      },
      {
        accessorKey: 'this_month_total_amount',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.this_month_total_amount',
        size: 17.5,
      },
      {
        accessorKey: 'this_month_total_count',
        textAlign: 'right',
        type: 'text',
        formatNumber: true,
        header: 'detailCashRegisterReport.this_month_total_count',
        size: 17.5,
      },
    ],
    []
  );

  return <TableReport columns={columns} dataName="reportTable.stamp_info_list" leftTitle="stamp" />;
};

const TableReport = (props: ICashRegisterReportTableProps) => {
  const { leftTitle, rightTitle, columns, dataName } = props;
  const { watch } = useFormContext();
  const data = watch(dataName) ?? [];

  return (
    <div
      className="detail-cash-register-report__table-report"
      style={{ '--report-table-row': data?.length ?? 0 } as React.CSSProperties}
    >
      <div className="detail-cash-register-report__table-title">
        <label className="detail-cash-register-report__table-left-title">
          <Translate contentKey={`detailCashRegisterReport.${leftTitle}`} />
        </label>
        {rightTitle && (
          <label className="detail-cash-register-report__table-right-title">
            <Translate contentKey={`detailCashRegisterReport.${rightTitle}`} />
          </label>
        )}
      </div>
      <TableData
        columns={columns}
        data={watch(dataName) ?? []}
        enableSelectRow={false}
        disableSingleRecordPadding={true}
      />
    </div>
  );
};

export default Sc3102DetailReport;
