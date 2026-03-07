import { EmployeesResponse, JournalsResponse } from 'app/modules/search-journal/search-journal-interface';
import { getBlobWithMethodPost, getDataWithParam } from './base-service';

export const searchJournals = getDataWithParam<
  {
    selected_stores: string[];
    business_date_from: string;
    business_date_to: string;
    cash_register_code?: string;
    employee_code?: string;
    receipt_no_from?: string;
    receipt_no_to?: string;
    keyword_1?: string;
    keyword_2?: string;
    condition_type: number;
    amount_money?: string;
  },
  JournalsResponse
>(`journals`);

export const getListEmployees = getDataWithParam<
  {
    selected_stores?: string[] | number;
    employee_code?: string;
    employee_code_type?: string;
    employee_name?: string;
    employee_name_type?: string;
    search_max_count?: number;
  },
  EmployeesResponse
>(`employees`);

export const exportBill = getBlobWithMethodPost<{
  record_ids: number[];
  sort_column: string;
  sort_value: string;
}>('journals/export');
