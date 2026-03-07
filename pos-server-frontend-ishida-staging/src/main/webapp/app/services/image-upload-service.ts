import { IImageData } from '@/modules/management-image/image-upload-interface';
import { getDataWithParam, postFile } from './base-service';

export const getListImages = getDataWithParam<
  { type: number; selected_store: string[] },
  { data: IImageData[] }
>('preset-images');

export const importImage = postFile<FormData>('image/upload');
