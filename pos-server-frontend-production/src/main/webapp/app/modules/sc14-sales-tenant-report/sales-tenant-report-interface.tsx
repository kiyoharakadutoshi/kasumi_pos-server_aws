import { RowBase } from 'app/components/table/table-data/table-data';

export interface ISalesTenantReport extends RowBase {
  group?: string;
  sales_revenue_08?: number;
  consumption_tax_08?: number;
  sales_revenue_10?: number;
  consumption_tax_10?: number;
  non_tax_amount?: number;
  total_revenue?: number;
}
