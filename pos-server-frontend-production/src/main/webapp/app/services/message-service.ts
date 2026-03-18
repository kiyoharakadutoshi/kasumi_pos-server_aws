import { getDataWithMethodPost } from "./base-service";

export const postMessageMaster = getDataWithMethodPost<{
  selected_stores: string[],
  type: number,
  message_code?: string,
  message_code_filter_type?: number
  sub_type?: string,
  message?: string,
  message_filter_type?: number
}, any>('messages');
