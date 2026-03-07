import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import React, { useRef } from 'react';
import { setError } from 'app/reducers/error';
import { localizeFormat } from 'app/helpers/utils';
import { useAppDispatch } from 'app/config/store';
import { AsyncThunk } from '@reduxjs/toolkit';
import { AsyncThunkConfig } from '@reduxjs/toolkit/dist/createAsyncThunk';

interface ImportButtonProps {
  text?: string;
  disabled?: boolean;
  apiImport: AsyncThunk<any, FormData, AsyncThunkConfig>;
}

const ImportCSVButton: React.FC<ImportButtonProps> = props => {
  const fileInputRef = useRef(null);
  const dispatch = useAppDispatch();

  const onClickImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.type;
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (fileType === 'text/csv' || fileExtension === 'csv') {
        const formData = new FormData();
        formData.append('file', file);
        dispatch(props.apiImport(formData))
          .unwrap()
          .then(res => {
            const data = res.data;
            if (data.status === 'Error') {
              dispatch(setError(localizeFormat('MSG_INFO_003', data?.data?.join(', ') ?? 'CSV')));
            }
          })
          .catch(() => {});
        event.target.value = null;
        return;
      }
    }
    dispatch(setError(localizeFormat('MSG_VAL_033', 'CSV')));
    event.target.value = null;
  };

  return (
    <>
      <ButtonPrimary onClick={onClickImport} text={props.text ?? 'action.importCSV'} disabled={props.disabled} />
      <input type="file" accept={'.csv'} ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
    </>
  );
};

export default ImportCSVButton;
