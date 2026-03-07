import { RowBase } from 'app/components/table/table-data/table-data';

export interface IBudgetRegistrationTable extends RowBase {
  col1DayOfMonth?: string;
  col1DayOfWeek?: string;
  col1BudgetAmount?: string;
  col2DayOfMonth?: string;
  col2DayOfWeek?: string;
  col2BudgetAmount?: string;
  col3DayOfMonth?: string;
  col3DayOfWeek?: string;
  col3BudgetAmount?: string;
}

export interface IBudgetList extends RowBase {
  record_id: number;
  store_code: string;
  apply_date: string;
  md_hierarchy_code: string;
  total_budget_all_category: number;
  total_budget_this_category: number;
  budget_info: BudgetInfo[];
}

export interface BudgetInfo {
  record_id?: number;
  apply_date?: string;
  budget?: number;
}

export interface SaveBudget {
  store_code?: string;
  apply_date?: string;
  md_hierarchy_code?: string;
  items?: BudgetInfo[];
}
