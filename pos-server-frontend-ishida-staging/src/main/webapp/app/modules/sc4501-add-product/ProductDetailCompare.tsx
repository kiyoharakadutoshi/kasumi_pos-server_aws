import React, { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { isEqualObject } from '@/helpers/utils';
import { keyIProductDetails } from '@/modules/sc0102-product-detail-setting/sc0102-product-detail-interface';

const ProductDetailCompare = () => {
  const { control, getValues, setValue } = useFormContext();
  const dataForm = useWatch({ control, name: 'productInfo' });

  useEffect(() => {
    const dataDefault = getValues('productInfoDefault');

    if (!dataDefault) {
      setValue('disableConfirm', true);
      setValue('isDirty', false);
      return;
    }

    const isEqual = isEqualObject(dataForm, dataDefault, [...keyIProductDetails, 'my_company_code', 'item_code']);

    setValue('disableConfirm', isEqual);
    setValue('isDirty', !isEqual);
  }, [dataForm]);
  return <></>;
};

export default ProductDetailCompare;
