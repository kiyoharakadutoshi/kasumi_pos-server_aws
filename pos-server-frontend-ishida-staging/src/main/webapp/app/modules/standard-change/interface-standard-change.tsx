import { OperationType } from '@/components/table/table-common';
import { TBodyBase } from 'app/components/table/table-data/interface-table';

export interface IStandardChange extends TBodyBase {
  record_id?: number;
  company_code?: number;
  store_code?: string;
  item_code: string;
  booking_date?: string;
  unit_price?: number;
  current_price?: number;
  my_company_code?: string;
  description?: string;
  group_code?: string;
  product_code?: string;
  standard_price?: number;
  standard_price_default?: number;
  selected?: boolean;
  id_delete_flag?: boolean;
  operation_type?: OperationType;
  new_price?: number;
}

export interface IStandardChangeUpdate {
  record_id?: number;
  operation_type?: number;
  store_code?: string;
  item_code: string;
  booking_date?: string;
  group_code?: string;
  new_price?: number;
}

export const createStandardPriceUpdate = (data: IStandardChange[]) => {
  const listStandardChange: IStandardChange[] = data?.filter(
    (item) => (item.record_id && item.id_delete_flag) || (item.operation_type && !item.id_delete_flag)
  );

  const standardPriceUpdate: IStandardChangeUpdate[] = listStandardChange?.map((item) => ({
    record_id: item.record_id,
    operation_type: item.operation_type,
    store_code: item.store_code,
    item_code: item.item_code,
    booking_date: item.booking_date,
    group_code: item.group_code,
    new_price: item.standard_price ?? item.current_price,
  }));
  return standardPriceUpdate;
};
