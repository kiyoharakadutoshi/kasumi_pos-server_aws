export const MAX_LENGTH_PRICE = 6;
export const MAX_MENU_BUTTON_COLUMN = 10;
export const MAX_MENU_BUTTON_ROW = 5;
export const MAX_PRESET_TAB = 10;
export const LIMIT_RECORD = 1000;
export const MIN_LENGTH_PASSWORD = 6;
export const MAX_LENGTH_PASSWORD = 64;

// Touch menu
export const GROUP_CODE_PRODUCTS = ['1'];
export const GROUP_CODE_CATEGORIES = ['133', '134'];
export const GROUP_CODE_FUNCTIONS = ['2'];

export const MASTER_CODE_FUNCTION = 'MC1501';

// Input
export const HEIGHT_INPUT = 40;
export const FONT_SIZE = '24px';

// Local storage
export const AUTH_TOKEN_KEY = 'jhi-authenticationToken';
export const USER_LOGIN_KEY = 'user-login';
export const GROUP_STORES = 'group-store';
export const PERMISSIONS_KEY = 'permissions';
export const STORE_USER = 'store-user';
export const KASUMI_CODE = 100;
export const INAGEYA_CODE = 800;
export const CODE_CASG_REGISTER_TOTAL = 9999;
export const TIMER_CASG_REGISTER_TOTAL = '9999';
export const LANGUAGE_JA = 'ja';
export const LANGUAGE_EN = 'en';

export enum LanguageOption {
  LANG_JA = LANGUAGE_JA,
  LANG_EN = LANGUAGE_EN,
}

export const LOGIN_KEY = "login"

export const GROUP_STORE_MASTER_CODE = 'MC0004';

export const STATUS = {
  success: 'Success',
  error: 'Error',
};

export const LIMIT_RECORD_PAGE = 11;
export const GROUP_PRODUCT_CODE_INPUT_MAX_LENGTH = 8;

export enum SG_MEMBER_INCLUDED {
  NOT_HANDLED = 0,
  HANNDLED = 1,
}

export enum SG_MEMBER_INCLUDED_LABEL {
  NOT_HANDLED = '0：扱いなし',
  HANNDLED = '1：扱い',
}

export enum KASUMI_CARD_MEMBER_INCLUDED {
  NOT_HANDLED = 0,
  HANNDLED = 1,
}

export enum KASUMI_CARD_MEMBER_INCLUDED_LABEL {
  NOT_HANDLED = '0：扱いなし',
  HANNDLED = '1：扱い',
}

export enum TIME_SERVICE {
  USUALLY = 0,
  TIME_SERVICE = 1,
}

export enum TIME_SERVICE_LABEL {
  USUALLY = '通常',
  TIME_SERVICE_LABEL = 'タイムサービス ',
}

export enum MIX_MATCH_TYPE {
  SALES_PRICE = 1,
  DISCOUNT = 2,
  DISCOUNT_MORE = 3,
}

export enum MIX_MATCH_TYPE_LABEL {
  SALES_PRICE = '1：売価',
  DISCOUNT = '2：割引',
  DISCOUNT_MORE = '3：値引',
}

export const KEYDOWN = {
  F1: 'F1',
  F2: 'F2',
  F3: 'F3',
  F4: 'F4',
  F5: 'F5',
  F6: 'F6',
  F7: 'F7',
  F8: 'F8',
  F9: 'F9',
  F10: 'F10',
  F11: 'F11',
  F12: 'F12',
  Space: ' ',
  Enter: 'Enter',
  Tab: 'Tab',
};

export const ARROW_KEYS = {
  Up: 'ArrowUp',
  Down: 'ArrowDown',
  Left: 'ArrowLeft',
  Right: 'ArrowRight',
};

export const USER_ROLE = {
  ADMIN: '00',
  HEAD: '01',
  STORE: '02',
};

export const MAX_LENGTH = {
  group_code: 2,
  product_code: 6,
  group_product_code: 8,
  item_code: 13,
};

export const YEAR_LENGTH = 2;
export const COLON_FULL_SIZE = '：';

export const USER_ID_REGEX = /^[\x20-\x2B\x2D-\x7D]+$/;

export const BUDGET_AMOUNT_MAX_LENGTH = 6;

export const STORE_CODE_DEFAULT = '09999';

export const TICKET_STORE_CODE_DEFAULT = '00002';

export const START_HOURS_DEFAULT = '00:00';

export const END_HOURS_DEFAULT = '23:59';

// eslint-disable-next-line no-control-regex
export const REGEX_HALF_WIDTH_ONLY = /^[\x00-\x7F]*$/;

export const CODE_MASTER = {
  INSTORE_TYPE: 'MC0003',
  STORE_CODE: 'MC0004',
  NOTE_TYPE: 'MC0005',
  DEVICE_CLASS: 'MC0006',
  KEYBOARD_LAYOUT: 'MC7104',
  FUNCTION_LAYOUT: 'MC7105',
  RECEIPT_MESSAGE: 'MC8301'
}
