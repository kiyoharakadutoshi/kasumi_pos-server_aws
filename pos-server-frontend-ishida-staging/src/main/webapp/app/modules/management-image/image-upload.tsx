/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useEffect, useState } from 'react';
import './image-upload-styled.scss';
import Header from '@/components/header/header';
import ListRadioButton from '@/components/radio-button-component/radio-button';
import SidebarStore from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import { isNullOrEmpty, localizeFormat, localizeString } from '@/helpers/utils';
import { TypeImage } from './defaultData';
import ButtonPrimary from '@/components/button/button-primary/button-primary';
import { FormProvider, useForm } from 'react-hook-form';
import TableData, { TableColumnDef } from '@/components/table/table-data/table-data';
import { IImageData, ImageUploadDefault } from './image-upload-interface';
import FuncKeyDirtyCheckButton from '@/components/button/func-key-dirty-check/func-key-dirty-check-button';
import BottomButton from '@/components/bottom-button/bottom-button';
import ImportImageButton from '@/components/button/import-button/import-image-button';
import { IStoreSate } from '@/reducers/store-reducer';
import { useAppDispatch, useAppSelector } from '@/config/store';
import { getListImages, importImage } from '@/services/image-upload-service';
import WrapBottomButton from './wrap-bottom-button';
import { setError } from '@/reducers/error';
import { elementChangeKeyListener } from '@/hooks/keyboard-hook';

const ImageUpload = () => {
  const dispatch = useAppDispatch();
  const formConfig = useForm({ defaultValues: ImageUploadDefault });
  const { getValues, watch, reset, setValue, control } = formConfig;
  const currentlyImageSelected = watch('selectedRows');
  const currentlyNewImageSelected = watch('selectedRowsNewImageTable');
  const storeReducer: IStoreSate = useAppSelector((state) => state.storeReducer);

  // store after click confirm
  const selectedStoresBeforeConfirm = storeReducer.selectedStores;
  const arrNewImageUpload = watch('newUploadData');
  // state used when clear data but still retains data before checkbox
  const [preListImageData, setPreListImageData] = useState<IImageData[]>(null);
  const listImageData = watch('listImageData');

  const newUploadColumn = React.useMemo<TableColumnDef<IImageData>[]>(
    () => [
      {
        accessorKey: 'file_name',
        header: 'imageUpload.table.fileNameUpload',
        size: 100,
        type: 'text',
        textAlign: 'left',
      },
    ],
    []
  );

  const listImageColumn = React.useMemo<TableColumnDef<IImageData>[]>(
    () => [
      {
        accessorKey: 'isDelete',
        header: 'imageUpload.table.delete',
        size: 10,
        type: 'checkbox',
      },
      {
        accessorKey: 'file_name',
        header: 'imageUpload.table.fileNameUpload',
        size: 90,
        type: 'text',
        textAlign: 'left',
      },
    ],
    []
  );

  const handleTypeImage = (value, index) => {
    setValue('typeImage', value?.id);
  };

  const checkFileExistence = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(true);
      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file);
    });
  };

  const confirmAction = async () => {
    const errorNames: string[] = [];
    const newImg = watch('dataUploadImage');
    const formData = new FormData();
    const itemDelete = listImageData?.filter((item) => item?.isDelete)?.map((image) => image?.file_name);

    if ((newImg && newImg?.length > 0) || itemDelete?.length > 0) {
      newImg?.length > 0 &&
        (await Promise.all(
          Array.from(newImg).map(async (file: File) => {
            const exists = await checkFileExistence(file);
            if (exists) {
              formData.append('files', file);
            } else {
              errorNames.push(file.name);
            }
          })
        ));
      formData.append('store_code', selectedStoresBeforeConfirm.map(Number).join(','));
      formData.append('type', JSON.stringify(getValues('typeImage')));
      // get delete record
      itemDelete?.length > 0 && formData.append('deleted_image_list', itemDelete.join(','));
      try {
        dispatch(importImage(formData))
          .unwrap()
          .then((res) => {
            const data = res.data;
            if (data.status === 'Error') {
              // dispatch(setError(localizeFormat('MSG_INFO_003', data?.data?.join(', '))));
            }
          })
          .then(() => handleSearchImages())
          .then(() => {
            // show file does existed
            if (errorNames && errorNames?.length > 0) {
              dispatch(setError(localizeFormat('MSG_VAL_067', errorNames.join('、'))));
            }
          })
          .catch((_) => {});
      } catch (error) {
        console.log('err when upload', error);
      }
    }
  };

  const handleClearData = () => {
    reset();
    // set list image without checkBox
    setValue('listImageData', preListImageData);
  };

  const handleSearchImages = () => {
    // reset data before search
    setValue('listImageDataDelete', null);
    setValue('newUploadData', null);
    setValue('dataUploadImage', null);
    setValue('selectedRows', null);
    setValue('selectedRowsNewImageTable', null);
    //handle search
    dispatch(getListImages({ type: getValues('typeImage'), selected_store: selectedStoresBeforeConfirm }))
      .unwrap()
      .then((res) => {
        if (res.data.data?.length > 0) {
          // setShowModalImage(true);
          setValue('listImageData', res?.data?.data || []);
          setPreListImageData(res?.data?.data || []);
        } else {
          setValue('listImageData', []);
          setPreListImageData([]);
        }
      })
      .catch((_) => {});
  };
  const handleRemoveFileUpload = () => {
    if (isNullOrEmpty(currentlyNewImageSelected)) {
      dispatch(setError(localizeFormat('MSG_VAL_036')));
      return;
    }

    const files = watch('dataUploadImage') as File[];
    const selectedIndex = currentlyNewImageSelected?.[0].index;
    if (!files) return;
    const filteredFiles = Array.from(files).filter((file, index) => index !== selectedIndex);
    // update new img push to db
    filteredFiles.length > 0 ? setValue('dataUploadImage', filteredFiles as any) : setValue('dataUploadImage', null);
    // update new img display

    setValue(
      'newUploadData',
      arrNewImageUpload.filter((item, index) => index !== selectedIndex)
    );
    // reset selectedRow
    setValue('selectedRowsNewImageTable', []);
  };
  // handle action when click button ok on dirtyCheck
  const handleOkDirtyCheckAction = () => {
    // reset data before search
    setValue('listImageDataDelete', null);
    setValue('newUploadData', null);
    setValue('dataUploadImage', null);
    setValue('selectedRows', null);
    setValue('selectedRowsNewImageTable', null);
    //get list image
    handleSearchImages();
  };

  return (
    <FormProvider {...formConfig}>
      <div className="image-upload">
        <div className="image-upload__header">
          <Header
            title="imageUpload.headerTitle"
            csv={{
              disabled: true,
            }}
            printer={{ disabled: true }}
            hasESC={true}
            confirmBack={!watch('disableConfirm')}
          />
        </div>
        <div className="image-upload__sidebar">
          <SidebarStore
            selectMultiple={true}
            disabledSearch={false}
            expanded={true}
            clearData={() => {
              reset();
              setPreListImageData(null);
            }}
            hasData={listImageData?.length > 0 || arrNewImageUpload?.length > 0}
          />
        </div>
        <div className="image-upload__search-condition">
          <div className="image-upload__search-condition-item">
            <div className="wrap-radio">
              <p className="label-radio">
                {localizeString('imageUpload.typeImage')}
                <span className="require">*</span>
              </p>
              <ListRadioButton
                name="radio-image-upload"
                isVertical={false}
                listValues={TypeImage.map((item, index) => ({
                  id: item.id,
                  textValue: `${item.name}`,
                  disabled: isNullOrEmpty(selectedStoresBeforeConfirm),
                }))}
                value={watch('typeImage')}
                onChange={(value, index) => {
                  handleTypeImage(value, index);
                }}
              />
            </div>
            <FuncKeyDirtyCheckButton
              className="search-btn"
              text="action.f12Search"
              funcKey={'F12'}
              funcKeyListener={selectedStoresBeforeConfirm}
              disabled={isNullOrEmpty(selectedStoresBeforeConfirm)}
              onClickAction={handleSearchImages}
              dirtyCheck={!watch('disableConfirm')}
              okDirtyCheckAction={handleOkDirtyCheckAction}
            />
          </div>
          <div className="image-upload__search-condition-item"></div>
        </div>
        <div className="image-upload__table">
          <div className="image-upload__table-item">
            <div className="button-container">
              <p className="explain-text">{localizeString('imageUpload.newUpload')}</p>
              <div className="wrap-button">
                <ImportImageButton
                  disabled={isNullOrEmpty(selectedStoresBeforeConfirm)}
                  text="imageUpload.fileSelect"
                  multiple={true}
                />
                <ButtonPrimary
                  disabled={isNullOrEmpty(currentlyNewImageSelected)}
                  text="imageUpload.deselected"
                  onClick={handleRemoveFileUpload}
                />
              </div>
            </div>
            <div className="wrap-table wrap-table-custom-header">
              <TableData<IImageData>
                columns={newUploadColumn}
                data={arrNewImageUpload || []}
                fieldSelectedRowsName={'selectedRowsNewImageTable'}
                disableSingleRecordPadding
              />
            </div>
            {currentlyNewImageSelected && currentlyNewImageSelected.length > 0 && (
              <div className="image-upload__table-item__image-review">
                <div className="container-image-review">
                  <img
                    className={'image-review-styled'}
                    src={currentlyNewImageSelected[0].original?.image_url}
                    alt={currentlyNewImageSelected[0].original?.file_name}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="image-upload__table-item">
            <div className="button-container">
              <p className="explain-text">{localizeString('imageUpload.uploaded')}</p>
            </div>
            <div className="wrap-table">
              <TableData<IImageData>
                columns={listImageColumn}
                data={listImageData || []}
                showNoData={listImageData?.length === 0}
                tableKey="listImageData"
                disableSingleRecordPadding
              />
            </div>
            {currentlyImageSelected && currentlyImageSelected.length > 0 && (
              <div className="image-upload__table-item__image-review">
                <div className="container-image-review">
                  <img
                    className={'image-review-styled'}
                    src={currentlyImageSelected[0].original?.image_url}
                    alt={currentlyImageSelected[0].original?.file_name}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="master-category-container">
          <WrapBottomButton
            confirmAction={confirmAction}
            clearAction={handleClearData}
            disabledClear={isNullOrEmpty(selectedStoresBeforeConfirm)}
            canKeyDown={true}
          />
        </div>
      </div>
    </FormProvider>
  );
};

export default ImageUpload;
