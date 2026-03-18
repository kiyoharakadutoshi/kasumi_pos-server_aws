import { IDropDownItem } from 'app/components/dropdown/dropdown';
import { RowBase, TableColumnDef } from 'app/components/table/table-data/table-data';
import { convertDateServer, dropDownMonth } from 'app/helpers/date-utils';
import { ICashRegisterReportParam } from 'app/services/cash-register-report-service';
import { FormTableDataBase } from 'app/components/table/table-data/interface-table';

export enum CashRegisterReportTypeInfo {
  Sale,
  Tax,
  Payment,
  Money,
  Cashier,
}

export enum CashRegisterReportTypeEnum {
  New = '0',
  Daily = '1',
  Monthly = '2',
}

export interface CashRegisterReportInfo {
  name: string;
  type: CashRegisterReportTypeInfo;
}

export interface ICashRegisterReportType {
  name: string;
  type: CashRegisterReportTypeEnum;
}

export const cashRegisterReportTabs = [
  { name: 'detailCashRegisterReport.sales', type: CashRegisterReportTypeInfo.Sale },
  { name: 'detailCashRegisterReport.taxSettlement', type: CashRegisterReportTypeInfo.Tax },
  { name: 'detailCashRegisterReport.depositWithdraw', type: CashRegisterReportTypeInfo.Payment },
  { name: 'detailCashRegisterReport.inventoryDiscount', type: CashRegisterReportTypeInfo.Money },
  { name: 'detailCashRegisterReport.operate', type: CashRegisterReportTypeInfo.Cashier },
];

export const cashRegisterReportTypes = [
  { name: 'detailCashRegisterReport.new', type: CashRegisterReportTypeEnum.New },
  { name: 'detailCashRegisterReport.daily', type: CashRegisterReportTypeEnum.Daily },
  { name: 'detailCashRegisterReport.monthly', type: CashRegisterReportTypeEnum.Monthly },
];

export interface ICashRegisterReportItem extends RowBase {
  name?: string;
  total_amount?: number;
  total_count?: number;
  this_month_total_amount?: number;
  this_month_total_count?: number;
  customer_count?: number;
  average_per_customer?: number;
  average_per_product?: number;
  target_total_amount?: number;
  this_month_target_total_amount?: number;
}

export interface IDetailCashRegisterReport {
  cash_register_name?: string;
  cash_register_code?: string;
  category_info_list?: ICashRegisterReportItem[];
  sale_info_list?: ICashRegisterReportItem[];
  tax_info_list?: ICashRegisterReportItem[];
  settlement_info_list?: ICashRegisterReportItem[];
  cash_in_info_list?: ICashRegisterReportItem[];
  cash_out_info_list?: ICashRegisterReportItem[];
  cash_info_list?: ICashRegisterReportItem[];
  discount_info_list?: ICashRegisterReportItem[];
  operation_info_list?: ICashRegisterReportItem[];
  stamp_info_list?: ICashRegisterReportItem[];
}

interface IDetailCashRegisterReportFormData extends FormTableDataBase<ICashRegisterReportItem> {
  type: ICashRegisterReportType;
  tab: CashRegisterReportInfo;
  startDateReport?: string;
  endDateReport?: string;
  cash_register_code?: string;
  month?: string;
  reportTable?: IDetailCashRegisterReport;
}

export interface ICashRegisterReportTableProps {
  leftTitle: string;
  rightTitle?: string;
  columns: TableColumnDef<ICashRegisterReportItem>[];
  dataName: string;
}

export interface ICashRegisterReportState extends ICashRegisterReportParam {
  cash_register_code: string;
  cash_registers: IDropDownItem[];
}

export const createDetailCashRegisterReportFormData = (state: ICashRegisterReportState) => {
  const businessType =
    cashRegisterReportTypes.find((item) => item.type === state?.business_type) ?? cashRegisterReportTypes[0];
  const currentDate = convertDateServer(new Date());

  return {
    type: businessType,
    tab: cashRegisterReportTabs[0],
    startDateReport: businessType.type === CashRegisterReportTypeEnum.Daily ? state?.start_period : currentDate,
    endDateReport:
      businessType.type === CashRegisterReportTypeEnum.Daily ? state?.end_period : currentDate,
    cash_register_code: state?.cash_register_code,
    month: dropDownMonth()[0].value,
  } as IDetailCashRegisterReportFormData;
};
