import BottomButton from '@/components/bottom-button/bottom-button';
import { isNullOrEmpty } from '@/helpers/utils';
import React, { useEffect, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

interface WrapBottomButtonProps {
  confirmAction?: () => void;
  clearAction?: () => void;
  disabledClear?: boolean;
  canKeyDown?: boolean;
}
const WrapBottomButton = ({
  canKeyDown,
  clearAction,
  confirmAction,
  disabledClear,
}: WrapBottomButtonProps) => {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const listImageData = useWatch({ control, name: 'listImageData' });
  const [deleteImage, setDeleteImage] = useState([]);

  const itemDelete = listImageData
    ?.filter((item) => item?.isDelete)
    ?.map((image) => image?.record_id);

  const isDisable = isNullOrEmpty(watch('newUploadData')) && isNullOrEmpty(itemDelete);
  useEffect(() => {
    setValue('disableConfirm', isDisable);
  }, [isDisable]);
  return (
    <>
      <Controller
        rules={{ required: 'ERRR' }}
        name={'wrapBottomButton'}
        control={control}
        render={() => (
          <BottomButton
            confirmAction={confirmAction}
            disableConfirm={isDisable}
            clearAction={clearAction}
            disabledClear={disabledClear}
            canKeyDown={canKeyDown}
          />
        )}
      />
    </>
  );
};

export default WrapBottomButton;
