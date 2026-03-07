import { IDropDownItem } from '@/components/dropdown/dropdown';
import { FormTableDataBase } from 'app/components/table/table-data/interface-table';
export type TSortType = 'DESC' | 'ASC';

export interface IProductRevenuePosSearchState {
  sort_column: keyof ModalProductListResponseItems;
  sort_value: TSortType;
}

export enum CashRegisterReportTypeEnum {
  New = 0,
  Daily = 1,
}

export interface ProductRevenuePOS extends ModalProductListResponseItems {
  start_date?: string;
  end_date?: string;
  cash_register_code?: string;
  cash_register_name?: string;
  store_code?: string;
}

export const OUTPUT_UNIT_OPTIONS: IDropDownItem[] = [
  {
    name: '全部で',
    value: 0,
    code: '0',
  },
  {
    name: '部門',
    value: 1,
    code: '1',
  },
  {
    name: '品群',
    value: 2,
    code: '2',
  },
  {
    name: '品種',
    value: 3,
    code: '3',
  },
  {
    name: '分類',
    value: 4,
    code: '4',
  },
  {
    name: '商品',
    value: 5,
    code: '5',
  },
];

export interface FormDataRevenue extends FormTableDataBase<CashRegisterRevenueResponseItems> {
  businessType: CashRegisterReportTypeEnum;
  startDate: string;
  endDate: string;
  displayedItemCount: number;
  storeMachineCode: string;
  outputUnit: number;
  classification: string;
  tableData: CashRegisterRevenueResponseItems[];
  pluCode: string;
  productName: string;
  descriptionSearch?: string
  showNoData?: boolean;
  showNoDataModal?: boolean;
  classificationItems?: IDropDownItem[]
}

export interface CashRegisterRevenue {
  selected_store: string;
  business_type: number;
  start_date: string | Date;
  end_date: string | Date;
  cash_register_code: string;
  md_hierarchy_level?: number;
  md_hierarchy_code?: string;
  plu_code?: string;
  limit?: number;
  report_type: number;
  order_by?: string;
  order_type?: string;
}

export interface ProductList {
  selected_store: string;
  plu?: string;
  group_code?: string;
  product_code?: string;
  promotion_code?: string;
  description?: string;
}

export interface CashRegisterRevenueResponseItems {
  my_company_code?: string;
  plu_code?: string;
  description?: string;
  sale_amount?: number;
  sale_quantity?: number;
  pi?: number;
  discount_amount?: number;
  discount_count?: number;
  last_sale_date?: string;
  sales_transaction_count?: number;
  time_period?: string;
}

export interface ModalProductListResponseItems {
  item_code?: string;
  my_company_code?: string;
  description?: string;
  unit_price?: number;
  exist_in?: number;
  belong_to?: number;
  force_price?: number;
  current_price?: number;
  special_valid?: number;
  apply_date?: string;
}
