import { getBlobWithMethodPost, getDataWithMethodPost, ResponseApi } from './base-service';
import { ISalesReport } from '@/modules/sales-report/sales-report-interface';

interface ResponseApiSaleReport<TypeItems> extends ResponseApi {
  data: {
    items?: TypeItems[];
    is_exceed_records?: boolean;
    parent_code?: string;
    parent_name?: string;
  };
}

export const getSaleReport = getDataWithMethodPost<
  {
    selected_store: string;
    start_date: string;
    end_date: string;
    report_type: number;
    md_hierarchy_code?: string;
    md_hierarchy_level?: number;
  },
  ResponseApiSaleReport<ISalesReport>
>(`report/sales`);

export const exportSales = getBlobWithMethodPost<{
  selected_store: string;
  start_date: string;
  end_date: string;
  report_type: number;
  output_type: number;
  md_hierarchy_code?: string;
  md_hierarchy_level?: number;
  language?: string;
}>(`report/sales/export`);
