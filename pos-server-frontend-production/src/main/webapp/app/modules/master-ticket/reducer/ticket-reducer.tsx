import axios from 'axios';
import { createAsyncThunk, createSlice, isRejected, PayloadAction } from '@reduxjs/toolkit';
import { BaseTicket, DataTicket, Discount, ShoppingTicket, Ticket } from 'app/modules/master-ticket/interface';
import { serializeAxiosError } from 'app/reducers/reducer.utils';
import { IStoreSate } from 'app/reducers/store-reducer';
import { getBaseTickets, getMasterTickets } from 'app/services/ticket-service';

export interface TicketState {
  tickets: DataTicket;
  baseTicket?: BaseTicket;
  ticketSearch?: DataTicket;
}

export interface ITicketSearchProps {
  type: number;
  name?: string;
  search_type?: number;
  page?: number;
  limit?: number;
}

export interface IValueTicket {
  key: keyof Discount | keyof ShoppingTicket;
  value?: string | number;
}

const initialState: TicketState = {
  tickets: { total_count: 0, item_list: [] },
  baseTicket: null,
};

export const masterTickerSlice = createSlice({
  name: 'masterTicket',
  initialState: initialState,
  reducers: {
    addTicket(state, action: PayloadAction<{ storeState: IStoreSate; ticket: Ticket }>) {
      if (action.payload.storeState?.applyStores) {
        const tickets: Ticket[] = action.payload.storeState?.registeredStores.map(store => {
          return { ...action.payload.ticket, store_code: store.store_code, store_name: store.store_name };
        });
        state.tickets.item_list = tickets.concat(state.tickets.item_list);
      } else {
        state.tickets.item_list = [action.payload.ticket].concat(state.tickets.item_list);
      }
    },

    updateTicket(state, action: PayloadAction<Ticket>) {
      const index = state.tickets.item_list.findIndex(
        item => item.store_code === action.payload.store_code && item.code === action.payload.code,
      );
      if (index >= 0) {
        state.tickets.item_list[index] = action.payload;
      }
    },

    deleteTicket(state, action: PayloadAction<Ticket>) {
      state.tickets.item_list.forEach(item => {
        if (item.store_code === action.payload.store_code && item.code === action.payload.code) {
          item.deleted = !item.deleted;
          return;
        }
      });
    },

    clear(state) {
      state = initialState;
    },

    clearDataModal(state) {
      state.baseTicket = null;
      state.ticketSearch = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getMasterTickets.fulfilled, (state, action) => {
        state.tickets = action.payload.data;
      })
      .addCase(getBaseTickets.fulfilled, (state, action) => {
        state.baseTicket = action.payload.data;
      })
      .addMatcher(isRejected(getMasterTickets), () => ({
        ...initialState,
      }));
  },
});

export const { addTicket, updateTicket, deleteTicket, clear, clearDataModal } = masterTickerSlice.actions;
export default masterTickerSlice.reducer;
