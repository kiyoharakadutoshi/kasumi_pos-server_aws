import {
  ISpecialPromotion,
  ISpecialPromotionError,
  keyPromotionsCheck,
} from 'app/modules/special-promotion/interface/special-sale-interface';
import { isNullOrEmpty } from 'app/helpers/utils';
import { IPromotionDetail } from 'app/services/promotion-service';
import { isValid } from 'date-fns';
import { INVALID_TIME } from 'app/components/time-picker/tooltip-time-picker/tooltip-time-picker';

export const validateSpecialPromotions = (items?: ISpecialPromotion[], isPercentPrice?: boolean, promotion?: IPromotionDetail) => {
  const specialPromotionErrors: ISpecialPromotionError[] = [];
  const minDateTime = new Date(Date.parse(`${promotion?.start_date} ${promotion?.start_time}`));
  const maxDateTime = new Date(Date.parse(`${promotion?.end_date} ${promotion?.end_time}`));
  let isError = false;

  for (const item of items) {
    // Exclude special promotions without editing
    if (!item.operation_type || isNullOrEmpty(item.my_company_code) || isNullOrEmpty(item.item_code)) {
      specialPromotionErrors.push(null);
      continue;
    }
    const error: ISpecialPromotionError = {};

    // Check validate empty
    keyPromotionsCheck.forEach(key => {
      if ((key === 'discount_value' && !isPercentPrice) || (key === 'special_price' && isPercentPrice)) {
        // Continue
      } else if (isNullOrEmpty(item[key])) {
        error[key] = 'MSG_VAL_001';
        isError = true;
      }
    });

    // Validate end_date_time
    const endDate = new Date(Date.parse(item['end_date']));
    if (!isNullOrEmpty(item['end_date'])) {
      if (!isValid(endDate)) {
        error['end_date'] = 'MSG_VAL_016';
        isError = true;
      } else {
        const endDateTime = new Date(Date.parse(`${item['end_date']} ${item['end_time']}`));
        if (endDateTime > maxDateTime) {
          error['end_date'] = 'MSG_VAL_041';
          isError = true;
        }
      }
    }

    // Validate start date time > end date time or out range date time promotion
    const startDate = new Date(Date.parse(item['start_date']));
    if (!isNullOrEmpty(item['start_date'])) {
      if (!isValid(startDate)) {
        error['start_date'] = 'MSG_VAL_016';
        isError = true;
      } else if (startDate > endDate) {
        error['start_date'] = 'MSG_VAL_051';
        isError = true;
      } else {
        const startDateTime = new Date(Date.parse(`${item['start_date']} ${item['start_time']}`));
        if (startDateTime < minDateTime) {
          error['start_date'] = 'MSG_VAL_041';
          isError = true;
        }
      }
    }

    // Validate start_time
    if (item.start_time === INVALID_TIME) {
      error['start_time'] = 'MSG_VAL_016';
      isError = true;
    }

    if (
      !isNullOrEmpty(item['start_time']) &&
      isNullOrEmpty(error['start_date']) &&
      isNullOrEmpty(error['end_date']) &&
      item.start_time >= item.end_time
    ) {
      const validateError =
        item.type_code === '0'
          ? item.start_date === item.end_date
          : startDate <= endDate;
      if (validateError) {
        error['start_time'] = 'MSG_VAL_051';
        isError = true;
      }
    }

    // Validate end_time
    if (item.end_time === INVALID_TIME) {
      error['end_time'] = 'MSG_VAL_016';
      isError = true;
    }

    specialPromotionErrors.push(error);
  }

  return { specialPromotionErrors, isError };
};
