import { RowBase } from '@/components/table/table-data/table-data';
import { Row } from '@tanstack/react-table';

export interface FormTableDataBase<TRow extends RowBase> {
  selectedRows?: Row<TRow>[];
  showNoData?: boolean;
  // selectedRowsNewImageTable?: Row<TRow>[];
  selectedItemInModal?: Row<TRow>[];
}
export interface MasterCategoryFormData extends FormTableDataBase<IMasterCategory> {
  listHierarchyLevel: IMasterCategory[];
  listHierarchyLevelIsChecked: IMasterCategory[];
  listDiscountCategory: IMasterCategory[];
  itemDetailDiscount?: IMasterCategory[];
  headerCondition: IHeaderCondition;
  disableSearchCondition: boolean;
  isShowTable: boolean;
  isShowTableDetail: boolean;
  disableConfirm: boolean;
  disabledClear: boolean;
  isResetExpanded?: boolean;
}
export interface IMasterCategory extends RowBase {
  /*  */
  choice?: boolean;
  code_level_one?: any;
  code_level_two?: any;
  code_level_three?: any;
  code_level_four?: any;
  description_level_one?: string;
  company_code?: string;
  store_code?: string;
  discount_md_hierarchy_code?: string;
  md_hierarchy_code?: string;
  md_hierarchy_level?: string;
  apply_date_time?: string;
  description?: string;
  // status?: 0 | 1 | 2 | 3;
  status?: any;
  start_date_time?: string;
  end_date_time?: string;
  start_service_time?: string;
  end_service_time?: string;
  type_time_service?: number;
  discount_type_code?: number;
  discount_value?: number;
}

export interface IHeaderCondition {
  code_level_one: any;
  discount_type_code?: number;
  discountPercent?: string;
  discountCash?: string;
  start_date_time: string | Date;
  end_date_time: string | Date;
  start_service_time?: string;
  end_service_time?: string;
  type_time_service?: number;
}
