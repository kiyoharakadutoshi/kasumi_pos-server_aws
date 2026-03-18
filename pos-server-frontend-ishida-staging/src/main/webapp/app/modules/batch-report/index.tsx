import './index.scss';
import { useAppSelector } from '@/config/store';
import { isNullOrEmpty, localizeString } from '@/helpers/utils';
import { FormProvider, useForm } from 'react-hook-form';
import React from 'react';
import { Translate } from 'react-jhipster';
import { RadioButton } from '@/components/radio-button-component/radio-button';
import TooltipDatePickerControl from '@/components/date-picker/tooltip-date-picker/tooltip-date-picker-control';
import FuncKeyDirtyCheckButton from '@/components/button/func-key-dirty-check/func-key-dirty-check-button';
import Header from '@/components/header/header';
import SidebarStore from '@/components/sidebar-store-default/sidebar-store/sidebar-store';
import useColumn from '@/modules/batch-report/use-column';
import { batchReportState } from '@/modules/batch-report/batch-report-constants';
import useHook from '@/modules/batch-report/use-hook';
import TableData from '@/components/table/table-data/table-data';
import PagingBottomButton from '@/components/bottom-button/pagging-bottom-button/paging-bottom-button';
import { batchReportTypes, BatchReportSearchType } from '@/modules/batch-report/batch-report-types';

const BatchReport = () => {
  const selectedStore: string = useAppSelector((state) => state.storeReducer.selectedStores)?.[0];
  const formConfig = useForm({ defaultValues: batchReportState });
  const { columns } = useColumn(selectedStore);
  const { disabledSearch, actionSearch, focusFirstElement, clearData, maxDate, onChangeType } = useHook(
    formConfig,
    selectedStore
  );
  const { watch } = formConfig;
  const noneStore = isNullOrEmpty(selectedStore);
  const type = watch('type');

  const searchReport = (
    <div className="batch-report__search-container">
      <div className="batch-report__type-container">
        <div className="batch-report__type-label">
          <Translate contentKey={'listCashRegisterReport.business'} />
          <span className="batch-report__required">*</span>
        </div>
        <div className="batch-report__list-type-item">
          {batchReportTypes.map((item, index) => (
            <RadioButton
              key={`type-${index}` as any}
              id={item.name}
              onChange={() => onChangeType(item)}
              textValue={localizeString(item.name)}
              checked={item.type === type}
              className={'cash-register-report__type-item'}
              disabled={noneStore}
            />
          ))}
        </div>
      </div>

      <div className="batch-report__date">
        <TooltipDatePickerControl
          required={true}
          name={'startDate'}
          labelText="listCashRegisterReport.startDateReport"
          disabled={type !== BatchReportSearchType.Daily || noneStore}
          checkEmpty={true}
          keyError={'listCashRegisterReport.startDateReport'}
          maxDate={maxDate}
          errorPlacement={'left'}
        />
        ～
        <TooltipDatePickerControl
          required={true}
          name={'endDate'}
          labelText="listCashRegisterReport.endDateReport"
          disabled={type !== BatchReportSearchType.Daily || noneStore}
          checkEmpty={true}
          keyError={'listCashRegisterReport.endDateReport'}
          maxDate={maxDate}
          errorPlacement={'right'}
        />
      </div>
      <FuncKeyDirtyCheckButton
        funcKey={'F12'}
        text="action.f12Search"
        onClickAction={actionSearch}
        disabled={disabledSearch}
        funcKeyListener={selectedStore}
      />
    </div>
  );

  return (
    <div className="batch-report">
      <FormProvider {...formConfig}>
        <Header title={'batchReport.title'} printer={{ disabled: true }} csv={{ disabled: true }} hasESC={true} />
        <SidebarStore
          onChangeCollapseExpand={focusFirstElement}
          expanded={true}
          hasData={watch('records')?.length > 0}
          actionConfirm={clearData}
        />
        {searchReport}
        <TableData
          columns={columns}
          data={watch('records')}
          enableSelectRow={false}
          rowConfig={(row) => {
            if (row.index === 0) return { className: 'row-total' };
          }}
          showNoDataNameForm="hasNoData"
        />
        <PagingBottomButton
          totalPage={watch('totalPage')}
          page={watch('currentPage')}
          total_record={watch('totalItem')}
          hideClear
          actionPaging={actionSearch}
        />
      </FormProvider>
    </div>
  );
};

export default BatchReport;
