import { Row } from '@tanstack/react-table';
import { RowBase } from 'app/components/table/table-data/table-data';
import { OperationType } from 'app/components/table/table-common';

export interface FormTableDataBase<TRow extends RowBase> {
  selectedRows?: Row<TRow>[];
  showNoData?: boolean;
}


export interface UserTable extends RowBase {
  user_id: string;
  user_name: string;
  role_id: string;
  role_name: string;
  store_code: string;
  store_name: string;
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
    storeCode: '',
    storeName: '',
    password: '',
    confirmPassword: '',
  },
  add: {
    userId: '',
    userName: '',
    role: 0,
    storeCode: '',
    storeName: '',
    password: '',
    confirmPassword: '',
    operation_type_before: OperationType.New,
  },
  typeDirty: 'search',
};

export interface UserSettingFormData extends FormTableDataBase<UserTable> {
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
    storeCode?: string;
    storeName: string;
    password?: string;
    confirmPassword?: string;
    operation_type_before?: OperationType;
    operation_type?: OperationType;
    userCreated?: number;
  };
  add?: {
    userId: string;
    userName: string;
    storeCode?: string;
    storeName: string;
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
    storeCode?: string;
    storeName: string;
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
  store_code?: string;
  password?: string;
}
