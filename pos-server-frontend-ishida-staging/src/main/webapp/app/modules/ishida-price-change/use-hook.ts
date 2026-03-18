import { IPriceState } from '@/modules/ishida-price-change/interface-price';
import {
  focusElementByNameWithTimeOut,
  getGroupCode,
  getProductCode,
  isNullOrEmpty,
  localizeFormat,
  localizeString,
} from '@/helpers/utils';
import { UseFormReturn } from 'react-hook-form';
import { useAppDispatch } from '@/config/store';
import { hideLoading, showLoading } from '@/components/loading/loading-reducer';
import { addIshidaPrices, IPriceChangeIshida, IProductIshida, suggestProduct } from '@/services/ishida-price-service';
import React, { useEffect } from 'react';
import { priceDefault } from '@/modules/ishida-price-change/price-constants';
import { IModalInfo, IModalType } from '@/components/modal/modal-common';

export const useHook = (formConfig: UseFormReturn<IPriceState>, storeCode: string) => {
  const dispatch = useAppDispatch();
  const { setError, setValue, getValues, resetField, reset } = formConfig;

  /**
   * Calculate row count table
   */
  useEffect(() => {
    const rowCount = Math.floor((window.innerHeight - 210) / 50);
    if (rowCount > 10) {
      const prices = Array.from({ length: rowCount }, () => priceDefault);
      reset({ prices, isDirtyConfirm: false });
    }
  }, []);

  const suggestItemCode = (itemCode: string, index: number) => {
    if (isNullOrEmpty(itemCode)) return;

    showLoadingData('show');

    if (!validateExistPlu(itemCode, index)) return;

    // API suggest
    dispatch(
      suggestProduct({
        selected_store: Number(storeCode),
        plu: itemCode,
      })
    )
      .unwrap()
      .then((res) => handleSuggestedSuccess(res.data.data, index))
      .catch(() => handleSuggestedError(index, true, false, itemCode));
  };

  const suggestProductCode = (_myCompanyCode: string, index: number) => {
    const row = getValues(`prices.${index}`);
    const isNullOrEmptyGroupCode = isNullOrEmpty(row.group_code);
    const isNullOrEmptyProductCode = isNullOrEmpty(row.product_code);

    if (isNullOrEmptyGroupCode || isNullOrEmptyProductCode) return;

    showLoadingData('show');

    if (!validateExistProduct(row.group_code, row.product_code, index)) return;

    // API suggest
    dispatch(
      suggestProduct({
        selected_store: Number(storeCode),
        my_company_code: `${row.group_code}${row.product_code}`,
      })
    )
      .unwrap()
      .then((res) => handleSuggestedSuccess(res.data.data, index))
      .catch(() => handleSuggestedError(index, false, false, null, row.group_code, row.product_code));
  };

  const confirm = (setShowModalSuccess: React.Dispatch<React.SetStateAction<IModalInfo>>) => {
    showLoadingData('show');
    let isError: boolean = false;
    const confirmPrices: IPriceChangeIshida[] = [];
    const prices = getValues('prices');

    // Validate => Get product valid
    prices.forEach((item, index) => {
      if (!item.success) return;

      if (isNullOrEmpty(item.new_price)) {
        setError(`prices.${index}.new_price`, { message: localizeFormat('MSG_VAL_001', 'priceChange.newPrice') });
        isError = true;
      } else {
        confirmPrices.push({
          item_code: item.item_code,
          current_price: Number(item.new_price),
        });
      }
    });

    // Call API change price
    if (!isError && confirmPrices.length > 0) {
      const firstItem = prices[0];
      dispatch(
        addIshidaPrices({
          company_code: firstItem.company_code,
          store_code: firstItem.store_code,
          prices: confirmPrices,
        })
      )
        .unwrap()
        .then((response) => {
          setValue('isDirtyConfirm', false);
          const messages: string[] = response.data?.data?.messages;
          let message: string;
          if (messages?.length > 0) {
            message = messages?.map((msg) => localizeString(msg))?.join('\n');
          } else {
            message = localizeString('MSG_INFO_008');
          }

          setShowModalSuccess({
            type: IModalType.info,
            isShow: true,
            message,
          });
          showLoadingData('hide');
        })
        .catch(() => showLoadingData('hide'));
    } else {
      showLoadingData('hide');
    }
  };

  const showLoadingData = (type: 'show' | 'hide') => {
    if (type === 'show') {
      dispatch(showLoading({ type: 'loading' }));
    } else {
      dispatch(hideLoading({ type: 'loading' }));
    }
  };

  const clear = () => {
    reset();
    focusElementByNameWithTimeOut(`prices[0].group_code`, 300);
  };

  const handleSuggestedSuccess = (data: IProductIshida, index: number) => {
    setError(`prices.${index}.item_name`, null);
    setValue('isDirtyConfirm', true);
    setValue(`prices.${index}`, {
      ...data,
      group_code: getGroupCode(data.my_company_code),
      product_code: getProductCode(data.my_company_code),
      success: true,
      new_price: getValues(`prices.${index}.new_price`),
    });

    showLoadingData('hide');
  };

  const handleSuggestedError = (
    index: number,
    isPlu: boolean,
    existProduct: boolean,
    itemCode: string,
    groupCode?: string,
    productCode?: string
  ) => {
    resetField(`prices.${index}`, { keepDirty: true });
    setValue(`prices.${index}.item_code`, itemCode);
    setValue(`prices.${index}.group_code`, groupCode);
    setValue(`prices.${index}.product_code`, productCode);

    setErrorItemName(index, isPlu, existProduct, itemCode, groupCode, productCode);
    // Reset dirtyConfirm
    resetDirtyConfirm();
    showLoadingData('hide');
  };

  const resetDirtyConfirm = () => {
    const { prices } = getValues();

    if (getValues('isDirtyConfirm') && prices.every((item) => !item.success)) {
      setValue('isDirtyConfirm', false);
    }
  };

  const validateExistPlu = (value: string, index: number): boolean => {
    const { prices } = getValues();
    if (prices.some((item, idx) => index !== idx && item.item_code === value)) {
      handleSuggestedError(index, true, true, value);
      return false;
    }

    return true;
  };

  const validateExistProduct = (groupCode: string, productCode: string, index: number): boolean => {
    const myCompanyCode = `${groupCode}${productCode}`;
    const { prices } = getValues();
    if (prices.some((item, idx) => index !== idx && item.my_company_code === myCompanyCode)) {
      handleSuggestedError(index, false, true, null, groupCode, productCode);
      return false;
    }

    return true;
  };

  const setErrorItemName = (
    index: number,
    isPlu: boolean,
    existProduct: boolean,
    itemCode: string,
    groupCode?: string,
    productCode?: string
  ) => {
    let message: string;
    if (existProduct) {
      if (isPlu) {
        message = localizeFormat('MSG_VAL_082', 'touchMenu.PLU', itemCode);
      } else {
        message = localizeFormat('MSG_VAL_082', 'touchMenu.productCode', `${groupCode}${productCode}`);
      }
    } else {
      message = localizeString('MSG_ERR_001');
    }

    setError(`prices.${index}.item_name`, { message });
  };

  const handleOKModal = () => {
    clear();
  };

  return { suggestItemCode, suggestProductCode, clear, confirm, handleOKModal };
};
