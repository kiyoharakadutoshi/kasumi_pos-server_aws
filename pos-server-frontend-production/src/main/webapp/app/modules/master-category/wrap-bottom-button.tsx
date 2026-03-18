import BottomButton from '@/components/bottom-button/bottom-button';
import { isNullOrEmpty } from '@/helpers/utils';
import React, { useEffect, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { transformData } from './category-function/transformData';
import { getAllWithChoiceTrue } from './category-function/getDataSelected';

interface WrapBottomButtonProps {
  confirmAction?: () => void;
  clearAction?: () => void;
  deleteAction?: () => void;
  disabledClear?: boolean;
  canKeyDown?: boolean;
  disableDelete?: boolean;
}
const WrapBottomButton = ({ clearAction, confirmAction, deleteAction, disableDelete }: WrapBottomButtonProps) => {
  const { getValues, watch, reset, setValue, control } = useFormContext();

  const itemDetailDiscount = useWatch({ control, name: 'itemDetailDiscount' });
  if (itemDetailDiscount) {
    // console.log('itemDetailDiscount++ wrap bottom', itemDetailDiscount);
  }
  const data = useWatch({ control, name: 'listHierarchyLevel' });

  return (
    <>
      <Controller
        rules={{ required: 'ERRR' }}
        name={'wrapBottomButton'}
        control={control}
        render={() => (
          <BottomButton
            confirmAction={confirmAction}
            disableConfirm={watch('disableConfirm')}
            clearAction={clearAction}
            disabledClear={watch('disabledClear')}
            deleteAction={deleteAction}
            disableDelete={!watch('itemDetailDiscount')}
            canKeyDown={true}
          />
        )}
      />
    </>
  );
};

export default WrapBottomButton;
