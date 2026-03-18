import { localizeFormat } from 'app/helpers/utils';
import { setErrorValidate } from 'app/reducers/error';
import _ from 'lodash';

const showError = (param: string, message: string, dispatch?) => {
  dispatch && dispatch(setErrorValidate({ param, message }));
};

export const validateDate = (date?: Date, dispatch?) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date.getTime() < today.getTime()) {
    showError('date_modal', localizeFormat('MSG_VAL_022', 'touchMenu.table.applyDate'), dispatch);
    return false;
  }
  return true;
};

const validateInput = (value?: string) => {
  return value === null || value === undefined || value === '';
};

export const validateFutureDate = (date?: Date, dispatch?) => {
  const currentDate = new Date();
  const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  const inputDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (inputDateOnly > currentDateOnly) {
    showError('date_modal', localizeFormat('MSG_VAL_049', 'searchJournal.msgVal.MSG_VAL_049_futureDate'), dispatch);
    return false;
  }
  return true;
};

export const validateEmptyData = (date?: string, titleName?: string, dispatch?) => {
  if (validateInput(date)) {
    showError('date_modal', localizeFormat('MSG_VAL_001', titleName), dispatch);
    return false;
  }
  return true;
};

export const validatePeriodDate = (startDate?: Date, endDate?: Date, startTime?: Date, endTime?: Date, dispatch?) => {
  if (startDate.getTime() > endDate.getTime()) {
    showError(
      'date_modal',
      localizeFormat('MSG_VAL_004', 'searchJournal.msgVal.MSG_VAL_004_dateFrom', 'searchJournal.msgVal.MSG_VAL_004_dateTo'),
      dispatch,
    );
    return false;
  }

  if (startDate.getTime() === endDate.getTime() && startTime.getTime() > endTime.getTime()) {
    showError(
      'date_modal',
      localizeFormat('MSG_VAL_004', 'searchJournal.msgVal.MSG_VAL_004_timeFrom', 'searchJournal.msgVal.MSG_VAL_004_timeTo'),
      dispatch,
    );
    return false;
  }
  return true;
};

export const validateReceiptNo = (receiptNoFrom: string, receiptNoTo: string, dispatch?) => {
  if (Number(receiptNoFrom) > Number(receiptNoTo) && receiptNoFrom && receiptNoTo) {
    showError(
      'date_modal',
      localizeFormat('MSG_VAL_004', 'searchJournal.msgVal.MSG_VAL_004_receiptFrom', 'searchJournal.msgVal.MSG_VAL_004_receiptTo'),
      dispatch,
    );
    return false;
  }
  return true;
};
