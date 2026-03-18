import { isNullOrEmpty, localizeFormat } from 'app/helpers/utils';
import { PresetMenuButton, ProductResponse } from '../../interface-preset';
import { MAX_MENU_BUTTON_COLUMN, MAX_MENU_BUTTON_ROW } from 'app/constants/constants';
import { translate } from 'react-jhipster';
import { setError, setErrorValidate } from 'app/reducers/error';
import { isNull } from 'lodash';

const showError = (param: string, message: string, dispatch?: any) => {
  dispatch && dispatch(setErrorValidate({ param, message }));
};

export const validateProduct = (product?: ProductResponse, plu?: string, hasPLU?: boolean, dispatch?: any) => {
  if (isNull(product) && plu !== null) {
    showError('item_code', localizeFormat('MSG_VAL_020', 'touchMenu.PLU'), dispatch);
    return false;
  }


  if (isNullOrEmpty(plu) || plu !== product?.item_code || !hasPLU) {
    showError('item_code', localizeFormat('MSG_VAL_001', 'touchMenu.PLU'), dispatch);
    return false;
  }

  return true;
};

export const validateCategory = (category?: string, hasCategory?: boolean, dispatch?: any) => {
  if (isNullOrEmpty(category)) {
    showError('setting_data', localizeFormat('MSG_VAL_001', 'detailMenu.buttonTab.categoryCode'), dispatch);
    return false;
  }

  if (!hasCategory) {
    showError('setting_data', localizeFormat('MSG_VAL_003', 'detailMenu.buttonTab.categoryCode'), dispatch);
    return false;
  }

  return true;
};

export const validatePresetButton = (name?: string, color?: string, dispatch?: any) => {
  if (isNullOrEmpty(name)) {
    dispatch && dispatch(setError(localizeFormat('MSG_VAL_001', 'detailMenu.buttonTab.buttonName')));
    return false;
  }

  if (isNullOrEmpty(color)) {
    dispatch && dispatch(setError(localizeFormat('MSG_VAL_027', 'functionTitle.buttonColor')));
    return false;
  }

  return true;
};

export const validateButtonSize = (button: PresetMenuButton, presetButtons: PresetMenuButton[], dispatch: any) => {
  if (
    !isContains(
      1,
      1,
      MAX_MENU_BUTTON_COLUMN,
      MAX_MENU_BUTTON_ROW,
      button.button_column_number,
      button.button_row_number,
      button.button_column_span,
      button.button_row_span,
    )
  ) {
    dispatch(setError(translate('MSG_VAL_031')));
    return false;
  }

  if (
    presetButtons.some(item =>
      isIntersect(
        item.button_column_number,
        item.button_row_number,
        item.button_column_span,
        item.button_row_span,
        button.button_column_number,
        button.button_row_number,
        button.button_column_span,
        button.button_row_span,
      ),
    )
  ) {
    dispatch(setError(translate('MSG_VAL_031')));
    return false;
  }
  return true;
};

const isContains = (x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) => {
  return x1 <= x2 && y1 <= y2 && x1 + w1 >= x2 + w2 && y1 + h1 >= y2 + h2;
};

const isIntersect = (x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) => {
  if (x1 === x2 && y1 === y2) {
    return false;
  }
  return x1 + w1 > x2 && x2 + w2 > x1 && y1 + h1 > y2 && y2 + h2 > y1;
};
