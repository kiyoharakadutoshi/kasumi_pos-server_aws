
import {
  ICashRegisterReportState,
  ICashRegisterReportType,
  CashRegisterReportInfo,
  cashRegisterReportTabs,
  cashRegisterReportTypes,
} from 'app/modules/sc31-report-quick-cashier/sc3102-detail-report/sc3102-detail-report-interface';
import { RowBase } from 'app/components/table/table-data/table-data';
import { convertDateServer } from 'app/helpers/date-utils';
import { IListCashRegisterReportState } from 'app/reducers/cash-register-report-reducer';
import { isValidDate } from 'app/helpers/utils';
import { FormTableDataBase } from 'app/components/table/table-data/interface-table';

interface CashRegisterReportListFormData extends FormTableDataBase<ICashRegisterReportData> {
  type: ICashRegisterReportType;
  tab: CashRegisterReportInfo;
  reports?: ICashRegisterReportData[];
  startDateReport?: string;
  endDateReport?: string;
  isExceedRecords?: boolean;
  searchSate?: ICashRegisterReportState;
}

export interface ICashRegisterReportData extends RowBase {
  cash_register_name?: string;
  cash_register_code?: string;
  sale_amount?: number;
  number_customers?: number;
  number_products?: number;
  exclude_tax_amount?: number;
  include_tax_amount?: number;
  average_product_amount?: number;
  average_customer_amount?: number;
}

export const getListCashRegisterReportDefault = (data?: IListCashRegisterReportState) => {
  let formData: CashRegisterReportListFormData;
  const date = convertDateServer(new Date());

  if (data?.searchState) {
    const businessType = cashRegisterReportTypes.find((element) => element.type === data.searchState.business_type);
    const startDateReport = data.searchState.start_period;
    const endDateReport = data.searchState.end_period;

    formData = {
      type: businessType ?? cashRegisterReportTypes[0],
      tab: cashRegisterReportTabs[0],
      reports: data.cashRegisterReports,
      endDateReport: isValidDate(endDateReport) ? endDateReport : date,
      startDateReport: isValidDate(startDateReport) ? startDateReport : date,
      searchSate: data.searchState,
    };
  } else {
    formData = {
      type: cashRegisterReportTypes[0],
      tab: cashRegisterReportTabs[0],
      reports: [],
      endDateReport: date,
      startDateReport: date,
    };
  }
  return formData;
};

export const listRadioCashRegisterReport = cashRegisterReportTypes.slice(0, 2);
