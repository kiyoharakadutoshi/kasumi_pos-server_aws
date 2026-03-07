import { createSlice, isRejected } from '@reduxjs/toolkit';
import { confirmEmployeeList } from 'app/services/employee-setting-service';

const initialState = {
  selected_stores: [],
  employee_code: '',
  employee_code_type: 0,
  employee_name: '',
  employee_name_type: 0,
  save_employee_success: false
};

export type ApplicationEmployeeState = Readonly<typeof initialState>;

export const ApplicationEmployeeState = createSlice({
  name: 'applicationEmployeeSetting',
  initialState: initialState as ApplicationEmployeeState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(confirmEmployeeList.fulfilled, (state, action) => {
      state.save_employee_success = true;
    });
    builder.addMatcher(isRejected(confirmEmployeeList), state => {
      state.save_employee_success = false;
    });
  }
});

export default ApplicationEmployeeState.reducer;
