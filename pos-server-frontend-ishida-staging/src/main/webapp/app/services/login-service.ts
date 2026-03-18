import { getDataWithMethodPost, getDataWithParam, ResponseApiListExceed } from './base-service';
import { IUserLogin, Permission } from 'app/reducers/user-login-reducer';

export const login = getDataWithMethodPost<{
  company_code: number;
  user_name?: string;
  password?: string;
}, any>(`auth/login`);

export const refreshToken = getDataWithMethodPost<any, IUserLogin>('auth/refresh')
export const getListCompany = getDataWithParam<any, any>('auth/company/list')
export const getIp = getDataWithParam<any, any>('auth/confirm-ip-address')

export const getListPermission = getDataWithParam<null, ResponseApiListExceed<Permission>>('permissions');
