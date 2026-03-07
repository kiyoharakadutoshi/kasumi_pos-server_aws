import './product-management.scss';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SidebarStore from 'app/components/sidebar-store-default/sidebar-store/sidebar-store';
import { FormProvider, useForm } from 'react-hook-form';
import {
  IMixMatchSpecialPrice,
  ProductManagementDefault,
} from 'app/modules/product-management/product-management-interface';
import { PopoverLabelText } from 'app/components/popover/popover';
import Header from 'app/components/header/header';
import TableData, { TableColumnDef } from 'app/components/table/table-data/table-data';
import { promotionValid } from 'app/modules/special-promotion/interface/special-sale-interface';
import TooltipNumberInputTextControl from 'app/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import {
  focusElementByName,
  formatNumber,
  getGroupCode,
  getGroupProductCode,
  getProductCode,
  isNullOrEmpty,
} from 'app/helpers/utils';
import { Row } from '@tanstack/react-table';
import { useNavigate, useNavigationType } from 'react-router';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { URL_MAPPING } from 'app/router/url-mapping';
import ModalPromotion from 'app/modules/special-promotion/modal-special-promotion/modal-promotion';
import { IPromotionDetail } from 'app/services/promotion-service';
import { getListMixMatchsSpecialPrice, IProduct, IProductResponse, suggestProduct } from 'app/services/product-service';
import {
  clearDataMixMatchsSpecialPrice,
  clearSelectedRow,
  ProductManagementState,
  setReloadDataProduct,
  setSelectedRows,
} from 'app/reducers/product-management-reducer';
import { AxiosResponse } from 'axios';
import { MAX_LENGTH } from 'app/constants/constants';
import FuncKeyDirtyCheckButton from 'app/components/button/func-key-dirty-check/func-key-dirty-check-button';
import { clearDataProduct } from 'app/reducers/product-reducer';
import { Action } from '@remix-run/router';

export enum MIX_MATCH_SETTING_STATUS {
  'ADD' = 'add',
  'EDIT' = 'edit',
}

const ProductManagement = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const navigationType = useNavigationType();

  const formConfig = useForm({
    defaultValues: ProductManagementDefault,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const { setValue, getValues } = formConfig;
  const selectedStore = useAppSelector((state) => state.storeReducer.selectedStores)?.[0];
  const productReducer: ProductManagementState = useAppSelector((state) => state.productManagementReducer);
  const suggestedProduct: IProduct = useAppSelector((state) => state.productManagementReducer?.suggestedProduct);
  const hasProduct = suggestedProduct?.item_code?.length > 0;
  const [showModalPromotion, setShowModalPromotion] = useState(false);

  const data = useMemo(() => {
    return formConfig.getValues('mixMatchs');
  }, [formConfig.watch('mixMatchs')]);

  /**
   * useEffect: function handle when has data product from api
   * 1. Get list mix-matchs, special price
   * 2. Display data product
   * 3. Reload data API if you have action confirm
   */
  useEffect(() => {
    if (!suggestedProduct) return;

    setValue('product', suggestedProduct);
    setValue('selectedRows', productReducer.selectedRows);

    if (suggestedProduct.item_code) {
      // Update value item_code
      if (suggestedProduct.item_code !== getValues('item_code')) {
        setValue('item_code', suggestedProduct.item_code);
      }
    }

    // Update value group_code, product_code
    const my_company_code = suggestedProduct.my_company_code;
    if (my_company_code?.length >= 8) {
      setValue('group_code', getGroupCode(my_company_code));
      setValue('product_code', getProductCode(my_company_code));
    }

    // When confirm from SC0102, SC0103, SC0301, SC0501 => navigate back to SC0101 and call API to reload data
    if (navigationType === Action.Pop && productReducer.reloadData) {
      const plu = suggestedProduct?.item_code;
      if (!isNullOrEmpty(selectedStore)) {
        suggest(plu, true, true);
      }
    }
    dispatch(setReloadDataProduct(false));
  }, [suggestedProduct]);

  useEffect(() => {
    setValue('mixMatchs', productReducer.mixMatchsSpecialPrice);
  }, [productReducer.mixMatchsSpecialPrice]);

  useEffect(() => {
    if (isNullOrEmpty(selectedStore)) return;

    setTimeout(() => {
      focusFirstElement(false);
    }, 100);
  }, []);

  const columns = React.useMemo<TableColumnDef<IMixMatchSpecialPrice>[]>(
    () => [
      {
        accessorKey: 'status',
        header: 'productManagement.status',
        size: 6,
        cell: (props) => promotionValid[data[props.row.index].status],
        textAlign: 'center',
      },
      {
        accessorKey: 'type',
        textAlign: 'center',
        header: 'productManagement.type',
        cell: (props) => (data[props.row.index].code ? 'ミックスマッチ' : '特売'),
        size: 11,
      },
      {
        accessorKey: 'promotion_code',
        type: 'text',
        header: 'productManagement.promotionCode',
        size: 10,
        textAlign: 'left',
      },
      {
        accessorKey: 'code',
        header: 'productManagement.code',
        size: 10,
        type: 'text',
        textAlign: 'left',
      },
      {
        accessorKey: 'start_date_time',
        header: 'productManagement.stage',
        type: 'text',
        size: 21,
        option(props) {
          const start_date_time = data[props.row.index]?.start_date_time?.slice(2, 16);
          const end_date_time = data[props.row.index]?.end_date_time?.slice(2, 16);
          return {
            value: `${start_date_time} ${isNullOrEmpty(start_date_time) || isNullOrEmpty(end_date_time) ? '' : '~'} ${end_date_time}`,
          };
        },
      },
      {
        accessorKey: 'special_price',
        header: 'productManagement.priceInfo',
        size: 42,
        textAlign: 'left',
        type: 'text',
        option(props) {
          const item = data[props.row.index];
          return createDataPrice(item);
        },
      },
    ],
    [data]
  );

  const createDataPrice = (item: IMixMatchSpecialPrice) => {
    if (!item || !item.code)
      return {
        value:
          item.special_price_info?.discount_value > 0
            ? `${item.special_price_info?.discount_value}%`
            : `${formatNumber(item.special_price_info?.special_price, 1)}円`,
      };

    switch (item.type) {
      case '01':
        return {
          value: item?.combination_options
            ?.map(
              (price) =>
                `${formatNumber(price.quantity)}個${formatNumber(price.value, 1)}円(成立後${formatNumber(price.value / price.quantity, 1)}円)`
            )
            ?.join(' | '),
        };
      case '02':
        return {
          value: item?.combination_options
            ?.map((price) => `${formatNumber(price.quantity)}個${formatNumber(price.value, 1)}%`)
            ?.join(' | '),
        };
      case '03':
        return {
          value: item?.combination_options
            ?.map((price) => `${formatNumber(price.quantity)}個${formatNumber(price.value, 1)}円`)
            ?.join(' | '),
        };
      default:
        return { value: '' };
    }
  };

  const focusFirstElement = (isExpand: boolean, isDirty?: boolean) => {
    if (isExpand || isDirty) return;
    const element: HTMLInputElement = document.querySelector('[name="group_code"]');
    element?.focus();
  };

  const actionConfirm = () => {
    clearData();
    setTimeout(() => {
      focusFirstElement(false);
    }, 350);
  };

  const clearData = () => {
    dispatch(clearDataMixMatchsSpecialPrice());
    dispatch(clearDataProduct());
    formConfig.reset();
  };

  const suggest = useCallback(
    (value?: string, isPlu?: boolean, reloadAPI?: boolean) => {
      if (isNullOrEmpty(value)) {
        clearData();
        return;
      }

      setTimeout(() => {
        if (isPlu) {
          const itemCode = formConfig.getValues('item_code');
          if (!reloadAPI && itemCode === getValues('product').item_code && getValues('product.unit_price')) return;

          dispatch(suggestProduct({ plu: itemCode, selected_store: selectedStore }))
            .unwrap()
            .then((response) => handleDataProduct(response, true))
            .catch(() => resetDataInput(true));
          return;
        }

        // Suggest product
        const group_code = formConfig.getValues('group_code');
        const product_code = formConfig.getValues('product_code');

        const stopAPI =
          group_code?.length !== MAX_LENGTH.group_code ||
          product_code?.length !== MAX_LENGTH.product_code ||
          (getGroupProductCode(getValues('product').my_company_code) === `${group_code}${product_code}` &&
            getValues('product.unit_price'));
        if (stopAPI) return;

        dispatch(suggestProduct({ group_code, product_code, selected_store: selectedStore }))
          .unwrap()
          .then((response) => handleDataProduct(response, false))
          .catch(() => resetDataInput(false));
      }, 100);
    },
    [selectedStore]
  );

  const resetDataInput = (isPlu: boolean) => {
    if (isPlu) {
      setValue('product_code', '');
      setValue('group_code', '');
    } else {
      setValue('item_code', '');
    }
  };

  const handleDataProduct = (response: AxiosResponse<IProductResponse, any>, isPlu?: boolean) => {
    const item_code = response.data?.data?.item_code;
    if (response.data?.data?.item_code) {
      dispatch(clearSelectedRow());
      dispatch(getListMixMatchsSpecialPrice({ plu: item_code, store_code: selectedStore }));
    } else {
      resetDataInput(isPlu);
    }
  };

  const addClassNameRow = (row: Row<IMixMatchSpecialPrice>) => {
    if (row.original.status !== 0) return null;
    return { className: row.original.code ? 'mix-matchs-row' : 'special-promotion-row' };
  };

  const navigateToDetail = () => {
    const itemCode = formConfig.getValues('product.item_code');
    const myCompanyCode = formConfig.getValues('product.my_company_code');
    if (isNullOrEmpty(itemCode) || isNullOrEmpty(myCompanyCode)) return;
    navigate(`${URL_MAPPING.SC0102}`, {
      state: { item_code: itemCode, my_company_code: myCompanyCode, store_code: selectedStore },
    });
    setSelectRow();
  };

  const navigateToPriceChange = () => {
    const product = formConfig.getValues('product');
    if (isNullOrEmpty(product.item_code) || isNullOrEmpty(product.my_company_code)) return;
    navigate(`${URL_MAPPING.SC0103}`, { state: product });
    setSelectRow();
  };

  const navigateToSC0301 = (promotionCode?: string) => {
    setSelectRow();
    let dataSC0301: Record<any, any> = {
      ...formConfig.getValues('product'),
      store_code: selectedStore,
    };

    if (!isNullOrEmpty(promotionCode)) {
      const row: IMixMatchSpecialPrice = formConfig.getValues('selectedRows')?.[0]
        ?.original as unknown as IMixMatchSpecialPrice;
      const specialPrice = row?.special_price_info;

      dataSC0301 = {
        ...dataSC0301,
        promotion_code: promotionCode,
        special_price: specialPrice?.special_price,
        discount_value: specialPrice?.discount_value,
        valid: row?.status,
        record_id: row?.record_id,
      };
    }

    setSelectRow();
    navigate(`/special-promotion-edit`, { state: dataSC0301 });
  };

  const navigateToSC0501 = (code?: string, promotionCode?: string, mode?: MIX_MATCH_SETTING_STATUS) => {
    const queryNavigate = {
      screenType: 'fromOtherScreen',
      mode,
      store_code: selectedStore,
      code: code ?? '',
      promotion_code: promotionCode ?? '',
      plu_code: getValues('item_code'),
    };

    navigate(`/${URL_MAPPING.SC0501}`, {
      state: queryNavigate,
      // replace: true
    });

    setSelectRow();
  };

  const setSelectRow = () => {
    dispatch(setSelectedRows(getValues('selectedRows')));
  };

  const handleEdit = () => {
    const selectedRow: IMixMatchSpecialPrice = formConfig.getValues('selectedRows')?.[0]
      ?.original as unknown as IMixMatchSpecialPrice;
    if (!selectedRow) return;

    if (selectedRow.code) {
      navigateToSC0501(selectedRow.code, selectedRow.promotion_code, MIX_MATCH_SETTING_STATUS.EDIT);
    } else {
      navigateToSC0301(selectedRow.promotion_code);
    }
  };

  const handleCloseModalPromotion = (item?: IPromotionDetail) => {
    setShowModalPromotion(false);
    if (!item) return;
    navigateToSC0501(null, item?.code, MIX_MATCH_SETTING_STATUS.ADD);
  };

  const onMaxLength = (type: 'group_code' | 'product_code' | 'item_code') => {
    setTimeout(() => {
      switch (type) {
        case 'group_code':
          focusElementByName('product_code', true);
          break;
        case 'product_code':
          focusElementByName('item_code', true);
          break;
        case 'item_code':
          (document.activeElement as HTMLElement)?.blur();
          break;
        default:
          break;
      }
    }, 50);
  };

  return (
    <FormProvider {...formConfig}>
      <div className="product-management">
        <ModalPromotion
          showModal={showModalPromotion}
          store_code={selectedStore}
          closeModal={handleCloseModalPromotion}
          product={formConfig.watch('product')}
        />
        <SidebarStore
          expanded={true}
          onChangeCollapseExpand={focusFirstElement}
          actionConfirm={actionConfirm}
          hasData={data?.length > 0}
        />
        <Header title="productManagement.title" hasESC={true} csv={{ disabled: true }} printer={{ disabled: true }} />
        <section className="product-management__search">
          <div className="product-management__inline">
            <div className="product-management__product">
              <TooltipNumberInputTextControl
                name="group_code"
                className="product-management__group-code"
                maxLength={MAX_LENGTH.group_code}
                label="productManagement.productCode"
                addZero={true}
                focusOut={suggest}
                required={true}
                onMaxLength={() => onMaxLength('group_code')}
              />
              <TooltipNumberInputTextControl
                name="product_code"
                className="product-management__product-code col-4"
                maxLength={MAX_LENGTH.product_code}
                addZero={true}
                focusOut={suggest}
                onMaxLength={() => onMaxLength('product_code')}
              />
            </div>
            <TooltipNumberInputTextControl
              name="item_code"
              className="col-3"
              label="productManagement.pluCode"
              maxLength={MAX_LENGTH.item_code}
              addZero={true}
              focusOut={(value) => suggest(value, true)}
              required={true}
              onMaxLength={() => onMaxLength('item_code')}
            />
            <PopoverLabelText
              formatedNumber={true}
              label="productManagement.forcePrice"
              text={getValues('product.force_price')}
              className="product-management__force-price"
              textAlign={'end'}
            />
            <PopoverLabelText
              formatedNumber={true}
              label="productManagement.unitPrice"
              text={getValues('product.unit_price')}
              className="product-management__unit-price"
              textAlign={'end'}
            />
          </div>
          <div className="product-management__inline">
            <PopoverLabelText
              label="productManagement.description"
              text={getValues('product.description')}
              className={`product-management__item-name ${hasProduct ? '' : 'product-management__item-name-error'}`}
            />
            <FuncKeyDirtyCheckButton
              funcKey="F1"
              disabled={!hasProduct}
              text="productManagement.detailProduct"
              onClickAction={navigateToDetail}
            />
            <FuncKeyDirtyCheckButton
              funcKey="F2"
              disabled={!hasProduct}
              text="productManagement.changePriceProduct"
              onClickAction={navigateToPriceChange}
            />
            <FuncKeyDirtyCheckButton
              funcKey="F3"
              disabled={!hasProduct}
              text="productManagement.setPrice"
              onClickAction={() => navigateToSC0301()}
            />
            <FuncKeyDirtyCheckButton
              funcKey="F6"
              disabled={!hasProduct}
              text="productManagement.newMixMatch"
              onClickAction={() => {
                const product = formConfig.getValues('product');
                if (isNullOrEmpty(product.item_code) || isNullOrEmpty(product.my_company_code)) return;
                setShowModalPromotion(true);
              }}
            />
            <FuncKeyDirtyCheckButton
              funcKey="F7"
              disabled={!formConfig.watch('selectedRows')}
              text="productManagement.edit"
              onClickAction={handleEdit}
            />
          </div>
        </section>
        <TableData<IMixMatchSpecialPrice>
          columns={columns}
          data={data}
          tableKey="mixMatchs"
          rowConfig={addClassNameRow}
          onDoubleClick={handleEdit}
          showNoData={productReducer.showNoData}
        />
      </div>
    </FormProvider>
  );
};

export default ProductManagement;
