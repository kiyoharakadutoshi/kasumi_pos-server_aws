import { createSlice } from '@reduxjs/toolkit';

interface CompanyCodeState {
  company_code: string;
}

const initCompanyCode: CompanyCodeState = {
  company_code: 'aaaa',
};

const companyCodeSlice = createSlice({
  name: 'companyCode',
  initialState: initCompanyCode,
  reducers: {
    setCurrentCompany(state, action: { payload: string }) {
      state.company_code = action.payload;
    },
  },
});

export const {setCurrentCompany} = companyCodeSlice.actions;

export default companyCodeSlice.reducer;
