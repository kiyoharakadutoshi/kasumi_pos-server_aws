import {
  createAsyncThunk,
  Dispatch,
  ThunkDispatch,
  UnknownAction,
  AsyncThunkPayloadCreator,
  AsyncThunkOptions,
  GetThunkAPI,
} from '@reduxjs/toolkit';
import { serializeAxiosError } from 'app/reducers/reducer.utils';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AsyncThunkConfig } from '@reduxjs/toolkit/dist/createAsyncThunk';
import {
  COMPANY_STORE_CODE,
  SELECTED_STORE_KEYS,
  STORE_CODE_KEYS,
  STORE_CODE_LENGTH_DEFAULT,
} from 'app/constants/company-constants';
import _ from 'lodash';
import { isNullOrEmpty } from 'app/helpers/utils';

export interface ResponseApi {
  status?: 'Error' | 'Success';
}

export interface ResponseApiListExceed<TypeItems> extends ResponseApi {
  data: {
    items?: TypeItems[];
    is_exceed_records?: boolean;
  };
}

export interface ResponseApiList extends ResponseApi {
  page?: number;
  size?: number;
  total_count?: number;
}

export interface IPagingResponseApi {
  total_item?: number;
  total_page: number;
  current_page: number;
}

export interface IPagingResponseList<T> extends IPagingResponseApi{
  items: T[];
  total_record: number;
}

export interface IBasePagingResponseApi<T> {
  status?: string;
  data: IPagingResponseList<T>
}

/**
 * Convert response store from number -> string and pad start
 * @param data
 * @param companyCode
 */
const normalizeRecursive = (data: any, companyCode?: number): any => {
  const padStoreCode = (value: number): string => {
    const valueString = value !== null ? _.toString(value) : '';
    return isNullOrEmpty(valueString)
      ? null
      : valueString.padStart(COMPANY_STORE_CODE[companyCode] ?? STORE_CODE_LENGTH_DEFAULT, '0');
  };

  if (Array.isArray(data)) {
    return data.map((item) => normalizeRecursive(item, companyCode));
  }

  if (data !== null && typeof data === 'object') {
    const normalizeObject: any = data;

    for (const key in data) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) continue;

      const value = data[key];
      if (STORE_CODE_KEYS.includes(key)) {
        // Convert store_code from Number -> String and pad start with 0
        if (Array.isArray(value)) {
          normalizeObject[key] = value?.map((item) => padStoreCode(item));
        } else {
          normalizeObject[key] = padStoreCode(value);
        }
      } else {
        normalizeObject[key] = normalizeRecursive(value, companyCode);
      }
    }

    return normalizeObject;
  }
  return data;
};

/**
 * Convert response store from string -> number
 * @param data
 */
const normalizeArg = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeArg(item));
  }

  if (data !== null && typeof data === 'object') {
    const normalizeObject: any = data;

    for (const key in data) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) continue;

      const value = data[key];
      if (SELECTED_STORE_KEYS.includes(key)) {
        if (Array.isArray(value)) {
          const parsedArray = value.reduce((acc, v) => {
            const store = parseInt(v, 10);
            if (!isNaN(store)) acc.push(String(store));
            return acc;
          }, []);
          if (parsedArray.length > 0) {
            normalizeObject[key] = parsedArray;
          }
        } else {
          const parsed = parseInt(value, 10);
          if (!isNaN(parsed)) {
            normalizeObject[key] = parsed;
          }
        }
      } else if (value !== null && typeof value === 'object') {
        normalizeObject[key] = normalizeArg(value);
      }
    }

    return normalizeObject;
  }

  return data;
};

/**
 * Custom createAsyncThunk with override request/response
 * @param typePrefix
 * @param payloadCreator
 * @param options
 */
const createNormalizedThunk = <Returned, ThunkArg, ThunkApiConfig extends AsyncThunkConfig = NonNullable<unknown>>(
  typePrefix: string,
  payloadCreator: AsyncThunkPayloadCreator<Returned, ThunkArg, ThunkApiConfig>,
  options?: AsyncThunkOptions<ThunkArg, ThunkApiConfig>
) =>
  createAsyncThunk<Returned, ThunkArg, ThunkApiConfig>(
    typePrefix,
    async (arg: ThunkArg, thunkAPI: GetThunkAPI<ThunkApiConfig>) => {
      const state: any = thunkAPI.getState();
      const companyCode = state.loginReducer?.selectedCompany?.code;
      const normalizedArg = normalizeArg(arg);
      const rawResult = await payloadCreator(normalizedArg, thunkAPI);
      return normalizeRecursive(rawResult, companyCode);
    },
    options
  );

export const getDataWithParam = <TParams = any, TResponse = any>(pathURL: string, name?: string) => {
  return createNormalizedThunk<AxiosResponse<TResponse, any>, TParams>(
    name ?? pathURL,
    async (params?: TParams) => await axios.get<TResponse>(pathURL, { params }),
    {
      serializeError: serializeAxiosError,
    }
  );
};

export const getDataWithPath = <TPath = any, TResponse = any>(pathURL: string, name?: string) => {
  return createNormalizedThunk<AxiosResponse<TResponse, any>, TPath>(
    name ?? pathURL,
    async (path) => await axios.get<TResponse>(`${pathURL}${Object.values(path).join('/')}`),
    {
      serializeError: serializeAxiosError,
    }
  );
};

export const getDataWithMethodPost = <TBody = any, TResponse = any>(pathURL: string, name?: string) => {
  return createNormalizedThunk<AxiosResponse<TResponse, any>, TBody>(
    name ?? pathURL,
    async (body) => await axios.post<TResponse>(pathURL, body),
    {
      serializeError: serializeAxiosError,
    }
  );
};

export const getDataWithParamAndBody = <TParam = any, TBody = any, TResponse = any>(pathURL: string, name?: string) => {
  return createNormalizedThunk<AxiosResponse<TResponse, any>, { params: TParam; body: TBody }>(
    name ?? pathURL,
    async ({ params, body }) => await axios.post<TResponse>(pathURL, body, { params }),
    {
      serializeError: serializeAxiosError,
    }
  );
};

export const postData = <TBody>(pathURL: string, name?: string, config?: AxiosRequestConfig) => {
  return createNormalizedThunk<any, TBody>(
    name ?? pathURL,
    async (body: TBody) => await axios.post(pathURL, body, config),
    {
      serializeError: serializeAxiosError,
    }
  );
};

export const deleteData = <TParams = any, TResponse = any>(pathURL: string, name?: string) => {
  return createNormalizedThunk<AxiosResponse<TResponse, any>, TParams>(
    name ?? pathURL,
    async (params?: TParams) => await axios.delete<TResponse>(pathURL, { params }),
    {
      serializeError: serializeAxiosError,
    }
  );
};

export const postFile = <TBody extends FormData>(pathURL: string, name?: string) => {
  return createNormalizedThunk<any, TBody>(
    name ?? pathURL,
    async (body: TBody) =>
      await axios.post(pathURL, body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    {
      serializeError: serializeAxiosError,
    }
  );
};

export const getBlobWithMethodPost = <TBody>(pathURL: string, name?: string) => {
  return createNormalizedThunk<{ blob: Blob; headers: any }, TBody>(
    name ?? pathURL,
    async (body: TBody) => {
      const response: AxiosResponse<any> = await axios.post(pathURL, body, {
        responseType: 'blob',
      });
      const headers = response.headers;
      const blob = response.data;
      return { blob, headers };
    },
    {
      serializeError: serializeAxiosError,
    }
  );
};

export const apiRequest =
  (requestConfig: any, type: string) =>
  async (
    dispatch: ThunkDispatch<
      {
        [p: string]: any;
      },
      undefined,
      UnknownAction
    > &
      Dispatch<UnknownAction>
  ) => {
    try {
      const response = await axios(requestConfig);
      dispatch({
        type: `${type}/fulfilled`,
        payload: response,
      });
    } catch (error) {
      dispatch({
        type: `${type}/reject`,
        error,
      });
    }
  };
