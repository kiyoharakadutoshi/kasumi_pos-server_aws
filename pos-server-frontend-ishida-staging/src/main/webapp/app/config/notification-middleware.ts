import axios, { AxiosError, AxiosResponse, isAxiosError } from 'axios';
import { setError } from 'app/reducers/error';
import { isPending, UnknownAction } from '@reduxjs/toolkit';
import { hideLoading, removeOngoingCalls, showLoading } from 'app/components/loading/loading-reducer';
import { isNullOrEmpty, localizeFormat, localizeString } from 'app/helpers/utils';
import { paramErrorCommon, urlError } from './error-param-value';
import { refreshToken } from 'app/services/login-service';
import { clearAuthentication, IUserLogin } from 'app/reducers/user-login-reducer';
import { apiRequest } from 'app/services/base-service';
import _ from 'lodash';
import { Storage } from 'react-jhipster';
import { USER_LOGIN_KEY } from 'app/constants/constants';

const errorStatus = {
  0: 'error.server.not.reachable',
  400: 'MSG_ERR_011',
  403: 'MSG_ERR_013',
  404: 'MSG_ERR_001',
  405: 'MSG_ERR_014',
  409: 'MSG_ERR_015',
  415: 'MSG_ERR_016',
  500: 'MSG_ERR_SERVER',
  503: 'MSG_ERR_017',
  505: 'MSG_ERR_018',
};

const urlIgnores = [
  'product/suggest',
  'promotion/detail',
  'sales/plu-suggest',
  'product/hierarchy-level',
  'product/suggest-child',
  'product/existed',
  'ticket/base-tickets-suggest',
];

const urlIgnoreErrors = ['sales/plu', 'ishida/product/suggest'];

const validateURLIgnores = ['product/update', 'product/suggest-child', 'product/existed'];

const isRejectedAction = (action: UnknownAction) => {
  return action?.type?.endsWith('/rejected');
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error: AxiosError, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const parseError = (axiosError: AxiosError<any, any>) => {
  const resultError = {};
  const errors = axiosError?.response?.data?.errors;

  if (!errors) {
    return { error: localizeString('MSG_ERR_422') };
  }

  if (Array.isArray(errors)) {
    return { error: (errors as string[]).map((err) => localizeString(err)) };
  }

  if (typeof errors !== 'object') {
    return { error: localizeString('MSG_ERR_422') };
  }

  const keys = Object.keys(errors).sort();
  if (keys.length === 0) {
    return { error: localizeString('MSG_ERR_422') };
  }

  let param = paramErrorCommon;
  const apiParam = urlError[axiosError?.config?.url ?? ''];
  if (apiParam) {
    param = { ...param, ...apiParam };
  }
  keys.forEach((key) => {
    let msgValues = errors[key] as string[];
    if (typeof msgValues === 'string') {
      msgValues = [msgValues];
    }
    // Format param validate index format
    const regex = /([a-zA-Z0-9_-]+)\[(\d+)]|([a-zA-Z0-9_-]+)(?=\[|\.|$)/g;
    const matches = key.match(regex);
    if (!matches || matches?.length <= 1) {
      const keyMsg = param[key];
      if (!keyMsg) {
        _.set(resultError, key, [localizeString('MSG_VAL_001')]);
        return;
      }

      _.set(
        resultError,
        key,
        msgValues.map((msg) => localizeFormat(msg, ...(keyMsg[msg] ?? '')))
      );
      return;
    }
    // Get param and index from error with format
    const result = [];
    for (const match of matches) {
      const parts = match.split('[');
      if (parts.length > 1) {
        result.push(parts[0]);
        result.push(parts[1].slice(0, -1));
      } else {
        result.push(parts[0]);
      }
    }

    const keyMsg = param[result[result.length - 1]];
    if (!keyMsg) return null;
    const values = msgValues
      .map((msg) => localizeFormat(msg, ...(keyMsg[msg] ?? '')))
      .filter((msg) => !isNullOrEmpty(msg));
    _.set(resultError, key, values);
  });

  return resultError;
};

const getErrorMessage = (error: AxiosError<any, any>) => {
  const data = error?.response?.data;
  const errors = data?.errors;
  if (!errors) {
    return localizeString('MSG_ERR_422');
  }

  if (Array.isArray(errors)) {
    return (errors as string[]).map((err) => localizeString(err)).join('\n');
  }

  if (typeof errors !== 'object') {
    return localizeString('MSG_ERR_422');
  }

  const keys = Object.keys(errors).sort();
  if (keys.length === 0) {
    return localizeString('MSG_ERR_422');
  }

  let param = paramErrorCommon;
  const apiParam = urlError[error?.config?.url ?? ''];
  if (apiParam) {
    param = { ...param, ...apiParam };
  }
  const message = keys
    .map((key) => {
      let msgValues = errors[key] as string[];
      if (typeof msgValues === 'string') {
        msgValues = [msgValues];
      }
      // Format param validate index format
      const regex = /([a-zA-Z0-9_-]+)\[(\d+)]|([a-zA-Z0-9_-]+)(?=\[|\.|$)/g;
      const matches = key.match(regex);
      if (!matches || matches?.length <= 1) {
        const keyMsg = param[key];
        if (!keyMsg) {
          return null;
        }
        return msgValues.map((msg) => localizeFormat(msg, ...(keyMsg[msg] ?? ''))).join('\n');
      }

      // Get param and index from error with format
      const result = [];
      for (const match of matches) {
        const parts = match.split('[');
        if (parts.length > 1) {
          result.push(parts[0]);
          result.push(parts[1].slice(0, -1));
        } else {
          result.push(parts[0]);
        }
      }

      const keyMsg = param[result[result.length - 1]];
      if (!keyMsg) return null;
      return `${msgValues
        .map((msg) => localizeFormat(msg, ...(keyMsg[msg] ?? '')))
        .filter((msg) => !isNullOrEmpty(msg))
        .join('\n')}`;
    })
    .filter((msg) => !isNullOrEmpty(msg))
    .join('\n');

  if (isNullOrEmpty(message)) {
    return localizeString('MSG_ERR_422');
  }

  return message;
};

const ignoreAction = (url?: string, params?: any, isError?: boolean) => {
  if (!url) {
    return false;
  }

  if (
    (params && url.includes('hierarchy-level') && !isNullOrEmpty(params['filter_code'])) ||
    (isError && urlIgnoreErrors.some((errorUrl) => url.includes(errorUrl)))
  ) {
    return true;
  }

  return urlIgnores.some((path) => url.includes(path));
};

const handleRefresh = (dispatch: any, action: any) => {
  if (action.type.includes('auth/login')) {
    dispatch(setError(localizeString('MSG_ERR_005')));
    dispatch(clearAuthentication());
  } else {
    const originalRequest = action.error.config;
    if (!isRefreshing) {
      axios.defaults.headers.Authorization = `Bearer ${Storage.local.get(USER_LOGIN_KEY)?.refresh_token ?? ''}`;
      isRefreshing = true;
      dispatch(refreshToken(null))
        .unwrap()
        .then((responseRefresh: AxiosResponse<any, IUserLogin>) => {
          const newToken = responseRefresh.data?.data?.access_token;
          isRefreshing = false;
          if (isNullOrEmpty(newToken)) {
            dispatch(clearAuthentication());
          }
          processQueue(null, newToken);
        })
        .catch((e: AxiosError) => {
          processQueue(e, null);
          dispatch(clearAuthentication());
          isRefreshing = false;
        });
    }
    const retryOriginalRequest = new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });

    retryOriginalRequest
      .then((token: string) => {
        if (!isNullOrEmpty(token)) {
          originalRequest.Authorization = `Bearer ${token}`;
          dispatch(apiRequest(originalRequest, action.type.replace('/rejected', '')));
        }
      })
      .catch(() => {});
  }
};

export default ({ dispatch }) =>
  (next: any) =>
  (action: any) => {
    const { error, type, meta } = action;
    const isAPIRefresh = type.includes('auth/refresh');

    // Handle show/hide loading
    if (!(type as string)?.startsWith('locale/setLocale')) {
      if (isPending(action) && !ignoreAction(type, meta?.arg)) {
        dispatch(showLoading({ type: type.replace('/pending', '') }));
        return next(action);
      } else if (type?.endsWith('/fulfilled')) {
        const typeFulfilled = type.replace('/fulfilled', '');
        if (isAPIRefresh) {
          dispatch(removeOngoingCalls({ type: typeFulfilled }));
        } else {
          dispatch(hideLoading({ type: typeFulfilled }));
        }
      } else if (type?.endsWith('/rejected')) {
        dispatch(hideLoading({ type: type.replace('/rejected', '') }));
      }
    }

    if (isAPIRefresh) {
      return next(action);
    }

    if (isRejectedAction(action) && isAxiosError(error)) {
      if (error.response) {
        const response = error.response;
        if (action.type.includes('auth/login')) {
          return next(action);
        } else if (response.status === 401) {
          handleRefresh(dispatch, action);
          action.type = action.type.replace('/rejected', '');
        } else if (response.status === 404 && ignoreAction(action.type, error?.config?.params, true)) {
          // Ignore, don't show error
        } else if (errorStatus[response.status] !== undefined && !isNullOrEmpty(errorStatus[response.status])) {
          dispatch(setError(localizeString(errorStatus[response.status])));
        } else {
          if (validateURLIgnores.some((url) => action.type?.includes(url))) {
            action.error.validate = parseError(error);
            return next(action);
          }

          const errorMessage = getErrorMessage(error);
          if (errorMessage) {
            // Check ignore url show modal error validate common
            if (action.type?.includes('change-password')) {
              action.error = errorMessage;
            } else {
              dispatch(setError(errorMessage));
            }
            return next(action);
          }
          const data = response.data?.errors;
          dispatch(
            setError(data?.detail ?? data?.message ?? data?.error ?? data?.title ?? localizeString('MSG_ERR_SERVER'))
          );
        }
      } else {
        dispatch(setError(error.message ?? localizeString('MSG_ERR_SERVER')));
      }
    } else if (error) {
      dispatch(setError(error.message ?? localizeString('MSG_ERR_SERVER')));
    }
    return next(action);
  };
