import { IStandardChange, IStandardChangeUpdate } from '@/modules/standard-change/interface-standard-change';
import { getDataWithParam, postData, ResponseApi } from '@/services/base-service';
import { getBlobWithMethodPost } from '@/services/base-service';

export interface IStandardPrice extends ResponseApi {
  total_item: number;
  total_page: number;
  current_page: number;
  items: IStandardChange[];
}

export interface IHierarchyLevelAPI extends ResponseApi {
  data: IStandardPrice;
}

export const getStandardPriceHistory = getDataWithParam<
  {
    selected_store: string;
    group_code?: string;
    booking_date: string;
    page_number?: number;
    limit?: number;
  },
  IHierarchyLevelAPI
>(`standard-price-history`);

export const getStandardPriceExport = getBlobWithMethodPost<{
  selected_store: string;
  group_code?: string;
  booking_date: string;
  language?: string;
}>(`changed-standard-prices/export`);

export const postStandardPriceList = postData<{ standard_prices: IStandardChangeUpdate[] }>(`standard-price-history/maintenance`);


