import { isNullOrEmpty, localizeFormat } from 'app/helpers/utils';
import { setErrorValidate } from 'app/reducers/error';
import _ from 'lodash';

export const validateForm = (discountPercent, discountCash, dispatch, watch) => {
  if (
    (!isNullOrEmpty(discountPercent) && !isNullOrEmpty(discountCash)) ||
    (isNullOrEmpty(discountPercent) && isNullOrEmpty(discountCash))
  ) {
    dispatch(
      setErrorValidate({
        param: 'code',
        message: localizeFormat(
          'MSG_VAL_058',
          'masterCategory.conditionSearchLabel.discountRate',
          'masterCategory.conditionSearchLabel.deductionAmount'
        ),
      })
    );
    return false;
  }
  // validate date
  if (
    !watch('headerCondition.start_date_time') ||
    _.toString(watch('headerCondition.start_date_time')) === 'Invalid Date' ||
    !watch('headerCondition.end_date_time') ||
    _.toString(watch('headerCondition.end_date_time')) === 'Invalid Date' ||
    !watch('headerCondition.start_service_time') ||
    _.toString(watch('headerCondition.start_service_time')) === 'Invalid Time' ||
    !watch('headerCondition.end_service_time') ||
    _.toString(watch('headerCondition.end_service_time')) === 'Invalid Time'
  ) {
    console.log('err date');
    return false;
  } else {
    // compare start date and end date
    const startDate = new Date(_.toString(watch('headerCondition.start_date_time')));
    const endDate = new Date(_.toString(watch('headerCondition.end_date_time')));
    const today = new Date();
    const currentMinutes = today.getHours() * 60 + today.getMinutes();
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    const startTime = parseTimeToMinutes(watch('headerCondition.start_service_time'));
    const endTime = parseTimeToMinutes(watch('headerCondition.end_service_time'));
    const typeTimeService = watch('headerCondition.type_time_service');

    if (startDate.getTime() > endDate.getTime()) {
      dispatch(setErrorValidate({ param: 'date', message: localizeFormat('MSG_VAL_051') }));
      return false;
    }

    if (startDate.getTime() < endDate.getTime() && startTime > endTime && typeTimeService === 1) {
      dispatch(setErrorValidate({ param: 'date', message: localizeFormat('MSG_VAL_051') }));
      return false;
    }

    if (startDate.getTime() === endDate.getTime() && startTime > endTime) {
      dispatch(setErrorValidate({ param: 'date', message: localizeFormat('MSG_VAL_051') }));
      return false;
    }

    if (endDate.getTime() < today.getTime()) {
      dispatch(setErrorValidate({ param: 'date', message: localizeFormat('MSG_VAL_022') }));
      return false;
    }

    if (endDate.getTime() === today.getTime() && endTime <= currentMinutes) {
      dispatch(setErrorValidate({ param: 'date', message: localizeFormat('MSG_VAL_022') }));
      return false;
    }
  }

  return true;
};

const parseTimeToMinutes = (timeStr) => {
  if (timeStr && !isNullOrEmpty(timeStr)) {
    const [hours, minutes] = timeStr?.split(':')?.map(Number);
    return hours * 60 + minutes;
  }
};
