import { createSlice } from '@reduxjs/toolkit';
import { CashReportReponse, exportCashReportList, getCashReportList } from 'app/services/cash-report-service';
import { saveAs } from 'file-saver';

export interface CashReportState {
  cashReports?: CashReportReponse;
}

const initialState: CashReportState = {
  cashReports: null,
};

const cashReportSlice = createSlice({
  name: 'cashReport',
  initialState,
  reducers: {
    clearDataCashReport(state) {
      state.cashReports = null;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getCashReportList.fulfilled, (state, action) => {
        state.cashReports = action.payload.data;
      })
      .addCase(exportCashReportList.fulfilled, (_, action) => {
        const blob = action.payload.blob;
        const fileName = `PR3301_${action.meta.arg.store_code}.pdf`;
        saveAs(blob, fileName);
      });
  },
});

export const { clearDataCashReport } = cashReportSlice.actions;
export default cashReportSlice.reducer;
