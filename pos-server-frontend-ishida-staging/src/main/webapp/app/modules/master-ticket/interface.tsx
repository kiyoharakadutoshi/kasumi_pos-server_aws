import { IStoreInfo } from 'app/reducers/store-reducer';
import { ResponseApiList } from 'app/services/base-service';

import { OperationType } from 'app/components/table/table-common';
import { TicketType, DiscountType, TimeService, DateCategoryType } from './data-type';
import { IDropDownItem } from 'app/components/dropdown/dropdown';
import { FormTableDataBase } from 'app/components/table/table-data/interface-table';
import { ModalMode } from 'app/components/modal/default-modal/default-enum';

export interface TicketFormData extends FormTableDataBase<Ticket> {
  ticketType: TicketType;
  ticketSearchType?: TicketType;
  keyword?: string;
  searchType: number;
  isDirty?: boolean;
  registerStores: IStoreInfo[];
  tickets: Ticket[];
  defaultTickets: Ticket[];
  isExceedRecords?: boolean;
  ticket: Ticket | ShoppingTicket | Discount;
  baseTicket?: {
    isExceedRecords?: boolean;
    items?: Ticket[] | ShoppingTicket[] | Discount[];
    noData?: boolean;
  }
  addedTicketCodes?: string[];
  categoryShoppingItems?: IDropDownItem[];
  categoryDiscountPriceItems?: IDropDownItem[];
  categoryDiscountPercentItems?: IDropDownItem[];
}

export interface DataTicket extends ResponseApiList {
  data: {
    is_exceed_records?: boolean;
    items?: Ticket[] | ShoppingTicket[] | Discount[];
  };
}

export interface MasterTicketUpdate {
  type: TicketType;
  shopping_tickets?: Ticket[];
  discounts?: Ticket[];
  registered_stores: string[];
}

export interface Ticket {
  record_id?: number;
  store_code?: string;
  store_name?: string;
  source_store?: string;
  code?: string;
  name?: string;
  ticket_summary_group_code?: DiscountType;
  unit_amount?: number;
  payment_code?: string;
  operation_type?: OperationType;
  operation_type_before?: OperationType;
  discount_value?: number;
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
  can_return: number;
  can_resale: number;
  can_change: number;
  can_just_fix: number;
  is_drawer: number;
  can_cancel: number;
  can_void: number;
  can_over_deposit: number;
  can_change_count: number;
  is_point_prohibition: number;
}

export interface Discount extends Ticket {
  time_service: TimeService;
  start_date: string;
  start_time?: string;
  end_date: string;
  end_time: string;
  date_categorize_type_code: DateCategoryType;
  is_monday: number;
  is_tuesday: number;
  is_wednesday: number;
  is_thursday: number;
  is_friday: number;
  is_saturday: number;
  is_sunday: number;
}

export interface DefaultModalProps {
  mode?: ModalMode;
  type?: TicketType;
  closeModal?: (ticket?: Ticket) => void;
}

export interface BaseTicket {
  code: string;
  name: string;
  unit_amount: number;
  ticket_summary_group_code: DiscountType;
}

export interface ITicketSearchProps {
  keyword?: string;
  selected_stores: string[];
  type: number;
  name?: string;
  search_type?: number;
  page?: number;
  limit?: number;
}
