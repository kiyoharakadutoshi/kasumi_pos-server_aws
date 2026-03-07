import { getBlobWithMethodPost, getDataWithParam } from '@/services/base-service';
import { ResponseApiListExceed } from 'app/services/base-service';

export interface ICashRegisterStatusParams {
  selected_stores: string[];
  business_date: string;
  cash_register_type: string | null;
  data_master_status: number | null;
  cash_register_status: number | null;
  failure_status: number | null;
}

export type CashRegisterItem = {
  store_code: number;
  store_name: string;
  cash_register_code: string;
  cash_register_type_code: string;
  cash_register_type_name: string;
  ip_address: string;
  parent_ip_address: string;
  data_master_status: number;
  apply_master_time: string;
  cash_register_status: number;
  parent_status: number;
  failure_status: number;
  transaction_date: string;
};

export type ListCashRegisterStatusResponse = {
  company_code: number;
  items: CashRegisterItem[];
  store_code: string;
  store_name: string;
  cash_register_code: string;
  cash_register_type_code: string;
  cash_register_type_name: string;
  ip_address: string;
  parent_ip_address: string;
  data_master_status: number;
  apply_master_time: string;
  cash_register_status: number;
  parent_status: number;
  failure_status: number;
  transaction_date: string;
};

export type exportCashRegisterCSVParams = {
  selected_stores: string[];
  business_date: string;
  cash_register_type: string;
  data_master_status: number;
  cash_register_status: number;
  failure_status: number;
  lang: string;
};

export type detailCashRegisterParams = {
  selected_store: string;
  business_date: string;
  cash_register_code: string;
};

export type detailCashRegisterResponse = {
  store_code:string;
  store_name: string;
  cash_register_code: string;
  cash_register_type_code: string;
  cash_register_type_name: string;
  ip_address: string;
  parent_ip_address: string;
  data_master_status: number | null;
  apply_master_time: string;
  transaction_date: string // business_date
  auto_charge_status: number;
  scanner_status: number;
  secod_display_status: number;
  printer_status: number;
  webcam_status:number;
  card_reader_status:number;
  check_network: number;
  cash_register_status: number;
  parent_status: number;
  startup_count: number;
  open_count: number;
  last_transaction_id: string;
  applied_master_time: string;
  downloaded_master_time: string;
  downloaded_master_version: string;
  applied_master_version: string;
  downloaded_app_version: string;
  download_app_time: string;
  applied_app_time:string;
  applied_app_version: string;
}

export const getListCashRegisterStatus = getDataWithParam<ICashRegisterStatusParams, ResponseApiListExceed<ListCashRegisterStatusResponse>>(
  'report/cash-registers'
);

export const exportCashRegisterCSV = getBlobWithMethodPost<exportCashRegisterCSVParams>(
  'report/cash-registers/export/csv'
);
export const getDetailCashRegister = getDataWithParam<detailCashRegisterParams, detailCashRegisterResponse>('report/cash-registers/detail');
