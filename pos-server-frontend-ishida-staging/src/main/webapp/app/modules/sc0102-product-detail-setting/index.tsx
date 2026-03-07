import React, { useEffect, useMemo, useRef } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';

// Constant
import { STORE_CODE_DEFAULT, USER_ROLE } from '@/constants/constants';

// Component
import { ButtonBottomControl } from '@/components/bottom-button/button-bottom-control';
import CompareForm from '@/components/compare-form/compare-form';
import InputControl from '@/components/control-form/input-control';
import SelectControl from '@/components/control-form/select-control';
import { IDropDownItem } from '@/components/dropdown/dropdown';
import { HeaderControl } from '@/components/header/header';
import TooltipInputTextControl from '@/components/input-text/input-text-control';
import TooltipNumberInputTextControl from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import { PopoverTextControl } from '@/components/popover/popover';
import { OperationType } from '@/components/table/table-common';
import TableData, { TableColumnDef } from '@/components/table/table-data/table-data';

// Hook

// Redux
import { useAppDispatch, useAppSelector } from '@/config/store';
import { setError as showErrorModal } from '@/reducers/error';
import { clearDataMixMatchsSpecialPrice, setReloadDataProduct } from '@/reducers/product-management-reducer';
import { clearDataProduct } from '@/reducers/product-reducer';
import { IStoreInfo, selectStore } from '@/reducers/store-reducer';

// Utils
import { blurInputWithTimeout, isNullOrEmpty, localizeString } from '@/helpers/utils';

// Modules
import {
  createDataProductUpdate,
  defaultProductDetail,
  IProductDetail,
  IProductFormData,
  IProductUpdate,
  JANItem,
  keyIProductDetails,
} from '@/modules/sc0102-product-detail-setting/sc0102-product-detail-interface';

// API
import {
  deleteProduct,
  getDetailProduct,
  ProductDeleteParam,
  suggestChildrenProduct,
  updateProduct,
} from '@/services/product-service';
import { getListTaxProduct } from '@/services/tax-service';

// Styles
import { getProductCode } from 'app/helpers/utils';
import { default as hierarchyLevel, default as HierarchyLevel } from 'app/hooks/hierarchy-level';
import { updateMyCompanyCode } from 'app/reducers/product-management-reducer';
import './styles.scss';

export const ITEM_MANUAL_DISCOUNT_PROHIBITION_OPTIONS: IDropDownItem[] = [
  {
    name: 'ﾏﾆｭｱﾙ値引除外しない＋自動値引除外しない',
    value: 0,
    code: '0',
  },
  {
    name: 'ﾏﾆｭｱﾙ値引除外（一般対象）＋自動値引除外しない',
    value: 1,
    code: '1',
  },
  {
    name: 'ﾏﾆｭｱﾙ値引除外（一般＆会員対象）＋自動値引除外しない',
    value: 3,
    code: '3',
  },
  {
    name: 'ﾏﾆｭｱﾙ値引除外しない＋自動値引除外',
    value: 4,
    code: '4',
  },
  {
    name: 'ﾏﾆｭｱﾙ値引（一般）＋自動値引除外',
    value: 5,
    code: '5',
  },
  {
    name: 'ﾏﾆｭｱﾙ値引除外（一般＆会員）＋自動値引除外',
    value: 6,
    code: '6',
  },
];

export const SUBTOTAL_DISCOUNT_PROHIBITION_OPTIONS: IDropDownItem[] = [
  {
    name: '対象外',
    value: 0,
    code: '0',
  },
  {
    name: '一般対象',
    value: 1,
    code: '1',
  },
  {
    name: '一般＆会員対象',
    value: 3,
    code: '3',
  },
];

export const MEMBER_PRIDE_METHOD_TYPE_OPTIONS: IDropDownItem[] = [
  {
    name: '値引額',
    value: 1,
    code: '1',
  },
  {
    name: '%値引',
    value: 2,
    code: '2',
  },
  {
    name: '新売価',
    value: 6,
    code: '6',
  },
];

/**
 * SC0102: Product Detail Information
 *
 * @returns {JSX.Element} The page for product detail information
 */
const ProductDetailSetting = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const stores: IStoreInfo[] = useAppSelector((state) => state.storeReducer.stores);
  const roleCode = useAppSelector((state) => state.loginReducer.userLogin?.user_detail?.role_code);
  const containerRef = useRef<HTMLDivElement>(null);

  const disabledStore = useMemo(() => {
    return !stores?.some((item) => item.store_code === location.state?.store_code);
  }, []);

  const formConfig = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: defaultProductDetail,
  });

  const {
    getValues,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = formConfig;

  const disableUser = disabledStore || roleCode !== USER_ROLE.ADMIN || watch('errorDetail');
  const { getDataHierachy } = hierarchyLevel({ formConfig });
  /**
   * useEffect: Get detail product, list tax
   */
  useEffect(() => {
    dispatch(setReloadDataProduct(false));
    if (
      isNullOrEmpty(location.state?.my_company_code) ||
      isNullOrEmpty(location.state?.item_code) ||
      isNullOrEmpty(location.state?.store_code)
    ) {
      return;
    }

    setValue('productInfo.my_company_code', location.state?.my_company_code);
    setValue('productInfo.item_code', location.state?.item_code);
    setValue('product_code', getProductCode(location.state?.my_company_code));
    dispatch(selectStore(location.state?.store_code));

    handleGetData();
  }, []);

  /**
   * handleGetData: Handle data API 0111, 01113
   */
  const handleGetData = () => {
    getDataAPI()
      .then(async ({ taxResponse, productResponse }) => {
        // Handle data tax: API0113
        const taxItems = taxResponse.data.data?.items.map((item) => ({
          value: item.code,
          name: item.description,
          rate: item.rate,
        }));

        setValue('listTax', taxItems);

        // Handle data detail product: API0111
        const detail = productResponse?.data?.data;
        if (!detail) {
          disableView();
          return;
        }

        const listTax = getValues('listTax');
        const tax: any = listTax?.find((item) => item.value === detail.tax_group_code) ?? listTax?.[0];

        const dataHierachy = await getDataHierachy(detail);

        const data: IProductDetail = {
          ...detail,
          code_level_one: dataHierachy.codeLevelOne,
          code_level_two: dataHierachy.codeLevelTwo,
          code_level_three: dataHierachy.codeLevelThree,
          code_level_four: dataHierachy.codeLevelFour,
          create_date: detail?.create_date?.slice(2), // Replace date yyyy/mm/dd => yy/mm/dd
          update_date: detail?.update_date?.slice(2),
          is_sub_total_discount: detail?.is_sub_total_discount ?? 0,
          is_item_manual_discount: detail?.is_item_manual_discount ?? 0,
          membership_price_type: detail?.membership_price_type ?? 1,
          tax_group_code: tax?.value as string,
          tax_rate: tax?.rate,
        };

        setValue('productInfo', { ...data, children: [] });
        setValue('productInfoDefault', data);
        setValue('productInfo.children', data?.children);

        focusFirstElement();
      })
      .catch(disableView);
  };

  /**
   * disableView when detail null or response error
   */
  const disableView = () => {
    setValue('errorDetail', true);
    setValue('productInfo.item_code', null);
    setValue('product_code', null);
  };

  /**
   * getDataAPI: API 0111, API 0113, API4503
   */
  const getDataAPI = async () => {
    const taxAPI = dispatch(getListTaxProduct({ selected_store: STORE_CODE_DEFAULT })).unwrap();
    const detailAPI = dispatch(
      getDetailProduct({
        plu: location.state?.item_code,
        my_company_code: location.state?.my_company_code,
        selected_store: location.state?.store_code,
      })
    ).unwrap();

    const results = await Promise.all([taxAPI, detailAPI]);
    const [taxResponse, productResponse] = results;
    return { taxResponse, productResponse };
  };

  const focusFirstElement = () => {
    setTimeout(() => {
      const element: HTMLElement = document.querySelector('.code_level_one .dropdown-container__dropdown-button ');
      element?.focus();
    }, 100);
  };

  const handleConfirmAction = (data: IProductFormData, janErrors: any) => {
    formConfig.setError('productInfo.children', janErrors);

    // In case error Jan code => stop call api
    if (
      data.productInfo?.children?.some(
        (item) => !item.record_id && !isNullOrEmpty(item.jan_code) && !item.operation_type && !item.deleted
      )
    )
      return;

    const changedProduct: IProductDetail = data?.productInfo;
    const productUpdate: IProductUpdate = createDataProductUpdate(changedProduct);

    dispatch(updateProduct(productUpdate))
      .unwrap()
      .then(() => {
        dispatch(updateMyCompanyCode(productUpdate.my_company_code));
        dispatch(setReloadDataProduct(true));
        navigate(-1);
      })
      .catch((error) => handleErrorUpdate(error.validate));
  };

  /**
   * handleErrorUpdate: Handle error api SC0102 with status 422
   * @param error
   */
  const handleErrorUpdate = (error?: Record<string, any>) => {
    if (!error) return;
    const keys = Object.keys(error);
    keys.forEach((key) => {
      if (key === 'children') {
        const children: any[] = error.children;
        children.forEach((item: any, index: number) => {
          const valueItemCode = item?.item_code;
          if (isNullOrEmpty(valueItemCode)) {
            formConfig.setError(`productInfo.children[${index}].item_code`, { message: valueItemCode });
          }
        });
      }

      formConfig.setError(`productInfo.${key}`, { message: error[key]?.[0] });
    });
  };

  const handleDeleteProduct = () => {
    const products = getValues('productInfoDefault.children')?.map((item) => item.jan_code) ?? [];
    products?.push(getValues('productInfo.item_code'));
    const param: ProductDeleteParam = {
      selected_store: location.state?.store_code,
      products,
      apply_date: getValues('productInfo.apply_date'),
    };
    dispatch(deleteProduct(param))
      .unwrap()
      .then((response) => {
        if (response.data?.status === 'Success') {
          dispatch(clearDataMixMatchsSpecialPrice());
          dispatch(clearDataProduct());
          navigate(-1);
          return;
        }

        const message =
          response.data?.data?.product?.map((msg) => localizeString(msg))?.join('\n') ??
          localizeString('MSG_ERR_SERVER');
        dispatch(showErrorModal(message));
      })
      .catch(() => {});
  };

  return (
    <div className="menu-checkout-wrapper" ref={containerRef}>
      <FormProvider {...formConfig}>
        <HeaderControl
          dirtyCheckName={'isDirty'}
          title="商品管理（詳細）設定"
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
        <main className="main-container product-detail-setting">
          <ProductView store={location.state?.store_code} disabledStore={disabledStore} disabledUser={disableUser} />
          <div className="product-detail-setting__col table-detail">
            <div className="product-detail-setting__title">子JAN情報</div>
            <TableJANCode store={location.state?.store_code} disabled={disabledStore} />
          </div>
          <div className="product-detail-setting__col pop-info">
            <div className="product-detail-setting__title">POP用情報</div>
            <div className="product-detail-setting__content">
              {/* 発注入り数 */}
              <TooltipNumberInputTextControl
                name="productInfo.number_of_order"
                className="input-condition-keyword element-focus"
                label={'発注入り数'}
                width={'100%'}
                height={'50px'}
                maxLength={3}
                disabled={disableUser}
                errorPlacement="left"
                localizeKey="発注入り数"
                thousandSeparator=","
              />

              {/* 発注単位 */}
              <TooltipInputTextControl
                name="productInfo.order_unit"
                className="input-condition-keyword element-focus"
                title={'発注単位'}
                width={'100%'}
                height={'50px'}
                maxLength={1}
                disabled={disableUser}
                localizeKey="発注単位"
                errorPlacement="left"
              />

              {/* ユニット数 */}
              <TooltipNumberInputTextControl
                name="productInfo.number_of_unit"
                className="input-condition-keyword element-focus"
                label={'ユニット数'}
                width={'100%'}
                height={'50px'}
                maxLength={5}
                decimalScale={2}
                disabled={disableUser}
                errorPlacement="left"
                localizeKey="ユニット数"
                thousandSeparator=","
              />

              {/* ユニット単位 */}
              <TooltipInputTextControl
                name="productInfo.unit"
                className="input-condition-keyword element-focus"
                title={'ユニット単位'}
                width={'100%'}
                height={'50px'}
                maxLength={2}
                disabled={disableUser}
                errorPlacement="left"
                localizeKey="ユニット単位"
              />

              {/* 規格数 */}
              <TooltipNumberInputTextControl
                name="productInfo.standard_number"
                className="input-condition-keyword element-focus"
                label={'規格数'}
                width={'100%'}
                height={'50px'}
                maxLength={2}
                disabled={disableUser}
                errorPlacement="left"
                localizeKey="規格数"
                thousandSeparator=","
              />

              {/* 規格単位 */}
              <TooltipInputTextControl
                name="productInfo.standard_unit"
                className="input-condition-keyword element-focus"
                title={'規格単位'}
                width={'100%'}
                height={'50px'}
                maxLength={2}
                disabled={disableUser}
                errorPlacement="left"
                localizeKey="規格単位"
              />

              {/* 保存期限 */}
              <TooltipNumberInputTextControl
                name="productInfo.storage_time"
                className="input-condition-keyword element-focus"
                label={'保存期限'}
                height={'50px'}
                disabled={disableUser}
                localizeKey="保存期限"
                maxLength={5}
                thousandSeparator=","
                isNegative
                errorPlacement="left"
              />

              {/* 保存単位 */}
              <TooltipInputTextControl
                name="productInfo.storage_unit"
                className="input-condition-keyword element-focus"
                title={'保存単位'}
                width={'100%'}
                height={'50px'}
                maxLength={1}
                disabled={disableUser}
                errorPlacement="left"
                localizeKey="保存単位"
              />

              {/* 取引先コード */}
              <TooltipNumberInputTextControl
                name="productInfo.partner_code"
                className="input-condition-keyword element-focus"
                label="取引先コード"
                width={'100%'}
                height={'50px'}
                maxLength={6}
                disabled={disableUser}
                errorPlacement="left"
                localizeKey="取引先コード"
                thousandSeparator=","
              />
            </div>
          </div>
        </main>
        <ButtonBottomControl
          name={'disableConfirm'}
          deleteAction={handleDeleteProduct}
          disableDelete={disableUser}
          confirmAction={() => {
            const janError = errors.productInfo?.children;
            formConfig.clearErrors();
            handleSubmit(
              (data) => handleConfirmAction(data, janError),
              () => {
                formConfig.setError('productInfo.children', janError);
              }
            )();
          }}
        />
      </FormProvider>
    </div>
  );
};
export default ProductDetailSetting;

const ProductView = ({
  store,
  disabledStore,
  disabledUser,
}: {
  store: string;
  disabledStore: boolean;
  disabledUser?: boolean;
}) => {
  const { setValue, watch, getValues, clearErrors } = useFormContext();
  const { handleGetListCodeLevel } = HierarchyLevel({ store, formConfig: useFormContext() });

  return (
    <div className="product-detail-setting__col product-info">
      <div className="product-detail-setting__title">商品情報</div>
      <div className="product-detail-setting__content pr-16">
        {/* 1. 商品コード */}
        <InputControl
          name="product_code"
          className="input-condition-keyword element-focus"
          labelText={'商品コード'}
          widthInput={'100%'}
          heightInput={'50px'}
          maxLength={6}
          disabled={true}
        />
        {/* 2. PLUコード(親) */}
        <InputControl
          name="productInfo.item_code"
          className="input-condition-keyword element-focus"
          labelText={'PLUコード(親)'}
          widthInput={'100%'}
          heightInput={'50px'}
          maxLength={13}
          disabled={true}
        />

        {/* 5. 部門 */}
        <SelectControl
          name="productInfo.code_level_one"
          label={'部門'}
          className="element-focus code_level_one"
          itemsName="listCodeLevelOne"
          isHiddenCode={false}
          disabled={disabledUser}
          isRequired
          hasBlankItem={true}
          onChange={(item: any) => {
            clearErrors('productInfo.code_level_two');
            handleGetListCodeLevel('Two', item.code, '1');
          }}
        />

        {/* 6. 品群 */}
        <SelectControl
          name="productInfo.code_level_two"
          label={'品群'}
          className="element-focus"
          itemsName="listCodeLevelTwo"
          isHiddenCode={false}
          disabled={disabledUser || isNullOrEmpty(getValues('productInfo.code_level_one'))}
          isRequired
          hasBlankItem={true}
          onChange={(item: any) => {
            clearErrors('productInfo.code_level_three');
            handleGetListCodeLevel('Three', item.code, '2');
          }}
        />

        {/* 7. 品種 */}
        <SelectControl
          name="productInfo.code_level_three"
          label={'部門'}
          className="element-focus"
          itemsName="listCodeLevelThree"
          isHiddenCode={false}
          disabled={disabledUser || isNullOrEmpty(getValues('productInfo.code_level_two'))}
          isRequired
          hasBlankItem={true}
          onChange={(item: any) => {
            clearErrors('productInfo.code_level_four');
            handleGetListCodeLevel('Four', item.code, '3');
          }}
        />

        {/* 8. 分類 */}
        <SelectControl
          name="productInfo.code_level_four"
          label={'分類'}
          className="element-focus"
          itemsName="listCodeLevelFour"
          isHiddenCode={false}
          disabled={disabledUser || isNullOrEmpty(watch('productInfo.code_level_three'))}
          hasBlankItem={true}
        />

        {/* 3. 税種別コード */}
        <div className="product-detail-setting__group-sub-pulldown">
          <SelectControl
            label={'税種別コード'}
            className="element-focus tax-group-code"
            name="productInfo.tax_group_code"
            items={watch('listTax')}
            isHiddenCode={true}
            disabled={disabledUser}
            isRequired
            onChange={(item: any) => setValue('productInfo.tax_rate', item.rate)}
          />
        </div>

        {/* 4. 税率 */}
        <div className="product-detail-setting__group-sub-text">
          <TooltipNumberInputTextControl
            name="productInfo.tax_rate"
            className="input-condition-keyword element-focus input-subtext"
            label={'税率'}
            width={'100%'}
            height={'50px'}
            maxLength={6}
            disabled={true}
            textAlign="right"
          />
          <div>%</div>
        </div>

        {/* 9. 単価 */}
        <div className="product-detail-setting__group-sub-text">
          <TooltipNumberInputTextControl
            name="productInfo.unit_price"
            className="input-condition-keyword element-focus input-subtext"
            label={'単価'}
            width={'100%'}
            height={'50px'}
            maxLength={6}
            disabled={disabledStore || watch('errorDetail')}
            required
            thousandSeparator=","
            textAlign="right"
            localizeKey="単価"
            minValue={1}
          />
        </div>

        {/* 10. 会员売価 */}
        <div className="product-detail-setting__group-sub-text">
          <TooltipNumberInputTextControl
            name="productInfo.member_price"
            className="input-condition-keyword element-focus input-subtext"
            label="会員価格"
            width={'100%'}
            height={'50px'}
            maxLength={6}
            disabled={disabledUser}
            required
            textAlign="right"
            thousandSeparator=","
            localizeKey="会員価格"
            minValue={1}
          />
        </div>

        {/* 12. 商品名称 */}
        <TooltipInputTextControl
          name="productInfo.product_name"
          className="input-condition-keyword element-focus"
          title={'商品名称'}
          width={'100%'}
          height={'50px'}
          maxLength={100}
          disabled={disabledUser}
          required
          localizeKey="商品名称"
        />

        {/* 13. レシート商品名称 */}
        <TooltipInputTextControl
          name="productInfo.receipt_name"
          className="input-condition-keyword element-focus"
          title={'レシート商品名称'}
          width={'100%'}
          height={'50px'}
          maxLength={50}
          disabled={disabledUser}
          required
          localizeKey="レシート商品名称"
        />

        {/* 15. 単品値引き除外 */}
        <SelectControl
          label={'単品値引き除外'}
          name="productInfo.is_item_manual_discount"
          items={ITEM_MANUAL_DISCOUNT_PROHIBITION_OPTIONS}
          disabled={disabledUser}
          isRequired
        />

        {/* 16. 小計マニュアル値引き除外 */}
        <SelectControl
          label={'小計マニュアル値引き除外'}
          name="productInfo.is_sub_total_discount"
          items={SUBTOTAL_DISCOUNT_PROHIBITION_OPTIONS}
          disabled={disabledUser}
          isRequired
        />

        {/* 17. 会員価格方式 */}
        <SelectControl
          label={'会員価格方式'}
          name="productInfo.membership_price_type"
          items={MEMBER_PRIDE_METHOD_TYPE_OPTIONS}
          disabled={disabledUser}
          isRequired
        />

        {/* 18. 登録日 */}
        <PopoverTextControl
          className="input-condition-keyword element-focus"
          label={'登録日'}
          name="productInfo.create_date"
        />

        {/* 19. 更新日 */}
        <PopoverTextControl
          className="input-condition-keyword element-focus"
          label={'更新日'}
          name="productInfo.update_date"
        />

        {/* 20. 更新者 */}
        <PopoverTextControl
          className="input-condition-keyword element-focus"
          label={'更新者'}
          name="productInfo.employee_update"
        />
        <ProductDetailCompare />
      </div>
    </div>
  );
};

const TableJANCode = ({ store, disabled }: { store: string; disabled: boolean }) => {
  const dispatch = useAppDispatch();
  const { getValues, setValue, watch, setError } = useFormContext();

  const dataTable: JANItem[] = useMemo(() => {
    return getValues('productInfo.children') ?? [];
  }, [watch('productInfo.children')]);

  /**
   * useEffect: Scroll and focus added element
   */
  useEffect(() => {
    const element = document.querySelector('.table-scroll');
    if (!element) return;

    setTimeout(() => {
      element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
      const inputFocus: HTMLInputElement = document.querySelector(
        `[name="productInfo.children[${dataTable?.length - 1}].jan_code"]`
      );
      inputFocus?.focus();
    }, 50);
  }, [dataTable]);

  const focusOut = (value: string, index: number) => {
    // Validate empty
    const operationType = nameValue(index, 'operation_type');
    if (isNullOrEmpty(value)) {
      setValue(operationType, null);
      showErrorValidate(null, index);
      return;
    }

    const parent_plu = getValues('productInfo.item_code');
    if (value === parent_plu) {
      setValue(operationType, null);
      showErrorValidate('MSG_VAL_043', index);
      return;
    }

    // API check exist plu
    dispatch(suggestChildrenProduct({ selected_store: store ?? '', plu: value, parent_plu }))
      .unwrap()
      .then(() => {
        setValue(operationType, OperationType.New);
        showErrorValidate(null, index);
      })
      .catch((error) => {
        setValue(operationType, null);
        if (error?.response?.status === 422) {
          const values = Object.values(error?.validate);
          const errorValue = values?.find((item) => !isNullOrEmpty(item))?.[0];
          showErrorValidate(errorValue, index);
        } else {
          showErrorValidate('MSG_ERR_001', index);
        }
      });
  };

  const nameValue = (index: number, key = 'jan_code') => `productInfo.children[${index}].${key}`;

  const showErrorValidate = (validateMsg: string, index: number) => {
    setError(nameValue(index, 'jan_code'), { type: 'manual', message: localizeString(validateMsg) });
  };

  const columns = React.useMemo<TableColumnDef<JANItem>[]>(
    () => [
      {
        accessorKey: 'record_id',
        header: 'No',
        size: 25,
        cell(info) {
          return info.row.index + 1;
        },
        textAlign: 'center',
      },
      {
        accessorKey: 'jan_code',
        textAlign: 'center',
        header: 'PLUコード',
        cell(info) {
          if (info.row.original.record_id) return info.row.original.jan_code;
          return (
            <TooltipNumberInputTextControl
              name={`productInfo.children[${info.row.index}].jan_code`}
              maxLength={13}
              addZero
              focusOut={(value) => focusOut(value, info.row.index)}
              disabled={watch(`productInfo.children[${info.row.index}].deleted`) || disabled}
              focusOutWhenTabEnter={false}
              onMaxLength={() => blurInputWithTimeout(true)}
              focusOutWhenDataNotChanged={false}
            />
          );
        },
        size: 50,
      },
      {
        accessorKey: 'deleted',
        type: 'checkbox',
        header: '削除',
        option(info) {
          return { disabled: isNullOrEmpty(info.row?.original?.jan_code) };
        },
        size: 25,
        disabled,
      },
    ],
    []
  );

  const addJANCode = () => {
    if (getValues('errorDetail') || disabled) return;
    const janItems = [...dataTable, { jan_code: '', deleted: false }];
    setValue(`productInfo.children`, janItems);
  };

  return (
    <div
      className={`product-detail-setting__content product-detail-setting__jan-container ${
        disabled ? 'product-detail-setting__jan-disabled' : ''
      }`.trim()}
      style={{ '--table-jan-height': dataTable?.length } as React.CSSProperties}
    >
      <TableData<JANItem>
        columns={columns}
        data={dataTable ?? []}
        actionFooter={addJANCode}
        tableKey="productInfo.children"
        enableSelectRow={false}
        disableSingleRecordPadding={true}
      />
    </div>
  );
};

const ProductDetailCompare = () => {
  return (
    <CompareForm
      name="productInfo"
      nameCompare="productInfoDefault"
      paramsEqual={keyIProductDetails}
      extraCompare={(obj1: IProductDetail) =>
        !obj1?.children?.some((item: JANItem) => item.operation_type || (item.record_id && item.deleted))
      }
    />
  );
};
