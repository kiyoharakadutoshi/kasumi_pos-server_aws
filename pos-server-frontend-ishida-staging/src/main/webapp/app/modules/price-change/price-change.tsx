import React, { useEffect, useMemo, useState } from 'react';
import Header from 'app/components/header/header';
import { IPriceChange } from '@/modules/price-change/interface-price-change';
import './price-change.scss';
import SidebarStore from 'app/components/sidebar-store-default/sidebar-store/sidebar-store';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import {
  isEqualObject,
  isNullOrEmpty,
  localizeFormat,
  localizeString,
  isEqual as equalValue,
  focusElementByName,
  getGroupCode,
  getProductCode,
} from 'app/helpers/utils';
import { useAppDispatch, useAppSelector } from '@/config/store';
import { getForcePriceList, postForcePriceList } from '@/services/force-price-list-service';
import { suggestProduct } from '@/services/product-service';
import { getForcePriceExport } from '@/services/force-price-export-service';
import { saveAs } from 'file-saver';
import { OperationType } from '@/components/table/table-common';
import { GROUP_PRODUCT_CODE_INPUT_MAX_LENGTH, LanguageOption, STATUS } from '@/constants/constants';
import { setError as setErrorReducers } from '@/reducers/error';
import FuncKeyDirtyCheckButton from '@/components/button/func-key-dirty-check/func-key-dirty-check-button';
import { getHierarchyLevel } from '@/services/hierarchy-level-service';
import TableData, { TableColumnDef } from '@/components/table/table-data/table-data';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import { elementChangeKeyListener } from '@/hooks/keyboard-hook';
import TooltipNumberInputTextControl from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import { isEqual } from 'lodash';
import { PagingBottomButtonControl } from '@/components/bottom-button/pagging-bottom-button/paging-bottom-button';
import { TSortType } from 'app/components/table/table-data/interface-table';
import { PopoverTextControl } from '@/components/popover/popover';

export const PriceChange = () => {
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];
  const defaultRecord: IPriceChange = {
    company_code: null,
    item_name: '',
    my_company_code: '',
    schedule_no: '',
    store_code: '',
    store_name: '',
    current_price: null,
    force_price: null,
    group_code: null,
    id_delete_flag: null,
    item_code: null,
    operation_type: null,
    product_code: null,
    unit_price: null,
    selected: false,
  };
  const limitRecord = 13;
  const dataDefault = {
    selectedStored: selectedStores[0],
    groupCodeLevelOne: null,
    descriptionLevelOne: null,
    listData: Array.from({ length: limitRecord }, () => ({ ...defaultRecord })),
    dataPriceChange: true,
    disableConfirm: true,
  };
  const formConfig = useForm({ defaultValues: dataDefault });
  const { setValue, getValues, watch, setError, clearErrors, reset } = formConfig;

  const dispatch = useAppDispatch();
  const dataPrice = useMemo(() => getValues('listData') ?? [], [watch('listData')]);
  const [totalPage, setTotalPage] = useState<number>(null);
  const [totalItem, setTotalItem] = useState<number>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const groupCodeLevelOne = watch('groupCodeLevelOne');
  const [enabledPLU, setEnabledPLU] = React.useState(true);
  const [sortValue, setSortValue] = useState<TSortType>(null);
  const langSystem = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0];
  const dirtyCheck = dataPrice.some((item) => item.operation_type);
  const [isDisableClear, setDisableClear] = useState(true);
  const runConfirm = 0;
  const [statusSearch, setStatusSearch] = React.useState(false);
  elementChangeKeyListener(enabledPLU);

  // Handle confirm
  const actionConfirm = (callback?: () => void) => {
    // Validate force_price
    const newDataForm = (watch('listData') && watch('listData')) || [];
    let checkError = false;
    newDataForm.forEach((item, index) => {
      if (item.unit_price != null && item.force_price == null) {
        setError(`listData[${index}].force_price` as any, {
          message: localizeFormat('MSG_VAL_038', localizeString('label.todayPrice')),
        });
        checkError = true;
      }
    });

    if (checkError) return;

    if (runConfirm !== 0) {
      if (runConfirm === null) {
        dispatch(setErrorReducers(localizeFormat('MSG_VAL_001', 'touchMenu.changedPrice')));
        return;
      } else if (runConfirm === -1) {
        dispatch(setErrorReducers(localizeFormat('MSG_VAL_001', 'touchMenu.changedPrice')));
        return;
      }
    }

    const data: IPriceChange[] = getValues('listData');
    const force_prices = data
      ?.filter((item) => {
        if (item.record_id) {
          if (item.id_delete_flag) return true;
          return !equalValue(item.force_price, item.force_price_default);
        }

        return !!item.unit_price;
      })
      .map((item) => ({
        record_id: item.record_id,
        selected_store: selectedStores?.[0],
        item_code: item.item_code,
        force_price: Number(item.force_price),
        id_delete_flag: item.id_delete_flag || false,
      }));

    if (isNullOrEmpty(force_prices)) {
      callback?.();
      return;
    }

    dispatch(postForcePriceList({ force_prices }))
      .unwrap()
      .then((response) => {
        if (response.data.status === STATUS.error) {
          return;
        }
        if (totalItem !== 0) {
          if (callback && typeof callback === 'function') {
            callback();
            return;
          }

          // Reset data to init screen status when click button confirm
          handleClearDataSearch();
          return;
        }

        setValue('listData', dataDefault.listData);
        setStatusSearch(false);
        setEnabledPLU(true);
        clearErrors();
        setTimeout(() => {
          const item = document.querySelector('input[name="listData[0].item_code"]');
          (item as HTMLInputElement)?.focus();
        }, 200);
      })
      .catch(() => {});
  };

  // Data blank
  const addRecordBlank = (existItemCount?: number) => {
    return Array.from({ length: limitRecord - (existItemCount ?? 0) }, () => ({
      company_code: null,
      current_price: null,
      force_price: null,
      group_code: '',
      id_delete_flag: undefined,
      item_code: '',
      item_name: '',
      my_company_code: '',
      product_code: '',
      schedule_no: '',
      selected: false,
      store_code: '',
      store_name: '',
      unit_price: null,
    }));
  };

  // Sugget code level one
  const handleBlurMyCompanyCode = () => {
    const currentGroupCodeLevelOne = getValues('groupCodeLevelOne');

    if (currentGroupCodeLevelOne?.length === 0) {
      setValue('descriptionLevelOne', null);
      setError('descriptionLevelOne', null);
    }

    if (!currentGroupCodeLevelOne) {
      setValue('descriptionLevelOne', null);
      setError('descriptionLevelOne', null);
      return;
    }

    dispatch(
      getHierarchyLevel({
        level: 1,
        filter_type: 2,
        filter_code: currentGroupCodeLevelOne,
      })
    )
      .unwrap()
      .then((res) => {
        const hierarchyLevelData = res?.data?.data;
        if (hierarchyLevelData.total_count !== 0) {
          clearErrors('descriptionLevelOne');
          setValue('descriptionLevelOne', hierarchyLevelData.items[0].description);
        } else {
          setError('descriptionLevelOne', {
            message: localizeString('MSG_ERR_001'),
          });
        }
      })
      .catch((err) => {
        console.error(err);
        setError('descriptionLevelOne', {
          message: localizeString('MSG_ERR_001'),
        });
      });
  };

  const handleFocusNextElement = (index: number, fieldName: string) => {
    setTimeout(() => {
      focusElementByName(`listData[${index}].${fieldName}`);
    }, 50);
  };

  // Sugggest table
  const suggestPluCode = (value: string, index: number) => {
    // If data cannot be found when searching by PLU Code
    if (isNullOrEmpty(value)) {
      setError(`listData.${index}.item_code`, null);
      setError(`listData.${index}.item_name`, null);

      // When item_code (PLUCode) has errors then change mode => clear error in group_code and product_code
      setError(`listData[${index}].group_code` as any, null);
      setError(`listData[${index}].product_code` as any, null);

      setValue(`listData[${index}]` as any, {
        ...getValues('listData')?.[index],
        current_price: null,
        item_code: null,
        unit_price: null,
        my_company_code: '',
        item_name: '',
        product_code: '',
        group_code: '',
        operation_type: null,
      });
      return;
    }

    dispatch(
      suggestProduct({
        selected_store: getValues('selectedStored'),
        plu: value,
      })
    )
      .unwrap()
      .then((res) => {
        const data = res.data.data;
        if (isNullOrEmpty(data)) {
          setStatusSearch(false);
        } else {
          setStatusSearch(true);
        }
        setError(`listData.${index}.item_name`, null);
        setValue(`listData[${index}]` as any, {
          ...getValues('listData')?.[index],
          current_price: data?.current_price ? Number(data?.current_price) : null,
          unit_price: data?.unit_price ? Number(data?.unit_price) : null,
          item_code: data?.item_code,
          my_company_code: value,
          group_code: getGroupCode(data.my_company_code),
          product_code: getProductCode(data.my_company_code),
          item_name: data?.description,
          isError: !data,
          operation_type: data ? OperationType.New : null,
        });
      })
      .catch(() => {
        setError(`listData[${index}].item_code` as any, {
          message: localizeString('MSG_ERR_001'),
        });
        setError(`listData[${index}].item_name` as any, {
          message: localizeString('MSG_ERR_001'),
        });

        // When item_code (PLUCode) has errors then change mode => clear error in group_code and product_code
        setError(`listData[${index}].group_code` as any, null);
        setError(`listData[${index}].product_code` as any, null);

        setValue(`listData[${index}]` as any, {
          ...getValues('listData')?.[index],
          current_price: null,
          unit_price: null,
          group_code: '',
          product_code: '',
        });
      });
  };

  const suggestMycompanyCode = (value: string, index: number) => {
    // If data cannot be found when searching by PLU Code
    const row: IPriceChange = getValues('listData')?.[index];

    if (row.group_code && !row.product_code && !row.item_code) {
      setError(`listData[${index}].group_code` as any, null);
      setError(`listData[${index}].item_name` as any, null);
    }

    if (!row.group_code && row.product_code && !row.item_code) {
      setError(`listData[${index}].product_code` as any, null);
      setError(`listData[${index}].item_name` as any, null);
    }

    if (isNullOrEmpty(row.group_code) && isNullOrEmpty(row.product_code)) {
      setError(`listData[${index}].group_code` as any, null);
      setError(`listData[${index}].product_code` as any, null);
      setError(`listData[${index}].item_name` as any, null);

      // When group_code, product_code has errors then change mode => clear error in item_code (PLUCode) input
      setError(`listData[${index}].item_code` as any, null);

      setValue(`listData[${index}]` as any, {
        ...getValues('listData')?.[index],
        current_price: null,
        item_code: value?.length > GROUP_PRODUCT_CODE_INPUT_MAX_LENGTH ? value : null,
        unit_price: null,
        my_company_code: '',
        item_name: '',
        product_code: value?.length === GROUP_PRODUCT_CODE_INPUT_MAX_LENGTH ? value?.substring(2) : null,
        group_code: value?.length === GROUP_PRODUCT_CODE_INPUT_MAX_LENGTH ? value?.substring(0, 2) : null,
        operation_type: null,
      });
      return;
    }

    if (row.group_code && row.product_code) {
      dispatch(
        suggestProduct({
          selected_store: getValues('selectedStored'),
          product_code: row.product_code,
          group_code: row.group_code,
        })
      )
        .unwrap()
        .then((res) => {
          const data = res.data.data;
          if (isNullOrEmpty(data)) {
            setStatusSearch(false);
          } else {
            setStatusSearch(true);
          }

          setError(`listData[${index}].item_name` as any, null);
          setError(`listData[${index}].group_code` as any, null);
          setError(`listData[${index}].product_code` as any, null);
          setValue(`listData[${index}]` as any, {
            ...getValues('listData')?.[index],
            current_price: data?.current_price ? Number(data?.current_price) : null,
            item_code: data?.item_code,
            unit_price: data?.unit_price ? Number(data?.unit_price) : null,
            my_company_code: value,
            item_name: data ? data?.description : localizeString('MSG_ERR_001'),
            isError: !data,
            operation_type: data ? OperationType.New : null,
          });
        })
        .catch(() => {
          setError(`listData[${index}].group_code` as any, {
            message: localizeString('MSG_ERR_001'),
          });
          setError(`listData[${index}].product_code` as any, {
            message: localizeString('MSG_ERR_001'),
          });
          setError(`listData[${index}].item_name` as any, {
            message: localizeString('MSG_ERR_001'),
          });

          // When group_code, product_code has errors then change mode => clear error in item_code (PLUCode) input
          setError(`listData[${index}].item_code` as any, null);

          setValue(`listData[${index}]` as any, {
            ...getValues('listData')?.[index],
            current_price: null,
            item_code: '',
            unit_price: null,
          });
        });
    }
  };

  // Call API API_AP0201: Get data
  const handleGetForcePrice = ({
    sortColumn, // eslint-disable-next-line @typescript-eslint/no-shadow
    sortValue,
    pageNumber,
  }: {
    sortColumn?: string;
    sortValue?: string;
    pageNumber?: number;
  }) => {
    clearErrors('listData');
    setDisableClear(false);
    let reqGetPriceChange: any = {
      selected_store: getValues('selectedStored'),
      page_number: pageNumber,
      limit: limitRecord,
      sort_column: sortColumn,
      sort_value: sortValue,
    };

    // add parameter to search condition when value > 0
    reqGetPriceChange = {
      ...reqGetPriceChange,
      ...(groupCodeLevelOne?.length > 0 && {
        md_hierarchy_code_level_one: groupCodeLevelOne,
      }),
    };

    dispatch(getForcePriceList(reqGetPriceChange))
      .unwrap()
      .then((res) => {
        setTotalPage(res.data?.data?.total_page);
        setTotalItem(res.data?.data?.total_item);
        if (res.data?.data?.total_item === 0) {
          setStatusSearch(false);
          setValue('listData', []);
          return;
        }
        setStatusSearch(true);

        let priceChanges = res.data?.data?.force_prices;
        if (priceChanges?.length < limitRecord) {
          priceChanges = priceChanges?.concat(addRecordBlank(priceChanges?.length));
        }
        setValue(
          'listData',
          priceChanges.map((item) => ({
            ...item,
            force_price_default: item.force_price,
            group_code: getGroupCode(item.my_company_code),
            product_code: getProductCode(item.my_company_code),
          }))
        );

        setTimeout(() => {
          const item = document.querySelector('input[name="listData[0].force_price"]');
          (item as HTMLInputElement)?.focus();
        }, 50);
      })
      .catch(() => {});
  };

  // Search
  const handleSearchPriceChange = () => {
    clearErrors('listData');
    setError('listData', null);
    setCurrentPage(1);
    setSortValue(null);
    handleGetForcePrice({ pageNumber: 1 });
  };

  // Action paging
  const actionPaging = (pagingAction?: 'next' | 'prev' | 'first' | 'last') => {
    const handlePaging = (page: number) => {
      setCurrentPage(page);
      handleGetForcePrice({
        pageNumber: page,
        ...(sortValue ? { sortValue } : {}),
      });
    };
    switch (pagingAction) {
      case 'first':
        actionConfirm(() => {
          clearErrors();
          handlePaging(1);
        });
        break;
      case 'last':
        actionConfirm(() => {
          clearErrors();
          handlePaging(totalPage);
        });
        break;
      case 'next':
        if (currentPage > totalPage) {
          return;
        }

        actionConfirm(() => {
          if (currentPage === totalPage) {
            setValue('listData', dataDefault.listData);
            setCurrentPage(currentPage + 1);
            return;
          }
          handlePaging(currentPage + 1);
        });
        break;
      case 'prev':
        actionConfirm(() => {
          handlePaging(Math.max(currentPage - 1, 1));
        });
        break;
      default:
        handlePaging(1);
        break;
    }
  };

  // Sort
  const actionSort = (keyItem: keyof IPriceChange, type: TSortType) => {
    setSortValue(type);
    setCurrentPage(1);
    handleGetForcePrice({ sortColumn: keyItem, sortValue: type });
  };

  // F8: clear data search
  const handleClearDataSearch = () => {
    reset();
    setValue('selectedStored', selectedStores?.[0]);
    setStatusSearch(false);
    setTotalItem(0);
    setCurrentPage(1);
    setEnabledPLU(true);
    setDisableClear(true);

    setTimeout(() => {
      const item = document.querySelector('input[name="listData[0].item_code"]');
      (item as HTMLInputElement)?.focus();
    }, 50);
  };

  // Handle print call API_AP0203_ Export
  const handlePrint = () => {
    dispatch(
      getForcePriceExport({
        selected_store: getValues('selectedStored'),
        md_hierarchy_code_level_one: groupCodeLevelOne?.length !== 0 ? groupCodeLevelOne : null,
        lang: LanguageOption.LANG_JA,
      })
    )
      .unwrap()
      .then((res) => {
        const { blob, headers } = res;
        let fileName: string;
        const match = headers.get('Content-Disposition')?.match(/filename\*=(?:UTF-8'')?(.+)/);
        if (match && match[1]) {
          fileName = decodeURIComponent(match[1]);
        } else {
          fileName = `緊急売価変更リスト_${selectedStores?.[0]}`;
        }
        saveAs(blob, fileName);
        setTimeout(() => {
          const itemCodeElement = document.querySelector('input[name="listData[0].item_code"]');
          const groupCodeElement = document.querySelector('input[name="listData[0].group_code"]');
          const forceFriceElement = document.querySelector('input[name="listData[0].force_price"]');

          if (itemCodeElement.hasAttribute('disabled') && groupCodeElement.hasAttribute('disabled')) {
            (forceFriceElement as HTMLInputElement)?.focus();
            return;
          }

          if (enabledPLU) {
            (itemCodeElement as HTMLInputElement)?.focus();
          } else {
            (groupCodeElement as HTMLInputElement)?.focus();
          }
        }, 50);
      })
      .catch(() => {});
  };

  // Handle change store
  useEffect(() => {
    reset();
    setTotalItem(0);
    setSortValue(null);
    setStatusSearch(false);
    setCurrentPage(1);
    setEnabledPLU(true);

    setValue('listData', dataDefault.listData);
    setValue('selectedStored', selectedStores[0]);
    setTimeout(() => {
      const item = document.querySelector('input[name="listData[0].item_code"]');
      (item as HTMLInputElement)?.focus();
    }, 50);
  }, [selectedStores[0]]);

  // Focus first input table
  const focusInput = () => {
    setTimeout(() => {
      focusElementByName('listData[0].item_code');
    }, 500);
  };

  // Handle status button clear
  useEffect(() => {
    if (!isNullOrEmpty(groupCodeLevelOne)) {
      return;
    }
  }, [groupCodeLevelOne, watch('listData')]);

  const columns = React.useMemo<TableColumnDef<IPriceChange>[]>(
    () => [
      {
        accessorKey: 'id_delete_flag',
        header: 'detailMenu.buttonTab.remove',
        size: 5,
        textAlight: 'center',
        type: 'checkbox',
        option(props) {
          if (props.row.original.record_id) {
            return { disabled: false };
          } else {
            return { disabled: true };
          }
        },
      },
      {
        accessorKey: 'my_company_code',
        header: 'touchMenu.productCode',
        size: 10,
        type: 'product',
        disabled: enabledPLU,
        inputTextProps: {
          disabledIfHasRecordId: true,
          addZero: true,
          textAlign: 'right',
          focusOut: suggestMycompanyCode,
          onMaxLengthProductFirstInput(_, index) {
            handleFocusNextElement(index, 'product_code');
          },
          onMaxLengthProductSecondInput(_, index) {
            handleFocusNextElement(index, 'force_price');
          },
        },
        actionSort: watch('listData').some((item) => {
          return item.record_id;
        })
          ? actionSort
          : null,
      },
      {
        accessorKey: 'item_code',
        header: 'touchMenu.PLU',
        size: 15,
        textAlight: 'center',
        type: 'inputNumber',
        disabled: !enabledPLU,
        inputTextProps: {
          maxLength: 13,
          textAlign: 'right',
          disabledIfHasRecordId: true,
          addZero: true,
          focusOut: suggestPluCode,
          onMaxLengthInputTable(_, index) {
            handleFocusNextElement(index, 'force_price');
          },
        },
      },
      {
        accessorKey: 'item_name',
        header: 'home.productName',
        size: 40,
        type: 'text',
        textAlight: 'left',
        useNameForm: true,
        option(info) {
          return { value: formConfig.getValues(`listData[${info.row.index}].item_name` as any) };
        },
        checkError: true,
        textAlign: 'left',
      },
      {
        accessorKey: 'unit_price',
        header: 'touchMenu.standardPrice',
        type: 'text',
        size: 10,
        textAlign: 'right',
        formatNumber: true,
        useNameForm: true,
      },
      {
        accessorKey: 'force_price',
        header: 'label.todayPrice',
        size: 10,
        type: 'inputNumber',
        inputTextProps: {
          maxLength: 6,
          minValue: 1,
          textAlign: 'right',
          thousandSeparator: ',',
          errorPlacement: 'left',
        },
      },
      {
        accessorKey: 'current_price',
        header: 'touchMenu.currentPrice',
        type: 'text',
        size: 10,
        textAlign: 'right',
        formatNumber: true,
        useNameForm: true,
      },
    ],
    [enabledPLU, watch('listData')]
  );

  const disabledClear = useMemo(() => {
    const currentGroupCodeLevelOne = getValues('groupCodeLevelOne');
    const currentListData = getValues('listData');
    return (
      isEqual(dataDefault.groupCodeLevelOne, currentGroupCodeLevelOne) &&
      currentListData.every((item, index) =>
        isEqualObject(item, dataDefault.listData[index], ['group_code', 'product_code', 'item_code', 'force_price'])
      )
    );
  }, [watch()]);

  const isDirtyCheck = useMemo(() => {
    const currentListData = getValues('listData');
    return currentListData.every((item, index) =>
      isEqualObject(item, dataDefault.listData[index], ['group_code', 'product_code', 'item_code', 'force_price'])
    );
  }, [watch()]);

  return (
    <FormProvider {...formConfig}>
      <div className="price-change">
        <Header
          hasESC={true}
          title="緊急売価変更"
          csv={{ disabled: true }}
          printer={{ disabled: false, action: () => handlePrint() }}
          hiddenTextESC={true}
          confirmBack={!isDirtyCheck}
        />
        <div className={'price-change__main'}>
          <SidebarStore
            expanded={true}
            onChangeCollapseExpand={focusInput}
            hasData={!isDirtyCheck}
            clearData={handleClearDataSearch}
            actionConfirm={handleClearDataSearch}
          />
          <div className={'price-change__search'}>
            <div className={'price-change__code'}>
              <div className={'price-change__code__item'}>
                <div>
                  <TooltipNumberInputTextControl
                    width={'70px'}
                    maxLength={2}
                    label={'priceChange.searchCondition.groupCode'}
                    name={'groupCodeLevelOne'}
                    focusOut={handleBlurMyCompanyCode}
                    disabled={statusSearch}
                    addZero={true}
                  />
                </div>
              </div>

              <div className={'price-change__code__item'}>
                <PopoverTextControl name="descriptionLevelOne" className="price-change__code__item__group-code-name" />
              </div>
            </div>
            <div className={'price-change-button'}>
              <ButtonPrimary
                text={enabledPLU ? 'priceChange.productCodeSwitching' : 'priceChange.PLUCodeSwitching'}
                onClick={() => {
                  setEnabledPLU(!enabledPLU);
                }}
              />
              <FuncKeyDirtyCheckButton
                text="action.f12Search"
                funcKey={'F12'}
                funcKeyListener={{
                  groupCodeLevelOne,
                  selectedStores,
                }}
                onClickAction={handleSearchPriceChange}
                dirtyCheck={dirtyCheck}
                okDirtyCheckAction={handleSearchPriceChange}
                disabled={statusSearch}
              />
            </div>
          </div>
          <div className={'price-change__table'}>
            <TableData<IPriceChange>
              columns={columns}
              tableKey={'listData'}
              data={dataPrice}
              enableSelectRow={false}
              showNoData={true}
              sort={{
                key: sortValue ? 'my_company_code' : null,
                type: sortValue,
              }}
            />
          </div>
        </div>
        <PagingBottomButtonControl
          clearAction={handleClearDataSearch}
          confirmName={'dataPriceChange'}
          disableClear={disabledClear && isDisableClear}
          confirmAction={actionConfirm}
          limit={limitRecord}
          totalPage={totalItem === 0 ? null : totalPage}
          page={currentPage}
          actionPaging={actionPaging}
          total_record={totalItem}
        />
      </div>
      <PriceChangeCompare />
    </FormProvider>
  );
};
export default PriceChange;

export const PriceChangeCompare = () => {
  const { control, setValue } = useFormContext();
  const dataForm: IPriceChange[] = useWatch({ control, name: 'listData' });
  useEffect(() => {
    if (isNullOrEmpty(dataForm) || dataForm.length === 0) {
      setValue('dataPriceChange', true);
      setValue('disableConfirm', true);
      return;
    }

    for (let i = 0; i < dataForm.length; i++) {
      const item = dataForm[i];

      if (item.id_delete_flag || (!item.record_id && item.unit_price)) {
        setValue('dataPriceChange', false);
        return;
      }

      if (item.record_id && !isEqual(item.force_price, item.force_price_default)) {
        setValue('dataPriceChange', false);
        return;
      }
    }

    setValue('dataPriceChange', true);
  }, [dataForm]);
  return <></>;
};
