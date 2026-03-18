import { getDataWithMethodPost } from "./base-service";
import { IUserLogin } from 'app/reducers/user-login-reducer';

export const login = getDataWithMethodPost<{
  company_code: string;
  user_name?: string;
  password?: string;
}, any>(`auth/login`);

export const refreshToken = getDataWithMethodPost<any, IUserLogin>('auth/refresh')
