import { DataTicket, BaseTicket } from "app/modules/master-ticket/interface";
import { ITicketSearchProps } from "app/modules/master-ticket/reducer/ticket-reducer";
import axios from "axios";
import { getDataWithParam, postData, getDataWithParamAndBody } from "./base-service";

export const getMasterTickets = getDataWithParamAndBody<ITicketSearchProps, { selected_stores: string[] }, DataTicket>('ticket/list_ticket');
export const confirmTickets = postData<any>(`ticket/maintenance_ticket`)
export const getBaseTickets = getDataWithParam<{ type: number; select_store: string; code: string }, BaseTicket>('ticket/base_ticket')
export const suggestTicket = async (type: number, select_store: string, code: string) => {
  return await axios.get(`ticket/base_ticket`, { params: { type, select_store, code } }).then(response => response.data);
};
