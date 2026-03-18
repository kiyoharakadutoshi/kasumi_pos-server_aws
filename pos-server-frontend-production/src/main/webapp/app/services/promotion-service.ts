import {
  getDataWithParam,
  IPagingResponseApi,
  postData,
  ResponseApi,
  ResponseApiListExceed,
} from 'app/services/base-service';
import {
  ISpecialPromotion,
  ISpecialPromotionSearch,
} from 'app/modules/special-promotion/interface/special-sale-interface';
import { TBodyBase } from 'app/components/table/table-common';

export type SpecialPromotionSearchKey = keyof ISpecialPromotionSearch;

export interface IDataSpecialPromotionResponse {
  data: ISpecialPromotionResponse;
}

export interface ISpecialPromotionResponse extends IPagingResponseApi {
  items: ISpecialPromotion[];
}

export interface IPromotionDetailSearch {
  selected_store: string;
  promotion_code: string;
}

export interface IDetailPromotionSearchState extends ResponseApi {
  data?: IPromotionDetail;
}

export interface IPromotionDetail extends TBodyBase {
  code?: string;
  name?: string;
  type?: number;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  hasData?: boolean;
  start_date_time?: string;
  end_date_time?: string;
}

export interface IListPromotionSearch {
  store_code: string;
  code: string;
  page?: number;
  limit?: number;
}

export interface IListPromotionResponse extends ResponseApi {
  data: {
    total_promotion?: number;
    total_pages?: number;
    current_page?: number;
    promotions?: IPromotionDetail[];
  };
}

export const getListSpecialPromotion = getDataWithParam<ISpecialPromotionSearch, IDataSpecialPromotionResponse>(
  'special-prices'
);
export const updateListSpecialPromotion = postData('special-prices/maintainance');

// AP016
export const getDetailPromotion = getDataWithParam<IPromotionDetailSearch, IDetailPromotionSearchState>(
  'promotion/detail'
);
export const getListPromotion = getDataWithParam<IListPromotionSearch, IListPromotionResponse>(
  'promotion/search'
);
