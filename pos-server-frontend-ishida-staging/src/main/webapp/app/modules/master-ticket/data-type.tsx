import { IDropDownItem } from '@/components/dropdown/dropdown';

export enum TicketType {
  TBase = 0,
  TShoppingTicket = 1,
  TDiscount = 2,
}

export const SEARCH_TYPE_OPTIONS: IDropDownItem[] = [
  {
    name: 'を含む',
    value: 0,
    code: '0',
  },
  {
    name: 'から始まる',
    value: 1,
    code: '1',
  },
  {
    name: 'で終わる',
    value: 2,
    code: '2',
  },
];

export enum TimeService {
  Time = 1,
  ServiceTime = 2,
}

export enum DiscountType {
  Money = '2',
  Percent = '1',
}

export enum DateCategoryType {
  EveryDay = 1,
  DayOfWeek = 2,
}
