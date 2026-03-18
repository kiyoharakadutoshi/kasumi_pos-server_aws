import { getBlobWithMethodPost, getDataWithParam, ResponseApiListExceed } from 'app/services/base-service';
import {
  IDetailCashRegisterReport,
  CashRegisterReportTypeEnum,
} from 'app/modules/sc31-report-quick-cashier/sc3102-detail-report/sc3102-detail-report-interface';
import { ICashRegisterReportData } from 'app/modules/sc31-report-quick-cashier/sc3101-list-cash-register-report/sc3101-list-cash-register-report-interface';

export interface ICashRegisterReportParam {
  selected_store: string;
  business_type: CashRegisterReportTypeEnum;
  start_period: string;
  end_period?: string;
}

export interface IDetailCashRegisterReportParam extends ICashRegisterReportParam {
  cash_register_code: string;
}

interface ICashRegisterReportResponse {
  data: IDetailCashRegisterReport;
}

export interface ICashRegisterReportPDFParam extends IDetailCashRegisterReportParam {
  cash_register_name: string;
  lang: string;
}

export const getListCashRegisterReport = getDataWithParam<
  ICashRegisterReportParam,
  ResponseApiListExceed<ICashRegisterReportData>
>('report/sales/cash-register');

export const getDetailCashRegisterReport = getDataWithParam<
  IDetailCashRegisterReportParam,
  ICashRegisterReportResponse
>('report/sales/cash-register/detail');

export const exportCashRegisterReport = getBlobWithMethodPost<ICashRegisterReportPDFParam>(
  `report/sales/cash-register/detail/export`
);
