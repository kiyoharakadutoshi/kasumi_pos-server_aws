import { RowBase } from '@/components/table/table-data/table-data';

export interface IMasterRedistribution extends RowBase {
  product_code?: string;
  plu_code: string;
  product_name: string;
  standard_price: string;
}
