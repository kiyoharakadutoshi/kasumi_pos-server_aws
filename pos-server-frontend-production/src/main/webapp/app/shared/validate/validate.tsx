import { isNullOrEmpty, localizeFormat } from 'app/helpers/utils';

export const IP_FORMAT_REGEX = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;
export const MAC_FORMAT_REGEX = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;

export const validateRequired = (value: string, param: string) => {
  if (isNullOrEmpty(value)) {
    return localizeFormat('MSG_VAL_001', param);
  }
};

export const validateIpv4 = (value: string, param: string) => {
  if (!IP_FORMAT_REGEX.test(value)) {
    return localizeFormat('MSG_VAL_003', param);
  }
};

export const validateMacAddress = (value: string, param: string) => {
  if (!MAC_FORMAT_REGEX.test(value)) {
    return localizeFormat('MSG_VAL_003', param);
  }
};
