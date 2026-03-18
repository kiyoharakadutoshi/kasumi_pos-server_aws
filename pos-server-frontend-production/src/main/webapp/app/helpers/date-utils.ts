import {
  APP_LOCAL_DATETIME_FORMAT,
  DATE_FORMAT_EXPORT_CSV,
  SERVER_DATE_FORMAT,
  SERVER_DATE_FORMAT_COMPACT,
} from 'app/constants/date-constants';
import dayjs from 'dayjs';
import _ from 'lodash';
import { isNullOrEmpty, localizeString } from 'app/helpers/utils';
import { isValid } from 'date-fns';

export const convertDateTimeFromServer = (date) => (date ? dayjs(date).format(APP_LOCAL_DATETIME_FORMAT) : null);
export const convertDateServer = (date: Date) => (date ? dayjs(date).format(SERVER_DATE_FORMAT) : '');
export const convertShortDateServer = (date: Date) => (date ? dayjs(date).format(SERVER_DATE_FORMAT_COMPACT) : '');
export const convertTime = (time: Date) => `${time.getHours()}:${time.getMinutes()}`;

export const convertDateTimeToServer = (date?: string): dayjs.Dayjs | null => (date ? dayjs(date) : null);

export const displayDefaultDateTime = () => dayjs().startOf('day').format(APP_LOCAL_DATETIME_FORMAT);

export const toDateString = (date: Date, format: string) => (date ? dayjs(date).format(format) : '');

export const timeString = (date: Date) => {
  if (!date) return null;
  return {
    hour: _.toString(date.getHours()).padStart(2, '0'),
    minute: _.toString(date.getMinutes()).padStart(2, '0'),
    second: _.toString(date.getSeconds()).padStart(2, '0'),
  };
};

export const getMonthString = (date: Date) => _.toString(date.getMonth() + 1).padStart(2, '0');
export const toShortDate = (dateStr: string) => {
  if (isNullOrEmpty(dateStr)) return null;
  return new Date(Date.parse(dateStr) ?? new Date().setHours(0, 0, 0, 0));
};

export const getTimExportCSV = () => dayjs().format(DATE_FORMAT_EXPORT_CSV);

export const getNextDate = (date?: Date) => {
  const currentDate = date ? new Date(date) : new Date();
  const nextDate = new Date(currentDate);
  nextDate.setDate(currentDate.getDate() + 1);
  return nextDate;
};

export const getPreviousDate = (date?: Date) => {
  const currentDate = date ? new Date(date) : new Date();
  const previousDate = new Date(currentDate);
  previousDate.setDate(currentDate.getDate() - 1);
  return previousDate;
};

export const getDateFromDateWithMonth = (month: number, dateInput?: Date) => {
  const date = dateInput ? new Date(dateInput) : new Date();
  date.setMonth(date.getMonth() + month);
  return date;
};

export const getDateWithOffsetDays = (days: number, dateInput?: Date) => {
  const date = dateInput ? new Date(dateInput) : new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const isValidDateInRange = (date: Date, min: Date, max: Date) => {
  if (!date || !isValid(date)) return false;
  const time = date.getTime();
  return (!min || min.getTime() <= time) && (!max || max.getTime() >= time);
};

export const getDateTime = (hour: number, minute: number, date?: Date) => {
  const currentDate = date ? new Date(date) : new Date();
  currentDate.setHours(hour, minute);
  return currentDate;
};

export const isStartEndDateValid = (
  startDate?: string,
  endDate?: string,
  startTime?: string,
  endTime?: string,
  checkTime?: boolean
) => {
  if (!startDate || !endDate) return false;
  if (checkTime) {
    if (!startTime || !endTime) return false;
  }
  return true;
};

export const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

export const compareDate = (dateString1: string, dateString2?: string): number => {
  const date1 = new Date(dateString1);
  const date2 = dateString2 ? new Date(dateString2) : new Date();

  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);

  if (date1 > date2) {
    return 1;
  } else if (date1 < date2) {
    return -1;
  } else {
    return 0;
  }
};

export const toDate = (dateString: string): Date => {
  if (isNullOrEmpty(dateString)) return null;
  if (dateString?.length === 8) {
    return new Date(`${new Date().getFullYear().toString().substring(0, 2)}${dateString}`);
  }
  return new Date(Date.parse(dateString));
};

export const fullDateToSortDate = (fullDate: string): string => {
  if (!isNullOrEmpty(fullDate) && fullDate.length === 10) {
    return fullDate.slice(2);
  }

  return fullDate;
};

export const dropDownMonth = (limit: number = 3, type: 'back' | 'next' = 'back', start: Date = new Date()) => {
  const date = new Date(start);
  const year = date.getFullYear().toString().slice(-2);
  const month = date.getMonth();
  const currentMonth = (month + 1).toString().padStart(2, '0');
  const yearLabel = localizeString('dateTimeLabel.year');
  const monthLabel = localizeString('dateTimeLabel.month');

  const items = [
    {
      value: `${year}/${currentMonth}`,
      name: `${year}${yearLabel}${currentMonth}${monthLabel}`,
    },
  ];

  for (let i = 0; i < limit - 1; i++) {
    date.setMonth(date.getMonth() + (type === 'back' ? -1 : 1));
    const newMonth = (date.getMonth() + 1).toString().padStart(2, '0');
    const newYear = date.getFullYear().toString().slice(-2);
    items.push({
      value: `${newYear}/${newMonth}`,
      name: `${newYear}${yearLabel}${newMonth}${monthLabel}`,
    });
  }

  return items;
};

export const isValidDate = (date?: Date): boolean => {
  return date && isValid(date);
};

export const monthsBetweenDates = (startDate: Date, endDate: Date): number => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return 0;

  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();

  return (endYear - startYear) * 12 + (endMonth - startMonth);
};

export const getNextHour = (time: string): string => {
  if (isNullOrEmpty(time)) return null;
  let hour = time.split(':')[0];

  const hourInt = parseInt(hour, 10);
  if (hourInt >= 23) {
    return '23:59';
  }
  hour = ( hourInt + 1).toString()?.padStart(2, '0');
  return `${hour}:00`;
};

export const daysBetweenDates = (startDate: Date, endDate: Date): number => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return 0;

  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
