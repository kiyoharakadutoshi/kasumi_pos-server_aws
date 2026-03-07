import { ButtonBottomControl } from '@/components/bottom-button/button-bottom-control';
import { HeaderControl } from '@/components/header/header';
import { SidebarStoreControl } from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import { useAppDispatch, useAppSelector } from '@/config/store';
import { USER_ROLE } from '@/constants/constants';
import { focusElementByName, isNullOrEmpty, localizeFormat } from '@/helpers/utils';
import { INPUT_NAME, PRODUCT_DETAIL } from '@/modules/sc4501-add-product/constant';
import POPInformation from '@/modules/sc4501-add-product/POPInformation';
import ProductInformation from '@/modules/sc4501-add-product/ProductInformation';
import { setReloadDataProduct } from '@/reducers/product-management-reducer';
import { UserDetail } from '@/reducers/user-login-reducer';
import { addProduct } from '@/services/product-service';
import {
  defaultProductDetail,
  INewProduct,
  IProductDetail,
  IProductFormData,
} from 'app/modules/sc0102-product-detail-setting/sc0102-product-detail-interface';
import React, { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import './sc4501-add-product.scss';

const AddProduct = () => {
  const dispatch = useAppDispatch();
  const userDetail: UserDetail = useAppSelector((state) => state.loginReducer.userLogin?.user_detail);
  const stores: string[] = useAppSelector((state) => state.storeReducer.selectedStores);
  const roleCode = useAppSelector((state) => state.loginReducer.userLogin?.user_detail?.role_code);
  const containerRef = useRef<HTMLDivElement>(null);
  const disabledStore = isNullOrEmpty(stores);
  const [hasError, setHasError] = useState<boolean>(false);

  const formConfig = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: defaultProductDetail,
  });

  const { getValues, setValue, handleSubmit } = formConfig;

  const disableUser = disabledStore || (roleCode !== USER_ROLE.ADMIN && roleCode !== USER_ROLE.HEAD);

  useEffect(() => {
    setDefaultData();
  }, []);

  const setDefaultData = () => {
    const detail: IProductDetail = PRODUCT_DETAIL;
    const date = detail?.create_date?.slice(2);
    const data: IProductDetail = {
      ...detail,
      create_date: date, // Replace date yyyy/mm/dd => yy/mm/dd
      update_date: date,
      is_sub_total_discount: detail?.is_sub_total_discount ?? 0,
      is_item_manual_discount: detail?.is_item_manual_discount ?? 0,
      membership_price_type: detail?.membership_price_type ?? 1,
      tax_group_code: getValues('listTax')?.[0]?.value as string,
      tax_rate: detail.tax_rate ?? (getValues('listTax')?.[0] as any)?.rate ?? null,
      created_by: userDetail?.user_name,
      apply_date: date
    };
    setValue('productInfo', data);
    setValue('productInfoDefault', data);
  };


  const handleConfirmAction = (data: IProductFormData) => {
    const productDetail: IProductDetail = data?.productInfo;

    // const calcMyCompanyCode = productDetail.code_level_one + productDetail.my_company_code;
    const calcMyCompanyCode = () => {
      const str = productDetail.code_level_one + productDetail.my_company_code;
      return str.padStart(13, '0');
    };

    const payload: INewProduct = {
      selected_stores: stores,
      my_company_code: calcMyCompanyCode(),
      item_code: productDetail.item_code,
      tax_group_code: productDetail.tax_group_code,
      code_level_one: productDetail.code_level_one,
      code_level_two: productDetail.code_level_two,
      code_level_three: productDetail.code_level_three,
      code_level_four: productDetail.code_level_four,
      unit_price: productDetail.unit_price,
      member_price: productDetail.member_price,
      product_name: productDetail.product_name,
      receipt_name: productDetail.receipt_name,
      is_item_manual_discount: productDetail.is_item_manual_discount,
      is_sub_total_discount: productDetail.is_sub_total_discount,
      membership_price_type: productDetail.membership_price_type,
      number_of_order: productDetail.number_of_order,
      order_unit: productDetail.order_unit,
      number_of_unit: productDetail.number_of_unit,
      unit: productDetail.unit,
      standard_unit: productDetail.standard_unit,
      storage_time: productDetail.storage_time,
      storage_unit: productDetail.storage_unit,
      partner_code: productDetail.partner_code,
      standard_number: productDetail.standard_number
    };

    dispatch(addProduct(payload))
      .unwrap()
      .then((response) => {
        dispatch(setReloadDataProduct(true));
        const status = response?.data.status;
        const errorMessage = response?.data.data;
        // navigate(-1);

        if (status === 'Error') {
          setHasError(true);
          Object.entries(errorMessage).forEach(([key, value]) => {
            formConfig.setError(`productInfo.${key}`, {
              type: 'manual',
              message: localizeFormat(value[0], INPUT_NAME[key]),
            });
          });
          return;
        }

        // Reset data if add success
        handleClearProduct();
      })
      .catch(() => { });
  };

  const handleClearProduct = () => {
    setValue('productInfo', getValues('productInfoDefault'));
    formConfig.clearErrors();
    focusElement();
  };

  const focusElement = (expanded?: boolean) => {
    if (!expanded) {
      focusElementByName('productInfo.my_company_code');
    }
  };

  const actionConfirmStore = () => {
    setValue('productInfo', getValues('productInfoDefault'));
    formConfig.clearErrors();
    setTimeout(() => {
      focusElement(false);
    }, 350);
  };

  return (
    <div className="menu-checkout-wrapper" ref={containerRef}>
      <FormProvider {...formConfig}>
        <SidebarStoreControl
          dirtyName="isDirty"
          expanded={true}
          selectMultiple={true}
          onChangeCollapseExpand={focusElement}
          actionConfirm={actionConfirmStore}
        />
        <HeaderControl
          dirtyCheckName={'isDirty'}
          title="商品管理（新規）設定"
          csv={{
            disabled: true,
          }}
          hasESC={true}
          printer={{
            disabled: true,
          }}
        />
        <main className="main-container add-new-product">
          <ProductInformation
            store={stores?.[0]}
            disabledStore={disabledStore}
            disabledUser={disableUser}
            formConfig={formConfig}
            hasError={hasError}
          />
          <POPInformation disableUser={disableUser} />
        </main>
        <ButtonBottomControl
          name={'disableConfirm'}
          dirtyCheckClear
          clearAction={handleClearProduct}
          confirmAction={() => {
            formConfig.clearErrors();
            handleSubmit(
              (data) => handleConfirmAction(data)
            )();
          }}
        />
      </FormProvider>
    </div>
  );
};

export default AddProduct;
