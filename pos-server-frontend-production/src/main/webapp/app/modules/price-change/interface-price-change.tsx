import { TBodyBase } from 'app/components/table/table-data/interface-table';

export interface IPriceChange extends TBodyBase {
  company_code?: string;
  store_code?: string;
  store_name?: string;
  my_company_code?: string;
  group_code?: string;
  product_code?: string;
  schedule_no?: string;
  item_code: string;
  item_name?: string;
  unit_price?: number;
  current_price?: number;
  force_price?: number;
  force_price_default?: number;
  selected?: boolean;
  id_delete_flag?: boolean;
  description?: string;
  dataBlack?: string;
}
