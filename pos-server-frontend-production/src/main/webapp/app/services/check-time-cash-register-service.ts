import { getBlobWithMethodPost, getDataWithParam } from '@/services/base-service';
import { ResponseApiListExceed } from 'app/services/base-service';

export interface ITimePeriodParams {
  selected_store: string;
  business_type: string;
  start_period: string;
  end_period: string;
}

export type ListCashRegister = {
  cash_register_code: string;
  rate_customer_excluded: number | null;
  data_report: DataReport[];
};
export type DataReport = {
  time_no: number;
  time_period: number;
  ratio: number;
  sale_amount: number;
  number_customers: number;
  number_products: number;
  is_highlight: boolean;
};


export const getTimePeriod = getDataWithParam<ITimePeriodParams, ResponseApiListExceed<ListCashRegister>>('report/sales/time-period');
export const getTimePeriodExportCSV = getBlobWithMethodPost<ITimePeriodParams>('report/sales/time-period/export/csv')
export const getTimePeriodExportPDF = getBlobWithMethodPost<ITimePeriodParams>('report/sales/time-period/export/pdf')
