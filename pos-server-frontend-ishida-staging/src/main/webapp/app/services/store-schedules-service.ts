import { getDataWithParam, postData, ResponseApi } from "./base-service";

export interface IStoreSchedules {
    business_date: string,
    business_day_week: number,
    business_day: number,
}

export interface IStoreScheduleList {
    items: IStoreSchedules[],
}

export interface IStoreSchedulesResponse extends ResponseApi {
    data: IStoreScheduleList,
}

export const getStoreSchedules = getDataWithParam<{store_code: number, business_date_filter: string}, IStoreSchedulesResponse>('store_schedules');
export const maintenanceStoreSchedules = postData<{store_code: number, business_date_filter: string, items: IStoreSchedules[]}>('store_schedules/update');