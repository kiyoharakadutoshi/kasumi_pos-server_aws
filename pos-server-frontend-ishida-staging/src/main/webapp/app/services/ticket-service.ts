import { DataTicket, BaseTicket, ITicketSearchProps } from 'app/modules/master-ticket/interface';
import { getDataWithParam, postData } from './base-service';

export interface ISuggestTicketParam {
  type: number;
  selected_store: string;
  code?: string;
}

export interface ISuggestTicketResponse {
  data: BaseTicket;
}

export const getMasterTickets = getDataWithParam<ITicketSearchProps, DataTicket>('ticket/list-ticket');
export const confirmTickets = postData<any>(`ticket/maintenance-ticket`);
export const getBaseTicket = getDataWithParam<ISuggestTicketParam, ISuggestTicketResponse>('ticket/base-ticket');
export const suggestTicket = getDataWithParam<ISuggestTicketParam, ISuggestTicketResponse>(
  'ticket/base-ticket',
  'ticket/base-tickets-suggest'
);
