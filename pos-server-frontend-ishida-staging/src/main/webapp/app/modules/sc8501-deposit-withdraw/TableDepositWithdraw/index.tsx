import React, { useEffect, useRef, useState } from 'react';
import InputTextCustom from '@/components/input-text-custom/input-text-custom';
import { FormProvider } from 'react-hook-form';
import Dropdown from '@/components/dropdown/dropdown';
import {
  TYPE_TEXT,
  RECORD_STATUS,
  MAX_LENGTH,
  INPUT_ID,
  MAX_TABLE_HEIGHT,
  DEFAULT_SELECT_ITEM,
  LIST_TYPE,
} from '@/modules/sc8501-deposit-withdraw/constants/tableDepositWithdraw';
import './table-deposit-withdraw.scss';

const TableDepositWithdraw = ({ refProps, stateProps, setStateProps, tableFormConfig }) => {
  const { inputCodeEditRef, inputNameEditRef, inputCodeNewRef } = refProps;
  const { listItems, lastRow, isEdit, itemSelected } = stateProps;
  const { setListItems, setStatusListButton, setLastRow, setIsEdit, setItemSelected } = setStateProps;

  const [tableHeight, setTableHeight] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);
  const { setValue, watch, getValues } = tableFormConfig;

  // check height table to change CSS grid
  useEffect(() => {
    const tableElement = tableRef.current;

    if (!tableElement) return;

    // watch resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setTableHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(tableElement);

    // remove resize
    return () => {
      resizeObserver.unobserve(tableElement);
    };
  }, []);

  // compare an object to change state true | false
  const compareObject = (object1: any, object2: any) => {
    if (object1 && object2) {
      const equal1 = object1.deposit_withdrawal_code === object2.deposit_withdrawal_code;
      const equal2 = object1.deposit_withdrawal_name === object2.deposit_withdrawal_name;
      const equal3 = object1.deposit_withdrawal_type === object2.deposit_withdrawal_type;

      if (equal1 && equal2 && equal3) {
        return 'no change';
      } else {
        return 'change';
      }
    }
  };

  const handleSelectRow = (item: any) => {
    if (isEdit && item.currentStatus !== 'default') {
      setIsEdit(false);

      const newItem = {
        deposit_withdrawal_code: getValues('code__edit'),
        deposit_withdrawal_name: getValues('name__edit'),
        deposit_withdrawal_type: getValues('type__edit'),
        record_id: itemSelected.record_id ?? Math.random().toString(36).substring(2, 9),
        currentStatus: 'edit',
        prevStatus: itemSelected.prevStatus,
      };

      const resultCompareChange = compareObject(listItems.originEntities[itemSelected.record_id], newItem);

      setStatusListButton((prev: any) => ({ ...prev, disableEdit: true, disableAdd: false, disableConfirm: false }));
      setIsEdit(false);
      setItemSelected(DEFAULT_SELECT_ITEM);
      if (resultCompareChange === 'no change') return; // no change

      setListItems((prevState: any) => ({
        ...prevState,
        entities: {
          ...prevState.entities,
          [itemSelected.record_id]: newItem,
        },
        change: resultCompareChange === 'change',
        listCode: [...prevState.listCode, newItem.deposit_withdrawal_code],
      }));

      return;
    } else if (lastRow) {
      const newItem = {
        record_id: Math.random().toString(36).substring(2, 9),
        deposit_withdrawal_code: getValues('code__new'),
        deposit_withdrawal_name: getValues('name__new'),
        deposit_withdrawal_type: getValues('type__new'),
        currentStatus: 'new',
        prevStatus: 'new',
      };

      setStatusListButton((prev: any) => ({ ...prev, disableAdd: false, disableConfirm: false }));

      setListItems((prevState: any) => ({
        ...prevState,
        entities: {
          ...prevState.entities,
          [newItem.record_id]: newItem,
        },
        listRecordId: [...prevState.listRecordId, newItem.record_id],
        change: true,
        listCode: [...prevState.listCode, newItem.deposit_withdrawal_code],
      }));
      setLastRow(false);
      setItemSelected(DEFAULT_SELECT_ITEM);
      return;
    } else {
      setItemSelected(item);
      if (item.currentStatus === 'delete') {
        setStatusListButton((prev: any) => ({ ...prev, disableEdit: true }));
        return;
      }

      setValue('code__edit', item.deposit_withdrawal_code);
      setValue('name__edit', item.deposit_withdrawal_name);
      setValue('type__edit', item.deposit_withdrawal_type);

      setStatusListButton((prev: any) => ({ ...prev, disableEdit: false }));
    }
  };

  return (
    <div id="table-deposit-withdraw">
      <div className="header-pin column-width">
        <div className="column-width__column-1 header-pin--text-align-center">コード</div>
        <div className="column-width__column-2 header-pin--text-align-center">名称</div>
        <div className="column-width__column-3 header-pin--text-align-center">種別</div>
        <div className="column-width__column-4 header-pin--scroll"></div>
      </div>
      <div
        className={`body-scroll ${tableHeight < MAX_TABLE_HEIGHT ? 'init' : 'add-scroll'}`}
        id="body-scroll-deposit-withdraw"
        ref={tableRef}
      >
        {listItems.listRecordId[0] === null ? (
          <div className="no-data-found">
            {listItems.listRecordId[0] !== null ? (
              <p className="message-no-data">データが見つかりませんでした。</p>
            ) : null}
          </div>
        ) : (
          <FormProvider {...tableFormConfig}>
            {listItems.listRecordId.map((record_id: string | number) => {
              //  row edit
              const findItem = listItems.entities[record_id];
              if (isEdit && itemSelected.record_id === findItem.record_id) {
                return (
                  <div
                    className={`column-width row-deposit-withdraw row-style ${itemSelected.record_id === record_id ? 'selected' : ''}`}
                    key={record_id}
                  >
                    <div className={`column-width__column-1 column-height`}>
                      {findItem.prevStatus === 'old' ? (
                        <span className="text">{findItem.deposit_withdrawal_code}</span>
                      ) : (
                        <div className="padding-input">
                          <InputTextCustom
                            inputRef={inputCodeEditRef}
                            inputClassName={'search-table-deposit__input-text-custom'}
                            datatype={INPUT_ID.code__edit}
                            id={INPUT_ID.code__edit}
                            name={INPUT_ID.code__edit}
                            maxLength={MAX_LENGTH.code}
                            onChange={(e: any) => setValue(INPUT_ID.code__edit, e.target.value)}
                            value={watch(INPUT_ID.code__edit)}
                            type="number"
                            hasTrim={true}
                            checkLengthFullSize={true}
                          />
                        </div>
                      )}
                    </div>
                    <div className="column-width__column-2 column-height">
                      <div className="padding-input">
                        <InputTextCustom
                          inputRef={inputNameEditRef}
                          inputClassName={'search-table-deposit__input-text-custom'}
                          id={INPUT_ID.name__edit}
                          name={INPUT_ID.name__edit}
                          value={watch(INPUT_ID.name__edit)}
                          onChange={(e: any) => setValue(INPUT_ID.name__edit, e.target.value)}
                          type="text"
                          maxLength={MAX_LENGTH.name}
                          checkLengthFullSize={true}
                          hasTrim={true}
                        />
                      </div>
                    </div>
                    <div className="column-width__column-3 column-height">
                      <div className="padding-input">
                        <Dropdown
                          hasBlankItem={false}
                          items={LIST_TYPE}
                          disabled={false}
                          onChange={(e: any) => setValue('type__edit', e.value)}
                          value={watch('type__edit')}
                          id="type__edit"
                          name="type__edit"
                          onBlur={() => handleSelectRow(findItem)}
                        />
                      </div>
                    </div>
                  </div>
                );
              } else {
                // row render data
                const rowClass = `${itemSelected.record_id === record_id ? 'selected' : ''}  ${findItem.currentStatus === RECORD_STATUS.delete ? 'deleted' : ''}`;
                const textClass = findItem.currentStatus !== RECORD_STATUS.old ? 'color-red' : '';
                return (
                  <div
                    className={`
                        column-width
                        row-deposit-withdraw row-style
                        ${rowClass}
                        `}
                    key={record_id}
                    id={`row-deposit-withdraw-${record_id}`}
                    onClick={() => handleSelectRow(findItem)}
                  >
                    <div
                      className={`
                        column-width__column-1
                        column-height
                        text
                        ${textClass}
                        `}
                    >
                      {findItem.deposit_withdrawal_code}
                    </div>
                    <div
                      className={`
                        column-width__column-2
                        column-height text
                        ${textClass}
                        `}
                    >
                      {findItem.deposit_withdrawal_name}
                    </div>
                    <div
                      className={`
                        column-width__column-3
                        column-height text
                        ${textClass}
                        `}
                    >
                      {findItem.deposit_withdrawal_type} : {TYPE_TEXT[findItem.deposit_withdrawal_type]}
                    </div>
                  </div>
                );
              }
            })}

            {/* row adds new */}
            {lastRow && (
              <div className="column-width row-deposit-withdraw row-style row-add-new">
                <div className="column-width__column-1 column-height">
                  <div className="padding-input">
                    <InputTextCustom
                      inputRef={inputCodeNewRef}
                      inputClassName={'search-table-deposit__input-text-custom'}
                      id={INPUT_ID.code__new}
                      name={INPUT_ID.code__new}
                      value={watch(INPUT_ID.code__new)}
                      onChange={(e: any) => setValue(INPUT_ID.code__new, e.target.value)}
                      type="number"
                      maxLength={MAX_LENGTH.code}
                      hasTrim={true}
                      checkLengthFullSize={true}
                    />
                  </div>
                </div>
                <div className="column-width__column-2 column-height">
                  <div className="padding-input">
                    <InputTextCustom
                      inputClassName={'search-table-deposit__input-text-custom'}
                      id={INPUT_ID.name__new}
                      name={INPUT_ID.name__new}
                      value={watch(INPUT_ID.name__new)}
                      onChange={(e: any) => setValue(INPUT_ID.name__new, e.target.value)}
                      maxLength={MAX_LENGTH.name}
                      type="text"
                      checkLengthFullSize={true}
                      hasTrim={true}
                    />
                  </div>
                </div>
                <div className="column-width__column-3 column-height">
                  <div className="padding-input">
                    <Dropdown
                      hasBlankItem={false}
                      items={LIST_TYPE}
                      disabled={false}
                      onChange={(e: any) => setValue('type__new', e.value)}
                      value={watch('type__new')}
                      id="type__new"
                      name="type__new"
                      onBlur={() => handleSelectRow({})}
                    />
                  </div>
                </div>
              </div>
            )}
          </FormProvider>
        )}
      </div>
    </div>
  );
};

export default TableDepositWithdraw;
