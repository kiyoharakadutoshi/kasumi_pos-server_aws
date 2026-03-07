import { IDropDownItem } from '@/components/dropdown/dropdown';
import { TBodyBase } from 'app/components/table/table-common';

export interface SearchJournalFormInterface {
  searchCondition: IConditionSearchJournal;
  listCashRegisterCode?: IDropDownItem[];
  listEmployees: IDropDownItem[];
  listReceiptName: IDropDownItem[];
  checkDisable: boolean;
}

export interface IConditionSearchJournal {
  business_date_from?: string;
  business_date_to?: string;
  business_time_from?: string;
  business_time_to?: string;
  condition_type?: number;
  cash_register_code?: string;
  employee_code?: string;
  keyword_1?: string;
  keyword_2?: string;
  receipt_no_from?: string;
  receipt_no_to?: string;
  receipt_name?: string;
}
export interface ISearchJournal extends TBodyBase {
  record_id?: number;
  store_code?: string;
  store_name?: string;
  cash_register_code?: string;
  employee_code?: string;
  transaction_date?: string;
  receipt_no?: number;
  journal_no?: number;
  selected?: boolean;
  journal_data?: string;
  business_date_from?: string;
  business_date_to?: string;
  business_time_from?: string;
  business_time_to?: string;
  receipt_no_from?: string;
  receipt_no_to?: string;
  condition_type?: number;
  keyword_2?: string;
  keyword_1?: string;
  type?: number;
  is_training_mode?: string;
  receipt_name?: string;
  subtotal?: string;
  total?: string;
}

export const fakeSearchJournal = Array.from({ length: 20 }, (_, index) => ({
  record_id: `${index + 1}`,
  store_code: `${index + 100}`,
  store_name: `人制`,
  cash_register_code: `${index + 100}`,
  transaction_date: `${index + 100}`,
  receipt_no: `${index + 100}`,
  journal_no: `${index + 100}`,
  subtotal: '0',
}));

export const initISearchJournal: ISearchJournal = {
  store_code: '',
  business_date_from: '',
  business_date_to: '',
  condition_type: 0,
  receipt_no_from: '',
  receipt_no_to: '',
  keyword_1: '',
  keyword_2: '',
};

export interface JournalsResponse {
  data: {
    items?: [
      {
        record_id: number;
        store_code?: string;
        store_name?: string;
        cash_register_code?: string;
        transaction_date?: string;
        receipt_no?: number;
        journal_no?: number;
        journal_data: string;
        business_date_from?: string;
        business_date_to?: string;
        receipt_no_from?: string;
        receipt_no_to?: string;
        subtotal?: string;
      },
    ];
  };
}
export interface EmployeesResponse {
  data: any;
}

export interface IsAscendingType {
  store_code: boolean | null;
  cash_register_code: boolean | null;
  transaction_date: boolean | null;
  receipt_no: boolean | null;
  receipt_name: boolean | null;
  is_training_mode: boolean | null;
  total: boolean | null;
}
