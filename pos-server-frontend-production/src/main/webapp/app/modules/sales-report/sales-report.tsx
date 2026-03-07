/* eslint-disable react/no-unknown-property */
/* eslint-disable object-shorthand */
import ListRadioButton from '@/components/radio-button-component/radio-button';
import './sales-report-styled.scss';
import { isNullOrEmpty, localizeFormat, localizeString } from '@/helpers/utils';
import React, { useEffect, useState } from 'react';
import { yesterday } from './data-sales-report';
import TooltipDatePicker from '@/components/date-picker/tooltip-date-picker/tooltip-date-picker';
import Dropdown from '@/components/dropdown/dropdown';
import Header from '@/components/header/header';
import FuncKeyDirtyCheckButton from '@/components/button/func-key-dirty-check/func-key-dirty-check-button';
import { useAppDispatch, useAppSelector } from '@/config/store';
import { FormProvider, useForm } from 'react-hook-form';
import ButtonPrimary from '@/components/button/button-primary/button-primary';
import TableData, { TableColumnDef } from '@/components/table/table-data/table-data';
import { ISalesReport } from './sales-report-interface';
import SidebarStore from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import BottomButton from '@/components/bottom-button/bottom-button';
import { elementChangeKeyListener } from '@/hooks/keyboard-hook';
import { defaultSaleReport, OUTPUT_UNITS, reportTypeData } from './data-default';
import _ from 'lodash';
import { compareDate, getDateFromDateWithMonth, getPreviousDate, toDateString } from '@/helpers/date-utils';
import { setError, setErrorValidate } from '@/reducers/error';
import { exportSales, getSaleReport } from '@/services/sales-report-service';
import { SERVER_DATE_FORMAT_COMPACT } from '@/constants/date-constants';
import { formatNumberWithCommas } from '@/helpers/number-utils';
import { saveAs } from 'file-saver';
import { Row } from '@tanstack/react-table';
import { USER_ROLE } from '@/constants/constants';

const SalesReport = () => {
  const dispatch = useAppDispatch();
  const formConfig = useForm({ defaultValues: defaultSaleReport });
  const { watch, setValue, getValues, reset } = formConfig;
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores);
  const userRole = useAppSelector((state) => state.loginReducer.userLogin?.user_detail?.role_code);
  const isGroupTable = watch('isGroupTable');
  const hierarchyCode = watch('selectedRows')?.[0]?.original?.md_hierarchy_code;
  const [msgErrStartDate, setMsgErrStartDate] = useState(null);
  const [isEmptyTransactionCount, setIsEmptyTransactionCount] = useState(false);
  const langSystem = useAppSelector((state) => state.locale.currentLocale);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isSwitchBackFromDailyReport, setIsSwitchBackFromDailyReport] = useState(false);
  const [isTotalRow, setIsTotalRow] = useState(true);

  elementChangeKeyListener(isGroupTable);
  const addClassNameRow = (row: Row<ISalesReport>) => {
    return { className: row.index === 0 ? 'total-row' : '' };
  };

  const dayColumns = React.useMemo<TableColumnDef<ISalesReport>[]>(
    () => [
      {
        accessorKey: 'No',
        header: 'salesReport.table.no',
        size: 5,
        textAlign: 'right',
        cell: ({ row, getValue }) => <div className="wrap-option-text">{row.index === 0 ? '****' : row.index}</div>,
      },
      {
        accessorKey: 'time_zone',
        header: 'salesReport.table.timeZone',
        size: 15,
        type: 'text',
        textAlign: 'left',
        option(props) {
          const timeZone = props?.row?.original?.time_zone;
          if (props?.row?.index === 0) {
            return {
              value: '時間巿計',
            };
          } else {
            return {
              value: timeZone,
            };
          }
        },
      },
      {
        accessorKey: 'sales_amount',
        header: 'salesReport.table.sales',
        size: 10,
        type: 'text',
        textAlign: 'right',
        option(props) {
          const salesAmount = props?.row?.original?.sales_amount;
          return {
            value: formatNumberWithCommas(salesAmount),
          };
        },
      },
      {
        accessorKey: 'achievement_ratio',
        header: 'salesReport.table.percentComplete',
        type: 'text',
        size: 10,
        textAlign: 'right',
        option(props) {
          const achievementRatio = props?.row?.original?.achievement_ratio || 0;
          return {
            value: formatNumberWithCommas(achievementRatio, true),
          };
        },
      },
      {
        accessorKey: 'discount_amount',
        header: 'salesReport.table.discountAmount',
        size: 10,
        type: 'text',
        textAlign: 'right',
        option(props) {
          const discountAmount = props?.row?.original?.discount_amount;
          return {
            value: formatNumberWithCommas(discountAmount),
          };
        },
      },
      {
        accessorKey: 'sales_quantity',
        header: 'salesReport.table.score',
        size: 10,
        textAlign: 'right',
        type: 'text',
        option(props) {
          const salesQuantity = props?.row?.original?.sales_quantity;
          return {
            value: formatNumberWithCommas(salesQuantity),
          };
        },
      },
      {
        accessorKey: 'item_unit_price',
        header: 'salesReport.table.unitPrice',
        size: 10,
        textAlign: 'right',
        type: 'text',
        option(props) {
          const itemUnitPrice = props?.row?.original?.item_unit_price || 0;
          return {
            value: formatNumberWithCommas(itemUnitPrice, true),
          };
        },
      },
      {
        accessorKey: 'sales_transaction_count',
        header: 'salesReport.table.numberOfGuests',
        size: 10,
        textAlign: 'right',
        type: 'text',
        option(props) {
          const salesTransactionCount = props?.row?.original?.sales_transaction_count;
          return {
            value: formatNumberWithCommas(salesTransactionCount),
          };
        },
      },
      {
        accessorKey: 'customer_unit_price',
        header: 'salesReport.table.pricePerCustomer',
        textAlign: 'right',
        size: 10,
        type: 'text',
        option(props) {
          const customerUnitPrice = props?.row?.original?.customer_unit_price || 0;
          return {
            value: formatNumberWithCommas(customerUnitPrice, true),
          };
        },
      },
      {
        accessorKey: 'cumulative_sales_price',
        header: 'salesReport.table.cumulativeSales',
        textAlign: 'right',
        size: 10,
        type: 'text',
        option(props) {
          const cumulativeSalesPrice = props?.row?.original?.cumulative_sales_price;
          return {
            value: formatNumberWithCommas(cumulativeSalesPrice),
          };
        },
      },
    ],
    []
  );
  const groupColumns = React.useMemo<TableColumnDef<ISalesReport>[]>(
    () => [
      {
        accessorKey: 'md_hierarchy_code',
        header: 'salesReport.table.code',
        size: 6,
        textAlign: 'left',
        type: 'text',
        option(props) {
          const hierarchyCodeColumn = props?.row?.original?.md_hierarchy_code;
          if (props?.row?.index === 0) {
            return {
              value: watch('parent_code') === null ? '****' : watch('parent_code'),
            };
          } else {
            return {
              value: hierarchyCodeColumn,
            };
          }
        },
      },
      {
        accessorKey: 'description',
        header: 'salesReport.table.groupName',
        size: 36,
        type: 'text',
        textAlign: 'left',
        option(props) {
          const descriptionValue = props?.row?.original?.description;
          if (props?.row?.index === 0) {
            return {
              value:
                watch('parent_name') === null ? localizeString('salesReport.table.storeTotal') : watch('parent_name'),
            };
          } else {
            return {
              value: descriptionValue,
            };
          }
        },
      },
      {
        accessorKey: 'sales_amount',
        header: 'salesReport.table.sales',
        size: 8,
        type: 'text',
        textAlign: 'right',
        option(props) {
          const salesAmount = props?.row?.original?.sales_amount;
          return {
            value: formatNumberWithCommas(salesAmount),
          };
        },
      },
      {
        accessorKey: 'budget',
        header: 'salesReport.table.budget',
        size: 8,
        type: 'text',
        textAlign: 'right',
        option(props) {
          const budgetData = props?.row?.original?.budget;
          return {
            value: formatNumberWithCommas(budgetData),
          };
        },
      },
      {
        accessorKey: 'achievement_ratio',
        header: 'salesReport.table.percentComplete',
        type: 'text',
        size: 8,
        textAlign: 'right',
        option(props) {
          const achievementRatio = props?.row?.original?.achievement_ratio || 0;
          return {
            value: formatNumberWithCommas(achievementRatio, true),
          };
        },
      },
      {
        accessorKey: 'constituent_ratio',
        header: 'salesReport.table.proportionOfRevenue',
        size: 8,
        type: 'text',
        textAlign: 'right',
        option(props) {
          const constituentRatio = props?.row?.original?.constituent_ratio;
          return {
            value: formatNumberWithCommas(constituentRatio),
          };
        },
      },
      {
        accessorKey: 'sales_transaction_count',
        header: 'salesReport.table.numberOfGuests',
        size: 8,
        textAlign: 'right',
        type: 'text',
        option(props) {
          const salesTransactionCount = props?.row?.original?.sales_transaction_count;
          return {
            value: formatNumberWithCommas(salesTransactionCount),
          };
        },
      },
      {
        accessorKey: 'sales_quantity',
        header: 'salesReport.table.score',
        size: 8,
        textAlign: 'right',
        type: 'text',
        option(props) {
          const salesQuantity = props?.row?.original?.sales_quantity;
          return {
            value: formatNumberWithCommas(salesQuantity),
          };
        },
      },
      {
        accessorKey: 'discount_amount',
        header: 'salesReport.table.discountAmount',
        size: 10,
        textAlign: 'right',
        type: 'text',
        option(props) {
          const discountAmount = props?.row?.original?.discount_amount;
          return {
            value: formatNumberWithCommas(discountAmount),
          };
        },
      },
    ],
    []
  );

  const handleGetReport = ({
    checkedStores,
    isReset = true,
  }: {
    checkedStores?: string[];
    isReset?: boolean;
  } = {}) => {
    // validate
    const startDate = _.toString(getValues('headerCondition.start_date'));
    const endDate = _.toString(getValues('headerCondition.end_date'));
    if (!startDate || _.toString(startDate) === 'Invalid Date' || !endDate || _.toString(endDate) === 'Invalid Date') {
      console.log('err validate date');
      return;
    }
    if (compareDate(startDate, endDate) === 1) {
      return;
    }

    let mdHierarchyLevelParam = null;
    const currentLevel = getValues('headerCondition.md_hierarchy_level');
    mdHierarchyLevelParam = currentLevel === 0 ? null : currentLevel;
    // preHierarchyCode for case search when click upper level
    const mdHierarchyCodeParam = watch('preHierarchyCode')?.slice(-1)[0]
      ? watch('preHierarchyCode')?.slice(-1)[0]
      : null;

    try {
      dispatch(
        getSaleReport({
          selected_store: checkedStores ? checkedStores?.[0] : selectedStores[0],
          start_date: toDateString(new Date(startDate), SERVER_DATE_FORMAT_COMPACT),
          end_date: toDateString(new Date(endDate), SERVER_DATE_FORMAT_COMPACT),
          report_type: Number(watch('report_type')),
          md_hierarchy_code: mdHierarchyCodeParam,
          md_hierarchy_level: mdHierarchyLevelParam,
        })
      )
        .unwrap()
        .then((res) => {
          const dataResponse = res.data?.data?.items || [];
          if (dataResponse[0]) {
            dataResponse[0].md_hierarchy_code = res.data?.data?.parent_code;
            dataResponse[0].description = res.data?.data?.parent_name;
          }
          setValue('dataReportList', dataResponse);
          // update parent code and parent name
          setValue('parent_code', res.data?.data?.parent_code);
          setValue('parent_name', res.data?.data?.parent_name);
          setIsEmptyTransactionCount(false);
          if (isReset) {
            // setValue('selectedRows', null);
            setValue('isGroupTable', defaultSaleReport.isGroupTable);
          }
          setIsTotalRow(true);
        })
        .catch(() => {});
    } catch (error) {
      console.log(error);
    }
  };

  const handleReportTypeChange = (value, index) => {
    setIsSwitchBackFromDailyReport(value.id === 0 ? true : false);
    setValue('headerCondition.output_type', Number(value.id) as any);
    // clear selected row
    setValue('selectedRows', null);
  };

  const handleChangeTableType = () => {
    setValue('isGroupTable', !isGroupTable);
    if (watch('isGroupTable')) {
      setValue('report_type', 0);
    } else {
      setValue('report_type', 1);
    }
    // handle search for case change table type
    // validate
    const startDate = _.toString(getValues('headerCondition.start_date'));
    const endDate = _.toString(getValues('headerCondition.end_date'));
    if (!startDate || _.toString(startDate) === 'Invalid Date' || !endDate || _.toString(endDate) === 'Invalid Date') {
      console.log('err validate date');
      return;
    }
    if (compareDate(startDate, endDate) === 1) {
      return;
    }

    let mdHierarchyCode = watch('preHierarchyCode')?.slice(-1)[0] || null;
    const currentLevel = getValues('headerCondition.md_hierarchy_level');
    let mdHierarchyLevelParam = currentLevel === 0 ? null : currentLevel;

    if (!watch('isGroupTable') && getValues('selectedRows')?.[0]?.index !== 0) {
      mdHierarchyLevelParam = Number(currentLevel) + 1;
      mdHierarchyCode = hierarchyCode;
    }
    // handle disable for mode view button when data selected have sales transaction count = 0
    if (
      Number(getValues('selectedRows')?.[0]?.original?.sales_transaction_count) === 0 ||
      !getValues('selectedRows')?.[0]?.original?.sales_transaction_count
    ) {
      setIsEmptyTransactionCount(true);
    } else {
      setIsEmptyTransactionCount(false);
    }

    try {
      dispatch(
        getSaleReport({
          selected_store: selectedStores[0],
          start_date: toDateString(new Date(startDate), SERVER_DATE_FORMAT_COMPACT),
          end_date: toDateString(new Date(endDate), SERVER_DATE_FORMAT_COMPACT),
          report_type: Number(watch('report_type')),
          md_hierarchy_code: mdHierarchyCode,
          md_hierarchy_level: mdHierarchyLevelParam,
        })
      )
        .unwrap()
        .then((res) => {
          const dataResponse = res.data?.data?.items || [];
          if (dataResponse[0]) {
            dataResponse[0].md_hierarchy_code = res.data?.data?.parent_code;
            dataResponse[0].description = res.data?.data?.parent_name;
          }
          setValue('dataReportList', dataResponse);
          // update parent code and parent name
          setValue('parent_code', res.data?.data?.parent_code);
          setValue('parent_name', res.data?.data?.parent_name);
          setIsTotalRow(true);
        })
        .catch(() => {});
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpperLevel = () => {
    const handleSearchUpperLevel = () => {
      let hierarchyLevel = getValues('headerCondition.md_hierarchy_level');
      if (hierarchyLevel === 0) return;
      hierarchyLevel -= 1;
      const preHierarchyCodeList = watch('preHierarchyCode')?.slice(0, -1);
      setValue('preHierarchyCode', [...preHierarchyCodeList]);
      setValue('headerCondition.md_hierarchy_level', hierarchyLevel);
      handleGetReport();
    };

    if (watch('headerCondition.md_hierarchy_level') !== 0 || watch('dataReportList')?.length === 0) {
      handleSearchUpperLevel();
    }
  };

  const handleLowerLevel = () => {
    if (!watch('selectedRows') || watch('selectedRows')?.length === 0 || watch('selectedRows')?.[0].index === 0) {
      dispatch(setError(localizeFormat('MSG_VAL_061')));
      return;
    }

    let hierarchyLevel = getValues('headerCondition.md_hierarchy_level');
    if (hierarchyLevel === 3) return;
    hierarchyLevel += 1;
    setValue('headerCondition.md_hierarchy_level', hierarchyLevel);
    const preHierarchyCodeList = watch('preHierarchyCode');
    setValue('preHierarchyCode', [...preHierarchyCodeList, hierarchyCode]);
    handleGetReport();
  };

  const handleClearData = (checkedStores) => {
    reset();
    setIsEmptyTransactionCount(false);
    setMsgErrStartDate(null);
    setIsFirstRender(false);
    setIsSwitchBackFromDailyReport(false);
    // auto search  if report_type =0
    if (!isFirstRender && watch('headerCondition.output_type') === 0) {
      handleGetReport({ checkedStores: checkedStores });
    }
    // focus first element
    setTimeout(() => {
      focusFirstElement(false);
    }, 350);
  };

  const focusFirstElement = (isExpand: boolean, isDirty?: boolean) => {
    if (isExpand || isDirty) return;
    const element: HTMLInputElement = document.querySelector(
      '.sales-report__condition-item .radio-button__input:not([disabled])'
    );
    element?.focus();
  };

  const handlePrint = () => {
    // validate
    const startDate = _.toString(getValues('headerCondition.start_date'));
    const endDate = _.toString(getValues('headerCondition.end_date'));
    if (!startDate || _.toString(startDate) === 'Invalid Date' || !endDate || _.toString(endDate) === 'Invalid Date') {
      console.log('err validate date');
      return;
    }
    if (compareDate(startDate, endDate) === 1) {
      dispatch(
        setErrorValidate({
          param: 'date',
          message: localizeFormat(
            'MSG_VAL_004',
            localizeString('salesReport.startDate'),
            localizeString('salesReport.endDate')
          ),
        })
      );
      return;
    }

    const currentLevel = getValues('headerCondition.md_hierarchy_level');
    let mdHierarchyLevelParam = currentLevel === 0 ? null : currentLevel;

    if (getValues('selectedRows')?.[0]?.index !== 0 && !watch('isGroupTable')) {
      mdHierarchyLevelParam = Number(currentLevel) + 1;
    }

    try {
      dispatch(
        exportSales({
          selected_store: selectedStores[0],
          start_date: toDateString(new Date(startDate), SERVER_DATE_FORMAT_COMPACT),
          end_date: toDateString(new Date(endDate), SERVER_DATE_FORMAT_COMPACT),
          report_type: Number(getValues('report_type')),
          output_type: getValues('headerCondition.output_type'),
          md_hierarchy_code: getValues('parent_code'),
          md_hierarchy_level: mdHierarchyLevelParam,
          language: langSystem,
        })
      )
        .unwrap()
        .then((res) => {
          const { blob, headers } = res;
          const contentDisposition = headers.get('Content-Disposition');
          const todayString = new Date(Date.now() + 9 * 60 * 60 * 1000)
            .toISOString()
            .replace(/[-T:]/g, '')
            .slice(0, 12);
          let fileName = `部門別速報${todayString}.pdf`;
          if (contentDisposition && contentDisposition.includes('filename')) {
            const match = contentDisposition.match(/filename\*=(?:UTF-8'')?(.+)/);
            if (match && match[1]) {
              fileName = decodeURIComponent(match[1]);
            }
          }
          saveAs(blob, fileName);
        })
        .catch(() => {});
    } catch (error) {
      console.log('err when print', error);
    }
  };

  // update data for date in header condition
  useEffect(() => {
    if (watch('headerCondition.output_type') === 0) {
      // update date condition
      setValue('headerCondition.start_date', new Date());
      setValue('headerCondition.end_date', new Date());
    } else {
      // update date condition
      setValue('headerCondition.start_date', yesterday);
      setValue('headerCondition.end_date', yesterday);
    }
  }, [watch('headerCondition.output_type')]);

  //handle disable button upper and lower level
  useEffect(() => {
    const dataReportList = watch('dataReportList') || [];
    const hierarchyLevel = watch('headerCondition.md_hierarchy_level');

    const isEmptyData = dataReportList.length === 0;

    // Default states
    setValue('disableButtonLowerLevel', isEmptyData || hierarchyLevel === 3 || isTotalRow);
    setValue('disableButtonUpperLevel', isEmptyData || hierarchyLevel === 0);

    // Special case: enable upper level when no data and hierarchy level is valid
    if (isEmptyData && hierarchyLevel > 0 && hierarchyLevel <= 3) {
      setValue('disableButtonUpperLevel', false);
    }
  }, [watch('dataReportList'), watch('selectedRows'), selectedStores]);

  useEffect(() => {
    // disable when date error
    const startDate = _.toString(getValues('headerCondition.start_date'));
    const endDate = _.toString(getValues('headerCondition.end_date'));
    if (!startDate || _.toString(startDate) === 'Invalid Date' || !endDate || _.toString(endDate) === 'Invalid Date') {
      setValue('isDateError', true);
    } else if (compareDate(startDate, endDate) === 1) {
      setValue('isDateError', true);
      setMsgErrStartDate(
        localizeFormat('MSG_VAL_004', localizeString('salesReport.startDate'), localizeString('salesReport.endDate'))
      );
    } else {
      setValue('isDateError', false);
      setMsgErrStartDate(null);
    }
  }, [watch('headerCondition.start_date'), watch('headerCondition.end_date')]);

  const renderTotalStores = () => {
    const parentCode = watch('parent_code') || '';
    const parentName = watch('parent_name') || '';
    const hierarchyLevel = Number(watch('headerCondition.md_hierarchy_level'));
    let name = OUTPUT_UNITS.find((unit) => unit.value === hierarchyLevel)?.name;
    if (getValues('selectedRows')?.[0]?.index === 0) {
      name = OUTPUT_UNITS.find((unit) => Number(unit.value) === Number(hierarchyLevel) - 1)?.name || '';
    }

    if (parentCode) {
      return `出力対象 \u00A0\u00A0\u00A0 ${parentCode} \u00A0\u00A0\u00A0 ${parentName} \u00A0\u00A0\u00A0 ( 階層レベル \u00A0 ${name} )`;
    }
    return '出力対象 ****** 店合計';
  };

  const handleCollapseSidebar = (isExpanded, stores) => {
    if (isFirstRender && !isExpanded && watch('headerCondition.output_type') === 0) {
      handleGetReport({ checkedStores: stores });
      setIsFirstRender(false);
    }
    focusFirstElement(false);
  };

  const handleRowClick = (row, index) => {
    setIsTotalRow(index === 0 ? true : false);
  };

  // Handle call search when role == user ( auto call because does not have multi store)
  useEffect(() => {
    if (userRole !== USER_ROLE.ADMIN && !isNullOrEmpty(selectedStores)) {
      handleGetReport();
    }
  }, [selectedStores]);

  return (
    <FormProvider {...formConfig}>
      <div className="sales-report">
        <div className="sales-report__header">
          <Header
            title="salesReport.headerTitle"
            csv={{
              disabled: true,
            }}
            printer={{ disabled: false, action: handlePrint }}
            hasESC={true}
            confirmBack={watch('dataReportList')?.length > 0}
          />
        </div>
        {/* side bar */}
        <SidebarStore
          onClickSearch={() => {}}
          onChangeCollapseExpand={(isExpanded, isDirty, stores) => {
            handleCollapseSidebar(isExpanded, stores);
          }}
          actionConfirm={(checkedStores) => {
            handleClearData(checkedStores);
          }}
          expanded={true}
          hasData={watch('dataReportList')?.length > 0}
          clearData={() => handleClearData}
        />
        <div className="sales-report__condition">
          <div className="sales-report__condition-item">
            <div className="wrap-radio">
              <p className="label-radio">
                {localizeString('salesReport.reportType')}
                <span className="require">*</span>
              </p>
              <ListRadioButton
                name="radio-sales-report"
                value={watch('headerCondition.output_type')}
                isVertical={false}
                listValues={reportTypeData.map((item, index) => ({
                  id: item.id,
                  textValue: `${item.name}`,
                }))}
                onChange={(value, index) => {
                  handleReportTypeChange(value, index);
                }}
              />
            </div>
            <TooltipDatePicker
              labelText="salesReport.startDate"
              initValue={new Date(watch('headerCondition.start_date'))}
              required={true}
              disabled={watch('headerCondition.output_type') === 0}
              onChange={(date) => {
                setValue('headerCondition.start_date', _.toString(date));
                setMsgErrStartDate(null);
              }}
              isShortDate={true}
              inputClassName="date-time-start-end__start-date"
              keyError={'salesReport.startDate'}
              checkEmpty={true}
              error={msgErrStartDate}
              minDate={getDateFromDateWithMonth(-3, getPreviousDate())}
              maxDate={getPreviousDate()}
            />
            <span className="space-date">~</span>
            <TooltipDatePicker
              labelText="salesReport.endDate"
              initValue={new Date(watch('headerCondition.end_date'))}
              disabled={watch('headerCondition.output_type') === 0}
              required={true}
              onChange={(date) => {
                setValue('headerCondition.end_date', _.toString(date));
              }}
              isShortDate={true}
              inputClassName="date-time-start-end__start-date"
              keyError={'salesReport.endDate'}
              checkEmpty={true}
              minDate={getDateFromDateWithMonth(-3, getPreviousDate())}
              maxDate={getPreviousDate()}
            />
            <Dropdown
              value={watch('headerCondition.md_hierarchy_level')}
              label={localizeString('salesReport.outputUnits')}
              hasBlankItem={true}
              items={OUTPUT_UNITS && OUTPUT_UNITS}
              disabled={true}
              isRequired={true}
            />
            <div className="wrap-button-search">
              <FuncKeyDirtyCheckButton
                className="search-btn"
                text="action.f12Search"
                funcKey={'F12'}
                funcKeyListener={selectedStores}
                disabled={
                  isNullOrEmpty(selectedStores[0]) ||
                  (watch('headerCondition.output_type') === 0 && !isSwitchBackFromDailyReport) ||
                  watch('isDateError')
                }
                onClickAction={() => {
                  // when click f12 auto reset
                  setValue('report_type', 0);
                  setValue('preHierarchyCode', []);
                  setValue('selectedRows', null);
                  setValue('headerCondition.md_hierarchy_level', 0);
                  handleGetReport();
                }}
              />
            </div>
          </div>
        </div>
        <div className="sales-report__button-action">
          <div className="wrap-btn-text">
            <ButtonPrimary
              onClick={handleChangeTableType}
              text={`salesReport.${isGroupTable ? 'groupButton' : 'timeButton'}`}
              disabled={
                (watch('dataReportList')?.length === 0 && !isEmptyTransactionCount) ||
                !watch('dataReportList') ||
                watch('isDateError')
              }
            />
            {!isGroupTable && <span className="total-stores">{renderTotalStores()}</span>}
          </div>
          {isGroupTable && (
            <div className="wrap-btn-expand">
              <ButtonPrimary
                icon={
                  <svg
                    style={{ transform: 'rotate(-90deg)' }}
                    width="22.5"
                    height="22.5"
                    viewBox="0 0 30 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M1.0925 13.8461H21.5233C22.0771 13.8461 22.3233 14.523 21.954 14.8922L16.0463 20.7999C15.6771 21.1692 15.6771 21.723 16.0463 22.0922L17.4002 23.4461C17.7694 23.8153 18.3233 23.8153 18.6925 23.4461L29.4617 12.6153C29.831 12.2461 29.831 11.6922 29.4617 11.323L18.6925 0.553779C18.3233 0.184548 17.7694 0.184548 17.4002 0.553779L16.1079 1.84609C15.7386 2.21532 15.7386 2.76916 16.1079 3.13839L22.0156 9.04609C22.3848 9.47686 22.1386 10.1538 21.5848 10.1538H1.15403C0.661726 10.1538 0.230957 10.523 0.230957 11.0153V12.8615C0.230957 13.3538 0.600188 13.8461 1.0925 13.8461Z"
                      fill="white"
                    />
                  </svg>
                }
                onClick={handleUpperLevel}
                disabled={watch('disableButtonUpperLevel') || watch('isDateError')}
                text="salesReport.collapsingButton"
              />
              <ButtonPrimary
                icon={
                  <svg
                    style={{ transform: 'rotate(90deg)' }}
                    width="22.5"
                    height="22.5"
                    viewBox="0 0 30 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M1.0925 13.8461H21.5233C22.0771 13.8461 22.3233 14.523 21.954 14.8922L16.0463 20.7999C15.6771 21.1692 15.6771 21.723 16.0463 22.0922L17.4002 23.4461C17.7694 23.8153 18.3233 23.8153 18.6925 23.4461L29.4617 12.6153C29.831 12.2461 29.831 11.6922 29.4617 11.323L18.6925 0.553779C18.3233 0.184548 17.7694 0.184548 17.4002 0.553779L16.1079 1.84609C15.7386 2.21532 15.7386 2.76916 16.1079 3.13839L22.0156 9.04609C22.3848 9.47686 22.1386 10.1538 21.5848 10.1538H1.15403C0.661726 10.1538 0.230957 10.523 0.230957 11.0153V12.8615C0.230957 13.3538 0.600188 13.8461 1.0925 13.8461Z"
                      fill="white"
                    />
                  </svg>
                }
                onClick={handleLowerLevel}
                disabled={watch('disableButtonLowerLevel') || watch('isDateError')}
                text="salesReport.expandingButton"
              />
            </div>
          )}
        </div>
        <div className="sales-report__table">
          {!isGroupTable ? (
            <div className="hours-table">
              <TableData<ISalesReport>
                columns={dayColumns}
                data={watch('dataReportList')}
                showNoData={watch('dataReportList')?.length === 0}
                rowConfig={addClassNameRow}
                enableSelectRow={false}
              />
            </div>
          ) : (
            <TableData<ISalesReport>
              columns={groupColumns}
              data={watch('dataReportList')}
              showNoData={watch('dataReportList')?.length === 0}
              onDoubleClick={() => {
                if (!watch('isDateError') && !isTotalRow) {
                  handleLowerLevel();
                }
              }}
              rowConfig={addClassNameRow}
              enableSelectRow={!watch('isDateError')}
              autoSelectedRow={0}
              onClickRow={(row, index) => handleRowClick(row, index)}
            />
          )}
        </div>
        <div className="sales-report-footer">
          <BottomButton leftPosition="20px" />
        </div>
      </div>
    </FormProvider>
  );
};

export default SalesReport;
