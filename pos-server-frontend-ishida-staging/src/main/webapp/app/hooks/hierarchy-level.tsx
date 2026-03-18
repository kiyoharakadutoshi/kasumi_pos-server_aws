import { useAppDispatch } from '@/config/store';
import { focusElementByName, isNullOrEmpty, localizeString } from '@/helpers/utils';
import { getHierachyLevelList } from '@/services/hierarchy-level-service';
import { IProductDetail, IProductFormData } from 'app/modules/sc0102-product-detail-setting/sc0102-product-detail-interface';
import { UseFormReturn } from 'react-hook-form';

type HierarchyLevelType = {
  store?: string,
  formConfig: UseFormReturn<IProductFormData, any, undefined>
}

export interface IHierarchyCode {
  codeLevelOne: string;
  codeLevelTwo: string;
  codeLevelThree: string;
  codeLevelFour: string;
}

const HierarchyLevel = ({ formConfig }: HierarchyLevelType) => {
  const dispatch = useAppDispatch();
  const { getValues, setValue, setError } = formConfig;

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

  /**
   * get list code level one or two or three or four
   * @param type 
   * @param parentCode 
   * @param parentLevel 
   * @returns 
   */
  const handleGetListCodeLevel = (type: 'One' | 'Two' | 'Three' | 'Four', parentCode?: string, parentLevel?: string) => {
    let targetLevel = "1";
    if (type === 'Two') {
      targetLevel = "2";
    } else if (type === "Three") {
      targetLevel = "3";
    } else if (type === "Four") {
      targetLevel = "4";
    }

    if (type === 'Two') {
      setValue('listCodeLevelTwo', []);
      setValue('listCodeLevelThree', []);
      setValue('listCodeLevelFour', []);
      setValue('productInfo.code_level_two', null);
      setValue('productInfo.code_level_three', null);
      setValue('productInfo.code_level_four', null);
      if (isNullOrEmpty(parentCode)) return;
    } else if (type === 'Three') {
      setValue('listCodeLevelThree', []);
      setValue('listCodeLevelFour', []);
      setValue('productInfo.code_level_three', null);
      setValue('productInfo.code_level_four', null);
      if (isNullOrEmpty(parentCode)) return;
    } else if (type === 'Four') {
      setValue('listCodeLevelFour', []);
      setValue('productInfo.code_level_four', null);
      if (isNullOrEmpty(parentCode)) return;
    }

    dispatch(getHierachyLevelList({ target_level: targetLevel, parent_code: parentCode, parent_level: parentLevel }))
      .unwrap()
      .then((response) => {
        handleSetCodeLevels(type, response);
      })
      .catch(() => { });
  };

  const handleSetCodeLevels = (type: 'One' | 'Two' | 'Three' | 'Four', response: any) => {
    const listCodeLevel = response.data.data?.items?.map((item) => ({
      value: item.md_hierarchy_code,
      code: item.md_hierarchy_code,
      name: item.description,
    })) ?? [];

    setValue(`listCodeLevel${type}`, listCodeLevel);

    if (type === 'One') {
      setValue('listCodeLevelTwo', []);
      setValue('listCodeLevelThree', []);
      setValue('listCodeLevelFour', []);
      setValue('productInfo.code_level_two', null);
      setValue('productInfo.code_level_three', null);
      setValue('productInfo.code_level_four', null);
    } else if (type === 'Two') {
      setValue('listCodeLevelThree', []);
      setValue('listCodeLevelFour', []);
      setValue('productInfo.code_level_three', null);
      setValue('productInfo.code_level_four', null);
    } else if (type === 'Three') {
      setValue('listCodeLevelFour', []);
      setValue('productInfo.code_level_four', null);
    }
  };

  const getDataHierachy = async (detail: IProductDetail): Promise<IHierarchyCode> => {
    let codeLevelOne = detail?.code_level_one;
    let codeLevelTwo = detail?.code_level_two;
    let codeLevelThree = detail?.code_level_three;
    let codeLevelFour = detail?.code_level_four;

    const getListCodeLevelOneAPI = dispatch(getHierachyLevelList({ target_level: "1" })).unwrap();
    const getListCodeLevelTwoAPI = dispatch(getHierachyLevelList({ target_level: "2", parent_code: codeLevelOne, parent_level: "1" }))
      .unwrap();
    const getListCodeLevelThreeAPI = dispatch(getHierachyLevelList({ target_level: "3", parent_code: codeLevelTwo, parent_level: "2" }))
      .unwrap();
    const getListCodeLevelFourAPI = dispatch(getHierachyLevelList({ target_level: "4", parent_code: codeLevelThree, parent_level: "3" }))
      .unwrap();

    const result = await Promise.all([getListCodeLevelOneAPI, getListCodeLevelTwoAPI, getListCodeLevelThreeAPI, getListCodeLevelFourAPI]);
    const [listCodeLevelOneResponse, listCodeLevelTwoResponse, listCodeLevelThreeResponse, listCodeLevelFourResponse] = result;

    handleSetCodeLevels('One', listCodeLevelOneResponse);
    handleSetCodeLevels('Two', listCodeLevelTwoResponse);
    handleSetCodeLevels('Three', listCodeLevelThreeResponse);
    handleSetCodeLevels('Four', listCodeLevelFourResponse);

    if (!getValues('listCodeLevelOne')?.some(item => item.code === detail?.code_level_one)) {
      codeLevelOne = null
      codeLevelTwo = null
      codeLevelThree = null
      codeLevelFour = null
    } else if (!getValues('listCodeLevelTwo')?.some(item => item.code === detail?.code_level_two)) {
      codeLevelTwo = null
      codeLevelThree = null
      codeLevelFour = null
    } else if (!getValues('listCodeLevelThree')?.some(item => item.code === detail?.code_level_three)) {
      codeLevelThree = null
      codeLevelFour = null
    }
    return { codeLevelOne, codeLevelTwo, codeLevelThree, codeLevelFour }
  }

  return {
    getDataHierachy,
    handleSetCodeLevels,
    blurInput,
    handleErrorHierachy,
    handleGetListCodeLevel
  };
};

export default HierarchyLevel;
