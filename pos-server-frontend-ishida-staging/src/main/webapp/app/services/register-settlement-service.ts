import { IRegisterSettlement } from '@/modules/register-settlement/register-settlement-interface';
import {
  getBlobWithMethodPost,
  getDataWithMethodPost,
  getDataWithParam,
  postData,
  ResponseApiListExceed,
} from './base-service';

//API2001
export const getBusinessDate = getDataWithParam<
  {
    selected_store: string;
  },
  { data: { business_open_date } }
>(`store/business-date`);

//API2002
export const getRegisterStatus = getDataWithMethodPost<
  {
    selected_store: string;
    business_date: string;
  },
  ResponseApiListExceed<IRegisterSettlement>
>(`store/cash-registers/close-status`);
//API2003
interface bodyCashRegistersClose {
  selected_store: string;
  business_date: string;
  cash_register_code: string;
  net_sale_eight_percent: number;
  tax_eight_percent: number;
  net_sale_ten_percent: number;
  tax_ten_percent: number;
  tax_free: number;
  change_reserve: number;
  gift1000: number;
  gift500: number;
  shipping_fee_in_kasumi: number;
  shipping_fee_in: number;
  waon_card: number;
  charge_waon_card: number;
  charge_ignica_money: number;
  shipping_fee_out: number;
  accounts_receivable: number;
  waon_sale: number;
  waon_sale_off: number;
  kasumi_ion: number;
  card_sale: number;
  card_return: number;
  return_correction: number;
  gift_kasumi: number;
  shopping_ticket: number;
  go_to_coupon: number;
  paper_recycling_ticket: number;
  coupon: number;
  shareholder_voucher: number;
  gift_card: number;
  ignica_point: number;
  ignica_money: number;
  m_point: number;
  qr_payment_app: number;
  qr_payment_cash_register: number;
  minna_bank: number;
  stamp200: number;
  stamp400: number;
  stamp600: number;
  cash_balance_at_time_of_checkout: number;
}

export const saveCashRegister = postData<bodyCashRegistersClose>(`store/cash-register/close`);

//API2004
export const exportCashRegister = getBlobWithMethodPost<{
  selected_store: string;
  business_date: string;
}>(`store/cash-registers/close-info/export`);

//API2005
export const getDisplayInfo = getDataWithParam<
  {
    selected_store: string;
  },
  { data }
>(`store/cash-register/closed-display-info`);

//API2006
export const getValueCashierMachine = getDataWithMethodPost<
  {
    selected_store: string;
    business_date: string;
    cash_register_code: string;
  },
  { data }
>(`store/cash-register/closed-info`);
