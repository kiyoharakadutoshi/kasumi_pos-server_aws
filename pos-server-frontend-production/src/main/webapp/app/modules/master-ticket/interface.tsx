import { IStoreInfo } from 'app/reducers/store-reducer';
import { ApplyType, DiscountType, OperationType, TicketType } from './data-input';
import { ResponseApiList } from 'app/services/base-service';

export interface DataTicket extends ResponseApiList{
  item_list: Ticket[] | ShoppingTicket[] | Discount[];
}

export interface MasterTicketUpdate {
  type: TicketType;
  shopping_tickets?: Ticket[];
  discounts?: Ticket[];
  registered_stores: string[];
}

export interface Ticket {
  record_id?: number;
  company_code: string;
  store_code: string;
  store_name: string;
  code: string;
  name: string;
  new_name?: string;
  discount_type: DiscountType;
  amount?: number;
  new_amount?: number;
  category: number;
  type?: OperationType;
  deleted?: boolean;
}

export interface CsvDataTicket {
  store_code: string;
  store_name: string;
  code: string;
  name: string;
  amount: number;
  include: string;
}

export interface ShoppingTicket extends Ticket {
  can_return: boolean;
  can_exchange: boolean;
  can_change: boolean;
  can_just_fix: boolean;
  is_drawer: boolean;
  can_cancel: boolean;
  can_void: boolean;
  can_over_deposit: boolean;
  can_change_count: boolean;
  is_point_prohibition: boolean;
}

export interface Discount extends Ticket {
  apply_type: ApplyType;
  start_date_time: string;
  end_date_time: string;
  date_categorize_type_code: number;
  is_monday: boolean;
  is_tuesday: boolean;
  is_wednesday: boolean;
  is_thursday: boolean;
  is_friday: boolean;
  is_saturday: boolean;
  is_sunday: boolean;
}

export interface HandleTickets {
  type: OperationType;
  masterTicket?: DataTicket;
  tickets?: Ticket[];
}

export interface DefaultModalProps {
  isEdit?: boolean;
  type: TicketType;
  stores: IStoreInfo[];
  ticket?: Ticket;
  ticketSearch?: BaseTicket;
  closeModal?: (ticket?: Ticket) => void;
  actionSearch?: (store: string) => void;
}

export interface BaseTicket {
  code: string;
  name: string;
  amount: number;
  discount_type: DiscountType;
}

export interface TicketRef {
  getData: () => Ticket;
}

export interface ShoppingTicketProps {
  ticket?: ShoppingTicket;
  ticketSuggest?: BaseTicket;
}

export interface DiscountProps {
  ticket: Discount;
  ticketSuggest?: BaseTicket;
}

export enum ActionType {
  Cancel,
  Delete,
  Edit,
  New,
  Confirm,
  None,
}
