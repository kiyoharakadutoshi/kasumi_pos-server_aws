import React, { useEffect, useMemo, useState } from 'react';
import TooltipDatePickerControl from '@/components/date-picker/tooltip-date-picker/tooltip-date-picker-control';
import SelectControl from '@/components/control-form/select-control';
import {
  cashRegisterStatusItems,
  cashRegisterStatusReferenceItems,
  equipmentFailureItems,
} from '@/modules/sc7301-cash-register-status-reference/sc7301-cash-register-status-interface';
import FuncKeyDirtyCheckButton from '@/components/button/func-key-dirty-check/func-key-dirty-check-button';
import ButtonPrimary from '@/components/button/button-primary/button-primary';
import { getCashRegisterType } from 'app/services/setting-master-service';
import { IDropDownItem } from 'app/components/dropdown/dropdown';
import { useAppDispatch } from 'app/config/store';
import { isNullOrEmpty, isValidDate, localizeString } from 'app/helpers/utils';
import { useFormContext } from 'react-hook-form';

// Define the SearchCashRegister component
const SearchCashRegister = ({
  divCommonRef, // Reference to the common div element
  disabledSearch, // Boolean to disable the search controls
  disabledDetail, // Boolean to disable the detail button
  handleSearchCashRegister, // Function to handle search action
  handleViewCashRegisterDetail, // Function to handle view detail action
}) => {
  const dispatch = useAppDispatch();
  const { watch, getValues } = useFormContext();
  const [listCashRegisterType, setListCashRegisterType] = useState<IDropDownItem[]>([
    {
      value: null,
      name: localizeString('cashRegisterStatus.all'),
    },
  ]);

  const canSearch = useMemo(() => {
    return isValidDate(getValues('businessDate')) && !isNullOrEmpty(listCashRegisterType);
  }, [watch('businessDate'), listCashRegisterType]);

  /**
   * Get list cash register type when display screen
   */
  useEffect(() => {
    getCashRegisterTypes();
  }, []);

  /**
   * API7103 Get list cash register type
   */
  const getCashRegisterTypes = () => {
    dispatch(getCashRegisterType({}))
      .unwrap()
      .then((response) => {
        const items = response?.data?.data;
        if (isNullOrEmpty(items)) return;

        const dropDownItems = items.map((item) => ({ value: item.code, name: item.name, code: item.code }));
        setListCashRegisterType([{ value: null, name: localizeString('cashRegisterStatus.all') }, ...dropDownItems]);
      })
      .catch(() => {});
  };

  return (
    <div className="cash-register-status-reference__search" ref={divCommonRef}>
      <div className="cash-register-status-reference__search-box">
        {/* Business Date Picker */}
        <div className="cash-register-status-reference__search-item">
          <TooltipDatePickerControl
            name="businessDate"
            errorPlacement="right"
            inputClassName="date-picker"
            heightDateTime={'50px'}
            labelText="cashRegisterStatus.systemDate"
            isShortDate
            checkEmpty={true}
            keyError="cashRegisterStatus.systemDate"
            required
            disabled={disabledSearch}
            maxDate={new Date()}
            messageError={'MSG_VAL_049'}
          />
        </div>

        {/* Cash Register Type Selector */}
        <div className="cash-register-status-reference__register-type">
          <SelectControl
            label="cashRegisterStatus.cashRegisterType"
            name="cashRegisterType"
            items={listCashRegisterType}
            disabled={disabledSearch}
          />
        </div>

        {/* Data Master Status Selector */}
        <div className="cash-register-status-reference__reflection-status">
          <SelectControl
            label="cashRegisterStatus.dataMasterStatus"
            name="dataMasterStatus"
            items={cashRegisterStatusReferenceItems} // dataMasterStatus
            disabled={disabledSearch}
            hasLocalized
          />
        </div>

        {/* Cash Register Status Selector */}
        <div className="cash-register-status-reference__status">
          <SelectControl
            label="cashRegisterStatus.cashRegisterStatus"
            name="cashRegisterStatus"
            items={cashRegisterStatusItems}
            disabled={disabledSearch}
            hasLocalized
          />
        </div>

        {/* Equipment Failure Status Selector */}
        <div className="cash-register-status-reference__equipment-fail">
          <SelectControl
            label="cashRegisterStatus.failureStatus"
            name="failureStatus"
            items={equipmentFailureItems}
            disabled={disabledSearch}
            hasLocalized
          />
        </div>

        {/* Search Button */}
        <FuncKeyDirtyCheckButton
          funcKey="F12"
          className="search-button"
          text="label.searchF12"
          onClickAction={handleSearchCashRegister}
          disabled={disabledSearch || !canSearch}
        />

        {/* Detail Button */}
        <ButtonPrimary
          disabled={disabledDetail}
          className="detail-button"
          text="label.detail"
          onClick={handleViewCashRegisterDetail}
        />
      </div>
    </div>
  );
};

export default SearchCashRegister;
