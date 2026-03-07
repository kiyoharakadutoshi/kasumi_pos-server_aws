import { deleteData, getDataWithParam, postData, ResponseApi, ResponseApiListExceed } from './base-service';
import { IMixMatchSpecialPrice } from 'app/modules/product-management/product-management-interface';
import {
  IProductDetail,
  IProductUpdate,
  INewProduct,
} from 'app/modules/sc0102-product-detail-setting/sc0102-product-detail-interface';

export interface IMixMatchsSpecialPriceParam {
  store_code: string;
  plu: string;
}

export interface IProductDetailParam {
  selected_store: string;
  plu: string;
  my_company_code: string;
}

export interface ISuggestedProductParam {
  selected_store: string;
  plu?: string;
  group_code?: string;
  product_code?: string;
  promotion_code?: string;
}

export interface ISuggestChildProductParam {
  selected_store: string;
  plu: string;
  parent_plu: string;
}

export type TSuggestProductParam = keyof ISuggestedProductParam;

export interface IProduct {
  record_id?: number;
  company_code?: string;
  item_code?: string;
  my_company_code?: string;
  sku_code?: string;
  description?: string;
  unit_price?: number;
  exist_in?: number;
  current_price?: number;
  force_price?: number;
  belong_to?: number;
  special_valid?: number;
}

export type KeyProduct = keyof IProduct;

export interface ProductDeleteParam {
  selected_store: string;
  products: string[];
}

export interface IProductResponse {
  data: IProduct;
}

export interface IProductDetailResponse extends ResponseApi {
  data?: IProductDetail;
}

export interface IProductDeleteResponse extends ResponseApi {
  data?: {
    product?: string[];
  };
}

export interface IProductExistedParams {
  selected_stores: string;
  plu: string;
}

export interface IProductSuggestAllStoreRequest {
  code: string;
}

export interface IProductSuggestAllStoreResponse {
  data: IProduct;
}

export const suggestProduct = getDataWithParam<ISuggestedProductParam, IProductResponse>(`product/suggest`);
export const getListMixMatchsSpecialPrice = getDataWithParam<
  IMixMatchsSpecialPriceParam,
  ResponseApiListExceed<IMixMatchSpecialPrice>
>('product/combinations-special-prices');
export const getDetailProduct = getDataWithParam<IProductDetailParam, IProductDetailResponse>('product/detail');
export const deleteProduct = deleteData<ProductDeleteParam, IProductDeleteResponse>('product');
export const updateProduct = postData<IProductUpdate>('product/update');
export const addProduct = postData<INewProduct>('product/add');
export const productExisted = getDataWithParam<IProductExistedParams>('product/existed');
export const productPresetInfo = getDataWithParam<IProductSuggestAllStoreRequest, IProductSuggestAllStoreResponse>(
  'product/suggest-all-store'
);

export const suggestChildrenProduct = getDataWithParam<ISuggestChildProductParam, any>('product/suggest-child');
