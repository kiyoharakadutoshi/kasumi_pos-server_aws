import { IDropDownItem } from '@/components/dropdown/dropdown';
import { Row } from '@tanstack/react-table';
import { RowBase } from 'app/components/table/table-data/table-data';
import { OperationType } from 'app/components/table/table-common';

export interface FormTableDataBase<TRow extends RowBase> {
  selectedRows?: Row<TRow>[];
  showNoData?: boolean;
}

export interface storeRes {
  store_code: string | number;
  store_name: string;
}


export interface UserTable extends RowBase {
  user_id: string;
  user_name: string;
  role_id: string;
  role_name: string;
  stores?: storeRes[];
  update_date?: string;
  update_user?: string;
  password?: string;
  confirm_password?: string;
  user_created?: number;
}

export const DEFAULT_VALUE: UserSettingFormData = {
  userId: '',
  userIdType: 0,
  userName: '',
  userNameType: 0,
  userInfo: [],
  defaultUserInfo: [],
  recordSelected: null,
  edit: {
    userId: '',
    userName: '',
    role: 0,
    stores: [],
    password: '',
    confirmPassword: '',
  },
  add: {
    userId: '',
    userName: '',
    role: 0,
    stores: [],
    password: '',
    confirmPassword: '',
    operation_type_before: OperationType.New,
  },
  typeDirty: 'search',
};

interface storeTable {
  storeCode: string;
  storeName: string;
}

export interface User {
  recordId: number;
  userId: string;
  userName: string;
  roleId: string;
  roleName: string;
  stores: storeTable[],
  updateDate: string;
  update_employee: string;
}

export interface UserSettingFormData extends FormTableDataBase<UserSettingFormData> {
  userId: string;
  userIdType: number;
  userName: string;
  userNameType: number;
  roleId?: number;
  userInfo?: UserTable[];
  defaultUserInfo?: UserTable[];
  recordSelected?: UserTable;
  isExceedRecords?: boolean;
  edit?: {
    userId: string;
    userName: string;
    role: number;
    stores: IDropDownItem[];
    password?: string;
    confirmPassword?: string;
    operation_type_before?: OperationType;
    operation_type?: OperationType;
    userCreated?: number;
  };
  add?: {
    userId: string;
    userName: string;
    stores: IDropDownItem[];
    role: number;
    password: string;
    confirmPassword: string;
    operation_type_before?: OperationType;
    operation_type?: OperationType;
  };
  editDefault?: {
    userId: string;
    userName: string;
    role: number;
    stores: IDropDownItem[];
    password?: string;
    confirmPassword?: string;
    operation_type_before?: OperationType;
    operation_type?: OperationType;
  };
  typeDirty: 'search' | 'changeStore';
}

export interface ListUserRequest {
  selected_stores: any;
  user_id: string;
  user_id_filter_type: number;
  user_name: string;
  user_name_filter_type: number;
  role: number;
}

export interface ListUserResponse {
  data: {
    is_exceed_records: boolean;
    items: UserTable[];
  };
}

export interface UserIdRequest {
  user_id: string;
}

export interface ExistedUserResponse {
  data: {
    is_existed: boolean;
  };
}

export interface UserSaveCondition {
  operation_type: number;
  user_id: string;
  user_name: string;
  role_id: string;
  store_code?: (string | number)[];
  password?: string;
}
