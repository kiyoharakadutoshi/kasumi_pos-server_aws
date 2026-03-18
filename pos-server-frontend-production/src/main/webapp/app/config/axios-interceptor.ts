import axios from 'axios';
import { Storage } from 'react-jhipster';
import qs from 'qs';
import { AUTH_TOKEN_KEY } from 'app/constants/constants';

const TIMEOUT = 60 * 1000;
axios.defaults.timeout = TIMEOUT;
axios.defaults.baseURL = SERVER_API_URL;
axios.defaults.paramsSerializer = { serialize: params => qs.stringify(params, { indices: null }) };
export const IGNORE_TOKEN_URLS = ['auth/refresh'];

const setupAxiosInterceptors = () => {
  const onRequestSuccess = config => {
    const token = Storage.local.get(AUTH_TOKEN_KEY);
    if (token && !IGNORE_TOKEN_URLS.includes(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.params) {
      Object.keys(config.params).forEach(key => {
        if (Array.isArray(config.params[key])) {
          config.params[key] = config.params[key].map(value => (!value || value === undefined ? '' : value));
        }
      });
    }
    return config;
  };

  const onResponseSuccess = response => response;
  const onResponseError = err => {
    return Promise.reject(err);
  };
  axios.interceptors.request.use(onRequestSuccess);
  axios.interceptors.response.use(onResponseSuccess, onResponseError);
};

export default setupAxiosInterceptors;
