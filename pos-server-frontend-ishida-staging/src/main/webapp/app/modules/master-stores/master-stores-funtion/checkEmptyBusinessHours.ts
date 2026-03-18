import { isNullOrEmpty } from '@/helpers/utils';
import { BusinessDay } from '../master-stores-interface';

export const checkEmptyBusinessHours = (dataForm: BusinessDay[]) => {
  if (dataForm) {
    const dataConvert = Object.values(dataForm);
    const isEmpty = dataConvert?.some(
      (item) =>
        isNullOrEmpty(item?.business_open) ||
        isNullOrEmpty(item?.business_close) ||
        item?.business_open === 'Invalid Time' ||
        item?.business_close === 'Invalid Time'
    );
    return isEmpty;
  }
  return true;
};
