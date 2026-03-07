import { getDetailHierachyLevel, HierachyLevelParam, IHierarchyLevelInfo } from '@/services/hierarchy-level-service';
import { NOT_FOUND_CODE } from '@/constants/api-constants';
import { focusElementByName, isNullOrEmpty, localizeString } from '@/helpers/utils';
import { useAppDispatch } from '@/config/store';
import {  UseFormReturn } from 'react-hook-form';
import { IProductFormData } from 'app/modules/sc0102-product-detail-setting/sc0102-product-detail-interface';

const LIST_TYPE = ['one', 'two', 'three', 'four'];

type HierarchyLevelType = {
  store: string,
  formConfig: UseFormReturn<IProductFormData, any, undefined>
}

const HierarchyLevel = ({ store, formConfig }: HierarchyLevelType) => {
  const dispatch = useAppDispatch();
  const { getValues, setValue, setError, resetField } = formConfig;

  const createParamHierarchyLevel = (type: 'one' | 'two' | 'three' | 'four') => {
    const code_level_one = getValues(`productInfo.code_level_one`);
    if (isNullOrEmpty(code_level_one)) return null;
    // Create param API
    let param: HierachyLevelParam = { store_code: store, code_level_one };
    switch (type) {
      case 'two':
      {
        const code_level_two = getValues('productInfo.code_level_two');
        if (isNullOrEmpty(code_level_two)) return null;
        param = { ...param, code_level_two };
      }
        break;
      case 'three':
      {
        const code_level_three = getValues('productInfo.code_level_three');
        if (isNullOrEmpty(code_level_three)) return null;
        param = { ...param, code_level_three, code_level_two: getValues('productInfo.code_level_two') };
      }
        break;
      case 'four':
      {
        const code_level_four = getValues('productInfo.code_level_four');
        if (isNullOrEmpty(code_level_four)) return null;
        param = {
          ...param,
          code_level_four,
          code_level_two: getValues('productInfo.code_level_two'),
          code_level_three: getValues('productInfo.code_level_three'),
        };
      }
        break;
      default:
        break;
    }
    return param;
  };


  const apiGetHierarchyLevel = (param: any, key: string, type?: string) => {
    dispatch(getDetailHierachyLevel(param))
      .unwrap()
      .then((response) => {
        const data: IHierarchyLevelInfo = response.data?.data;
        if (!data) return;

        key !== 'productInfo.code_level_one' && setValue('productInfo.code_level_one', data.code_level_one);
        setValue('productInfo.description_level_one', data.description_level_one);

        key !== 'productInfo.code_level_two' && setValue('productInfo.code_level_two', data.code_level_two);
        setValue('productInfo.description_level_two', data.description_level_two);

        key !== 'productInfo.code_level_three' && setValue('productInfo.code_level_three', data.code_level_three);
        setValue('productInfo.description_level_three', data.description_level_three);

        key !== 'productInfo.code_level_four' && setValue('productInfo.code_level_four', data.code_level_four);
        setValue('productInfo.description_level_four', data.description_level_four);
      })
      .catch((error) => {
        if (error.response?.status === NOT_FOUND_CODE) {
          setError(`productInfo.description_level_${type}`, { type: 'manual', message: localizeString('MSG_ERR_001') });
        }
      });
  };

  const resetFieldHierarchyLevel = (index: number) => {
    for (let i = index; i < LIST_TYPE.length; i++) {
      if (i + 1 < LIST_TYPE.length) {
        resetField(`productInfo.code_level_${LIST_TYPE[i + 1]}`);
      }
      resetField(`productInfo.description_level_${LIST_TYPE[i]}`);
    }
  }

  const getIHierarchyLevel = (type: 'one' | 'two' | 'three' | 'four') => {
    const index = LIST_TYPE.findIndex((item) => item === type);

    // Create API
    const param = createParamHierarchyLevel(type);

    // Reset field if input level === null
    if (!param) {
      resetFieldHierarchyLevel(index)
      return
    }

    // Clear param null or undefined
    for (const key of Object.keys(param)) {
      if (!param[key]) delete param[key];
    }

    // Reset field, name child HierarchyLevel
    resetFieldHierarchyLevel(index)
    apiGetHierarchyLevel(param, `productInfo.code_level_${type}`, type);
  };

  const blurInput = (name?: string) => {
    setTimeout(() => {
      if (name) {
        focusElementByName(name);
      } else {
        (document.activeElement as HTMLInputElement)?.blur();
      }
    }, 50);
  };

  const handleErrorHierachy = () => {
    let hasError = false;
    if (
      isNullOrEmpty(formConfig.getValues('productInfo.description_level_one')) &&
      !isNullOrEmpty(getValues('productInfo.code_level_one'))
    ) {
      hasError = true;
      setError(`productInfo.description_level_one`, {
        type: 'manual',
        message: localizeString('MSG_ERR_001'),
      });
    }

    if (
      isNullOrEmpty(getValues('productInfo.description_level_two')) &&
      !isNullOrEmpty(getValues('productInfo.code_level_two'))
    ) {
      hasError = true;
      setError(`productInfo.description_level_two`, {
        type: 'manual',
        message: localizeString('MSG_ERR_001'),
      });
    }

    if (
      isNullOrEmpty(getValues('productInfo.description_level_three')) &&
      !isNullOrEmpty(getValues('productInfo.code_level_three'))
    ) {
      hasError = true;
      setError(`productInfo.description_level_three`, {
        type: 'manual',
        message: localizeString('MSG_ERR_001'),
      });
    }

    if (
      isNullOrEmpty(getValues('productInfo.description_level_four')) &&
      !isNullOrEmpty(getValues('productInfo.code_level_four'))
    ) {
      hasError = true;
      setError(`productInfo.description_level_four`, {
        type: 'manual',
        message: localizeString('MSG_ERR_001'),
      });
    }
    return hasError;
  };

  return {
    getIHierarchyLevel,
    blurInput,
    handleErrorHierachy
  };
};

export default HierarchyLevel;
