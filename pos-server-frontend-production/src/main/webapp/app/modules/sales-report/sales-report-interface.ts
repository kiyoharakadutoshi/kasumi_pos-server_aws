import { RowBase } from '@/components/table/table-data/table-data';
import { Row } from '@tanstack/react-table';

export interface FormTableDataBase<TRow extends RowBase> {
  selectedRows?: Row<TRow>[];
  showNoData?: boolean;
}
export interface SaleReportInterface extends FormTableDataBase<ISalesReport> {
  dataReportList: ISalesReport[];
  headerCondition: IHeaderCondition;
  isGroupTable: boolean;
  disableButtonUpperLevel: boolean;
  disableButtonLowerLevel: boolean;
  preHierarchyCode: string[];
  report_type: 0 | 1;
  isDateError: boolean;
  parent_code: string;
  parent_name: string;
}
export interface ISalesReport extends RowBase {
  record_id?: any;
  company_code?: string;
  store_code?: string;
  md_hierarchy_code?: string;
  md_hierarchy_parent_code?: string;
  description?: string;
  sales_amount?: number;
  budget?: number;
  achievement_ratio?: number;
  constituent_ratio?: number;
  sales_transaction_count?: string;
  sales_quantity?: number;
  item_unit_price?: number;
  discount_amount?: number;
  customer_unit_price?: number;
  cumulative_sales_price?: number;
  time_zone?: string;
}
export interface IHeaderCondition {
  start_date: string | Date;
  end_date: string | Date;
  output_type: 0 | 1;
  md_hierarchy_level?: number;
}
