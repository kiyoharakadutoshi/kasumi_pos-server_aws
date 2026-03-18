import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, Resolver, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, ValidationError } from 'yup';

// Component
import Header from 'app/components/header/header';
import SidebarStore from 'app/components/sidebar-store-default/sidebar-store/sidebar-store';
import FuncKeyDirtyCheckButton from 'app/components/button/func-key-dirty-check/func-key-dirty-check-button';
import TableData, { TableColumnDef } from 'app/components/table/table-data/table-data';
import RadioControl from '@/components/control-form/radio-control';
import TooltipDatePickerControl from '@/components/date-picker/tooltip-date-picker/tooltip-date-picker-control';
import BottomButton from 'app/components/bottom-button/bottom-button';
import { IRadioButtonValue } from '@/components/radio-button-component/radio-button';

// Redux
import { useAppSelector } from '@/config/store';

// Utils
import { getDateFromDateWithMonth, getPreviousDate } from '@/helpers/date-utils';
import { isNullOrEmpty, localizeFormat, localizeString } from 'app/helpers/utils';
import { USER_ROLE } from '@/constants/constants';
import { getFocusableElements } from '@/helpers/utils-element-html';

// API
import { ISalesTenantReport } from './sales-tenant-report-interface';

// Styles
import './styles.scss';

const LIMIT_RECORD = 20;

const defaultRecord: ISalesTenantReport = {
  group: '01',
  sales_revenue_08: 8000,
  consumption_tax_08: 80000,
  sales_revenue_10: 1000,
  consumption_tax_10: 10000,
  non_tax_amount: 880000,
  total_revenue: 1000000,
};

const dataDefault = Array.from({ length: LIMIT_RECORD }, () => ({ ...defaultRecord }));

interface FormData {
  searchCondition?: {
    businessType: number;
    dateReport: Date;
  };

  salesData?: ISalesTenantReport[];
}

const DEFAULT_DATA: FormData = {
  searchCondition: {
    businessType: 0,
    dateReport: new Date(),
  },

  salesData: [],
};

const MAPPING_ERROR = {
  dateReport: 'salesTenantReport.mappingError.dateReport',
};

const BUSINESS_TYPE: IRadioButtonValue[] = [
  {
    id: 0,
    textValue: 'salesTenantReport.conditionSearchLabel.breakingNews',
    disabled: false,
  },
  {
    id: 1,
    textValue: 'salesTenantReport.conditionSearchLabel.dailyReport',
    disabled: false,
  },
];

export const SalesTenantReport = () => {
  // Hook from React
  const divCommonRef = useRef(null);

  const [businessTypeBreakingNews, setBusinessTypeBreakingNews] = useState(true);
  const [isStatusSearch, setIsStatusSearch] = React.useState(false);
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];
  const [isFirstRender, setIsFirstRender] = useState(true);
  const userRole = useAppSelector((state) => state.loginReducer.userLogin?.user_detail?.role_code);

  const validationSchema = object<FormData>().shape({});

  const formConfig = useForm<FormData>({
    defaultValues: DEFAULT_DATA,
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
  });
  const { getValues, setValue, setError, reset, watch } = formConfig;

  // Focus first input
  const focusInput = () => {
    setTimeout(() => {
      const element = getFocusableElements(divCommonRef.current) as unknown as HTMLElement[];
      element[0].focus();
    }, 500);
  };

  const dataTable: ISalesTenantReport[] = useMemo(() => getValues('salesData') ?? null, [watch('salesData')]);

  // Handle Change Business type
  const handleChangeBusinessType = () => {
    const today = new Date();
    if (watch('searchCondition.businessType') === 0) {
      setBusinessTypeBreakingNews(true);
    } else {
      setBusinessTypeBreakingNews(false);
      today.setDate(today.getDate() - 1);
    }
    setValue('searchCondition.dateReport', today);
    setError('searchCondition.dateReport', null);
  };

  const columns = React.useMemo<TableColumnDef<ISalesTenantReport>[]>(
    () => [
      {
        accessorKey: 'group',
        header: 'salesTenantReport.table.group',
        size: 10,
        type: 'text',
        textAlign: 'left',
      },
      {
        accessorKey: 'sales_revenue_08',
        formatNumber: true,
        header: 'salesTenantReport.table.salesRevenue08',
        size: 15,
        type: 'text',
        textAlign: 'right',
      },
      {
        accessorKey: 'consumption_tax_08',
        formatNumber: true,
        header: 'salesTenantReport.table.consumptionTax08',
        size: 15,
        type: 'text',
        textAlign: 'right',
      },
      {
        accessorKey: 'sales_revenue_10',
        formatNumber: true,
        header: 'salesTenantReport.table.salesRevenue10',
        size: 15,
        type: 'text',
        textAlign: 'right',
      },
      {
        accessorKey: 'consumption_tax_10',
        formatNumber: true,
        header: 'salesTenantReport.table.consumptionTax10',
        type: 'text',
        size: 15,
        textAlign: 'right',
      },
      {
        accessorKey: 'non_tax_amount',
        formatNumber: true,
        header: 'salesTenantReport.table.nonTaxAmount',
        type: 'text',
        size: 15,
        textAlign: 'right',
      },
      {
        accessorKey: 'total_revenue',
        formatNumber: true,
        header: 'salesTenantReport.table.totalRevenue',
        type: 'text',
        size: 15,
        textAlign: 'right',
      },
    ],
    []
  );

  // F12 Search
  const handleConfirmAction = async () => {
    const { dateReport } = getValues('searchCondition');

    try {
      await validationSchema.validate(
        {
          dateReport,
        },
        { abortEarly: false }
      );
      if (selectedStores[0] !== '00005') {
        setValue('salesData', dataDefault);
      }
      setIsStatusSearch(true);
      return true;
    } catch (e) {
      if (e instanceof ValidationError) {
        let fieldName = '';
        let message = '';
        if (e.inner.length > 0) {
          fieldName = e.inner[0]?.path ?? '';
          message = e.inner[0]?.message;
        } else {
          fieldName = e.path;
          message = e.message;
        }

        setError(`searchCondition.${fieldName}` as any, {
          message: localizeFormat(message, MAPPING_ERROR[fieldName]),
        });
        return;
      }
      return false;
    }
  };

  // Print AP1202
  const handlePrint = async () => {
    const { dateReport } = getValues('searchCondition');

    try {
      await validationSchema.validate(
        {
          dateReport,
        },
        { abortEarly: false }
      );

      return true;
    } catch (e) {
      if (e instanceof ValidationError) {
        let fieldName = '';
        let message = '';
        if (e.inner.length > 0) {
          fieldName = e.inner[0]?.path ?? '';
          message = e.inner[0]?.message;
        } else {
          fieldName = e.path;
          message = e.message;
        }

        setError(`searchCondition.${fieldName}` as any, {
          message: localizeFormat(message, MAPPING_ERROR[fieldName]),
        });
        return;
      }
      return false;
    }
  };

  const handleClearData = (checkedStores) => {
    reset();
    if (checkedStores[0] === '00005') {
      setValue('salesData', null);
    }
    setBusinessTypeBreakingNews(true);
    // setIsStatusSearch(false);
    setIsFirstRender(false);
    if (!isFirstRender) {
      // Call API get list subtotal discount credit
      if (checkedStores[0] !== '00005') {
        setValue('salesData', dataDefault);
      }
      setIsStatusSearch(true);
    }
  };

  const handleCollapseSidebar = (isExpanded, stores) => {
    if (isFirstRender && !isExpanded) {
      // Call API get list subtotal discount credit
      if (stores[0] !== '00005') {
        setValue('salesData', dataDefault);
      }
      setIsStatusSearch(true);
      setIsFirstRender(false);
    }
    focusInput();
  };

  // Handle call search when role == user ( auto call because does not have multi store)
  useEffect(() => {
    if (userRole !== USER_ROLE.ADMIN && !isNullOrEmpty(selectedStores)) {
      setValue('salesData', dataDefault);
      setIsStatusSearch(true);
    }
  }, [selectedStores]);

  return (
    <FormProvider {...formConfig}>
      <div className="sales-tenant-report">
        <Header
          hasESC={true}
          title="salesTenantReport.title"
          csv={{ disabled: true }}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          printer={{ disabled: false, action: handlePrint }}
          hiddenTextESC={true}
        />

        <div className={'sales-tenant-report__main'}>
          {/* Sidebar */}
          <SidebarStore
            onClickSearch={() => {}}
            expanded={true}
            onChangeCollapseExpand={(isExpanded, isDirty, stores) => handleCollapseSidebar(isExpanded, stores)}
            clearData={() => handleClearData}
            hasData={watch('salesData')?.length > 0}
            actionConfirm={(checkedStores) => handleClearData(checkedStores)}
          />

          {/* Input search */}
          <div className={'sales-tenant-report__search'} ref={divCommonRef}>
            <div className={`sales-tenant-report__business-type`}>
              <span className="sales-tenant-report__lablel">
                {localizeString('salesTenantReport.conditionSearchLabel.businessType')}
                <span className="sales-tenant-report__label-mark">*</span>
              </span>
              <RadioControl
                isVertical={false}
                name="searchCondition.businessType"
                listValues={BUSINESS_TYPE}
                value={watch('searchCondition.businessType')}
                onChange={handleChangeBusinessType}
              />
            </div>
            <div className={'sales-tenant-report__input-date'}>
              <TooltipDatePickerControl
                inputClassName="date-time-start-end__start-date"
                name="searchCondition.dateReport"
                labelText="salesTenantReport.conditionSearchLabel.dateReport"
                disabled={businessTypeBreakingNews}
                checkEmpty={true}
                keyError={'salesTenantReport.conditionSearchLabel.dateReport'}
                errorPlacement="bottom-end"
                minDate={businessTypeBreakingNews ? null : getDateFromDateWithMonth(-3, getPreviousDate())}
                maxDate={businessTypeBreakingNews ? null : getPreviousDate()}
              />
              <FuncKeyDirtyCheckButton
                text="action.f12Search"
                funcKey={'F12'}
                onClickAction={() => {
                  handleConfirmAction();
                }}
                funcKeyListener={selectedStores}
              />
            </div>
          </div>

          {/* Table */}
          <div className="sales-tenant-report__table">
            <TableData<ISalesTenantReport>
              columns={columns}
              data={dataTable}
              enableSelectRow={false}
              showNoData={isStatusSearch && (dataTable === null || dataTable.length === 0)}
              tableType="view"
            />
          </div>
        </div>

        {/* Footer */}
        <BottomButton leftPosition="455px" />
      </div>
    </FormProvider>
  );
};

export default SalesTenantReport;
