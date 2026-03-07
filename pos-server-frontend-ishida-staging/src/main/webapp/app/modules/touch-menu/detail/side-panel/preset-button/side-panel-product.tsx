import React, { useEffect, useState } from 'react';
import 'app/modules/touch-menu/detail/preset.scss';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { clearErrorMessage, PresetState, saveProduct, selectButton, setButtonDescription, setErrorMessage, setPresetButtonProduct } from '../../reducer/preset-reducer';

import NumberInputText from 'app/components/input/input-text/number-input';
import { clearDataProduct } from 'app/reducers/product-reducer';
import { GROUP_CODE_PRODUCTS } from 'app/constants/constants';
import { getGroupCode, getProductCode, isNullOrEmpty } from 'app/helpers/utils';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import InputTextCustom from 'app/components/input-text-custom/input-text-custom';
import { BUTTON_PRESET_REMOVE_CLASS, ProductResponse } from '../../interface-preset';
import { NOT_FOUND_CODE, NOT_FOUND_DATA } from '@/constants/api-constants';
import { formatNumberWithCommas } from '@/helpers/number-utils';
import { productPresetInfo } from '@/services/product-service';

const SizePanelProduct = ({
  productButton,
  plu,
  onChangePLU,
  onChangeDescription,
  handleOnBlurPLU
}: {
  productButton?: ProductResponse;
  plu: string;
  onChangePLU: (value: string) => void;
  onChangeDescription: (value: string) => void;
  handleOnBlurPLU: () => void;
}) => {
  const dispatch = useAppDispatch();
  const preset: PresetState = useAppSelector(state => state.presetReducer);
  const product: ProductResponse = useAppSelector(state => state.productReducer.product);
  const errorMessageProduct: string = useAppSelector(state => state.productReducer.errorMessage);
  const [hasNewDescription, setHasNewDescription] = useState(false);

  useEffect(() => {
    if (preset.presetButton && GROUP_CODE_PRODUCTS.includes(preset.presetButton?.event_group_code)) {
      if (!preset?.presetButton?.operation_type && preset.presetButton?.record_id && !hasPLU(preset.presetButton?.setting_data)) {
        setHasNewDescription(false);
      }
    }
  }, [preset.presetButton?.button_column_number, preset.presetButton?.button_row_number]);


  useEffect(() => {
    if (product) {
      if (hasNewDescription) {
        setHasNewDescription(false);
        onChangeDescription(product.item_name);
      }
      dispatch(saveProduct(product));
      dispatch(clearDataProduct());
    }
  }, [product]);

  const disableButton = () => {
    return preset.presetButton?.display_status === 0;
  };

  const hasPLU = (value?: string) => {
    const pluValue = value ?? plu;
    const checkMyCompanyCode = getGroupCode(pluValue) === preset?.presetButton?.product?.item_info_group_code || getProductCode(pluValue) === preset?.presetButton?.product?.item_product_code
    return (pluValue === preset?.presetButton?.product?.item_code || checkMyCompanyCode) && isNullOrEmpty(errorMessageProduct);
  };

  const getSuggestingProductionAsync = async (pluCodeFocusOut?: string, hasDetailDescription?: string) => {
    await dispatch(
      productPresetInfo({
        code: pluCodeFocusOut || plu,
      })
    )
      .unwrap()
      .then((response_) => {
        const response = response_.data.data;

        onChangePLU(response.item_code);

        dispatch(selectButton({
          ...preset.presetButton,
          event_group_code: GROUP_CODE_PRODUCTS?.[0],
          description: hasDetailDescription ? hasDetailDescription : response.description,
          product: {
            ...preset.presetButton.product,
            item_code: response.item_code,
            item_info_group_code: getGroupCode(response.my_company_code),
            item_product_code: getProductCode(response.my_company_code),
            item_unit_price_fmt: `￥${formatNumberWithCommas(String(response.unit_price))}`
          },
          setting_data: response.item_code,
        }));
      })
      .catch((error) => {
        if (error?.response?.data?.code === NOT_FOUND_CODE) {
          dispatch(setErrorMessage(NOT_FOUND_DATA));
          dispatch(setButtonDescription(''));
          dispatch(setPresetButtonProduct(null));
        }
      });
  };


  const canSuggest = (event: React.FocusEvent<HTMLInputElement>): boolean => {
    const clickTargetClassName = event.relatedTarget?.className;
    if (clickTargetClassName !== null && typeof clickTargetClassName === 'string') {
      if (clickTargetClassName?.includes('selected-item')) return true;

      if (clickTargetClassName?.includes('preset-button-click') ||
        clickTargetClassName?.includes('add-tab-preset') ||
        (clickTargetClassName?.includes(BUTTON_PRESET_REMOVE_CLASS))) {
        onChangePLU(null);
        return false;
      }
    }

    return true;
  };

  const handleOnBlurEvent = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (!canSuggest(event)) return;

    if (isNullOrEmpty(value)) {
      dispatch(clearErrorMessage());
      handleOnBlurPLU();
      return;
    }

    dispatch(selectButton({
      ...preset.presetButton,
      event_group_code: GROUP_CODE_PRODUCTS?.[0],
      setting_data: value
    }));

    getSuggestingProductionAsync(value);
  };

  return (
    <>
      <span className="side-panel-item-name">商品コード/PLUコード</span>
      <div className="flex">
        <NumberInputText
          disabled={true}
          borderRadius={0}
          classNameForm="width40"
          className="group-code"
          width="100%"
          value={hasPLU() ? productButton?.item_info_group_code : ''}
          borderColor="#B0B9D7"
          backgroundColor="white"
          marginBottom={0}
          maxLength={2}
          addZero={true}
          height={'47'}
        />
        <NumberInputText
          disabled={true}
          borderRadius={0}
          width="100%"
          value={hasPLU() ? productButton?.item_product_code : ''}
          borderColor="#B0B9D7"
          backgroundColor="white"
          marginBottom={0}
          maxLength={6}
          addZero={true}
          className={'code-product'}
          height={'47'}
        />
      </div>
      <NumberInputText
        datatype="item_code"
        borderRadius={0}
        width="100%"
        value={plu}
        disabled={disableButton()}
        borderColor="#B0B9D7"
        backgroundColor="white"
        className="PLU-input"
        onChange={onChangePLU}
        maxLength={13}
        height={'44'}
        onBlur={handleOnBlurEvent}
      />
      <div className="flex price">
        <InputTextCustom
          width="110px"
          labelText="定価売価"
          value={hasPLU() ? productButton?.item_unit_price_fmt : ''}
          className="price-input"
          maxLength={6}
          disabled={true}
        />

        <div className="button-normal">
          <ButtonPrimary
            text="detailMenu.buttonTab.decideButton"
            onClick={() => { }}
            disabled={true}
          />
        </div>
      </div>
    </>
  );
};

export default SizePanelProduct;
