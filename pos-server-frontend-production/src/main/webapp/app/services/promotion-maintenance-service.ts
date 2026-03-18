import { getDataWithParam, postData } from './base-service';
import { TBodyBase } from 'app/components/table/table-common';

export interface IPromotionMaintenanceDetail extends TBodyBase {
  code?: string;
  name?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
}

export interface IPromotionMaintenanceSearch {
    store_code: string;
    code?: string;
    page_number?: number;
    limit?: number;
}
export interface IListPromotionMaintenance {
    total_promotion: number;
    total_page: number;
    current_page: number;
    promotions: IPromotionMaintenanceDetail[];
}

export interface IPromotionMaintenanceListResponse {
    data: IListPromotionMaintenance;
}

export interface IPromotionMaintenanceListUpdateRequest {
    store_code: string;
    promotions: IPromotionMaintenanceDetail[];
}

export const getListPromotionMaintenance = getDataWithParam<IPromotionMaintenanceSearch, IPromotionMaintenanceListResponse>('promotion/search');
export const updateListPromotionMaintenance = postData('promotion/maintenance');