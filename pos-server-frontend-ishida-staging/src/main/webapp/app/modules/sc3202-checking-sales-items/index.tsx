// React
import React, { useEffect, useMemo, useRef } from 'react';

// Form handling
import { useForm, FormProvider } from 'react-hook-form';
import { object, ValidationError } from 'yup';

// Redux
import { useAppDispatch } from '@/config/store';

// Components
import Header from '@/components/header/header';
import TableData, { TableColumnDef } from '@/components/table/table-data/table-data';
import TooltipNumberInputTextControl from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import ButtonPrimary from '@/components/button/button-primary/button-primary';
import { PopoverLabelText } from '@/components/popover/popover';
import TooltipDatePickerControl from 'app/components/date-picker/tooltip-date-picker/tooltip-date-picker-control';

// Utils
import { localizeFormat } from '@/helpers/utils';
import { KEYDOWN } from '@/constants/constants';
import { convertDateServer, getDateFromDateWithMonth, fullDateToSortDate, getNextHour } from 'app/helpers/date-utils';
import { focusElementByName, isNullOrEmpty, isValidDate, localizeString } from 'app/helpers/utils';

// Services
import { getCashRegisterRevenue } from '@/services/product-revenue-pos-service';

// Interfaces
import {
  CashRegisterRevenue,
  ProductRevenuePOS,
} from 'app/modules/sc3201-product-revenue-pos/product-revenue-pos-interface';

// Misc
import { useLocation } from 'react-router';

// Styles
import './styles.scss';
import { selectStore } from 'app/reducers/store-reducer';

interface SalesItem {
  timeRange: string;
  revenueAmount: number;
  quantity: number;
  customerCount: number;
}

interface FormData {
  productCode: string;
  pluCode: string;
  productName: string;
  storeMachineCode: number;
  startDate: string;
  endDate: string;
  tableData: SalesItem[];
  showNoData?: boolean;
}

const DEFAULT_VALUE: FormData = {
  productCode: '',
  pluCode: '',
  productName: '',
  storeMachineCode: null,
  startDate: convertDateServer(new Date()),
  endDate: convertDateServer(new Date()),
  tableData: [],
  showNoData: false,
};

const MAPPING_ERROR = {
  'businessDay.startDate': '営業日',
  'businessDay.endDate': '営業日',
};

/**
 * SC3202:
 *
 * @returns {JSX.Element} The page for
 */
const CheckingSalesItem = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const divCommonRef = useRef(null);
  const location = useLocation();
  const state: ProductRevenuePOS = location.state;

  const maxDate = new Date();
  const minDate = getDateFromDateWithMonth(-3, maxDate);

  const formConfig = useForm({
    defaultValues: DEFAULT_VALUE,
    // resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
  });

  const { getValues, watch, setError } = formConfig;

  const disabledSearch = useMemo(() => {
    if (!state) return true;
    const startDate = getValues('startDate');
    const endDate = getValues('endDate');
    return !isValidDate(startDate) || !isValidDate(endDate);
  }, [[watch('startDate'), watch('endDate')]]);

  // Validation Schema
  const validationSchema = object<FormData>().shape({
    businessDay: object().test((data: { startDate: string; endDate: string }) => {
      if (data.startDate > data.endDate) {
        setError('startDate', { message: localizeString('MSG_VAL_051') });
        return false;
      }
      return true;
    }),
  });

  const columns = React.useMemo<TableColumnDef<SalesItem>[]>(
    () => [
      {
        accessorKey: 'timeRange',
        header: 'checkingSalesItems.timeRange',
        size: 25,
        type: 'text',
        textAlign: 'center',
      },
      {
        accessorKey: 'revenueAmount',
        textAlign: 'right',
        header: 'checkingSalesItems.revenueAmount',
        formatNumber: true,
        type: 'text',
        size: 25,
      },
      {
        accessorKey: 'quantity',
        textAlign: 'right',
        header: 'checkingSalesItems.quantity',
        formatNumber: true,
        type: 'text',
        size: 25,
      },
      {
        accessorKey: 'customerCount',
        textAlign: 'right',
        header: 'checkingSalesItems.customerCount',
        formatNumber: true,
        type: 'text',
        size: 25,
      },
    ],
    []
  );

  const focusFirstElement = () => {
    focusElementByName('startDate');
  };

  const handleSearchCheckingSalesItem = async () => {
    formConfig.clearErrors();
    const { startDate, endDate } = getValues();

    try {
      await validationSchema.validate(
        {
          businessDay: { startDate, endDate },
        },
        { abortEarly: false }
      );

      handelCallApi();
    } catch (e) {
      if (e instanceof ValidationError) {
        e.inner?.forEach((item) => {
          const fieldName = item?.path ?? '';
          setError(fieldName as any, { message: localizeFormat(item?.message, MAPPING_ERROR[fieldName]) });
        });
      }
      return false;
    }
  };

  const handleKeyDownEvent = (event: KeyboardEvent) => {
    if (event.key === KEYDOWN.F12) {
      handleSearchCheckingSalesItem();
    }
  };

  useEffect(() => {
    if (state?.store_code) {
      dispatch(selectStore(state?.store_code));
    }

    document.addEventListener('keydown', handleKeyDownEvent, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDownEvent, true);
    };
  }, []);

  const handelCallApi = () => {
    if (!state) return;

    const payload: CashRegisterRevenue = {
      selected_store: state.store_code,
      business_type: 1,
      start_date: fullDateToSortDate(getValues('startDate')),
      end_date: fullDateToSortDate(getValues('endDate')),
      cash_register_code: state.cash_register_code,
      plu_code: state.item_code,
      report_type: 1,
    };
    dispatch(getCashRegisterRevenue(payload))
      .unwrap()
      .then((res) => {
        const items = res?.data?.data?.items ?? [];
        const dataTable: SalesItem[] = items?.map((item) => ({
          timeRange: `${item.time_period} ～ ${getNextHour(item.time_period)}`,
          revenueAmount: item.sale_amount,
          quantity: item.sale_quantity,
          customerCount: item.sales_transaction_count,
        }));
        formConfig.setValue('showNoData', isNullOrEmpty(items));
        formConfig.setValue('tableData', dataTable);
      })
      .catch(() => formConfig.setValue('showNoData', true));
  };

  useEffect(() => {
    if (!state) return;

    formConfig.setValue('startDate', state.start_date);
    formConfig.setValue('endDate', state.end_date);
    handelCallApi();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      focusFirstElement();
    }, 100);
  }, []);

  return (
    <div className="menu-checkout-wrapper" ref={containerRef}>
      <Header
        title="checkingSalesItems.title"
        csv={{
          disabled: true,
          listTitleTable: [],
          csvData: null,
          fileName: null,
        }}
        hasESC={true}
        printer={{
          disabled: true,
        }}
      />

      <FormProvider {...formConfig}>
        <main className="main-container checking-sales-item">
          <div className="checking-sales-item__search" ref={divCommonRef}>
            <div className="checking-sales-item__search-box">
              {/* 商品コード */}
              <div className="checking-sales-item__search-item">
                <TooltipNumberInputTextControl
                  value={state?.my_company_code}
                  maxLength={13}
                  width={'100%'}
                  name="productCode"
                  label="checkingSalesItems.productCode"
                  disabled
                />
              </div>

              {/* PLUコード */}
              <div className="checking-sales-item__search-item">
                <TooltipNumberInputTextControl
                  value={state?.item_code}
                  maxLength={13}
                  width={'100%'}
                  name="pluCode"
                  label="checkingSalesItems.pluCode"
                  addZero
                  disabled
                />
              </div>

              {/* 商品名称 */}
              <div className="checking-sales-item__search-item wide">
                <PopoverLabelText
                  text={state?.description}
                  label="checkingSalesItems.productName"
                  className="product-name"
                />
              </div>

              {/* 端末番号 */}
              <div className="checking-sales-item__search-item">
                <PopoverLabelText
                  text={`${state?.cash_register_code ?? ''}：${state?.cash_register_name ?? ''}`}
                  label="checkingSalesItems.storeMachineCode"
                />
              </div>

              {/* 営業日 */}
              <div className="checking-sales-item__search-item datetime">
                <TooltipDatePickerControl
                  disabled={!state}
                  required={true}
                  name={'startDate'}
                  labelText="productRevenuePos.workingDate"
                  checkEmpty={true}
                  keyError={'listCashRegisterReport.startDateReport'}
                  maxDate={maxDate}
                  minDate={minDate}
                  errorPlacement={'left'}
                />
                ～
                <TooltipDatePickerControl
                  disabled={!state}
                  required={true}
                  name={'endDate'}
                  checkEmpty={true}
                  keyError={'listCashRegisterReport.endDateReport'}
                  maxDate={maxDate}
                  minDate={minDate}
                  errorPlacement={'right'}
                />
              </div>

              <div className="checking-sales-item__search-item">
                <ButtonPrimary
                  disabled={disabledSearch}
                  className="search-button"
                  text="label.searchF12"
                  onClick={handleSearchCheckingSalesItem}
                />
              </div>
            </div>
          </div>

          <div className="checking-sales-item__list">
            <TableData<SalesItem>
              enableSelectRow={false}
              columns={columns}
              data={watch('tableData')}
              tableKey="tableData"
              showNoData={watch('showNoData')}
            ></TableData>
          </div>
        </main>
      </FormProvider>
    </div>
  );
};
export default CheckingSalesItem;
