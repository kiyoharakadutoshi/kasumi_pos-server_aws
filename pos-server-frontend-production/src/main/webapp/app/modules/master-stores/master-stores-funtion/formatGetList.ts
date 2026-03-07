import { isNullOrEmpty } from 'app/helpers/utils';
import { businessTypeValue } from '../option-dropdown';

export const formatBusinessType = (value) => {
  if (!isNullOrEmpty(value)) {
    const data = businessTypeValue.find((item) => Number(item.value) === Number(value));
    return data.name;
  }
};
