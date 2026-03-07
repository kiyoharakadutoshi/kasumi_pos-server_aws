import { RowBase } from 'app/components/table/table-data/table-data';

export interface IHierarchyLevel {
  code_level_one?: string;
  code_level_two?: string;
  code_level_three?: string;
  code_level_four?: string;
  description?: string;
  choice?: boolean;
  md_hierarchy_code?: string;
  md_hierarchy_level?: number;
  subRows?: IHierarchyLevel[];
}

export interface IProductReport extends RowBase {
  rank?: number;
  company_code?: string;
  store_code?: string;
  md_hierarchy_code_level_one?: string;
  md_hierarchy_code_level_two?: string;
  md_hierarchy_code_level_three?: string;
  md_hierarchy_code_level_four?: string;
  item_code?: string;
  my_company_code?: string;
  description?: string;
  average_price?: number;
  sales_amount?: number;
  sales_quantity?: number;
  special_price_amount?: number;
  special_price_quantity?: number;
  combination_price_amount?: number;
  combination_price_quantity?: number;
  setmatch_price_amount?: number;
  setmatch_price_quantity?: number;
  discount_amount?: number;
  discount_quantity?: number;
  transaction_time?: string;
}
