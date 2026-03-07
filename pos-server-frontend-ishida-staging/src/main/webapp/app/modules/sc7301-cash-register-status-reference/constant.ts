import { convertDateServer } from '@/helpers/date-utils';

export const DEFAULT_VALUE = {
  businessDate: convertDateServer(new Date()),
  cashRegisterType: null,
  dataMasterStatus: null,
  cashRegisterStatus: null,
  failureStatus: null,
  dataTable: [],
  registerNumber: '',
  storeMachineCode: 0,
};

const BASE_STATUS = {
  '0': { value: 0, name: 'cashRegisterStatus.errorStatus' },
  '1': { value: 1, name: 'OK' },
  '-1': { value: -1, name: '－' },
};

export const DATA_MASTER_STATUS = {
  0: { value: 0, name: 'cashRegisterStatus.notStarted' },
  1: { value: 1, name: 'cashRegisterStatus.alreadyStarted' },
  2: { value: 2, name: 'cashRegisterStatus.reflectFailure' },
  3: { value: 3, name: 'cashRegisterStatus.reflected' },
};

export const FAILURE_STATUS = {
  0: { value: 0, name: 'OK' },
  1: { value: 1, name: 'NG' },
};

export const AUTO_CHARGE_STATUS = BASE_STATUS;

export const SCANNER_STATUS = BASE_STATUS;

export const SECOD_DISPLAY_STATUS = BASE_STATUS;

export const PRINTER_STATUS = BASE_STATUS;

export const WEBCAM_STATUS = BASE_STATUS;

export const CARD_READER_STATUS = BASE_STATUS;
