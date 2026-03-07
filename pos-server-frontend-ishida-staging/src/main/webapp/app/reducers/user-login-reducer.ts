import { createSlice, isFulfilled, isRejected } from '@reduxjs/toolkit';
import { Storage } from 'react-jhipster';
import { getListPermission, login, refreshToken } from 'app/services/login-service';
import { toNumber } from 'lodash';
import { AUTH_TOKEN_KEY, GROUP_STORES, PERMISSIONS_KEY, USER_LOGIN_KEY } from 'app/constants/constants';
import { clearPreset } from 'app/modules/touch-menu/detail/reducer/preset-reducer';
import { clearDataSearch, clearMenuPreset } from 'app/modules/touch-menu/menu-preset/reducer/menu-preset-reducer';
import { IDropDownItem } from 'app/components/dropdown/dropdown';
import { ISettingMasterDefaultParam } from 'app/modules/setting-master/interface-setting';
import { isEqual } from 'app/helpers/utils';
import { LIST_COMPANY } from 'app/constants/company-constants';

export interface UserState {
  isAuthenticated: boolean;
  userLogin?: IUserLogin;
  selectedCompany?: CompanyInfo;
  errorMessage?: string;
  permissions?: Permission[];
}

export interface CompanyInfo extends IDropDownItem {
  mainColor: string;
  backgroundColor: string;
  settingMaster?: ISettingMasterDefaultParam;
  employeeBarCode?: string;
}

export interface IUserLogin {
  access_token?: string;
  refresh_token?: string;
  user_detail?: UserDetail;
}

export interface UserDetail {
  user_name: string;
  user_id: string;
  role_code: string;
  role_name: string;
  company_code: number;
  company_name?: string;
  store_code?: string;
  store_name?: string;
}

export interface Permission {
  code: string;
  alias_name: string;
  name?: NamePermission;
}

export interface NamePermission {
  ja?: string;
  en?: string;
}

const initialUserLoginState: UserState = {
  isAuthenticated: false,
  userLogin: null,
  selectedCompany: null,
};

export const clearAuthSession = () => {
  Storage.local.remove(AUTH_TOKEN_KEY);
  Storage.local.remove(USER_LOGIN_KEY);
  Storage.local.remove(GROUP_STORES);
};

export const clearAuthentication = () => (dispatch) => {
  clearAuthSession();
  dispatch(setAuthentication(false));
  dispatch(clearPreset());
  dispatch(clearMenuPreset());
  dispatch(clearDataSearch());
};

const userLoginSlice = createSlice({
  name: 'userLogin',
  initialState: initialUserLoginState,
  reducers: {
    setAuthentication(state, action) {
      state.isAuthenticated = action.payload;
    },
    setupSession(state) {
      const userLogin: IUserLogin = Storage.local?.get(USER_LOGIN_KEY);
      state.permissions = Storage.local?.get(PERMISSIONS_KEY);
      state.userLogin = userLogin;
      if (userLogin) {
        state.isAuthenticated = true;
        state.selectedCompany =
          LIST_COMPANY.find((company) => isEqual(company.code, userLogin.user_detail?.company_code)) ?? LIST_COMPANY[0];
      }
    },
    setSelectedCompany(state, action) {
      state.selectedCompany = LIST_COMPANY.find((company) => isEqual(company.code, action.payload)) ?? LIST_COMPANY[0];
    },
    clearCompany(state) {
      state.selectedCompany = null;
    },
    clearSession(state) {
      state.userLogin = null;
      state.isAuthenticated = false;
      state.selectedCompany = null;
      state.permissions = null;
      clearAuthSession();
    },
    setMessageError(state, action) {
      state.errorMessage = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addMatcher(isFulfilled(login, refreshToken), (state, action) => {
        const userLogin = action.payload.data.data;
        if (userLogin && userLogin.access_token && userLogin.user_detail) {
          state.userLogin = userLogin;
          Storage.local.set(AUTH_TOKEN_KEY, userLogin.access_token);
          Storage.local.set(USER_LOGIN_KEY, userLogin);
          state.errorMessage = null;
        }
      })
      .addMatcher(isFulfilled(getListPermission), (state, action) => {
        // parse json name and sort
        state.permissions = action.payload.data?.data?.items
          ?.map((item: any) => {
            let name: NamePermission;
            try {
              name = JSON.parse(item?.name);
            } catch (e) {
              const nameString = item?.name ?? '';
              name = { ja: nameString, en: nameString };
            }

            return { ...item, name };
          })
          .sort((item1: Permission, item2: Permission) => toNumber(item1.code) - toNumber(item2.code));

        // Save permission to Local storage
        Storage.local.set(PERMISSIONS_KEY, state.permissions);
      })
      .addMatcher(isRejected(login), (state) => {
        state.isAuthenticated = false;
        state.errorMessage = 'MSG_ERR_005';
      })
      .addMatcher(isRejected(getListPermission), (state) => {
        state.permissions = [];
        // Save permission to Local storage
        Storage.local.set(PERMISSIONS_KEY, state.permissions);
      });
  },
});

export const { setAuthentication, setupSession, clearSession, clearCompany, setSelectedCompany, setMessageError } =
  userLoginSlice.actions;

export default userLoginSlice.reducer;
