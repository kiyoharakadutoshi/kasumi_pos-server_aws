import _ from 'lodash';
import { translate } from 'react-jhipster';
import { format } from 'react-string-format';
import { SelectOption } from 'app/components/input/normal-dropdown/normal-dropdown';
import { IDropDownItem } from 'app/components/dropdown/dropdown';
import { INAGEYA_CODE, LIMIT_RECORD_PAGE, MAX_LENGTH, STATUS } from 'app/constants/constants';
import JsPDF from 'jspdf';
import { isValid } from 'date-fns';
import { OperationType } from 'app/components/table/table-common';
import { INVALID_TIME } from 'app/components/time-picker/tooltip-time-picker/tooltip-time-picker';
import { ItemMasterCode } from 'app/reducers/master-reducer';

export const parseBool = (value: number): boolean => {
  return !!+value;
};

export const parseNumber = (value: boolean) => {
  return value === true ? 1 : 0;
};

export const isNullOrUndefined = (value: any) => value === null || value === undefined;

export const isNumber = (input: string) => {
  const numberRegex = /^[+-]?\d+(\.\d+)?$/;
  return numberRegex.test(input);
};

export const isNullOrEmpty = (value?: any) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'number') return Number.isNaN(value);
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
  return false;
};

export const nonBlankElse = (value: string, defaultValue: string) => {
  if (isNullOrEmpty(value)) return defaultValue;
  return value;
};

export const localizeFormat = (key: string, ...values: string[] | number[]) => {
  const localizeValues = values.map((value: any) => {
    const localizeValue = translate(_.toString(value));
    if (localizeValue === `translation-not-found[${value}]`) {
      return value;
    }
    return localizeValue;
  });
  return format(localizeString(key), ...localizeValues);
};

export const localizeString = (key: string) => {
  if (isNullOrEmpty(key)) {
    return '';
  }
  const localizeValue = translate(key);
  if (localizeValue === `translation-not-found[${key}]`) {
    return key;
  }
  return localizeValue;
};

export const parseString = (number: number, pad: number = 2) => {
  return _.toString(number).padStart(pad, '0');
};

export const arraysEqual = (array1: any[], array2: any[]) => {
  const set1 = new Set(array1);
  const set2 = new Set(array2);

  if (set1.size !== set2.size) return false;

  for (const item of set1) {
    if (!set2.has(item)) return false;
  }

  return true;
};

export const convertObjectToQueryString = (object: any) => {
  return new URLSearchParams(
    Object.entries(object).flatMap(([key, value]) =>
      Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]
    )
  ).toString();
};

export const convertQueryStringToObject = (query: string) => {
  const params = new URLSearchParams(query);
  return Object.fromEntries(params.entries()) as any;
};

export const moveElement = (array: any[], fromIndex: number, toIndex: number) => {
  const newArray = [...array];
  const [movedElement] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, movedElement);
  return newArray;
};

export const getStringLength = (str?: string) => {
  if (isNullOrEmpty(str)) return 0;
  // eslint-disable-next-line no-control-regex
  const fullSizeRegex = /[^\x00-\x7F]/g;
  const fullSizeCount = (str.match(fullSizeRegex) || []).length;
  const totalLength = str.length;
  return totalLength + fullSizeCount;
};

export const escapeHTML = (str?: any) => {
  return String(str)?.replace(/</g, '&lt;')?.replace(/>/g, '&gt;');
};

export const createDropdownList = (
  items: any[] | null | undefined,
  getValue: (item: any) => any,
  getLabel: (item: any) => any
) => {
  let selectItems: SelectOption[] = [
    {
      id: '0',
      value: '',
      label: translate('global.selectDropdown'),
    },
  ];
  if (!items || items.length === 0) {
    return selectItems;
  } else {
    const data: SelectOption[] = items.map((item, index) => ({
      id: `${index + 1}`,
      value: getValue(item) || '',
      label: getLabel(item) || '',
    }));
    selectItems = [...selectItems, ...data];
    return selectItems;
  }
};

export const convertFullWidthToHalfWidth = (str: string): string => {
  return str
    .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/\u3000/g, ' ');
};

export const createDropdownListCustom = (
  items: any[] | null | undefined,
  getCode: (item: any) => any,
  getName: (item: any) => any
) => {
  let selectItems: IDropDownItem[] = [];
  if (!items || items.length === 0) {
    return selectItems;
  } else {
    const data: IDropDownItem[] = items.map((item) => ({
      value: getCode(item) ?? '',
      code: getCode(item) ?? '',
      name: getName(item) ?? '',
    }));
    selectItems = [...selectItems, ...data];
    return selectItems;
  }
};

export const countCommas = (maxLength?: number) => {
  if (maxLength === null || maxLength <= 3) return 0;
  return Math.floor((maxLength - 1) / 3);
};

export const isEqual = (value1: any, value2: any) => {
  if ((isNullOrEmpty(value1) || value1 === undefined) && (isNullOrEmpty(value2) || value2 === undefined)) return true;
  return _.isEqual(_.toString(value1), _.toString(value2));
};

export const isEqualObject = (obj1: Record<any, any>, obj2: Record<any, any>, includeKeys?: any[]) => {
  if (!obj1 || !obj2) return false;

  if (includeKeys) {
    return includeKeys.every((key) => isEqual(obj1[key], obj2[key]));
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every((key) => isEqual(obj1[key], obj2[key]));
};

export const isEqualObjectData = (obj1: Record<any, any>, obj2: Record<any, any>, includeKeys?: any[]) => {
  if (!obj1 || !obj2) return false;

  if (includeKeys) {
    return includeKeys.every((key) => _.isEqual(obj1[key], obj2[key]));
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every((key) => _.isEqual(obj1[key], obj2[key]));
};

export const isEqualData = (obj1: Record<any, any>, obj2: Record<any, any>, includeKeys?: any[]): boolean => {
  if (!obj1 || !obj2) return false;

  if (obj1 instanceof Array) {
    if (obj1?.[0] instanceof Object) {
      return obj1.every((item, index) => isEqualData(item, obj2[index], includeKeys));
    }

    return obj1.every((item, index) => isEqual(item, obj2[index]));
  }

  let keys1 = Object.keys(obj1);
  let keys2 = Object.keys(obj2);

  if (includeKeys && includeKeys.every((key) => keys1.includes(key))) {
    keys1 = includeKeys;
    keys2 = includeKeys;
  }

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every((key) => {
    const value1 = obj1[key];
    const value2 = obj2[key];
    if (value1 instanceof Object) {
      return isEqualData(value1, value2);
    }
    if (value1 instanceof Array) {
      if (value1?.[0] instanceof Object) {
        return value1.every((item, index) => isEqualData(item, value2[index]));
      }

      return value1.every((item, index) => isEqual(item, value2[index]));
    }

    return isEqual(value1, value2);
  });
};

/*
  func parse data error validate when status code 200
  param dataResponse: data response from api
  param items: list item in screen
  param limit: number record in screen
 */
export const parseDataResponseErrorValidate = (
  dataResponse: any,
  items: { operation_type?: OperationType; my_company_code?: string; item_code?: string }[],
  limit: number = LIMIT_RECORD_PAGE
) => {
  const { data, status } = dataResponse;
  if (status === STATUS.success || data === null) return null;

  const keys = Object.keys(data);
  if (keys.length === 0) return null;

  // Initialize error array
  const errors: any[] = Array(limit).fill(null);
  const regexKey = /\[(\d+)]\.(\w+)/;
  const indexItems = items.reduce<number[]>((acc, item, index) => {
    if (!item.operation_type) return acc;

    if (!item.my_company_code === undefined || item.item_code === undefined) {
      acc.push(index);
      return acc;
    }

    if (!isNullOrEmpty(item.my_company_code) && !isNullOrEmpty(item.item_code)) {
      acc.push(index);
    }

    return acc;
  }, []);

  // Parse error validate with format _[index].keyItem
  for (const key of keys) {
    const values = data[key];
    if (isNullOrEmpty(values)) continue;

    const match = key.match(regexKey);
    if (!match) continue;

    const [_keyList, indexStr, keyItem] = match;
    const index = parseInt(indexStr, 10);

    if (isNaN(index) || index < 0 || index >= errors.length) continue;

    // Put error at exact location on real item list items
    const targetIndex = indexItems[index];
    if (targetIndex !== undefined) {
      errors[targetIndex] = errors[targetIndex] || {};
      errors[targetIndex][keyItem] = values?.sort()[0];
    }
  }

  return errors;
};

export const calculationHeightTable = () => {
  const rows = document.querySelectorAll('.table-master .cell:nth-child(n)');

  for (let i = 0; i < rows.length; i++) {
    let maxHeight = 0;
    const cells = document.querySelectorAll(`.cell:nth-child(${i + 1})`);
    cells.forEach((cell: HTMLDivElement) => {
      if (cell.offsetHeight > maxHeight) {
        maxHeight = cell.offsetHeight;
      }
    });
    cells.forEach((cell: HTMLDivElement) => {
      cell.style.height = maxHeight + 'px';
    });
  }
};

export const createJsPDF = (orientation?: 'landscape' | 'p' | 'portrait' | 'l', fontSize?: number) => {
  const doc = new JsPDF({ orientation: orientation ?? 'landscape' });
  doc.addFileToVFS('NotoSansJP-Regular.ttf', 'content/fonts/NotoSansJP/NotoSansJP-Regular.ttf');
  doc.addFont('content/fonts/NotoSansJP/NotoSansJP-Regular.ttf', 'NotoSansJP', 'normal');
  doc.setFont('NotoSansJP', 'normal');
  doc.setFontSize(fontSize ?? 24);
  return doc;
};

export const isHalfSize = (input: string) => {
  if (isNullOrEmpty(input)) return true;
  // eslint-disable-next-line no-control-regex
  const halfSizeRegex = /^[\x00-\x7F]+$/;
  return halfSizeRegex.test(input);
};

export const formatNumber = (
  value: any,
  numberFractionDigits?: number,
  fixedDigit: boolean = false,
  locales = 'en-US'
) => {
  if (!value && value !== 0) return '';

  const factor = Math.pow(10, numberFractionDigits || 0);
  const roundedValue = Math.round(value * factor) / factor;

  if (!fixedDigit && Number.isInteger(roundedValue)) {
    return Intl.NumberFormat(locales).format(roundedValue);
  }

  return Intl.NumberFormat(locales, {
    minimumFractionDigits: numberFractionDigits,
    maximumFractionDigits: numberFractionDigits,
  }).format(roundedValue);
};

export const isValidDate = (dateStr?: string) => {
  const date = new Date(Date.parse(dateStr));
  return isValid(date);
};

export const isValidTime = (time?: string): boolean => {
  if (isNullOrEmpty(time)) return false;
  return !(time === INVALID_TIME);
};

export const calculateEAN13CheckDigit = (ean12: string) => {
  if (!/^\d{12}$/.test(ean12)) {
    return null;
  }

  let sum = 0;
  for (let i = 0; i < ean12.length; i++) {
    const digit = parseInt(ean12[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }

  return (10 - (sum % 10)) % 10;
};

export const getNestedValue = (obj: any, keys: any[]) => {
  if (!obj || !keys) return null;
  return keys.reduce((result, key) => result?.[key], obj);
};

export const focusElementByName = (nameFocus: string, hasSelect?: boolean) => {
  const element = document.querySelector(`[name="${nameFocus}"]`) as unknown as HTMLElement;
  element?.focus();
  if (hasSelect) {
    (element as HTMLInputElement)?.select();
  }
};

export const focusElementByNameWithTimeOut = (nameFocus: string, duration: number, hasSelect?: boolean) => {
  setTimeout(() => {
    focusElementByName(nameFocus, hasSelect);
  }, duration);
};

export const blurInput = () => {
  (document.activeElement as HTMLInputElement)?.blur();
};

export const blurInputWithTimeout = (hasBlur?: boolean, timeDuration = 50) => {
  if (hasBlur) {
    setTimeout(() => {
      blurInput();
    }, timeDuration);
  }
};

export const delay = async (ms: number) => await new Promise((resolve) => setTimeout(resolve, ms));

export const getProductCode = (myCompanyCode?: string): string => myCompanyCode?.slice(-MAX_LENGTH.product_code);

export const getGroupCode = (myCompanyCode?: string): string =>
  myCompanyCode?.slice(-MAX_LENGTH.group_product_code, -MAX_LENGTH.product_code);

export const getGroupProductCode = (myCompanyCode?: string): string =>
  myCompanyCode?.slice(-MAX_LENGTH.group_product_code);

export const formatValue = (code?: any, name?: string): string => {
  if (isNullOrEmpty(code)) return name ?? '';
  if (isNullOrEmpty(name)) return `${code}`;
  return `${code}：${name}`;
};

export const isInageyaCompany = (companyCode: number) => isEqual(companyCode, INAGEYA_CODE);

/**
 * Remove function in object
 * @param obj
 */
export const stripFunctions = (obj: Record<any, any>) => {
  if (Array.isArray(obj)) {
    return obj.map(stripFunctions);
  }
  if (obj && typeof obj === 'object') {
    const clean = {};
    for (const key in obj) {
      if (typeof obj[key] !== 'function') {
        clean[key] = stripFunctions(obj[key]);
      }
    }
    return clean;
  }
  return obj;
};

export const mapCodeMastersToDropdownItems = (items: ItemMasterCode[]): IDropDownItem[] =>
  items.map((item) => ({
    code: item.setting_data_type,
    value: item.setting_data_type,
    name: item.event_group_name,
  }));
