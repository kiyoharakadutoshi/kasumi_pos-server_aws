import React, { useEffect, useMemo, useState } from 'react';
import { FormProvider, Resolver, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { date, number, object, string, ValidationError } from 'yup';
import _ from 'lodash';
import { saveAs } from 'file-saver';

// Component
import Header from 'app/components/header/header';
import SidebarStore from 'app/components/sidebar-store-default/sidebar-store/sidebar-store';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import FuncKeyDirtyCheckButton from 'app/components/button/func-key-dirty-check/func-key-dirty-check-button';
import PopoverText, { PopoverTextControl } from 'app/components/popover/popover';
import Dropdown from 'app/components/dropdown/dropdown';
import TableData, { TableColumnDef } from 'app/components/table/table-data/table-data';
import RadioControl from '@/components/control-form/radio-control';
import TooltipDatePickerControl from '@/components/date-picker/tooltip-date-picker/tooltip-date-picker-control';
import BottomButton from 'app/components/bottom-button/bottom-button';
import TooltipNumberInputTextControl from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';

// Redux
import { useAppDispatch, useAppSelector } from '@/config/store';

// Hooks
import { elementChangeKeyListener } from '@/hooks/keyboard-hook';

// Utils
import { compareDate, getDateFromDateWithMonth, getPreviousDate, toDateString } from '@/helpers/date-utils';
import { SERVER_DATE_FORMAT_COMPACT } from '@/constants/date-constants';
import { focusElementByName, formatNumber, isNullOrEmpty, localizeFormat, localizeString } from 'app/helpers/utils';

// Modules
import HierarchyLevelModal from './hierarchy-level-modal';
import { transformData } from './transformData';

// API
import { NOT_FOUND_CODE } from '@/constants/api-constants';
import { IHierarchyLevel, IProductReport } from './product-report-interface';
import { exportSalesItem, getSalesItemReport } from '@/services/sales-item-report-service';
import { suggestProduct } from '@/services/product-service';
import { getHierarchyLevel } from '@/services/hierarchy-level-service';

// Styles
import './styles.scss';

const CATEGORY = [
  {
    name: '部門',
    value: 1,
    code: '1',
  },
  {
    name: '品群',
    value: 2,
    code: '2',
  },
  {
    name: '品種',
    value: 3,
    code: '3',
  },
  {
    name: '分類',
    value: 4,
    code: '4',
  },
];

interface FormData {
  searchCondition?: {
    businessType: number;
    exportUnit: number;
    reportStartDate: Date;
    reportEndDate: Date;
    limitRecord: number;
    sortBy: number;
    level: number;
    codeLevel: string;
    codeLevelName: string;
    productCode: string;
    productCodeName: string;
    pluCode: string;
    pluCodeName: string;
  };

  salesData?: IProductReport[];
  productHierarchies?: IHierarchyLevel[];
}

const DEFAULT_DATA: FormData = {
  searchCondition: {
    businessType: 0,
    exportUnit: 0,
    reportStartDate: new Date(),
    reportEndDate: new Date(),
    limitRecord: 3000,
    sortBy: 0,
    level: 1,
    codeLevel: '',
    codeLevelName: '',
    productCode: '',
    productCodeName: '',
    pluCode: '',
    pluCodeName: '',
  },

  salesData: [],
  productHierarchies: [],
};

const MAPPING_ERROR = {
  reportStartDate: 'productReport.mappingError.reportStartDate',
  reportEndDate: 'productReport.mappingError.reportEndDate',
  limitRecord: 'productReport.mappingError.limitRecord',
  codeLevel: 'productReport.mappingError.codeLevel',
  productCode: 'productReport.mappingError.productCode',
  pluCode: 'productReport.mappingError.pluCode',
};

export const ProductReport = () => {
  const dispatch = useAppDispatch();
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IHierarchyLevel>(null);
  const [businessTypeBreakingNews, setBusinessTypeBreakingNews] = useState(true);
  const [isLevelOne, setIsLevelOne] = React.useState(true);
  const [isStatusSearch, setIsStatusSearch] = React.useState(false);
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];
  const [msgErrStartDate, setMsgErrStartDate] = useState(null);
  const langSystem = useAppSelector((state) => state.locale.currentLocale);

  const validationSchema = object<FormData>().shape({
    reportStartDate: date()
      .typeError('MSG_VAL_016')
      .test(
        'is-before-end-date',
        localizeFormat(
          'MSG_VAL_004',
          localizeString('productReport.mappingError.reportStartDate'),
          localizeString('productReport.mappingError.reportEndDate')
        ),
        function (value) {
          if (!value || !watch('searchCondition.reportEndDate')) return true;
          const startDate = new Date(value);
          const endDate = new Date(watch('searchCondition.reportEndDate'));
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          return startDate <= endDate;
        }
      ),
    reportEndDate: date().typeError('MSG_VAL_016'),
    limitRecord: number()
      .required('MSG_VAL_001')
      .min(1, localizeFormat('MSG_VAL_059', localizeString('productReport.mappingError.limitRecord'), '1', '99,999'))
      .max(
        99999,
        localizeFormat('MSG_VAL_059', localizeString('productReport.mappingError.limitRecord'), '1', '99,999')
      ),
    codeLevel: string().required('MSG_VAL_001'),
  });

  const validationSchema1 = object<FormData>().shape({
    reportStartDate: date()
      .typeError('MSG_VAL_016')
      .test(
        'is-before-end-date',
        localizeFormat(
          'MSG_VAL_004',
          localizeString('productReport.mappingError.reportStartDate'),
          localizeString('productReport.mappingError.reportEndDate')
        ),
        function (value) {
          if (!value || !watch('searchCondition.reportEndDate')) return true;
          const startDate = new Date(value);
          const endDate = new Date(watch('searchCondition.reportEndDate'));
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          return startDate <= endDate;
        }
      ),
    reportEndDate: date().typeError('MSG_VAL_016'),
    limitRecord: number()
      .required('MSG_VAL_001')
      .min(1, localizeFormat('MSG_VAL_059', localizeString('productReport.mappingError.limitRecord'), '1', '99,999'))
      .max(
        99999,
        localizeFormat('MSG_VAL_059', localizeString('productReport.mappingError.limitRecord'), '1', '99,999')
      ),
    productCode: string()
      .nullable()
      .test(
        'both-productCode-pluCode-empty',
        localizeFormat('MSG_VAL_058', MAPPING_ERROR.productCode, MAPPING_ERROR.pluCode),
        function (value) {
          const pluCode = watch('searchCondition.pluCode');
          return !!value || !!pluCode;
        }
      ),
    pluCode: string()
      .nullable()
      .test(
        'both-productCode-pluCode-empty',
        localizeFormat('MSG_VAL_058', MAPPING_ERROR.productCode, MAPPING_ERROR.pluCode),
        function (value) {
          const productCode = watch('searchCondition.productCode');
          return !!productCode || !!value;
        }
      ),
  });

  const formConfig = useForm<FormData>({
    defaultValues: DEFAULT_DATA,
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
  });
  const { getValues, setValue, setError, reset, watch } = formConfig;

  // Focus first input
  const focusInput = () => {
    setTimeout(() => {
      focusElementByName(localizeString('productReport.conditionSearchLabel.breakingNews') + '0');
    }, 500);
  };

  const dataTable: IProductReport[] = useMemo(() => getValues('salesData') ?? null, [watch('salesData')]);

  const isShowExportByCategory = useMemo(() => {
    return watch('searchCondition.exportUnit') === 0;
  }, [watch('searchCondition.exportUnit')]);

  elementChangeKeyListener(isShowExportByCategory);

  // Handle Change Business type
  const handleChangeBusinessType = () => {
    const today = new Date();
    if (watch('searchCondition.businessType') === 0) {
      setBusinessTypeBreakingNews(true);
    } else {
      setBusinessTypeBreakingNews(false);
      today.setDate(today.getDate() - 1);
    }

    setValue('searchCondition.reportStartDate', today);
    setValue('searchCondition.reportEndDate', today);
    setError('searchCondition.reportStartDate', null);
    setError('searchCondition.reportEndDate', null);
  };

  // Handle Change Export unit
  const handleChangeExportUnit = () => {
    setError('searchCondition.codeLevel', null);
    setError('searchCondition.productCode', null);
    setError('searchCondition.pluCode', null);
  };

  // Handle change store
  useEffect(() => {
    handleClearData();
  }, [selectedStores[0]]);

  useEffect(() => {
    const startDate = _.toString(getValues('searchCondition.reportStartDate'));
    const endDate = _.toString(getValues('searchCondition.reportEndDate'));
    if (!startDate || _.toString(startDate) === 'Invalid Date' || !endDate || _.toString(endDate) === 'Invalid Date') {
      return;
    } else if (compareDate(startDate, endDate) === 1) {
      setMsgErrStartDate(
        localizeFormat(
          'MSG_VAL_004',
          localizeString('productReport.mappingError.reportStartDate'),
          localizeString('productReport.mappingError.reportEndDate')
        )
      );
    } else {
      setMsgErrStartDate(null);
    }
  }, [watch('searchCondition.reportStartDate'), watch('searchCondition.reportEndDate')]);

  const columns = React.useMemo<TableColumnDef<IProductReport>[]>(
    () => [
      {
        id: 'only_SC12_no',
        accessorKey: 'rank',
        header: 'productReport.table.no',
        size: 4,
      },
      {
        id: 'only_SC12_productCode',
        accessorKey: 'my_company_code',
        header: 'productReport.table.productCode',
        size: 7,
        type: 'text',
        textAlign: 'left',
        option(props) {
          const myCompanyCode = props?.row?.original?.my_company_code;
          return {
            value: myCompanyCode?.slice(-8),
          };
        },
      },
      {
        id: 'only_SC12_pluCode',
        accessorKey: 'item_code',
        header: 'productReport.table.pluCode',
        size: 11,
        type: 'text',
        textAlign: 'left',
      },
      {
        id: 'only_SC12_name',
        accessorKey: 'description',
        header: 'productReport.table.name',
        size: 14,
        type: 'text',
        textAlign: 'left',
      },
      {
        id: 'only_SC12_avgPrice',
        accessorKey: 'average_price',
        formatNumber: true,
        header: 'productReport.table.avgPrice',
        type: 'text',
        size: 6,
        textAlign: 'right',
      },
      {
        id: 'revenue',
        header: 'productReport.table.revenue',
        columns: [
          {
            accessorKey: 'sales_amount',
            header: 'productReport.table.amount',
            size: 5.75,
            textAlign: 'right',
            cell(info) {
              return (
                <PopoverText
                  lineHeight={null}
                  textAlign={'center'}
                  text={formatNumber(info?.row?.original?.sales_amount)}
                  lineLimit={1}
                  height={null}
                />
              );
            },
          },
          {
            accessorKey: 'sales_quantity',
            header: 'productReport.table.points',
            size: 4.75,
            textAlign: 'right',
            cell(info) {
              return formatNumber(info?.row?.original?.sales_quantity);
            },
          },
        ],
        size: 10.5,
      },
      {
        id: 'specialPrice',
        header: 'productReport.table.specialPrice',
        columns: [
          {
            accessorKey: 'special_price_amount',
            header: 'productReport.table.amount',
            size: 5.75,
            textAlign: 'right',
            cell(info) {
              return (
                <PopoverText
                  lineHeight={null}
                  textAlign={'center'}
                  text={formatNumber(info?.row?.original?.special_price_amount)}
                  lineLimit={1}
                  height={null}
                />
              );
            },
          },
          {
            accessorKey: 'special_price_quantity',
            header: 'productReport.table.points',
            size: 4.75,
            textAlign: 'right',
            cell(info) {
              return formatNumber(info?.row?.original?.special_price_quantity);
            },
          },
        ],
        size: 10.5,
      },
      {
        id: 'mixMatch',
        header: 'productReport.table.mixMatch',
        columns: [
          {
            accessorKey: 'combination_price_amount',
            header: 'productReport.table.amount',
            size: 5.75,
            textAlign: 'right',
            cell(info) {
              return (
                <PopoverText
                  lineHeight={null}
                  textAlign={'center'}
                  text={formatNumber(info?.row?.original?.combination_price_amount)}
                  lineLimit={1}
                  height={null}
                />
              );
            },
          },
          {
            accessorKey: 'combination_price_quantity',
            header: 'productReport.table.points',
            size: 4.75,
            textAlign: 'right',
            cell(info) {
              return formatNumber(info?.row?.original?.combination_price_quantity);
            },
          },
        ],
        size: 10.5,
      },
      {
        id: 'set',
        header: 'productReport.table.set',
        columns: [
          {
            accessorKey: 'setmatch_price_amount',
            header: 'productReport.table.amount',
            size: 5.75,
            textAlign: 'right',
            cell(info) {
              return (
                <PopoverText
                  lineHeight={null}
                  textAlign={'center'}
                  text={formatNumber(info?.row?.original?.setmatch_price_amount)}
                  lineLimit={1}
                  height={null}
                />
              );
            },
          },
          {
            accessorKey: 'setmatch_price_quantity',
            header: 'productReport.table.points',
            size: 4.75,
            textAlign: 'right',
            cell(info) {
              return formatNumber(info?.row?.original?.setmatch_price_quantity);
            },
          },
        ],
        size: 10.5,
      },
      {
        id: 'discount',
        header: 'productReport.table.discount',
        columns: [
          {
            accessorKey: 'discount_amount',
            header: 'productReport.table.amount',
            size: 5.75,
            textAlign: 'right',
            cell(info) {
              return (
                <PopoverText
                  lineHeight={null}
                  textAlign={'center'}
                  text={formatNumber(info?.row?.original?.discount_amount)}
                  lineLimit={1}
                  height={null}
                />
              );
            },
          },
          {
            accessorKey: 'discount_quantity',
            header: 'productReport.table.points',
            size: 4.75,
            textAlign: 'right',
            cell(info) {
              return formatNumber(info?.row?.original?.discount_quantity);
            },
          },
        ],
        size: 10.5,
      },
      {
        id: 'only_SC12_lastSaleTime',
        accessorKey: 'transaction_time',
        header: 'productReport.table.lastSaleTime',
        type: 'text',
        size: 5.5,
        textAlign: 'left',
      },
    ],
    []
  );

  // Handle select item on modal
  useEffect(() => {
    if (selectedItem) {
      let level = Number(0);
      let codeLevel = '';
      if (selectedItem.code_level_one) {
        level = 1;
        codeLevel = selectedItem.code_level_one;
      } else if (selectedItem.code_level_two) {
        level = 2;
        codeLevel = selectedItem.code_level_two;
      } else if (selectedItem.code_level_three?.length > 0) {
        level = 3;
        codeLevel = selectedItem.code_level_three;
      } else if (selectedItem.code_level_four?.length > 0) {
        level = 4;
        codeLevel = selectedItem.code_level_four;
      }

      // Clear error and set value to form data
      setError('searchCondition.codeLevel', null);
      setError('searchCondition.codeLevelName', null);
      setValue('searchCondition.level', level);
      setValue('searchCondition.codeLevel', codeLevel);
      setValue('searchCondition.codeLevelName', selectedItem.description);
      setIsLevelOne(level > 1 ? false : true);
    }
  }, [selectedItem]);

  // F12 Search
  const handleConfirmAction = async () => {
    const { exportUnit, reportStartDate, reportEndDate, limitRecord, sortBy, level, codeLevel, productCode, pluCode } =
      getValues('searchCondition');

    // Reset focus
    const businessType = watch('searchCondition.businessType');
    setTimeout(() => {
      focusElementByName(
        businessType === 0
          ? localizeString('productReport.conditionSearchLabel.breakingNews') + '0'
          : localizeString('productReport.conditionSearchLabel.dailyReport') + '1'
      );
    }, 10);

    setError('searchCondition.reportStartDate', null);
    setError('searchCondition.reportEndDate', null);
    setError('searchCondition.limitRecord', null);
    if (exportUnit) {
      // Start date, end date, limit record, product code, plu code
      setError('searchCondition.productCode', null);
      setError('searchCondition.pluCode', null);
    } else {
      // Start date, end date, limit record, code level
      setError('searchCondition.codeLevel', null);
    }

    try {
      if (exportUnit === 0) {
        await validationSchema.validate(
          {
            reportStartDate,
            reportEndDate,
            limitRecord,
            codeLevel,
          },
          { abortEarly: false }
        );
      } else {
        await validationSchema1.validate(
          {
            reportStartDate,
            reportEndDate,
            limitRecord,
            productCode,
            pluCode,
          },
          { abortEarly: false }
        );
      }

      dispatch(
        getSalesItemReport({
          selected_store: selectedStores[0],
          start_date: toDateString(new Date(reportStartDate), SERVER_DATE_FORMAT_COMPACT),
          end_date: toDateString(new Date(reportEndDate), SERVER_DATE_FORMAT_COMPACT),
          output_type: exportUnit,
          md_hierarchy_level: exportUnit === 0 ? level : null,
          md_hierarchy_code: exportUnit === 0 ? codeLevel.padStart(level > 1 ? 4 : 2, '0') : null,
          department_code: exportUnit === 1 && !isNullOrEmpty(productCode) ? productCode.padStart(2, '0') : null,
          item_code: exportUnit === 1 && !isNullOrEmpty(pluCode) ? pluCode.padStart(13, '0') : null,
          sort_column: sortBy === 0 ? 'sales_amount' : 'sales_quantity',
          limit: limitRecord,
        })
      )
        .unwrap()
        .then((res) => {
          setValue(
            'salesData',
            res.data?.data?.items.map((itemSales, index) => ({
              ...itemSales,
              rank: index + 1,
            }))
          );

          setIsStatusSearch(true);
        })
        .catch(() => {});

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

  // Suggest Product code AP1507
  const suggestCode = () => {
    const level = getValues('searchCondition.level');
    const codeLevel = getValues('searchCondition.codeLevel');
    const productCode = getValues('searchCondition.productCode');

    if (isShowExportByCategory && isNullOrEmpty(codeLevel)) {
      // If you have not entered or entered but then deleted, you need to delete codeLevel and codeLevelName
      setValue('searchCondition.codeLevel', null);
      setValue('searchCondition.codeLevelName', null);
      setError('searchCondition.codeLevelName', null);
      return;
    }

    if (!isShowExportByCategory && isNullOrEmpty(productCode)) {
      // If you have not entered or entered but then deleted, you need to delete productCode and productCodeName
      setValue('searchCondition.productCode', null);
      setValue('searchCondition.productCodeName', null);
      setError('searchCondition.productCodeName', null);
      return;
    }

    const filterCode = isShowExportByCategory ? codeLevel : productCode;
    const filterLevel = isShowExportByCategory ? level : 1;

    dispatch(
      getHierarchyLevel({
        store_code: selectedStores[0],
        level: filterLevel,
        filter_code: _.toString(filterCode),
      })
    )
      .unwrap()
      .then((res) => {
        const hierarchyLevelData = res?.data?.data;

        // Suggest product code
        if (!isShowExportByCategory) {
          if (hierarchyLevelData.total_count === 0) {
            setError('searchCondition.productCodeName', {
              message: localizeString('MSG_ERR_001'),
            });
            return;
          }

          setError('searchCondition.productCodeName', null);
          setValue('searchCondition.productCodeName', hierarchyLevelData?.items[0]?.description_level_one);
          return;
        }

        // Suggest group product
        if (hierarchyLevelData.total_count === 0) {
          setError('searchCondition.codeLevelName', {
            message: localizeString('MSG_ERR_001'),
          });
          return;
        }
        let codeLevelName = '';
        switch (level) {
          case 1:
            codeLevelName = hierarchyLevelData?.items[0]?.description_level_one;
            break;
          case 2:
            codeLevelName = hierarchyLevelData?.items[0]?.description_level_two;
            break;
          case 3:
            codeLevelName = hierarchyLevelData?.items[0]?.description_level_three;
            break;
          case 4:
            codeLevelName = hierarchyLevelData?.items[0]?.description_level_four;
            break;
          default:
            break;
        }
        setError('searchCondition.codeLevelName', null);
        setValue('searchCondition.codeLevelName', codeLevelName);
      })
      .catch(() => {});
  };

  // Suggest PLU code AP1506
  const suggestPluCode = (value: string) => {
    if (isNullOrEmpty(value)) {
      // If you have not entered or entered but then deleted, you need to delete pluCode and pluCodeName
      setValue('searchCondition.pluCode', null);
      setValue('searchCondition.pluCodeName', null);
      setError('searchCondition.pluCodeName', null);
      return;
    }

    dispatch(
      suggestProduct({
        selected_store: selectedStores[0],
        plu: value,
      })
    )
      .unwrap()
      .then((res) => {
        const data = res.data.data;
        if (isNullOrEmpty(data)) {
          setError('searchCondition.pluCodeName', {
            message: localizeString('MSG_ERR_001'),
          });
          return;
        }
        setError('searchCondition.pluCodeName', null);
        setValue('searchCondition.pluCodeName', data.description);
      })
      .catch((error) => {
        if (error.response?.status === NOT_FOUND_CODE) {
          setError('searchCondition.pluCodeName', {
            message: localizeString(error.response?.data.errors[0]),
          });
        }
      });
  };

  // Search group product AP1507
  const handleGetListProductHierachy = () => {
    dispatch(
      getHierarchyLevel({
        store_code: selectedStores[0],
      })
    )
      .unwrap()
      .then((res) => {
        const hierarchyLevelData = res?.data?.data;
        if (hierarchyLevelData && hierarchyLevelData?.items) {
          setValue('productHierarchies', transformData(hierarchyLevelData?.items) || []);
        }
      })
      .then(() => {
        setOpenModal(true);
      })
      .catch(() => {});
  };

  // Print AP1202
  const handlePrint = async () => {
    const { exportUnit, reportStartDate, reportEndDate, limitRecord, sortBy, level, codeLevel, productCode, pluCode } =
      getValues('searchCondition');

    setError('searchCondition.reportStartDate', null);
    setError('searchCondition.reportEndDate', null);
    setError('searchCondition.limitRecord', null);
    if (exportUnit) {
      // Start date, end date, limit record, product code, plu code
      setError('searchCondition.productCode', null);
      setError('searchCondition.pluCode', null);
    } else {
      // Start date, end date, limit record, code level
      setError('searchCondition.codeLevel', null);
    }

    try {
      if (exportUnit === 0) {
        await validationSchema.validate(
          {
            reportStartDate,
            reportEndDate,
            limitRecord,
            codeLevel,
          },
          { abortEarly: false }
        );
      } else {
        await validationSchema1.validate(
          {
            reportStartDate,
            reportEndDate,
            limitRecord,
            productCode,
            pluCode,
          },
          { abortEarly: false }
        );
      }

      dispatch(
        exportSalesItem({
          selected_store: selectedStores[0],
          start_date: toDateString(new Date(reportStartDate), SERVER_DATE_FORMAT_COMPACT),
          end_date: toDateString(new Date(reportEndDate), SERVER_DATE_FORMAT_COMPACT),
          output_type: exportUnit,
          md_hierarchy_level: exportUnit === 0 ? level : null,
          md_hierarchy_code: exportUnit === 0 ? codeLevel : null,
          department_code: exportUnit === 1 && !isNullOrEmpty(productCode) ? productCode : null,
          item_code: exportUnit === 1 && !isNullOrEmpty(pluCode) ? pluCode : null,
          sort_column: sortBy === 0 ? 'sales_amount' : 'sales_quantity',
          limit: limitRecord,
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
          let fileName = `単品売上速報__${todayString}.pdf`;
          if (contentDisposition && contentDisposition.includes('filename')) {
            const match = contentDisposition.match(/filename\*=(?:UTF-8'')?(.+)/);
            if (match && match[1]) {
              fileName = decodeURIComponent(match[1]);
            }
          }
          saveAs(blob, fileName);
          const businessType = watch('searchCondition.businessType');
          setTimeout(() => {
            focusElementByName(
              businessType === 0
                ? localizeString('productReport.conditionSearchLabel.breakingNews') + '0'
                : localizeString('productReport.conditionSearchLabel.dailyReport') + '1'
            );
          }, 50);
        })
        .catch(() => {});
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

  const handleClearData = () => {
    reset();
    setOpenModal(false);
    setSelectedItem(null);
    setBusinessTypeBreakingNews(true);
    setIsLevelOne(true);
    setIsStatusSearch(false);
    setMsgErrStartDate(null);
  };

  return (
    <FormProvider {...formConfig}>
      <div className="product-report">
        <Header
          hasESC={true}
          title="productReport.title"
          csv={{ disabled: true }}
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          printer={{ disabled: false, action: handlePrint }}
          hiddenTextESC={true}
        />
        {openModal && <HierarchyLevelModal setOpenModal={setOpenModal} selectedItem={setSelectedItem} />}

        <div className={'product-report__main'}>
          {/* Sidebar */}
          <SidebarStore
            onClickSearch={() => {}}
            expanded={true}
            onChangeCollapseExpand={focusInput}
            clearData={handleClearData}
            hasData={watch('salesData')?.length > 0}
            actionConfirm={handleClearData}
          />

          {/* Input search */}
          <div className={'product-report__search'}>
            <div className={'product-report__search-fixed'}>
              <div className={'product-report__search-section-1'}>
                <div className={`product-report__business-type left`}>
                  <div className={`product-report__business-type-radio`}>
                    <span className="product-report__lablel">
                      {localizeString('productReport.conditionSearchLabel.businessType')}
                      <span className="product-report__label-mark">*</span>
                    </span>
                    <RadioControl
                      isVertical={false}
                      name="searchCondition.businessType"
                      listValues={[
                        {
                          id: 0,
                          textValue: localizeString('productReport.conditionSearchLabel.breakingNews'),
                          disabled: false,
                        },
                        {
                          id: 1,
                          textValue: localizeString('productReport.conditionSearchLabel.dailyReport'),
                          disabled: false,
                        },
                      ]}
                      value={watch('searchCondition.businessType')}
                      onChange={handleChangeBusinessType}
                    />
                  </div>

                  <div className={'product-report__business-type__start-end-date'}>
                    <TooltipDatePickerControl
                      required
                      inputClassName="date-time-start-end__start-date"
                      name="searchCondition.reportStartDate"
                      labelText="productReport.conditionSearchLabel.reportStartDate"
                      disabled={businessTypeBreakingNews}
                      checkEmpty={true}
                      keyError={'productReport.conditionSearchLabel.reportStartDate'}
                      errorPlacement="bottom-end"
                      minDate={businessTypeBreakingNews ? null : getDateFromDateWithMonth(-3, getPreviousDate())}
                      maxDate={businessTypeBreakingNews ? null : getPreviousDate()}
                      error={msgErrStartDate}
                    />
                    <span> ～ </span>
                    <TooltipDatePickerControl
                      required
                      inputClassName="date-time-start-end__start-date"
                      name="searchCondition.reportEndDate"
                      labelText="productReport.conditionSearchLabel.reportEndDate"
                      disabled={businessTypeBreakingNews}
                      checkEmpty={true}
                      keyError={'productReport.conditionSearchLabel.reportEndDate'}
                      errorPlacement="bottom-end"
                      minDate={businessTypeBreakingNews ? null : getDateFromDateWithMonth(-3, getPreviousDate())}
                      maxDate={businessTypeBreakingNews ? null : getPreviousDate()}
                    />
                  </div>
                  <div className={'product-report__record-number'}>
                    <TooltipNumberInputTextControl
                      name="searchCondition.limitRecord"
                      type={'number'}
                      maxLength={5}
                      thousandSeparator={','}
                      required={true}
                      label={localizeString('productReport.conditionSearchLabel.limitRecord')}
                      errorPlacement="left-end"
                    />
                  </div>
                </div>
                <div className={`product-report__export-unit left`}>
                  <div className={`product-report__export-unit-radio`}>
                    <span className="product-report__lablel">
                      {localizeString('productReport.conditionSearchLabel.exportUnit')}
                      <span className="product-report__label-mark">*</span>
                    </span>
                    <RadioControl
                      isVertical={false}
                      name="searchCondition.exportUnit"
                      listValues={[
                        {
                          id: 0,
                          textValue: localizeString('productReport.conditionSearchLabel.categorySpecification'),
                          disabled: false,
                        },
                        {
                          id: 1,
                          textValue: localizeString('productReport.conditionSearchLabel.productSpecification'),
                          disabled: false,
                        },
                      ]}
                      value={watch('searchCondition.exportUnit')}
                      onChange={handleChangeExportUnit}
                    />
                  </div>
                  <div className={'product-report__sort-by'}>
                    <span className="product-report__lablel">
                      {localizeString('productReport.conditionSearchLabel.sortBy')}
                      <span className="product-report__label-mark">*</span>
                    </span>
                    <RadioControl
                      isVertical={false}
                      name="searchCondition.sortBy"
                      listValues={[
                        {
                          id: 0,
                          textValue: localizeString('productReport.table.amount'),
                          disabled: false,
                        },
                        {
                          id: 1,
                          textValue: localizeString('productReport.table.points'),
                          disabled: false,
                        },
                      ]}
                      value={watch('searchCondition.sortBy')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={'product-report__search-dynamic'}>
              <div className={'product-report__category-wrapper'}>
                <div className={`${isShowExportByCategory ? 'product-report__show-export-category' : 'hidden'}`}>
                  <div className={'product-report__category'}>
                    <Dropdown
                      value={Number(watch('searchCondition.level'))}
                      label={localizeString('productReport.conditionSearchLabel.level')}
                      isRequired={true}
                      hasBlankItem={false}
                      items={CATEGORY}
                      style={{
                        display: isShowExportByCategory ? 'flex' : 'none',
                      }}
                      onChange={(item) => {
                        setIsLevelOne(Number(item.value) > 1 ? false : true);
                        setValue('searchCondition.level', Number(item.value));
                        setValue('searchCondition.codeLevel', null);
                      }}
                    />
                  </div>
                  <div className={'product-report__category-code-group'}>
                    <TooltipNumberInputTextControl
                      name="searchCondition.codeLevel"
                      maxLength={isLevelOne ? 2 : 4}
                      addZero={true}
                      required={true}
                      focusOut={suggestCode}
                      errorPlacement="right"
                      style={{
                        display: isShowExportByCategory ? 'flex' : 'none',
                      }}
                    />
                  </div>
                  <ButtonPrimary
                    text={localizeString('productReport.conditionSearchLabel.search')}
                    onClick={handleGetListProductHierachy}
                    styles={{
                      display: isShowExportByCategory ? 'flex' : 'none',
                    }}
                  />
                  <PopoverTextControl
                    name="searchCondition.codeLevelName"
                    className="product-report__group-code-name"
                  />
                </div>
                <div className={`${isShowExportByCategory ? 'hidden' : 'product-report__show-export-product'}`}>
                  <div className={`export-by-product left`}>
                    <TooltipNumberInputTextControl
                      name="searchCondition.productCode"
                      className="product-report__code-group"
                      label={localizeString('productReport.conditionSearchLabel.productCode')}
                      maxLength={2}
                      addZero={true}
                      focusOut={suggestCode}
                      onChange={(value) => {
                        // Clear plu code, plu code name
                        if (!isNullOrEmpty(value)) {
                          setValue('searchCondition.pluCode', null);
                          setValue('searchCondition.pluCodeName', null);
                          setError('searchCondition.pluCodeName', null);
                        }
                      }}
                      style={{
                        display: isShowExportByCategory ? 'none' : 'flex',
                      }}
                    />
                    <PopoverTextControl name="searchCondition.productCodeName" className="product-report__group-name" />
                  </div>
                  <div className={`export-by-product`}>
                    <TooltipNumberInputTextControl
                      name="searchCondition.pluCode"
                      className="product-report__plu-code"
                      label={localizeString('productReport.table.pluCode')}
                      maxLength={13}
                      addZero={true}
                      focusOut={suggestPluCode}
                      onChange={(value) => {
                        // Clear product code, product code name
                        if (!isNullOrEmpty(value)) {
                          setValue('searchCondition.productCode', null);
                          setValue('searchCondition.productCodeName', null);
                          setError('searchCondition.productCode', null);
                          setError('searchCondition.productCodeName', null);
                        }
                      }}
                      style={{
                        display: isShowExportByCategory ? 'none' : 'flex',
                      }}
                    />
                    <PopoverTextControl name="searchCondition.pluCodeName" className="product-report__plu-code-name" />
                  </div>
                </div>
                <div className={'product-report-button'}>
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
            </div>
          </div>

          {/* Table */}
          <div className="product-report__table">
            <TableData<IProductReport>
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

export default ProductReport;
