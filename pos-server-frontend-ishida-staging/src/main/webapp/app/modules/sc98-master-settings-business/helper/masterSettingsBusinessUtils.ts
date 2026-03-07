import { IStoreSchedules } from '@/services/store-schedules-service';
import { IMasterSettingsBusiness } from './interface';
import { isEmpty } from 'lodash';

const DEFAULT_ROW_COUNT = 11;

interface BusinessDateSetting {
  name: string,
  value: string,
}

/**
 * Generates a list of the next 12 months starting from the current month.
 * Each item contains a formatted display name and a value representing 
 * the first day of the month in "yyyy/MM/dd" format.
 *
 * @returns An array of BusinessDateSetting objects for the next 12 months.
 */
const getNext12Months = (): BusinessDateSetting[] => {
  const currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = currentDate.getMonth() + 1;
  const months: BusinessDateSetting[] = [];
  for (let i = 0; i < 12; i++) {
    const formattedName = `${year}年${String(month).padStart(2, '0')}月`;
    const formattedValue = `${year}/${String(month).padStart(2, '0')}/01`;
    months.push({
      name: formattedName,
      value: formattedValue
    });

    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return months;
};

export const SETTING_MONTH = getNext12Months();

const mapNumberToDayOfWeekName: Map<number, string> = new Map([
  [0, "日"],
  [1, "月"],
  [2, "火"],
  [3, "水"],
  [4, "木"],
  [5, "金"],
  [6, "土"],
])

export const mapDayOfWeekNameToNumber: Map<string, number> = new Map(
  Array.from(mapNumberToDayOfWeekName.entries()).map(([num, name]) => [name, num])
)

/**
 * Generates a default list of store schedules for the given month.
 * Each entry includes the full business date, day of the week, and business day (default 0).
 *
 * @param businessDateSettingFilter A string in the format "yyyy/MM/dd" used to determine the target month and year.
 * @returns An array of IStoreSchedules representing each day of the specified month.
 */
const getDefaultStoreSchedules = (businessDateSettingFilter: string): IStoreSchedules[] => {
  const [year, month] = businessDateSettingFilter.split('/').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(year, month - 1, day);
    const weekday = date.getDay();

    return {
      business_date: `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`,
      business_day_week: weekday,
      business_day: 0,
    }
  }
  );
}

/**
 * Prepare data to show in table
 * 
 * @param businessDateSettingFilter A string in the format "yyyy/MM/dd" used to determine the target month and year.
 * @param data data receive from api
 * @returns data to show in table
 */
export const convertToMasterSettingsBusiness = (businessDateSettingFilter: string, data: IStoreSchedules[]): IMasterSettingsBusiness[] => {

  const result: IMasterSettingsBusiness[] = [];

  if (isEmpty(data)) {
    data = getDefaultStoreSchedules(businessDateSettingFilter);
  }

  for (let i = 0; i < DEFAULT_ROW_COUNT; i++) {
    const first = data[i];
    const second = data[i + DEFAULT_ROW_COUNT];
    const third = data[i + DEFAULT_ROW_COUNT * 2];

    result.push({
      businessDateFisrt: first?.business_date ?? null,
      businessDayWeekFirst: mapNumberToDayOfWeekName.get(first?.business_day_week) ?? null,
      businessDayFirst: first?.business_day ?? null,

      businessDateSecond: second?.business_date ?? null,
      businessDayWeekSecond: mapNumberToDayOfWeekName.get(second?.business_day_week) ?? null,
      businessDaySecond: second?.business_day ?? null,

      businessDateThird: third?.business_date ?? null,
      businessDayWeekThird: mapNumberToDayOfWeekName.get(third?.business_day_week) ?? null,
      businessDayThird: third?.business_day ?? null,
    });
  }

  return result;
};
