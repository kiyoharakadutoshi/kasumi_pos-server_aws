import { getDataWithMethodPost, getDataWithParam, postData, postFile } from './base-service';

export interface ListEmployeeRequest {
  selected_stores: any;
  employee_code: string;
  employee_code_type: number;
  employee_name: string;
  employee_name_type: number;
}

export interface Employee {
  record_id: number;
  company_code: number;
  store_code: string;
  store_name: string;
  employee_role_code: string;
  employee_role_name: string;
  employee_code: string;
  employee_name: string;
  employee_name_kana: string;
  description: string;
}

export interface ListEmployeeResponse {
  data: {
    items: Employee[];
    is_exceed_records?: boolean;
  };
}

export const getEmployeeList = getDataWithParam<ListEmployeeRequest, ListEmployeeResponse>('employees');
export const confirmEmployeeList = postData('employees/maintenance');
export const checkDuplicatesEmployee = postData<any>('employees/exists');
export const importCSV = postFile<FormData>('employees/import')
