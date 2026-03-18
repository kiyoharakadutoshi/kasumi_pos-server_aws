import { getDataWithParam, postData, ResponseApi, ResponseApiListExceed } from './base-service';
import { IMixMatchSpecialPrice } from 'app/modules/product-management/product-management-interface';
import {
  IProductDetail,
  IProductUpdate,
  INewProduct,
} from 'app/modules/sc0102-product-detail-setting/sc0102-product-detail-interface';

export interface IMixMatchsSpecialPriceParam {
  selected_store: string;
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
  booking_date?: string;
}

export interface ISuggestChildProductParam {
  selected_store: string;
  plu: string;
  parent_plu: string;
}

export type TSuggestProductParam = keyof ISuggestedProductParam;

export interface IProduct {
  record_id?: number;
  company_code?: number;
  item_code?: string;
  my_company_code?: string;
  sku_code?: string;
  description?: string;
  unit_price?: number;
  exist_in?: number;
  current_price?: number;
  force_price?: number;
  belong_to?: string;
  special_valid?: number;
}

export type KeyProduct = keyof IProduct;

export interface ProductDeleteParam {
  selected_store: string;
  apply_date: string;
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
  plu: string;
}

export interface IProductSuggestAllStoreRequest {
  code: string;
}

export interface IProductSuggestAllStoreResponse {
  data: IProduct;
}

// API1506
export const suggestProduct = getDataWithParam<ISuggestedProductParam, IProductResponse>(`product/suggest`);
// API0101
export const getListMixMatchsSpecialPrice = getDataWithParam<
  IMixMatchsSpecialPriceParam,
  ResponseApiListExceed<IMixMatchSpecialPrice>
>('product/combinations-special-prices');
// API0111
export const getDetailProduct = getDataWithParam<IProductDetailParam, IProductDetailResponse>('product/detail');
// API0112
export const deleteProduct = postData<ProductDeleteParam>('product/delete');
// API0102
export const updateProduct = postData<IProductUpdate>('product/update');
// API4501
export const addProduct = postData<INewProduct>('product/add');
// API1513
export const productPresetInfo = getDataWithParam<IProductSuggestAllStoreRequest, IProductSuggestAllStoreResponse>(
  'product/suggest-all-store'
);
export const getProductExisted = getDataWithParam<IProductExistedParams, IProductDetail>('product/detail-existed');
// API0115
export const suggestChildrenProduct = getDataWithParam<ISuggestChildProductParam, any>('product/suggest-child');
