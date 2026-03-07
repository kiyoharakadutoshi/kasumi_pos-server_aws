import { RegisterDetailInterFace } from './register-detail/IRegisterSettlementDetail';
import { RegisterSettlementInterface } from './register-settlement-interface';
import { convertDateServer } from '@/helpers/date-utils';

export const registerDefaultData: RegisterSettlementInterface = {
  businessOpenDate: convertDateServer(new Date()),
  listData: null,
  isFirstRender: true,
};

// data default of register detail page
export const registerDetailDefaultData: RegisterDetailInterFace = {
  listRegisterDetail: {
    table1: null,
    table2: null,
  },
  listRegisterDetailDefault: {
    table1: null,
    table2: null,
  },
  isDisableDataTable: false,
  isDirtyCheck: false,
};

// constant for table of register table
const initialRegisterDetailName = {
  net_sale_eight_percent: '純売上(8%)',
  tax_eight_percent: '消費税(8%)',
  net_sale_ten_percent: '純売上(10%)',
  tax_ten_percent: '消費税(10%)',
  tax_free: '非課税',
  cash_in_total: '入金合計',
  change_reserve: '釣銭準備金',
  gift1000: '商品券1000円',
  gift500: '商品券500円',
  shipping_fee_in_kasumi: '配送料(カスミ使)',
  shipping_fee_in: '配送料',
  waon_card: 'WAONカード販売(内税)',
  charge_waon_card: 'WAON現金チャージ',
  charge_ignica_money: 'Ignica moneyチャージ',
  cash_out_total: '出金合計',
  shipping_fee_out: '配送料支払',
  accounts_receivable: '売掛金',
  waon_sale: 'WAON売上',
  waon_sale_off: 'オフWAON売上',
  kasumi_ion: 'カスミイオン',
  card_sale: 'カード売上',
  card_return: 'カード返品',
  return_correction: '返品／訂正',
  // second table
  voucher_payment_total: '券支払合計',
  gift_kasumi: 'カスミ商品券',
  shopping_ticket: '商品券',
  go_to_coupon: 'GoToクーポン',
  paper_recycling_ticket: '古紙リサイクル券',
  coupon: 'クーポン券',
  shareholder_voucher: '株主優待券',
  gift_card: 'ギフト券',
  other_payment_total: 'その他支払合計',
  ignica_point: 'ignicaポイント ',
  ignica_money: 'Ignica money利用',
  m_point: 'Mクーポン ',
  qr_payment_app: 'QR決済(アプリ)',
  qr_payment_cash_register: 'QR決済(レジ)',
  minna_bank: 'みんなの銀行',
  stamp200: '収入印紙200',
  stamp400: '収入印紙400',
  stamp600: '収入印紙600',
  desired_cash_balance: 'あるべき現金在高',
  cash_balance_at_time_of_checkout: '精算時現金在高',
  cash_surplus_or_shortage: '現金過不足',
};

const listInputDisable = [
  'cash_in_total',
  'cash_out_total',
  'voucher_payment_total',
  'other_payment_total',
  'desired_cash_balance',
  'cash_surplus_or_shortage',
  'stamp200',
  'stamp400',
  'stamp600',
];

const listParentField = [
  'net_sale_eight_percent',
  'tax_eight_percent',
  'tax_eight_percent',
  'net_sale_ten_percent',
  'tax_ten_percent',
  'tax_free',
  'cash_in_total',
  'cash_out_total',
  'accounts_receivable',
  'waon_sale',
  'waon_sale_off',
  'kasumi_ion',
  'card_sale',
  'card_return',
  'return_correction',
  'voucher_payment_total',
  'other_payment_total',
  'qr_payment_app',
  'qr_payment_cash_register',
  'minna_bank',
  'stamp200',
  'new_stamp200',
  'stamp400',
  'new_stamp400',
  'stamp600',
  'new_stamp600',
  'desired_cash_balance',
  'cash_balance_at_time_of_checkout',
  'cash_surplus_or_shortage',
];

export const fieldsAction02 = [
  'change_reserve',
  'gift1000',
  'gift500',
  'shipping_fee_in_kasumi',
  'shipping_fee_in',
  'waon_card',
  'charge_waon_card',
  'charge_ignica_money',
];
export const fieldsAction03 = ['shipping_fee_out'];
export const fieldsAction04 = [
  'gift_kasumi',
  'shopping_ticket',
  'go_to_coupon',
  'paper_recycling_ticket',
  'coupon',
  'shareholder_voucher',
  'gift_card',
];
export const fieldsAction05 = ['ignica_point', 'ignica_money', 'm_point'];
export const fieldsAction06Plus = [
  'net_sale_eight_percent',
  'tax_eight_percent',
  'net_sale_ten_percent',
  'tax_ten_percent',
  'tax_free',
  'cash_in_total',
  'card_return',
];
export const fieldsAction06Negative = [
  'cash_out_total',
  'accounts_receivable',
  'waon_sale',
  'waon_sale_off',
  'kasumi_ion',
  'card_sale',
  // table 2
  'voucher_payment_total',
  'other_payment_total',
  'qr_payment_app',
  'qr_payment_cash_register',
  'minna_bank',
];
export const fieldsAction07 = ['desired_cash_balance', 'cash_balance_at_time_of_checkout'];

export const mappedData = (
  detailName: Record<string, any>,
  oldValueFrom2001: Record<string, any>,
  newValueFrom2001: Record<string, any>
) => {
  const stampKeys = ['stamp200', 'stamp400', 'stamp600'];
  return Object.keys(initialRegisterDetailName).map((key) => ({
    key,
    item_name: detailName[key] || initialRegisterDetailName[key],
    before_correction: oldValueFrom2001[key] || 0,
    after_correction: stampKeys.includes(key) ? newValueFrom2001[`new_${key}`] || 0 : newValueFrom2001[key] || 0,
    disable: listInputDisable.includes(key),
    format: fieldsAction06Plus.includes(key) ? 'plus' : fieldsAction06Negative.includes(key) ? 'negative' : null,
    isChildren: !listParentField.includes(key),
  }));
};

enum Status {
  Active = '稼働中',
  Settled = '精算済み',
  Inactive = '－',
}

export const statusRegister: Record<number, string> = {
  1: Status.Active,
  2: Status.Settled,
  3: Status.Inactive,
};

enum CloseStatus {
  notProgress = '未処理',
  done = '済',
  handleByServer = 'サーバーで処理済',
}

export const closeStatusRegister: Record<number, string> = {
  1: CloseStatus.notProgress,
  2: CloseStatus.done,
  3: CloseStatus.handleByServer,
};
