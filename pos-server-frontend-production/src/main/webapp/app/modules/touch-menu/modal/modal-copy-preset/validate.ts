import {localizeFormat, isNullOrEmpty} from 'app/helpers/utils';
import { setErrorValidate } from 'app/reducers/error';
import { IStoreInfo } from 'app/reducers/store-reducer';
import {isValidDate} from "app/helpers/date-utils";

const showError = (param: string, message: string, dispatch?) => {
  dispatch && dispatch(setErrorValidate({ param, message }));
};

export const validateDate = (date?: Date, dispatch?) => {
  if (!isValidDate(date)) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date.getTime() < today.getTime()) {
    showError('date_modal', localizeFormat('MSG_VAL_022', 'touchMenu.table.applyDate'), dispatch);
    return false;
  }
  return true;
};

export const validateDateEdit = (date?: Date, dispatch?, isChangeDate?:boolean) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date.getTime() < today.getTime() && isChangeDate) {
    showError('date_modal', localizeFormat('MSG_VAL_022', 'touchMenu.table.applyDate'), dispatch);
    return false;
  }
  return true;
};

export const validatePresetLayoutCode = (presetLayoutCode?: string, dispatch?) => {
  if (validateInput(presetLayoutCode)) {
    showError('preset_layout_code_modal', localizeFormat('MSG_VAL_001', 'touchMenu.table.presetLayoutCode'), dispatch);
    return false;
  }
  return true;
};

export const validatePresetLayoutName = (presetLayoutName?: string, dispatch?) => {
  if (validateInput(presetLayoutName)) {
    showError('preset_layout_name_modal', localizeFormat('MSG_VAL_001', 'touchMenu.table.presetLayoutName'), dispatch);
    return false;
  }
  return true;
};

export const validateSelectStore = (store?: string, dispatch?) => {
  if (validateInput(store)) {
    showError('store_modal', localizeFormat('MSG_VAL_001', 'touchMenu.table.store'), dispatch);
    return false;
  }
  return true;
};

export const validateSelectMultiStore = (store?: IStoreInfo[], dispatch?) => {
  if (isNullOrEmpty(store)) {
    showError('store_modal', localizeFormat('MSG_VAL_001', 'touchMenu.modal.store'), dispatch);
    return false;
  }
  return true;
};

const validateInput = (value?: string) => {
  return value === null || value === undefined || value === '' || value.trim() === '';
};

export const convertToDateYYYYMMDD = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}/${month}/${day}`;
};
