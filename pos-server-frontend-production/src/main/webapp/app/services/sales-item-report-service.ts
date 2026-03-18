import { getBlobWithMethodPost, getDataWithMethodPost, ResponseApiListExceed } from './base-service';
import { IProductReport } from '@/modules/sc12-product-report/product-report-interface';

export const getSalesItemReport = getDataWithMethodPost<
  {
    selected_store: string;
    start_date: string;
    end_date: string;
    output_type: number;
    md_hierarchy_level?: number;
    md_hierarchy_code?: string;
    department_code?: string;
    item_code?: string;
    sort_column: string;
    limit: number;
  },
  ResponseApiListExceed<IProductReport>
>(`report/sales/items`);

export const exportSalesItem = getBlobWithMethodPost<{
    selected_store: string;
    start_date: string;
    end_date: string;
    output_type: number;
    md_hierarchy_level?: number;
    md_hierarchy_code?: string;
    department_code?: string;
    item_code?: string;
    sort_column: string;
    limit: number;
    language: string;
}>(`report/sales/items/export`);