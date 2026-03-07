import { SelectOption } from 'app/components/input/normal-dropdown/normal-dropdown';
import { localizeString } from 'app/helpers/utils';
import React from 'react';
import { Translate } from 'react-jhipster';
import { Discount, ShoppingTicket } from './interface';

export enum SelectedType {
  Do = 1,
  Dont = 0,
}

export enum OperationType {
  None = 0,
  New = 1,
  Edit = 2,
  Remove = 3,
}

export enum ApplyType {
  Time = 1,
  ServiceTime = 2,
}

export enum DiscountType {
  Percent = 1,
  Money = 2,
}

export enum TicketType {
  Base = 0,
  ShoppingCart = 1,
  Discount = 2,
}

export enum MatchingType {
  Include = 1,
  Start = 2,
  End = 3,
}

export const categoryShoppingTickets = () => {
  return [
    {
      id: '15',
      value: 15,
      label: localizeString('modalTicket.category.shoppingTicket.category15'),
    },
    {
      id: '16',
      value: 16,
      label: localizeString('modalTicket.category.shoppingTicket.category16'),
    },
    {
      id: '17',
      value: 17,
      label: localizeString('modalTicket.category.shoppingTicket.category17'),
    },
    {
      id: '18',
      value: 18,
      label: localizeString('modalTicket.category.shoppingTicket.category18'),
    },
    {
      id: '19',
      value: 19,
      label: localizeString('modalTicket.category.shoppingTicket.category19'),
    },
    {
      id: '20',
      value: 20,
      label: localizeString('modalTicket.category.shoppingTicket.category20'),
    },
    {
      id: '21',
      value: 21,
      label: localizeString('modalTicket.category.shoppingTicket.category21'),
    },
    {
      id: '22',
      value: 22,
      label: localizeString('modalTicket.category.shoppingTicket.category22'),
    },
    {
      id: '23',
      value: 23,
      label: localizeString('modalTicket.category.shoppingTicket.category23'),
    },
    {
      id: '24',
      value: 24,
      label: localizeString('modalTicket.category.shoppingTicket.category24'),
    },
  ];
};

export const categoryDiscountPercents = () => {
  return [
    {
      id: '6',
      value: 6,
      label: localizeString('modalTicket.category.discountPercent.category6'),
    },
    {
      id: '7',
      value: 7,
      label: localizeString('modalTicket.category.discountPercent.category7'),
    },
    {
      id: '8',
      value: 8,
      label: localizeString('modalTicket.category.discountPercent.category8'),
    },
    {
      id: '9',
      value: 9,
      label: localizeString('modalTicket.category.discountPercent.category9'),
    },
    {
      id: '10',
      value: 10,
      label: localizeString('modalTicket.category.discountPercent.category10'),
    },
    {
      id: '16',
      value: 16,
      label: localizeString('modalTicket.category.discountPercent.category11'),
    },
    {
      id: '17',
      value: 17,
      label: localizeString('modalTicket.category.discountPercent.category12'),
    },
    {
      id: '18',
      value: 18,
      label: localizeString('modalTicket.category.discountPercent.category13'),
    },
    {
      id: '19',
      value: 19,
      label: localizeString('modalTicket.category.discountPercent.category14'),
    },
    {
      id: '20',
      value: 20,
      label: localizeString('modalTicket.category.discountPercent.category15'),
    },
  ];
};

export const categoryDiscountMoneys = () => [
  {
    id: '1',
    value: 1,
    label: localizeString('modalTicket.category.discountMoney.category1'),
  },
  {
    id: '2',
    value: 2,
    label: localizeString('modalTicket.category.discountMoney.category2'),
  },
  {
    id: '3',
    value: 3,
    label: localizeString('modalTicket.category.discountMoney.category3'),
  },
  {
    id: '4',
    value: 4,
    label: localizeString('modalTicket.category.discountMoney.category4'),
  },
  {
    id: '5',
    value: 5,
    label: localizeString('modalTicket.category.discountMoney.category5'),
  },
  {
    id: '11',
    value: 11,
    label: localizeString('modalTicket.category.discountMoney.category11'),
  },
  {
    id: '13',
    value: 13,
    label: localizeString('modalTicket.category.discountMoney.category12'),
  },
  {
    id: '14',
    value: 1,
    label: localizeString('modalTicket.category.discountMoney.category13'),
  },
  {
    id: '15',
    value: 15,
    label: localizeString('modalTicket.category.discountMoney.category14'),
  },
];

export const shoppingTicketRadioValues = () => [
  {
    id: '0',
    checkBoxValue: SelectedType.Dont,
    textValue: <Translate contentKey="modalTicket.false" />,
  },
  {
    id: '1',
    checkBoxValue: SelectedType.Do,
    textValue: <Translate contentKey="modalTicket.true" />,
  },
];

export const applyDateValues = () => [
  {
    id: '1',
    checkBoxValue: 1,
    textValue: <Translate contentKey="modalTicket.everyDay" />,
  },
  {
    id: '2',
    checkBoxValue: 2,
    textValue: <Translate contentKey="modalTicket.dayOfWeek" />,
  },
];

export const discountTypeValues = () => [
  {
    id: '2',
    checkBoxValue: DiscountType.Money,
    textValue: <Translate contentKey="modalTicket.amountMoney" />,
  },
  {
    id: '1',
    checkBoxValue: DiscountType.Percent,
    textValue: <Translate contentKey="modalTicket.percent" />,
  },
];

export const applyTypeValues = () => [
  {
    id: '1',
    checkBoxValue: ApplyType.Time,
    textValue: <Translate contentKey="modalTicket.period" />,
  },
  {
    id: '2',
    checkBoxValue: ApplyType.ServiceTime,
    textValue: <Translate contentKey="modalTicket.timeService" />,
  },
];

export const ticketTypeValues = () => [
  {
    id: '1',
    checkBoxValue: TicketType.ShoppingCart,
    textValue: localizeString('masterTicket.shoppingCart'),
  },
  {
    id: '2',
    checkBoxValue: TicketType.Discount,
    textValue: localizeString('masterTicket.discount'),
  },
];

export const searchTypeValues = () => [
  {
    id: '1',
    value: MatchingType.Include,
    label: localizeString('matching.include'),
  },
  {
    id: '2',
    value: MatchingType.Start,
    label: localizeString('matching.start'),
  },
  {
    id: '3',
    value: MatchingType.End,
    label: localizeString('matching.end'),
  },
];
