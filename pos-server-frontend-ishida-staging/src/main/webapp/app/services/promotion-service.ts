import { getDataWithParam, IPagingResponseApi, postData, ResponseApi } from 'app/services/base-service';
import {
  ISpecialPromotion,
  ISpecialPromotionSearch,
  TStatus,
  TTimeService,
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
  selected_store: string;
  promotion_code?: string;
  page_number?: number;
  limit?: number;
}

export interface IListPromotionResponse extends ResponseApi {
  data: {
    total_promotion?: number;
    total_page?: number;
    current_page?: number;
    items?: IPromotionDetail[];
  };
}

export interface IMaintenanceSpecialPromotion {
  record_id?: number;
  store_code: string;
  status: TStatus;
  item_code: string;
  discount_method_code: string;
  special_price: number;
  type_code: TTimeService;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
}

export interface IMaintenanceListSpecialPromotion {
  items: IMaintenanceSpecialPromotion[];
}

// API0301
export const getListSpecialPromotion = getDataWithParam<ISpecialPromotionSearch, IDataSpecialPromotionResponse>(
  'special-prices'
);
// API0107
export const updateListSpecialPromotion = postData<IMaintenanceListSpecialPromotion>('special-prices/maintainance');

// API0106
export const getDetailPromotion = getDataWithParam<IPromotionDetailSearch, IDetailPromotionSearchState>(
  'promotion/detail'
);
// API0105
export const getListPromotion = getDataWithParam<IListPromotionSearch, IListPromotionResponse>('promotion/search');
// API1001
export const updateListPromotionMaintenance = postData('promotion/maintenance');
