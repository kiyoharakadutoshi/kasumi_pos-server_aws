import { isNullOrEmpty } from 'app/helpers/utils';

export const formatStoreCode = (value) => {
  if (!isNullOrEmpty(value)) {
    return String(value).padStart(5, '0');
  }
};
