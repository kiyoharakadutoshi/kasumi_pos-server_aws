import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Translate } from 'react-jhipster';

// Libraries
import { FormProvider, useForm } from 'react-hook-form';
import { number, object, string, ValidationError } from 'yup';

// Hooks
import { useAppDispatch, useAppSelector } from '@/config/store';
import {
  setSort,
  setFormData,
  setStoreMachineCodeOptionsReducer,
  clearFormDataRevenue,
} from 'app/reducers/product-revenue-pos-reducer';
import { elementChangeKeyListener } from '@/hooks/keyboard-hook';

// Reducers and Services
import { getCashRegister } from 'app/services/setting-master-service';
import { getCashRegisterRevenue } from '@/services/product-revenue-pos-service';
import { getHierarchyLevel } from '@/services/hierarchy-level-service';
import { suggestProduct } from '@/services/product-service';

// Components
import Header from '@/components/header/header';
import SidebarStore from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import ActionsButtonBottom from '@/components/bottom-button/actions-button-bottom';
import SelectControl from '@/components/control-form/select-control';
import { IDropDownItem } from '@/components/dropdown/dropdown';
import TableData, { TableColumnDef } from '@/components/table/table-data/table-data';
import TooltipNumberInputTextControl from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import RadioControl from '@/components/control-form/radio-control';
import { IRadioButtonValue } from '@/components/radio-button-component/radio-button';
import ButtonPrimary from '@/components/button/button-primary/button-primary';
import { MenuIcon } from '@/components/icons';
import ProductListModal from './modal-product-list';
import FuncKeyDirtyCheckButton from '@/components/button/func-key-dirty-check/func-key-dirty-check-button';
import TooltipDatePickerControl from 'app/components/date-picker/tooltip-date-picker/tooltip-date-picker-control';

// Types and Interfaces
import {
  FormDataRevenue,
  CashRegisterReportTypeEnum,
  ProductRevenuePOS,
  IProductRevenuePosSearchState,
  CashRegisterRevenue,
  OUTPUT_UNIT_OPTIONS,
  ModalProductListResponseItems,
} from 'app/modules/sc3201-product-revenue-pos/product-revenue-pos-interface';
import { TSortType } from 'app/components/table/table-data/interface-table';

// Utils
import { localizeFormat } from '@/helpers/utils';
import { getFocusableElements } from '@/helpers/utils-element-html';
import {
  isNullOrEmpty,
  localizeString,
  isValidDate,
  getGroupProductCode,
  focusElementByNameWithTimeOut,
} from 'app/helpers/utils';
import { URL_MAPPING } from '@/router/url-mapping';
import { KEYDOWN } from '@/constants/constants';
import {
  getDateFromDateWithMonth,
  convertDateServer,
  getPreviousDate,
  fullDateToSortDate,
} from 'app/helpers/date-utils';

// Styles
import './styles.scss';
import { PopoverTextControl } from 'app/components/popover/popover';

const MAPPING_ERROR = {
  'businessDay.startDate': '営業日',
  'businessDay.endDate': '営業日',
  displayedItemCount: '表示件数',
  pluCode: 'PLUコード',
};

export enum Level {
  LevelOne = 1,
  LevelTwo = 2,
  LevelThree = 3,
  LevelFour = 4,
}

const DEFAULT_VALUE: FormDataRevenue = {
  businessType: 0,
  startDate: convertDateServer(new Date()),
  endDate: convertDateServer(new Date()),
  displayedItemCount: 3000,
  storeMachineCode: null,
  outputUnit: 0,
  classification: null,
  pluCode: '',
  productName: '',
  tableData: [],
};

const TYPE_OPTION_LIST: IRadioButtonValue[] = [
  {
    id: 0,
    textValue: 'productRevenuePos.new',
  },
  {
    id: 1,
    textValue: 'productRevenuePos.daily',
  },
];

/**
 * SC3201:
 *
 * @returns {JSX.Element} The page for
 */
const RevenueCheckByProductAndPOS = (): JSX.Element => {
  // Hook from React
  const containerRef = useRef<HTMLDivElement>(null);
  const divCommonRef = useRef(null);
  const storesRef = useRef([]);

  // Redux Hooks
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const selectedStores: string[] = useAppSelector((state) => state.storeReducer.selectedStores);
  const searchState: IProductRevenuePosSearchState = useAppSelector(
    (state) => state.productRevenuePosReducer.searchState
  );
  const formDataRevenue: FormDataRevenue = useAppSelector((state) => state.productRevenuePosReducer.formData);

  const storeMachineCodeOptionsReducer: IDropDownItem[] = useAppSelector(
    (state) => state.productRevenuePosReducer.storeMachineCodeOptions
  );

  // State Variables
  const [isShowModal, setIsShowModal] = useState(false);
  const [storeMachineCodeOptions, setStoreMachineCodeOptions] = useState<IDropDownItem[]>([]);
  const [itemData, setItemData] = useState<ProductRevenuePOS | null>(null);

  const maxDate = new Date();
  const minDate = getDateFromDateWithMonth(-3, maxDate);

  // Form Configuration
  const formConfig = useForm({
    defaultValues: DEFAULT_VALUE,
    // resolver: yupResolver(validationSchema) as unknown as Resolver<FormDataRevenue>,
  });

  const { getValues, watch, setValue, setError } = formConfig;

  // Validation Schema
  const validationSchema = object<FormDataRevenue>().shape({
    businessDay: object().test((data: { startDate: string; endDate: string }) => {
      if (data.startDate > data.endDate) {
        setError('startDate', { message: localizeString('MSG_VAL_051') });
        return false;
      }
      return true;
    }),
    displayedItemCount: number().required('MSG_VAL_001'),
    pluCode: string().required('MSG_VAL_001'),
  });

  const callApiCashRegisterRevenue = (sortColumn?: keyof ProductRevenuePOS, sortValue?: TSortType) => {
    // Reset selected row when search
    formConfig.setValue('selectedRows', null);

    const {
      pluCode,
      displayedItemCount,
      startDate,
      endDate,
      outputUnit,
      businessType,
      classification,
      storeMachineCode,
    } = getValues();

    const param: CashRegisterRevenue = {
      selected_store: storesRef.current?.[0],
      business_type: businessType,
      start_date: fullDateToSortDate(startDate),
      end_date: fullDateToSortDate(endDate),
      cash_register_code: storeMachineCode,
      plu_code: pluCode,
      limit: displayedItemCount,
      report_type: 0,
      order_type: sortValue ?? searchState?.sort_value ?? 'DESC',
      order_by: sortColumn ?? searchState?.sort_column ?? 'my_company_code',
      ...(outputUnit !== 0 && {
        md_hierarchy_level: outputUnit,
        md_hierarchy_code: classification,
      }),
    };

    dispatch(getCashRegisterRevenue(param))
      .unwrap()
      .then((res) => {
        const items = res?.data?.data?.items;
        formConfig.setValue('tableData', items);
        setValue('showNoData', isNullOrEmpty(items));
      })
      .catch(() => {
        setValue('showNoData', true);
      });
  };

  const actionSort = (keyItem: keyof ModalProductListResponseItems, type: TSortType) => {
    dispatch(setSort({ key: keyItem, value: type }));
    callApiCashRegisterRevenue(keyItem, type);
  };

  const columns = React.useMemo<TableColumnDef<ProductRevenuePOS>[]>(
    () => [
      {
        accessorKey: 'no',
        header: 'table.no',
        size: 4,
        type: 'text',
        textAlign: 'center',
        option(props) {
          return { value: props?.row?.index + 1 };
        },
      },
      {
        accessorKey: 'my_company_code',
        textAlign: 'left',
        header: 'table.productCode',
        type: 'text',
        option(props) {
          return { value: getGroupProductCode(props?.row?.original?.my_company_code) };
        },
        size: 9,
        actionSort,
      },
      {
        accessorKey: 'item_code',
        textAlign: 'left',
        header: 'table.pluCode',
        type: 'text',
        size: 11,
      },
      {
        accessorKey: 'description',
        textAlign: 'left',
        header: 'table.name',
        type: 'text',
        size: 29,
      },
      {
        accessorKey: 'sale_amount',
        textAlign: 'right',
        header: 'table.saleAmount',
        type: 'text',
        size: 9,
        formatNumber: true,
        actionSort,
      },
      {
        accessorKey: 'sale_quantity',
        textAlign: 'right',
        header: 'table.salePoint',
        type: 'text',
        size: 8,
        formatNumber: true,
        actionSort,
      },
      {
        accessorKey: 'pi',
        textAlign: 'right',
        header: 'table.valuePi',
        fixedDigit: true,
        numberFractionDigits: 1,
        formatNumber: true,
        type: 'text',
        size: 7.5,
      },
      {
        accessorKey: 'discount_amount',
        textAlign: 'right',
        header: 'table.discountAmount',
        type: 'text',
        formatNumber: true,
        size: 6.5,
      },
      {
        accessorKey: 'discount_count',
        textAlign: 'right',
        header: 'table.discountPoint',
        type: 'text',
        formatNumber: true,
        size: 6.5,
      },
      {
        accessorKey: 'last_sale_date',
        textAlign: 'left',
        header: 'table.lastSalesDate',
        type: 'text',
        size: 10.5,
      },
    ],
    []
  );

  const handleSearchProduct = () => {
    setIsShowModal(true);
  };

  const handleCloseModal = (data?: ModalProductListResponseItems) => {
    setIsShowModal(false);
    if (data) {
      setValue('pluCode', data.item_code);
      setError('pluCode', null);
      setValue('productName', data.description);
      setError('productName', null);
    }
  };

  const handleRowClick = (rowData: ModalProductListResponseItems) => {
    dispatch(setFormData(formConfig.getValues()));
    dispatch(setStoreMachineCodeOptionsReducer(storeMachineCodeOptions));
    const cash_register_code = formConfig.getValues('storeMachineCode');
    const cash_register_name = storeMachineCodeOptions?.find((item) => item.value === cash_register_code)?.name ?? '';
    const itemDataParent: ProductRevenuePOS = {
      ...rowData,
      start_date: getValues('startDate'),
      end_date: getValues('endDate'),
      store_code: storesRef.current?.[0],
      cash_register_code,
      cash_register_name,
    };
    setItemData(itemDataParent);
  };

  const focusFirstElement = () => {
    const element = getFocusableElements(divCommonRef.current) as unknown as HTMLElement[];
    element[0].focus();
  };

  const isShowProductName = useMemo(() => watch('outputUnit') === 5, [watch('outputUnit')]);

  const isEnableClassification = useMemo(() => watch('outputUnit') === 0, [watch('outputUnit')]);

  elementChangeKeyListener(isShowProductName);

  /**
   *
   * @returns
   */
  const handleSearchProductRevenue = async () => {
    const { pluCode, displayedItemCount, startDate, endDate, classification, outputUnit } = getValues();

    // Clear error before validate
    formConfig.setError('startDate', null);
    formConfig.setError('classification', null);
    formConfig.setError('storeMachineCode', null);
    let errorValidate = false;

    if (storeMachineCodeOptions.length === 0) {
      setError('storeMachineCode', { message: localizeFormat('MSG_VAL_001', 'productRevenuePos.registerNumber') });
      errorValidate = true;
    }

    if (outputUnit > 0 && outputUnit < 5 && isNullOrEmpty(classification)) {
      setError('classification', { message: localizeFormat('MSG_VAL_001', 'productRevenuePos.outputUnits') });
      errorValidate = true;
    }

    try {
      await validationSchema.validate(
        {
          businessDay: { startDate, endDate },
          displayedItemCount,
          pluCode: isShowProductName ? pluCode : '1',
        },
        { abortEarly: false }
      );

      if (!errorValidate) {
        callApiCashRegisterRevenue();
      }
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

  const handleCheckingSalesItem = () => {
    navigate(URL_MAPPING.SC3202, { state: itemData });
  };

  /**
   * Process event when click button on keyboard
   */
  const handleKeyDownEvent = (event: KeyboardEvent) => {
    if (event.key === KEYDOWN.F12) {
      handleSearchProductRevenue();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDownEvent, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDownEvent, true);
    };
  }, [getValues('pluCode')]);

  const resetDate = () => {
    if (watch('businessType') === CashRegisterReportTypeEnum.New) {
      const currentDate = convertDateServer(new Date());
      setValue('startDate', currentDate);
      setValue('endDate', currentDate);
    } else {
      const date = convertDateServer(getPreviousDate(maxDate));
      setValue('startDate', date);
      setValue('endDate', date);
    }
  }

  const memoizedSelectedStores = useMemo(() => {
    return selectedStores;
  }, [selectedStores]);

  /**
   * useMemo disabledSearch
   */
  const disabledSearch = useMemo(() => {
    const startDate = getValues('startDate');
    const endDate = getValues('endDate');
    if (getValues('outputUnit') === 5 && formConfig.formState.errors.productName?.message) {
      return true;
    }
    return !isValidDate(startDate) || !isValidDate(endDate);
  }, [
    watch('startDate'),
    watch('endDate'),
    storeMachineCodeOptions,
    watch('pluCode'),
    watch('outputUnit'),
    watch('productName'),
  ]);

  /**
   * Focus element when back from SC3202
   */
  useEffect(() => {
    if (!isNullOrEmpty(selectedStores)) {
      focusElementByNameWithTimeOut('businessType0', 100);
    }
  }, []);

  useEffect(() => {
    if (isNullOrEmpty(memoizedSelectedStores)) return;
    storesRef.current = memoizedSelectedStores;

    if (formDataRevenue?.tableData.length > 0) {
      formConfig.setValue('tableData', formDataRevenue.tableData);
      if (storeMachineCodeOptionsReducer) {
        setStoreMachineCodeOptions(storeMachineCodeOptionsReducer);
        setValue('storeMachineCode', formDataRevenue.storeMachineCode);
      }

      setValue('displayedItemCount', formDataRevenue.displayedItemCount);
      setValue('startDate', formDataRevenue?.startDate);
      setValue('endDate', formDataRevenue?.endDate);
      setValue('outputUnit', formDataRevenue.outputUnit);
      setValue('businessType', formDataRevenue.businessType);
      setValue('classification', formDataRevenue.classification);
      formConfig.resetField('selectedRows');
      setValue('classificationItems', formDataRevenue.classificationItems);
      if (formDataRevenue.pluCode) {
        setValue('pluCode', formDataRevenue.pluCode);
      }
      if (formDataRevenue.productName) {
        setValue('productName', formDataRevenue.productName);
      }

      dispatch(clearFormDataRevenue());
      return;
    }

    dispatch(
      getCashRegister({
        selected_store: selectedStores,
      })
    )
      .unwrap()
      .then((response) => {
        const result = response.data.data;
        const fetchedOptions: IDropDownItem[] = result.items.map((item) => ({
          value: item.code,
          code: item.code,
          name: item.type_name,
        }));

        setStoreMachineCodeOptions(fetchedOptions);
        formConfig.setValue('storeMachineCode', fetchedOptions[0].value as string);
      })
      .catch(() => { });
  }, [memoizedSelectedStores]);

  const handleChangeOutputInitOption = (item: any) => {
    // Reset error
    setError('classification', null);

    // Clear data classificationItems when select all
    if (item.value === 0) {
      const emptyClassification: IDropDownItem[] = [];
      setValue('classificationItems', emptyClassification);
      return;
    }

    // Reset PlU when select mode PLU
    if (item.value === 5) {
      setValue('pluCode', null);
      setError('pluCode', null)
      setValue('productName', null);
      formConfig.setError('productName', null);
      return;
    }

    dispatch(getHierarchyLevel({
      level: item.value,
      filter_type: 2,
    }))
      .unwrap()
      .then((res) => {
        const result = res?.data?.data;
        let fetchedUniteOptions: IDropDownItem[] = [];

        switch (item.value) {
          case Level.LevelOne:
            fetchedUniteOptions = result.items.map((dataItem) => ({
              value: dataItem.code_level_one,
              code: dataItem.code_level_one,
              name: dataItem.description,
            }));
            break;
          case Level.LevelTwo:
            fetchedUniteOptions = result.items.map((dataItem) => ({
              value: dataItem.code_level_two,
              code: dataItem.code_level_two,
              name: dataItem.description,
            }));
            break;
          case Level.LevelThree:
            fetchedUniteOptions = result.items.map((dataItem) => ({
              value: dataItem.code_level_three,
              code: dataItem.code_level_three,
              name: dataItem.description,
            }));
            break;
          case Level.LevelFour:
            fetchedUniteOptions = result.items.map((dataItem) => ({
              value: dataItem.code_level_four,
              code: dataItem.code_level_four,
              name: dataItem.description,
            }));
            break;
          default:
            break;
        }

        setValue('classification', (fetchedUniteOptions?.[0]?.value as string) ?? null);
        setValue('classificationItems', fetchedUniteOptions);
      })
      .catch(() => { });
  };

  const clearData = () => {
    formConfig.reset();
    setTimeout(() => {
      focusFirstElement();
    }, 350);
  };

  const handleSuggest = () => {
    // Reset product Name when clear plu code
    const pluCode = getValues('pluCode');
    if (isNullOrEmpty(pluCode)) {
      setValue('productName', null);
      setError('productName', null);
      return
    }

    dispatch(
      suggestProduct({
        selected_store: storesRef.current?.[0],
        plu: pluCode,
      })
    )
      .unwrap()
      .then((response) => {
        const dataProduct = response.data.data;

        if (dataProduct) {
          setValue('productName', dataProduct.description);
          formConfig.setError('productName', null);
        } else {
          setErrorProductName();
        }
      })
      .catch(setErrorProductName);
  };

  const setErrorProductName = () => {
    const error = localizeString('MSG_ERR_001');
    setValue('productName', error);
    formConfig.setError('productName', { message: error });
  };

  return (
    <div className="menu-checkout-wrapper" ref={containerRef}>
      <Header
        title="productRevenuePos.title"
        csv={{
          disabled: true,
        }}
        hasESC={true}
        printer={{
          disabled: true,
        }}
      />

      <SidebarStore
        expanded={true}
        onChangeCollapseExpand={focusFirstElement}
        actionConfirm={clearData}
        hasData={watch('tableData')?.length > 0}
      />

      <FormProvider {...formConfig}>
        <ProductListModal isShowModal={isShowModal} handleCloseModal={handleCloseModal} />
        <main className="main-container product-revenue-pos">
          <div className="product-revenue-pos__search" ref={divCommonRef}>
            <div className="product-revenue-pos__search-box">
              <div className="product-revenue-pos__search-item report-type-date">
                <label className="label-radio">
                  <Translate contentKey={'productRevenuePos.business'} />
                  <span className="text-require">*</span>
                </label>
                <RadioControl
                  isVertical={false}
                  name="businessType"
                  value={getValues('businessType')}
                  listValues={TYPE_OPTION_LIST}
                  onChange={resetDate}
                />
              </div>

              <div className="product-revenue-pos__search-item date-time">
                <TooltipDatePickerControl
                  required={true}
                  inputClassName="end-date"
                  name={'startDate'}
                  labelText="productRevenuePos.workingDate"
                  disabled={watch('businessType') !== CashRegisterReportTypeEnum.Daily}
                  checkEmpty={true}
                  keyError={'listCashRegisterReport.startDateReport'}
                  maxDate={maxDate}
                  minDate={minDate}
                  errorPlacement={'left'}
                />
                ～
                <TooltipDatePickerControl
                  required={true}
                  inputClassName="end-date"
                  name={'endDate'}
                  disabled={watch('businessType') !== CashRegisterReportTypeEnum.Daily}
                  checkEmpty={true}
                  keyError={'listCashRegisterReport.endDateReport'}
                  maxDate={maxDate}
                  minDate={minDate}
                  errorPlacement={'right'}
                />
              </div>

              <div className="product-revenue-pos__search-item">
                <TooltipNumberInputTextControl
                  minValue={1}
                  maxLength={5}
                  width={'100%'}
                  className="item-count"
                  name="displayedItemCount"
                  label="productRevenuePos.limitRecord"
                  required
                  textAlign="right"
                />
              </div>

              <div className="product-revenue-pos__search-item">
                <SelectControl
                  name="storeMachineCode"
                  className="register-number"
                  label="productRevenuePos.registerNumber"
                  items={storeMachineCodeOptions}
                  isRequired
                  errorPlacement="left"
                />
              </div>

              <div className="product-revenue-pos__search-item">
                <SelectControl
                  name="outputUnit"
                  className="unit-option"
                  label="productRevenuePos.outputUnits"
                  onChange={(item: any) => handleChangeOutputInitOption(item)}
                  items={OUTPUT_UNIT_OPTIONS}
                  isRequired
                />
              </div>

              {!isShowProductName && (
                <div className={'product-revenue-pos__search-item'}>
                  <SelectControl
                    name="classification"
                    className="select-revenue"
                    items={watch('classificationItems')}
                    disabled={isEnableClassification}
                    isRequired
                  />
                </div>
              )}

              <div
                className="product-revenue-pos__search-item end-item"
                style={{
                  gridColumn: isShowProductName ? '2 / -1' : '3 / -1',
                }}
              >
                {isShowProductName && (
                  <>
                    <TooltipNumberInputTextControl
                      maxLength={13}
                      width={'100%'}
                      name="pluCode"
                      height={'50px'}
                      label="productRevenuePos.pluCode"
                      required
                      addZero
                      focusOut={() => handleSuggest()}
                    />

                    <ButtonPrimary disabled={false} onClick={handleSearchProduct} icon={<MenuIcon />} />

                    <PopoverTextControl name="productName" className={'product-name'} />
                  </>
                )}

                <FuncKeyDirtyCheckButton
                  funcKey={'F12'}
                  disabled={disabledSearch}
                  className="search-button"
                  text="label.searchF12"
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClickAction={async () => {
                    await handleSearchProductRevenue();
                  }}
                  funcKeyListener={selectedStores}
                />
              </div>
            </div>
          </div>

          <div className="product-revenue-pos__list">
            <TableData<ModalProductListResponseItems>
              columns={columns}
              data={watch('tableData')}
              tableKey="tableData"
              sort={{ type: searchState?.sort_value, key: searchState?.sort_column }}
              onDoubleClick={handleCheckingSalesItem}
              onClickRow={handleRowClick}
              showNoData={watch('showNoData')}
            />
          </div>
        </main>
      </FormProvider>

      <ActionsButtonBottom>
        <ButtonPrimary
          disabled={isNullOrEmpty(watch('selectedRows'))}
          text="table.lastSalesDate"
          onClick={handleCheckingSalesItem}
        />
      </ActionsButtonBottom>
    </div>
  );
};
export default RevenueCheckByProductAndPOS;
