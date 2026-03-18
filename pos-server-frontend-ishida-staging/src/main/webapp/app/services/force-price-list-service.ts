import { IPriceChange } from '@/modules/price-change/interface-price-change';
import { getDataWithParam, postData, ResponseApi } from '@/services/base-service';
import { IForcePriceUpdate } from 'app/modules/sc0103-changing-price';

export interface IForcePrice extends ResponseApi {
  total_item: number;
  total_page: number;
  current_page: number;
  force_prices: IPriceChange[];
}

export interface IHierarchyLevelAPI extends ResponseApi {
  data: IForcePrice;
}

export const getForcePriceList = getDataWithParam<
  {
    selected_store: string;
    md_hierarchy_code_level_one?: string;
    product_code?: string;
    plu?: string;
    page_number?: number;
    limit?: number;
    sort_column?: string;
    sort_value?: string;
  },
  IHierarchyLevelAPI
>(`force-price/list`);

export const postForcePriceList = postData<{ force_prices: IPriceChange[] }>(`force-price/maintenance`);

export const updateForePrice = postData<{
  force_prices: IForcePriceUpdate[];
}>(`force-price/maintenance`, `force-price/maintenance-update`);
