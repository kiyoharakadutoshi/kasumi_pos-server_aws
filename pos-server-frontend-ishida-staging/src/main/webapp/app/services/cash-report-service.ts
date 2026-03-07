import { getBlobWithMethodPost, getDataWithParam, ResponseApiList } from './base-service';

export interface CashReportReponse extends ResponseApiList {
  data: {
    items: CashReport[];
    is_exceed_records: boolean;
  };
}

export interface ICashReportRequest {
  type: number;
  store_code: string;
}

export interface IExportCashReportRequest extends ICashReportRequest {
  lang?: string;
}

export interface CashReport {
  cash_register_code: string;
  cash_threshold: {
    ten_thousand_count: number;
    five_thousand_count: number;
    two_thousand_count: number;
    one_thousand_count: number;
    five_hundred_count: number;
    one_hundred_count: number;
    fifty_count: number;
    ten_count: number;
    five_count: number;
    one_count: number;
  };
  remaining_cash: {
    ten_thousand_count: number;
    five_thousand_count: number;
    two_thousand_count: number;
    one_thousand_count: number;
    five_hundred_count: number;
    one_hundred_count: number;
    fifty_count: number;
    ten_count: number;
    five_count: number;
    one_count: number;
    last_retrieved_date: string;
  };
  additional_cash: {
    ten_thousand_count: string;
    five_thousand_count: string;
    two_thousand_count: string;
    one_thousand_count: string;
    five_hundred_count: string;
    one_hundred_count: string;
    fifty_count: string;
    ten_count: string;
    five_count: string;
    one_count: string;
  };
}

export const getCashReportList = getDataWithParam<ICashReportRequest, CashReportReponse>('cash-report/search');

export const exportCashReportList = getBlobWithMethodPost<IExportCashReportRequest>('cash-report/export');
