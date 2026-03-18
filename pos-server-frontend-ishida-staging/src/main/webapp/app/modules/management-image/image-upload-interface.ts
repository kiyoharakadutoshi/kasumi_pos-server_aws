import { RowBase } from '@/components/table/table-data/table-data';
import { Row } from '@tanstack/react-table';

export interface FormTableDataBase<TRow extends RowBase> {
  selectedRows?: Row<TRow>[];
  showNoData?: boolean;
  selectedRowsNewImageTable?: Row<TRow>[];
}

export interface ImageUploadInterface extends FormTableDataBase<IImageData> {
  newUploadData: IImageData[];
  listImageData: IImageData[];
  listImageDataDelete?: string[];
  typeImage: number;
  dataUploadDisplay?: any;
  image_url?: string;
  file_name?: string;
  dataUploadImage?: [];
  disableConfirm?: boolean;
}

export interface IImageData extends RowBase {
  file_name: string;
  image_url: string;
  isDelete?: boolean;
}

export const ImageUploadDefault: ImageUploadInterface = {
  listImageData: null,
  listImageDataDelete: null,
  newUploadData: null,
  typeImage: 0,
  dataUploadImage: [],
  disableConfirm: true,
};
