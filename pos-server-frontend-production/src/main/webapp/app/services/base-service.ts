import { Dispatch, ThunkDispatch, UnknownAction, createAsyncThunk } from '@reduxjs/toolkit';
import { serializeAxiosError } from 'app/reducers/reducer.utils';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

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
  total_item: number;
  total_page: number;
  current_page: number;
}

interface FetchDataParams {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
}

export const getDataWithParam = <TParams = any, TResponse = any>(pathURL: string, name?: string) => {
  return createAsyncThunk<AxiosResponse<TResponse, any>, TParams>(
    name ?? pathURL,
    async (params?: TParams) => await axios.get<TResponse>(pathURL, { params }),
    {
      serializeError: serializeAxiosError,
    }
  );
};

export const getDataWithPath = <TPath = any, TResponse = any>(pathURL: string, name?: string) => {
  return createAsyncThunk<AxiosResponse<TResponse, any>, TPath>(
    name ?? pathURL,
    async (path) => await axios.get<TResponse>(`${pathURL}${Object.values(path).join('/')}`),
    {
      serializeError: serializeAxiosError,
    }
  );
};

export const getDataWithMethodPost = <TBody = any, TResponse = any>(pathURL: string, name?: string) => {
  return createAsyncThunk<AxiosResponse<TResponse, any>, TBody>(
    name ?? pathURL,
    async (body) => await axios.post<TResponse>(pathURL, body),
    {
      serializeError: serializeAxiosError,
    }
  );
};

export const getDataWithParamAndBody = <TParam = any, TBody = any, TResponse = any>(pathURL: string, name?: string) => {
  return createAsyncThunk<AxiosResponse<TResponse, any>, { params: TParam; body: TBody }>(
    name ?? pathURL,
    async ({ params, body }) => await axios.post<TResponse>(pathURL, body, { params }),
    {
      serializeError: serializeAxiosError,
    }
  );
};

export const postData = <TBody>(pathURL: string, name?: string, config?: AxiosRequestConfig) => {
  return createAsyncThunk<any, TBody>(name ?? pathURL, async (body: TBody) => await axios.post(pathURL, body, config), {
    serializeError: serializeAxiosError,
  });
};

export const deleteData = <TParams = any, TResponse = any>(pathURL: string, name?: string) => {
  return createAsyncThunk<AxiosResponse<TResponse, any>, TParams>(
    name ?? pathURL,
    async (params?: TParams) => await axios.delete<TResponse>(pathURL, { params }),
    {
      serializeError: serializeAxiosError,
    }
  );
};

export const postFile = <TBody extends FormData>(pathURL: string, name?: string) => {
  return createAsyncThunk<any, TBody>(
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
  return createAsyncThunk<{ blob: Blob; headers: any }, TBody>(
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
