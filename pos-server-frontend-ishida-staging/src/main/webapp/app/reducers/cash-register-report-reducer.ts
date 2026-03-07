import { ICashRegisterReportState } from 'app/modules/sc31-report-quick-cashier/sc3102-detail-report/sc3102-detail-report-interface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getListCashRegisterReport } from 'app/services/cash-register-report-service';
import { ICashRegisterReportData } from 'app/modules/sc31-report-quick-cashier/sc3101-list-cash-register-report/sc3101-list-cash-register-report-interface';

export interface IListCashRegisterReportState {
  searchState: ICashRegisterReportState;
  cashRegisterReports: ICashRegisterReportData[];
}

const initialState: IListCashRegisterReportState = {
  searchState: null,
  cashRegisterReports: [],
};

const cashRegisterReportSlice = createSlice({
  name: 'quickReport',
  initialState,
  reducers: {
    clearQuickReport(state) {
      state.searchState = null;
      state.cashRegisterReports = [];
    },

    setCashRegisterCode(state, action: PayloadAction<string>) {
      if (state.searchState) {
        state.searchState.cash_register_code = action.payload;
      }
    },
    setSearchState(state, action: PayloadAction<ICashRegisterReportState>) {
      state.searchState = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(getListCashRegisterReport.fulfilled, (state, action) => {
      state.cashRegisterReports = action.payload.data.data?.items;
    });
    builder.addCase(getListCashRegisterReport.rejected, (state) => {
      state.cashRegisterReports = [];
      state.searchState = null;
    });
  },
});

export const { clearQuickReport, setCashRegisterCode, setSearchState } = cashRegisterReportSlice.actions;

export default cashRegisterReportSlice.reducer;
