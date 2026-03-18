import React, { useRef } from 'react';
import ButtonPrimary from '../button-primary/button-primary';
import { useAppDispatch } from '@/config/store';
import { localizeFormat } from '@/helpers/utils';
import { setError } from '@/reducers/error';
import { useFormContext } from 'react-hook-form';

interface ImportImageButtonProps {
  text?: string;
  disabled?: boolean;
  multiple?: boolean;
}
const ImportImageButton: React.FC<ImportImageButtonProps> = (props) => {
  const { setValue, getValues } = useFormContext();
  const fileInputRef = useRef(null);
  const dispatch = useAppDispatch();
  const invalidCharacters = /[\\/:*?"<>|]/;
  const handleUploadFileSelected = (event: any) => {
    const files = event.target?.files;
    //reset data before handle

    if (files) {
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (let i = 0; i < files?.length; i++) {
        const file = files[i];
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
        const fileSize = file.size;
        if (!allowedTypes.includes(file.type)) {
          errors.push(localizeFormat('MSG_VAL_033', 'jpeg、jpg、png、svg'));
          continue;
        }
        if (fileSize > 5 * 1024 * 1024) {
          errors.push(localizeFormat('MSG_VAL_034'));

          continue;
        }
        if (file.name.length > 50) {
          errors.push(localizeFormat('MSG_VAL_002', 'imageUpload.table.fileNameUpload', '50'));
          continue;
        }
        if (invalidCharacters.test(file.name)) {
          errors.push(localizeFormat('MSG_VAL_042'));
          continue;
        }
        validFiles.push(file);
      }

      validFiles?.length > 0 &&
        validFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const preDataUploadDisplay = getValues('newUploadData') || [];
            // data for call api
            const preDataUploadImage = getValues('dataUploadImage') || [];
            setValue('newUploadData', [
              ...preDataUploadDisplay,
              {
                file_name: file?.name,
                image_url: e.target?.result,
              },
            ]);

            setValue('dataUploadImage', [...preDataUploadImage, file]);
          };
          reader.readAsDataURL(file);
        });
      if (errors.length > 0) {
        const errorMessage = errors.map((item, index) => `${index + 1}. ${item}`).join('\n');
        dispatch(setError(errorMessage));
      }
      // reset image
      event.target.value = null;
    }
  };
  const onClickImport = () => {
    fileInputRef.current?.click();
  };
  return (
    <div>
      <ButtonPrimary onClick={onClickImport} text={props.text ?? ''} disabled={props.disabled} />
      <input
        type="file"
        accept=".jpeg,.jpg,.png,.svg"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleUploadFileSelected}
        multiple={props.multiple ? props.multiple : false}
      />
    </div>
  );
};

export default ImportImageButton;
