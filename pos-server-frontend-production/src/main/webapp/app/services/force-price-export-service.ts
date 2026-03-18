import { getBlobWithMethodPost } from '@/services/base-service';

export interface IForcePriceExportParam {
  selected_store: string;
  md_hierarchy_code_level_one?: string;
  product_code?: string;
  plu?: string;
  lang?: string;
  sort_column?: string;
  sort_value?: string;
}

export const getForcePriceExport = getBlobWithMethodPost<IForcePriceExportParam>(`force-price/export`);
