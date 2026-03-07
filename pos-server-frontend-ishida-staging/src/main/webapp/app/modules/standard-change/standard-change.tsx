import FuncKeyDirtyCheckButton from '@/components/button/func-key-dirty-check/func-key-dirty-check-button';
import TooltipDatePickerControl from '@/components/date-picker/tooltip-date-picker/tooltip-date-picker-control';
import TooltipInputTextControl from '@/components/input-text/input-text-control';
import TooltipNumberInputTextControl from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import { OperationType } from '@/components/table/table-common';
import TableData, { TableColumnDef } from '@/components/table/table-data/table-data';
import { useAppDispatch, useAppSelector } from '@/config/store';
import { NOT_FOUND_CODE } from '@/constants/api-constants';
import { STATUS, USER_ROLE } from '@/constants/constants';
import { convertDateServer, getNextDate } from '@/helpers/date-utils';
import {
  createStandardPriceUpdate,
  IStandardChange,
  IStandardChangeUpdate,
} from '@/modules/standard-change/interface-standard-change';
import { setError as setErrorReducer } from '@/reducers/error';
import { getHierarchyLevel } from '@/services/hierarchy-level-service';
import { suggestProduct } from '@/services/product-service';
import {
  getStandardPriceExport,
  getStandardPriceHistory,
  postStandardPriceList,
} from '@/services/standard-price-history-service';
import { PagingBottomButtonControl } from 'app/components/bottom-button/pagging-bottom-button/paging-bottom-button';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import Header from 'app/components/header/header';
import SidebarStore from 'app/components/sidebar-store-default/sidebar-store/sidebar-store';
import { MAX_LENGTH } from 'app/constants/constants';
import {
  focusElementByName,
  getGroupCode,
  getProductCode,
  isEqual,
  isEqualObject,
  isNullOrEmpty,
  localizeFormat,
  localizeString,
} from 'app/helpers/utils';
import { saveAs } from 'file-saver';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import './standard-change.scss';

import { elementChangeKeyListener } from '@/hooks/keyboard-hook';

interface FormData {
  searchCondition?: {
    bookingDate: string;
    groupCode: string;
    groupCodeName: string;
  };

  standardPrices?: IStandardChange[];
  standardPricesDefault?: IStandardChange[];
  disableConfirm?: boolean;
  disablePrint?: boolean;
  dirtyTableData?: boolean;
}

const DEFAULT_VALUE: FormData = {
  searchCondition: {
    bookingDate: convertDateServer(getNextDate(new Date())),
    groupCode: '',
    groupCodeName: '',
  },

  standardPrices: null,
  standardPricesDefault: null,
  disableConfirm: true,
  disablePrint: true,
  dirtyTableData: false,
};

const VALID_GROUP_CODES = ['01', '07', '08'];
const LIMIT_RECORD = 13;

export const StandardChange = () => {
  const defaultRecord: IStandardChange = {
    record_id: null,
    company_code: null,
    store_code: '',
    item_code: '',
    booking_date: '',
    unit_price: null,
    current_price: null,
    my_company_code: '',
    description: '',
    group_code: '',
    product_code: '',
    standard_price: null,
    standard_price_default: null,
    id_delete_flag: false,
  };

  const dataDefault = Array.from({ length: LIMIT_RECORD }, () => ({ ...defaultRecord }));
  const dispatch = useAppDispatch();
  const [enabledPLU, setEnabledPLU] = React.useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(null);
  const [totalItem, setTotalItem] = useState<number>(null);
  const [isDisabledSearch, setIsDisabledSearch] = React.useState(false);
  const [isDisabledPLUSwitch, setIsDisabledPLUSwitch] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [hasGroupCodeLevelOne, setHasGroupCodeLevelOne] = useState(false);
  const langSystem = useAppSelector((state) => state.locale.currentLocale);
  const [isDisableClear, setDisableClear] = useState(true);

  const formConfig = useForm<FormData>({
    defaultValues: DEFAULT_VALUE,
  });

  const { getValues, setValue, watch, reset, setError, clearErrors } = formConfig;

  const dataTable: IStandardChange[] = useMemo(() => {
    if (getValues('standardPrices') === null) {
      return dataDefault;
    }

    return getValues('standardPrices');
  }, [watch('standardPrices')]);

  const disabledClear = useMemo(() => {
    const currentSearchCondition = getValues('searchCondition');
    const currentListTableData = getValues('standardPrices');
    if (currentPage > 1) {
      return false;
    }
    return (
      isEqualObject(DEFAULT_VALUE.searchCondition, currentSearchCondition) &&
      currentListTableData?.every((item, index) =>
        isEqualObject(item, dataDefault[index], ['group_code', 'product_code', 'item_code', 'standard_price'])
      )
    );
  }, [watch()]);

  // Handle focus first input into table
  const handleFocusInput = () => {
    // First input will focus in table
    setTimeout(() => {
      const inputTableFocus = document.querySelector('input[name^="standardPrices[0]"]:not([type="checkbox"]):not([disabled])');
      (inputTableFocus as HTMLInputElement)?.focus();
    }, 350);
  };

  // Suggest PLU Code AP1506
  const suggestPluCode = (value: string, index: number) => {
    if (isNullOrEmpty(value)) {
      setError(`standardPrices.${index}.item_code`, null);
      setError(`standardPrices.${index}.description`, null);

      // When item_code (PLUCode) has errors then change mode => clear error in group_code and product_code
      setError(`standardPrices[${index}].group_code` as any, null);
      setError(`standardPrices[${index}].product_code` as any, null);

      setValue(`standardPrices[${index}]` as any, {
        ...getValues('standardPrices')?.[index],
        my_company_code: null,
        company_code: null,
        group_code: null,
        product_code: null,
        item_code: null,
        description: null,
        unit_price: null,
        current_price: null,
        standard_price: null,
        operation_type: null,
      });

      const currentListTableData = getValues('standardPrices');
      setIsDisabledSearch(
        currentListTableData.some((item) => item.record_id || item.operation_type === OperationType.New)
      );
      return;
    }

    const booking_date = getValues('searchCondition.bookingDate');

    dispatch(
      suggestProduct({
        selected_store: selectedStores[0],
        plu: value,
        booking_date
      })
    )
      .unwrap()
      .then((res) => {
        const data = res.data.data;
        if (isNullOrEmpty(data)) {
          setIsDisabledSearch(false);
        } else {
          // Validate my_company_code
          const group_code = getGroupCode(data.my_company_code);
          if (!VALID_GROUP_CODES.includes(group_code)) {
            setError(`standardPrices[${index}].item_code` as any, {
              message: localizeString('MSG_VAL_045'),
              type: 'manual',
            });
            setError(`standardPrices[${index}].group_code` as any, {
              message: localizeString('MSG_VAL_045'),
              type: 'manual',
            });
          } else {
            setIsDisabledSearch(true);
            setValue(`standardPrices[${index}]` as any, {
              ...getValues('standardPrices')?.[index],
              operation_type: data ? OperationType.New : null,
            });
            // If the suggestion is successful, clear the group code, product code, and item code errors.
            setError(`standardPrices[${index}].group_code` as any, null);
            setError(`standardPrices[${index}].product_code` as any, null);
            setError(`standardPrices[${index}].item_code` as any, null);
          }
          // Mapping value
          setValue(`standardPrices[${index}]` as any, {
            ...getValues('standardPrices')?.[index],
            store_code: selectedStores[0],
            company_code: null,
            my_company_code: data.my_company_code,
            group_code: getGroupCode(data.my_company_code),
            product_code: getProductCode(data.my_company_code),
            booking_date,
            description: data ? data?.description : '',
            current_price: data?.current_price ? Number(data?.current_price) : null,
            unit_price: data?.unit_price ? Number(data?.unit_price) : null,
          });
          setErrorDescription(index, false);
        }
      })
      .catch((error) => {
        if (error.response?.status === NOT_FOUND_CODE) {
          // Set error to description
          setErrorDescription(index, true);
          setError(`standardPrices[${index}].item_code` as any, {
            message: localizeString('MSG_ERR_001'),
          });

          // When item_code has errors then change mode => clear error in group_code, product_code (PLUCode) input
          setError(`standardPrices[${index}].group_code` as any, null);
          setError(`standardPrices[${index}].product_code` as any, null);

          // Clear data
          setValue(`standardPrices[${index}]` as any, {
            ...getValues('standardPrices')?.[index],
            my_company_code: null,
            company_code: null,
            group_code: null,
            product_code: null,
            unit_price: null,
            current_price: null,
            standard_price: null,
            operation_type: null,
          });
        }
      });
  };

  const setErrorDescription = (index?: number, isError?: boolean) => {
    setError(`standardPrices[${index}].description` as any, {
      message: isError ? localizeString('MSG_ERR_001') : null,
    });
  };

  // Sugget My Company Code AP1506
  const suggestMycompanyCode = (value: string, index: number) => {
    // SC0601-12 - Validate when input in row item
    const groupCode = watch(`standardPrices[${index}].group_code` as any);
    const productCode = watch(`standardPrices[${index}].product_code` as any);
    const rowTable: IStandardChange = getValues('standardPrices')?.[index];

    // 1. Return if you have not entered both
    if (isNullOrEmpty(groupCode) && isNullOrEmpty(productCode)) {
      setValue(`standardPrices[${index}]` as any, {
        ...getValues('standardPrices')?.[index],
        my_company_code: null,
        company_code: null,
        group_code: null,
        product_code: null,
        item_code: null,
        description: null,
        unit_price: null,
        current_price: null,
        standard_price: null,
        operation_type: null,
      });

      setError(`standardPrices[${index}].item_code` as any, null);
      setError(`standardPrices[${index}].description` as any, null);

      setErrorDescription(index, false);
      const currentListTableData = getValues('standardPrices');
      setIsDisabledSearch(
        currentListTableData.some((item) => item.record_id || item.operation_type === OperationType.New)
      );
      return;
    }

    // 3. Enter group then check and show error
    if (!VALID_GROUP_CODES.includes(watch(`standardPrices[${index}].group_code` as any)?.slice(0, 2))) {
      setError(`standardPrices[${index}].group_code` as any, {
        message: localizeString('MSG_VAL_045'),
        type: 'manual',
      });
      return;
    }

    if (rowTable.group_code && !rowTable.product_code && !rowTable.item_code) {
      setError(`standardPrices[${index}].group_code` as any, null);
      setError(`standardPrices[${index}].description` as any, null);
    }

    if (!rowTable.group_code && rowTable.product_code && !rowTable.item_code) {
      setError(`standardPrices[${index}].product_code` as any, null);
      setError(`standardPrices[${index}].description` as any, null);
    }

    const row: IStandardChange = getValues('standardPrices')?.[index];
    if (isNullOrEmpty(row.group_code) && isNullOrEmpty(row.product_code)) {
      return;
    }

    // 4. Enter group and code then suggest
    if (row.group_code && row.product_code) {
      const booking_date = getValues('searchCondition.bookingDate');

      dispatch(
        suggestProduct({
          selected_store: selectedStores[0],
          group_code: row.group_code,
          product_code: row.product_code,
          booking_date
        })
      )
        .unwrap()
        .then((res) => {
          const data = res.data.data;
          if (isNullOrEmpty(data)) {
            setIsDisabledSearch(false);
          } else {
            setIsDisabledSearch(true);
            setValue(`standardPrices[${index}]` as any, {
              ...getValues('standardPrices')?.[index],
              store_code: selectedStores[0],
              my_company_code: data?.my_company_code,
              company_code: null,
              booking_date,
              item_code: data?.item_code,
              description: data ? data?.description : '',
              unit_price: data?.unit_price ? Number(data?.unit_price) : null,
              current_price: data?.current_price ? Number(data?.current_price) : null,
              operation_type: data ? OperationType.New : null,
            });
            // If the suggestion is successful, clear the group code, product code, item code and description errors.
            setError(`standardPrices[${index}].group_code` as any, null);
            setError(`standardPrices[${index}].product_code` as any, null);
            setError(`standardPrices[${index}].item_code` as any, null);
            setErrorDescription(index, false);
          }
        })
        .catch((error) => {
          if (error.response?.status === NOT_FOUND_CODE) {
            // Set error to description
            setErrorDescription(index, true);
            setError(`standardPrices[${index}].group_code` as any, {
              message: localizeString('MSG_ERR_001'),
            });
            setError(`standardPrices[${index}].product_code` as any, {
              message: localizeString('MSG_ERR_001'),
            });

            // When group_code, product_code has errors then change mode => clear error in item_code (PLUCode) input
            setError(`standardPrices[${index}].item_code` as any, null);

            // Clear data
            setValue(`standardPrices[${index}]` as any, {
              ...getValues('standardPrices')?.[index],
              item_code: null,
              unit_price: null,
              company_code: null,
              current_price: null,
              standard_price: null,
              operation_type: null,
            });
          }
        });
    }
  };

  const handleFocusNextElement = (index: number, fieldName: string) => {
    setTimeout(() => {
      focusElementByName(`standardPrices[${index}].${fieldName}`);
    }, 50);
  };

  const columns = React.useMemo<TableColumnDef<IStandardChange>[]>(
    () => [
      {
        accessorKey: 'id_delete_flag',
        header: 'table.checkboxDelete',
        size: 5,
        type: 'checkbox',
        option(props) {
          return { disabled: isNullOrEmpty(props.row?.original?.record_id) };
        },
      },
      {
        accessorKey: 'my_company_code',
        header: 'table.productCode',
        size: 10,
        type: 'product',
        disabled: enabledPLU,
        inputTextProps: {
          disabledIfHasRecordId: true,
          addZero: true,
          textAlign: 'left',
          focusOut(value, index) {
            suggestMycompanyCode(value, index);
          },
          onMaxLengthProductFirstInput(_, index) {
            handleFocusNextElement(index, 'product_code');
          },
          onMaxLengthProductSecondInput(_, index) {
            handleFocusNextElement(index, 'standard_price');
          },
        },
        option(props) {
          return { disabled: !isNullOrEmpty(props.row?.original?.record_id), value: 20 };
        },
      },
      {
        accessorKey: 'item_code',
        header: 'table.pluCode',
        size: 12,
        type: 'inputNumber',
        disabled: !enabledPLU,
        inputTextProps: {
          maxLength: 13,
          textAlign: 'left',
          addZero: true,
          focusOut: suggestPluCode,
          onMaxLengthInputTable(_, index) {
            handleFocusNextElement(index, 'standard_price');
          },
        },
        option(props) {
          return { disabled: !isNullOrEmpty(props.row?.original?.record_id) };
        },
      },
      {
        accessorKey: 'description',
        header: 'table.description',
        useNameForm: true,
        type: 'text',
        size: 49,
        textAlign: 'left',
      },
      {
        accessorKey: 'unit_price',
        header: 'table.unitPrice',
        type: 'text',
        textAlign: 'right',
        useNameForm: true,
        formatNumber: true,
        size: 8,
      },
      {
        accessorKey: 'current_price',
        header: 'table.currentPrice',
        type: 'text',
        useNameForm: true,
        formatNumber: true,
        textAlign: 'right',
        size: 8,
      },
      {
        accessorKey: 'standard_price',
        header: 'table.standardPrice',
        type: 'inputNumber',
        size: 8,
        inputTextProps: {
          maxLength: 6,
          textAlign: 'right',
          addZero: false,
          thousandSeparator: true,
          minValue: 1,
          errorPlacement: 'left',
        },
        option(props) {
          return { disabled: props.row?.original?.id_delete_flag };
        },
      },
    ],
    [enabledPLU, watch('standardPrices')]
  );

  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];
  const userRole = useAppSelector((state) => state.loginReducer.userLogin?.user_detail?.role_code);

  const formRef = useRef<HTMLDivElement>(null);

  elementChangeKeyListener(enabledPLU);

  // Handle change store
  useEffect(() => {
    reset();
    setValue('standardPrices', dataDefault);
    setTotalItem(0);
    setCurrentPage(1);
    setEnabledPLU(true);
    setIsDisabledSearch(false);
    setIsDisabledPLUSwitch(false);
  }, [selectedStores[0]]);

  useEffect(() => {
    if (userRole !== USER_ROLE.ADMIN) {
      handleFocusInput();
    }
  }, [userRole]);

  // Data blank
  const addRecordBlank = (existItemCount?: number) => {
    return Array.from({ length: 12 - (existItemCount ?? 0) }, () => ({
      record_id: null,
      company_code: null,
      store_code: '',
      item_code: '',
      unit_price: null,
      current_price: null,
      my_company_code: '',
      description: '',
      group_code: '',
      product_code: '',
      standard_price: null,
      standard_price_default: null,
      id_delete_flag: false,
    }));
  };

  // Sugget code level one AP0114
  const handleBlurMyCompanyCode = (groupCode) => {
    if (isNullOrEmpty(groupCode)) {
      setValue('searchCondition.groupCodeName', '');
      return;
    }
    if (!VALID_GROUP_CODES.includes(groupCode)) {
      setValue('searchCondition.groupCodeName', localizeString('MSG_VAL_045'));
      setHasGroupCodeLevelOne(false);
      return;
    }

    dispatch(
      getHierarchyLevel({
        level: 1,
        filter_type: 2,
        filter_code: groupCode,
      })
    )
      .unwrap()
      .then((res) => {
        const hierarchyLevelData = res?.data?.data;
        let descriptionLevelOne = localizeString('MSG_ERR_001');
        setHasGroupCodeLevelOne(false);
        if (hierarchyLevelData.total_count !== 0) {
          descriptionLevelOne = hierarchyLevelData?.items[0]?.description;
          clearErrors('searchCondition.groupCodeName')
          setValue('searchCondition.groupCodeName', descriptionLevelOne);
          setHasGroupCodeLevelOne(true);
        } else {
          setError('searchCondition.groupCodeName', {
            message: localizeString('MSG_ERR_001'),
          });
        }
      })
      .catch((error) => {
        if (error.response?.status === NOT_FOUND_CODE) {
          setValue(
            'searchCondition.groupCodeName',
            error.response.data?.errors?.map((msg) => localizeString(msg))?.join('\n')
          );
          setHasGroupCodeLevelOne(false);
        }
      });
  };

  // Call API AP0601
  const handleGetStandardPrice = ({ pageNumber }: { pageNumber?: number }, action: Action) => {
    clearErrors();
    const bookingDate = getValues('searchCondition.bookingDate');

    let requestParmGetStandardChange: any = {
      selected_store: selectedStores[0],
      booking_date: bookingDate,
      page_number: pageNumber,
      limit: LIMIT_RECORD,
    };

    // Add parameter to search condition when groupCode > 0
    requestParmGetStandardChange = {
      ...requestParmGetStandardChange,
      ...(getValues('searchCondition.groupCode')?.length > 0 && {
        groupCode: getValues('searchCondition.groupCode'),
      }),
    };

    dispatch(getStandardPriceHistory(requestParmGetStandardChange))
      .unwrap()
      .then((res) => {
        setTotalPage(res.data?.data?.total_page);
        setTotalItem(res.data?.data?.total_item);

        // When API returns total_item === 0
        // ++ Action: Search (1)
        // Set standardPrices equal to [] ( 0 empty records), show error message
        // ++ Action: Paging (2)
        // When paging, next will always set standardPrices equal to dataDefault( 13 empty records)
        if (res.data?.data?.total_item === 0) {
          switch (action) {
            case Action.Search:
              // // Show no data, disable search.
              setValue('standardPrices', []);
              setValue('standardPricesDefault', []);
              setDisableClear(false);
              break;
            case Action.Paging:
              setValue('standardPrices', dataDefault);
              setValue('standardPricesDefault', dataDefault);
              break;
            default:
              // Mode add new
              setValue('standardPrices', dataDefault);
              setValue('standardPricesDefault', dataDefault);
              break;
          }
          return;
        }

        // Case total_item > 0
        let standardChanges = res.data?.data?.items;
        if (standardChanges?.length < LIMIT_RECORD) {
          standardChanges = standardChanges?.concat(addRecordBlank(standardChanges?.length - 1));
        }

        setValue(
          'standardPrices',
          standardChanges.map((item) => ({
            ...item,
            product_code:
              item?.my_company_code?.length >= MAX_LENGTH.product_code ? getProductCode(item?.my_company_code) : '',
            standard_price_default: item?.standard_price,
          }))
        );

        setValue('standardPricesDefault', standardChanges);
        setValue('disablePrint', false);
        setIsDisabledSearch(true);
        setIsEditMode(true);

        handleFocusInput();
      })
      .catch(() => {});
  };

  // Search F12 API AP0601
  const handleSearchStandardChange = () => {
    setCurrentPage(1);
    handleGetStandardPrice({ pageNumber: 1 }, Action.Search);
  };

  // Confirm F11 API AP0602
  const handleConfirmAction = (callback?: () => void) => {
    // Validate standard_price
    let hasInputError = false;
    const listDefault = getValues('standardPricesDefault');
    const standardChangeFormData: IStandardChange[] = watch('standardPrices');
    const isOnlyRecordModeAdd = standardChangeFormData.every((item) => isNullOrEmpty(item.record_id));

    const dataChange = standardChangeFormData
      .map((item, index) => {
        if (
          // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
          (item.operation_type === OperationType.New &&
            // eslint-disable-next-line eqeqeq
            (isNullOrEmpty(item.standard_price) || item.standard_price == 0)) ||
          // eslint-disable-next-line eqeqeq
          (!item.id_delete_flag && item.record_id && (isNullOrEmpty(item.standard_price) || item.standard_price == 0))
        ) {
          setError(`standardPrices[${index}].standard_price` as any, {
            // eslint-disable-next-line eqeqeq
            message: item.standard_price == 0 ? localizeString('MSG_VAL_046') : localizeString('MSG_VAL_047'),
            type: 'manual',
          });
          hasInputError = true;
        }

        if (item.id_delete_flag) {
          setValue(`standardPrices[${index}].operation_type` as any, OperationType.Remove);
        }

        return item;
      })
      .filter((item, index) => {
        if (item.id_delete_flag) {
          return true;
        }
        if (
          isNullOrEmpty(item.record_id) &&
          !isNullOrEmpty(item.group_code) &&
          !isNullOrEmpty(item.product_code) &&
          !isNullOrEmpty(item.item_code)
        ) {
          return true;
        }

        const isEditedItem = listDefault?.some((listItem) => {
          return (
            !isNullOrEmpty(listItem.record_id) &&
            listItem.record_id === item.record_id &&
            listItem.standard_price !== item.standard_price
          );
        });

        if (isEditedItem) {
          setValue(`standardPrices[${index}].operation_type` as any, OperationType.Edit);
        }
        return isEditedItem;
      });

    if (hasInputError) {
      return;
    }

    const dataChangeUpdate: IStandardChangeUpdate[] = createStandardPriceUpdate(dataChange);

    if (isNullOrEmpty(dataChangeUpdate)) {
      callback?.();
      return;
    }

    dispatch(postStandardPriceList({ standard_prices: dataChangeUpdate }))
      .unwrap()
      .then((res) => {
        if (res.data.status === STATUS.error) {
          const errorList: any[] = extractValues(res.data.data);
          const errorString = errorList
            .flatMap((item) => item.messages?.map((message) => localizeFormat(message, item.field) + `[${item.index}]`))
            .join('\n');

          dispatch(setErrorReducer(errorString));
          return;
        }
        if (isOnlyRecordModeAdd && !isEditMode) {
          handleClearData();
          return;
        }

        if (totalItem !== 0) {
          if (callback && typeof callback === 'function') {
            callback();
            return;
          }

          // Reset data to init screen status when click button confirm
          handleClearData();
          handleFocusInput();

          return;
        }
      })
      .catch(() => {});
  };

  const handlePaging = (page: number) => {
    setCurrentPage(page);
    handleGetStandardPrice({ pageNumber: page }, Action.Paging);
  };

  // Action paging
  const actionPaging = (pagingAction?: 'next' | 'prev' | 'first' | 'last') => {
    clearErrors('standardPrices');

    switch (pagingAction) {
      case 'first':
        handleConfirmAction(() => {
          handlePaging(1);
        });
        break;
      case 'last':
        handleConfirmAction(() => {
          handlePaging(totalPage);
        });
        break;
      case 'next':
        if (currentPage > totalPage) {
          return;
        }

        handleConfirmAction(() => {
          // In case the current page is the last page, after click F2 next then create a blank page, increase the current page by 1
          if (currentPage === totalPage) {
            setValue('standardPrices', dataDefault);
            setCurrentPage(currentPage + 1);
            handleFocusInput();
            return;
          }
          handlePaging(currentPage + 1);
        });
        break;
      case 'prev':
        handleConfirmAction(() => {
          handlePaging(Math.max(currentPage - 1, 1));
        });
        break;
      default:
        handlePaging(1);
        break;
    }
  };

  // F8 Clear data
  const handleClearData = () => {
    reset();
    setValue('standardPrices', dataDefault);
    setTotalItem(0);
    setCurrentPage(1);
    setEnabledPLU(true);
    setIsDisabledSearch(false);
    setIsDisabledPLUSwitch(false);
    setIsEditMode(false);
    setDisableClear(true);

    handleFocusInput();
  };

  // Handle print API_AP0603
  const handlePrint = () => {
    dispatch(
      getStandardPriceExport({
        selected_store: selectedStores[0],
        group_code: isNullOrEmpty(getValues('searchCondition.groupCode'))
          ? null
          : getValues('searchCondition.groupCode'),
        booking_date: getValues('searchCondition.bookingDate'),
        language: langSystem,
      })
    )
      .unwrap()
      .then((res) => {
        const { blob, headers } = res;
        const contentDisposition = headers.get('Content-Disposition');
        const todayString = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().replace(/[-T:]/g, '').slice(0, 12);
        let fileName = `１，７，８定番変更_${todayString}.pdf`;
        if (contentDisposition && contentDisposition.includes('filename')) {
          const match = contentDisposition.match(/filename\*=(?:UTF-8'')?(.+)/);
          if (match && match[1]) {
            fileName = decodeURIComponent(match[1]);
          }
        }
        saveAs(blob, fileName);
        handleFocusInput();
      })
      .catch(() => {});
  };

  return (
    <FormProvider {...formConfig}>
      <div className="standard-change">
        <Header
          hasESC={true}
          title={'standardChange.title'}
          csv={{ disabled: true }}
          printer={{ disabled: false, action: () => handlePrint() }}
          hiddenTextESC={true}
          confirmBack={watch('dirtyTableData') || currentPage > 1}
        />
        <div className={'standard-change__main'}>
          <SidebarStore
            onClickSearch={() => { }}
            expanded={true}
            onChangeCollapseExpand={() => {
              setTimeout(() => {
                handleFocusInput();
              }, 100)
            }
            }
            clearData={handleClearData}
            hasData={watch('dirtyTableData')}
            actionConfirm={handleClearData}
          />
          <div className={'standard-change__search'}>
            <div className={'standard-change__date'} ref={formRef}>
              <TooltipDatePickerControl
                required
                name="searchCondition.bookingDate"
                labelText="searchCondition.bookingDate"
                disabled={isDisabledSearch}
                checkEmpty={true}
                keyError={'searchCondition.bookingDate'}
                minDate={new Date()}
                messageError="MSG_VAL_022"
                errorPlacement="bottom-end"
              />
            </div>
            <div className={'standard-change__code'}>
              <div className={'standard-change__code__item'}>
                <TooltipNumberInputTextControl
                  name="searchCondition.groupCode"
                  className="standard-change__group-code"
                  label="searchCondition.groupCode"
                  maxLength={2}
                  addZero={true}
                  focusOut={handleBlurMyCompanyCode}
                  disabled={isDisabledSearch}
                />
              </div>
              <div className={'standard-change__code__item'}>
                <TooltipInputTextControl
                  name="searchCondition.groupCodeName"
                  disabled={true}
                  width={'633px'}
                  className={hasGroupCodeLevelOne ? '' : 'standard-change__code__item-error'}
                />
              </div>
            </div>
            <div className={'standard-change-button'}>
              <ButtonPrimary
                text={enabledPLU ? 'searchCondition.productCodeSwitching' : 'searchCondition.pluCodeSwitching'}
                onClick={() => {
                  setEnabledPLU(!enabledPLU);
                }}
                disabled={isDisabledPLUSwitch}
              />
              <FuncKeyDirtyCheckButton
                text="action.f12Search"
                funcKey={'F12'}
                onClickAction={handleSearchStandardChange}
                disabled={
                  isDisabledSearch || (!hasGroupCodeLevelOne && !isNullOrEmpty(getValues('searchCondition.groupCode')))
                }
                funcKeyListener={selectedStores}
              />
            </div>
          </div>
          <div className={'standard-change__table'}>
            <TableData<IStandardChange>
              columns={columns}
              data={dataTable}
              enableSelectRow={false}
              tableKey="standardPrices"
              showNoData={true}
              tableType="edit"
            />
          </div>
        </div>
        <PagingBottomButtonControl
          confirmName={'disableConfirm'}
          confirmAction={handleConfirmAction}
          clearAction={handleClearData}
          disableClear={disabledClear && isDisableClear}
          limit={LIMIT_RECORD}
          actionPaging={actionPaging}
          page={currentPage}
          total_record={totalItem}
          totalPage={totalItem === 0 ? null : totalPage}
        />
      </div>
      <StandardChangeCompare />
    </FormProvider>
  );
};

export default StandardChange;

export const StandardChangeCompare = () => {
  const { control, setValue } = useFormContext();
  const dataForm: IStandardChange[] = useWatch({ control, name: 'standardPrices' });

  useEffect(() => {
    if (isNullOrEmpty(dataForm)) {
      setValue('disableConfirm', true);
      setValue('dirtyTableData', false);
      return;
    }

    for (let i = 0; i < dataForm.length; i++) {
      const item = dataForm[i];

      if (
        item.id_delete_flag ||
        (!item.record_id &&
          item.group_code &&
          item.product_code &&
          item.item_code &&
          item.operation_type === OperationType.New)
      ) {
        setValue('disableConfirm', false);
        return;
      }

      if (item.record_id && !isEqual(item.standard_price, item.standard_price_default)) {
        setValue('disableConfirm', false);
        return;
      }
    }

    setValue('disableConfirm', true);

    for (let i = 0; i < dataForm.length; i++) {
      const item = dataForm[i];

      if (item.record_id) {
        setValue('dirtyTableData', true);
        return;
      }

      if (
        item.group_code ||
        item.product_code ||
        item.item_code ||
        item.description ||
        item.unit_price ||
        item.current_price ||
        item.standard_price
      ) {
        setValue('dirtyTableData', true);
        return;
      }
    }
    setValue('dirtyTableData', false);
  }, [dataForm]);
  return <></>;
};

const extractValues = (data) => {
  return Object.keys(data).map((key) => {
    const keyParts = key.split('.');
    const lastKey = keyParts[keyParts.length - 1];

    const indexMatch = key.match(/\[(\d+)\]/);
    const fieldIndex = indexMatch ? parseInt(indexMatch[1], 10) + 1 : null;

    return {
      field: FieldNameMapping[lastKey],
      index: fieldIndex,
      messages: data[key],
    };
  });
};

enum FieldNameMapping {
  operation_type = 'fieldName.operation_type',
  store_code = 'fieldName.store_code',
  item_code = 'fieldName.item_code',
  booking_date = 'fieldName.booking_date',
  group_code = 'fieldName.group_code',
  new_price = 'fieldName.new_price',
}

enum Action {
  Search = 1,
  Paging = 2,
}
