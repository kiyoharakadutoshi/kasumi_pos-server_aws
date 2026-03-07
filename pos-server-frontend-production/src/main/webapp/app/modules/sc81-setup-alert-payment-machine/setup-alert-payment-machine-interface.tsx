import { RowBase } from 'app/components/table/table-data/table-data';

export interface ISetupAlertPaymentMachine extends RowBase {
  cashier_no?: number;
  ten_thousand_count?: number;
  five_thousand_count?: number;
  two_thousand_count?: number;
  one_thousand_count?: number;
  five_hundred_count?: number;
  one_hundred_count?: number;
  fifty_count?: number;
  ten_count?: number;
  five_count?: number;
  one_count?: number;
}
