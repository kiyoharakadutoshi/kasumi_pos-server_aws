import { useFormContext, useWatch } from 'react-hook-form';
import React, { useEffect } from 'react';
import { isEqualData } from 'app/helpers/utils';

interface ICompareFormProps {
  name: string;
  nameCompare: string;
  paramsEqual?: any[];
  defaultCompare?: boolean;
  extraCompare?: (obj1: any, obj2: any) => boolean;
}

const CompareForm = (props: ICompareFormProps) => {
  const { name, nameCompare, paramsEqual, extraCompare, defaultCompare = true } = props;
  const { control, getValues, setValue } = useFormContext();
  const dataForm = useWatch({ control, name });

  useEffect(() => {
    const dataDefault = getValues(nameCompare);
    if (!dataDefault) {
      setValue('disableConfirm', true);
      setValue('isDirty', false);
      return;
    }

    if (defaultCompare) {
      const isEqual = isEqualData(dataForm, dataDefault, paramsEqual);

      if (!isEqual) {
        setValue('disableConfirm', false);
        setValue('isDirty', true);
        return;
      }
    }

    if (extraCompare) {
      const isEqual = extraCompare?.(dataForm, dataDefault);
      setValue('disableConfirm', isEqual);
      setValue('isDirty', !isEqual);
      return;
    }

    setValue('disableConfirm', true);
    setValue('isDirty', false);
  }, [dataForm]);

  return <></>;
};

export default CompareForm;
