import { convertDateServer } from '@/helpers/date-utils';
import { IsAscendingType, SearchJournalFormInterface } from '../search-journal-interface';

export const DEFAULT_SEARCH_JOURNAL: SearchJournalFormInterface = {
  searchCondition: {
    business_date_from: convertDateServer(new Date()),
    business_date_to: convertDateServer(new Date()),
    business_time_from: '00:00',
    business_time_to: '23:59',
    condition_type: 0,
    receipt_no_from: '',
    receipt_no_to: '',
    keyword_1: '',
    keyword_2: '',
    cash_register_code: '',
    employee_code: '',
    receipt_name: '',
  },
  listCashRegisterCode: [],
  listEmployees: [],
  listReceiptName: [],
  checkDisable: true,
};

export const TYPE_JOURNAL_TABLE = {
  201: '開設',
  202: '精算',
  301: '釣銭機精査',
  191: '釣銭準備金登録',
  136: '補充',
  146: '釣銭回収',
  194: '現金報告',
  138: '釣銭補充(釣機←ドロア)',
  102: '売上登録（取引中止)',
  101: '売上登録',
  105: '保留',
};

export const IS_TRAINING_MODE = {
  '1': 'トレーニング',
  '0': '本番',
};

export const CONDITION_TYPE = [
  { id: '0', checkBoxValue: 0, textValue: 'OR' },
  { id: '1', checkBoxValue: 1, textValue: 'AND' },
];

export const MASTER_CODE = 'MC0009';

export const SORT_DEFAULT: IsAscendingType = {
  store_code: true,
  cash_register_code: true,
  transaction_date: true,
  receipt_no: true,
  receipt_name: true,
  is_training_mode: true,
  total: true,
};
