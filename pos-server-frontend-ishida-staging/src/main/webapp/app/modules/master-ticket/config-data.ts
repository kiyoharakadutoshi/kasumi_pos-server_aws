import { Discount, ShoppingTicket, TicketFormData } from 'app/modules/master-ticket/interface';
import { convertDateServer } from 'app/helpers/date-utils';
import { DateCategoryType, DiscountType, TimeService } from 'app/modules/master-ticket/data-type';
import { formatNumber } from 'app/helpers/utils';
import { IRadioButtonValue } from 'app/components/radio-button-component/radio-button';

export const TICKET_DEFAULT_VALUE: TicketFormData = {
  baseTicket: null,
  selectedRows: [],
  ticketType: 1,
  searchType: 0,
  keyword: '',
  isDirty: false,
  registerStores: [],
  tickets: [],
  defaultTickets: [],
  showNoData: false,
  isExceedRecords: false,
  ticket: null,
  categoryDiscountPercentItems: null,
  categoryDiscountPriceItems: null,
  categoryShoppingItems: null,
};

export const discountDefault: Discount = {
  date_categorize_type_code: DateCategoryType.EveryDay,
  ticket_summary_group_code: DiscountType.Money,
  end_date: convertDateServer(new Date()),
  start_time: '00:00',
  end_time: '23:59',
  is_friday: 0,
  is_monday: 0,
  is_saturday: 0,
  is_sunday: 0,
  is_thursday: 0,
  is_tuesday: 0,
  is_wednesday: 0,
  start_date: convertDateServer(new Date()),
  time_service: TimeService.Time,
};

export const shoppingTicketDefault: ShoppingTicket = {
  ticket_summary_group_code: DiscountType.Money,
  can_cancel: 0,
  can_change: 0,
  can_change_count: 0,
  can_just_fix: 0,
  can_over_deposit: 0,
  can_resale: 0,
  can_return: 0,
  can_void: 0,
  is_drawer: 0,
  is_point_prohibition: 0
};

export const TYPE_OPTION_LIST: IRadioButtonValue[] = [
  {
    id: 1,
    textValue: 'masterTicket.shoppingCart',
  },
  {
    id: 2,
    textValue: 'masterTicket.discount',
  },
];

export const DISCOUNT_TYPE: IRadioButtonValue[] = [
  {
    id: DiscountType.Money,
    textValue: '値引',
  },
  {
    id: DiscountType.Percent,
    textValue: '割引',
  },
];

export const APPLY_TYPE: IRadioButtonValue[] = [
  {
    id: 1,
    textValue: '期間',
  },
  {
    id: 2,
    textValue: 'タイムサービス',
  },
];

export const DATE_CATEGORY_TYPE: IRadioButtonValue[] = [
  {
    id: DateCategoryType.EveryDay,
    textValue: '毎日',
  },
  {
    id: DateCategoryType.DayOfWeek,
    textValue: '曜日指定',
  },
];

export const formatAmount = (amount: number, type: DiscountType) => {
  if (amount === null) return '';
  return `${formatNumber(amount)} ${type === DiscountType.Percent ? '%' : '円'}`;
};
