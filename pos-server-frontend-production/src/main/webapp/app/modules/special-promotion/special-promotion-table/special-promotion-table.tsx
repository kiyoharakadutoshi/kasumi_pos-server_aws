import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './special-promotion-table.scss';
import { escapeHTML, formatNumber, localizeFormat, localizeString, parseBool } from 'app/helpers/utils';
import { debounce } from 'lodash';
import { Popover } from 'bootstrap/dist/js/bootstrap.esm.min.js';
import TooltipNumberInputText from 'app/components/input-text/tooltip-input-text/tooltip-number-input-text';
import TooltipDatePicker from 'app/components/date-picker/tooltip-date-picker/tooltip-date-picker';
import { convertDateServer, toShortDate } from 'app/helpers/date-utils';
import TooltipTimePicker, { ITimeProps } from 'app/components/time-picker/tooltip-time-picker/tooltip-time-picker';
import { SelectedRow, TableColumn, TableCommonProps, TBodyBase } from 'app/components/table/table-data/interface-table';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import ModalCommon, { IModalType } from 'app/components/modal/modal-common';
import CheckboxButton from '@/components/checkbox-button/checkbox-button';
import InputText from 'app/components/input-text/input-text';
import { OperationType } from 'app/components/table/table-common';

const createErrorMessage = (keyItem: any, error?: string, className?: string) => {
  return error?.length > 0 ? localizeFormat(error, keyError(keyItem, className)) : null;
};
const keyError = (keyItem: any, className?: string) => `${className ? `${className}.` : ''}${keyItem.toString()}`;

const CellText = <TBody extends TBodyBase>({
  item,
  column,
}: {
  itemsBefore: TBody[];
  item: TBody;
  index: number;
  column: TableColumn;
  isNewRow: boolean;
  error?: string;
}) => {
  const extraValue = column.extraValue ? ` ${column.extraValue}` : column.keyItem === 'store_code' ? `: ${item['store_name']}` : '';
  const newValue =
    column.mappingValue && typeof column.mappingValue === 'object'
      ? column.mappingValue[item[column.keyItem]] ?? ''
      : item[column.keyItem] ?? '';
  const cellRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const cellElement = cellRef.current;
    if (cellElement) {
      const isContentOverflowing = cellElement.scrollWidth > cellElement.clientWidth;
      if (isContentOverflowing) {
        // eslint-disable-next-line no-new
        new Popover(cellRef.current, {
          customClass: 'custom-popover',
          trigger: 'hover',
          html: true,
          content: `<div>${escapeHTML(newValue)}</div>`,
        });
        const handleMouseLeave = () => {
          const elements = document.getElementsByClassName('custom-popover');
          Array.from(elements).forEach(element => {
            element.remove();
          });
        };

        cellElement.addEventListener('mouseleave', handleMouseLeave);
        return () => {
          cellElement.removeEventListener('mouseleave', handleMouseLeave);
        };
      }
    }
  }, [item]);

  return (
    <div
      className={`promotion-table__cell-text ${column.checkError && item.isError ? 'promotion-table__red-text' : ''}`.trim()}
      ref={cellRef}
    >
      {`${column.formatNumber ? formatNumber(newValue, 0) : newValue} ${extraValue}`}
    </div>
  );
};

const CellCheckBox = (
  selected: boolean,
  indexRow: number,
  column: TableColumn,
  onChange: (keyItem: string | number | symbol, index: number) => void,
  recordId?: any
) => {
  const cellConfig = column?.cell?.(column.keyItem, indexRow);

  return (
    <div className="promotion-table__cell-data">
      <CheckboxButton
        checked={selected}
        disabled={
          column.disabled ||
          (!recordId && column.inputTextProps?.disabledIfHasRecordId) ||
          cellConfig?.disabled
        }
        onChange={() => {
          onChange(column.keyItem, indexRow);
        }}
      />
      {column.extraValue}
    </div>
  );
};

const CellInputText = (
  value: string,
  indexRow: number,
  column: TableColumn,
  onChange: (keyItem: string | number | symbol, valueChanged: string, index: number) => void,
  id?: number,
  error?: string,
  errorClassName?: string,
) => {
  const cellConfig = column?.cell?.(column.keyItem, indexRow);
  if (column.inputTextProps?.type === 'text') {
    return (
      <InputText
        value={value}
        width={column.inputTextProps?.width}
        maxLength={column.inputTextProps?.maxLength}
        disabled={column.disabled || (id != null && column.inputTextProps?.disabledIfHasRecordId) || cellConfig?.disabled}
        onChange={event => {
          if (onChange) onChange(column.keyItem, event.target.value, indexRow);
        }}
        onDoubleClick={(event: any) => {
          event.stopPropagation();
        }}
        errorValue={createErrorMessage(column.keyItem, error, errorClassName)}
      />
    );
  }

  return (
    <TooltipNumberInputText
      value={value}
      textAlign={column.inputTextProps?.textAlign}
      disabled={column.disabled || (id != null && column.inputTextProps?.disabledIfHasRecordId) || cellConfig?.disabled}
      width={column.inputTextProps?.width}
      minValue={column.inputTextProps?.minValue}
      maxValue={column.inputTextProps?.maxValue}
      addZero={column.inputTextProps?.addZero}
      maxLength={column.inputTextProps?.maxLength}
      thousandSeparator={column.inputTextProps?.thousandSeparator}
      focusOut={valueChange => {
        if (onChange) onChange(column.keyItem, valueChange, indexRow);
        if (column?.inputTextProps?.focusOut) column.inputTextProps?.focusOut(valueChange, indexRow);
      }}
      onDoubleClick={(event: any) => {
        event.stopPropagation();
      }}
      error={createErrorMessage(column.keyItem, error, errorClassName)}
    />
  );
};

const CellDoubleInputText = (
  value: string,
  indexRow: number,
  column: TableColumn,
  onChange: (keyItem: string | number | symbol, valueChanged: string, index: number) => void,
  id?: number,
  error?: string,
  errorClassName?: string,
) => {
  let value1 = value?.length === 2 ? value?.substring(0, 2) : '';
  if (value?.length >= 8) {
    value1 = value.substring(value.length - 8, value.length - 6);
  }
  const value2 = value?.length >= 6 ? value?.slice(-6) : '';
  const disabled = column.disabled || (id != null && column.inputTextProps?.disabledIfHasRecordId);
  const cellConfig = column?.cell?.(column.keyItem, indexRow);

  return (
    <div
      className={`promotion-table__double-input-text ${disabled ? 'promotion-table__double-input-text-disabled' : ''}`}
      style={{ width: column.inputTextProps?.width ?? '100%' }}
    >
      <TooltipNumberInputText
        className="double-input-text1"
        value={value1}
        textAlign={column.inputTextProps?.textAlign}
        disabled={disabled || cellConfig?.disabled}
        width="30%"
        minValue={column.inputTextProps?.minValue}
        maxValue={column.inputTextProps?.maxValue}
        addZero={column.inputTextProps?.addZero}
        thousandSeparator={column.inputTextProps?.thousandSeparator}
        maxLength={2}
        focusOut={valueChange => {
          const newValue = valueChange + (value2 ?? '');
          if (onChange) onChange(column.keyItem, newValue, indexRow);
          if (column?.inputTextProps?.focusOut) column.inputTextProps?.focusOut(newValue, indexRow);
        }}
        onDoubleClick={(event: any) => {
          event.stopPropagation();
        }}
        error={createErrorMessage(column.keyItem, error, errorClassName)}
      />
      <TooltipNumberInputText
        className="double-input-text2"
        value={value2}
        textAlign={column.inputTextProps?.textAlign}
        disabled={disabled || cellConfig?.disabled}
        width="70%"
        minValue={column.inputTextProps?.minValue}
        maxValue={column.inputTextProps?.maxValue}
        addZero={column.inputTextProps?.addZero}
        thousandSeparator={column.inputTextProps?.thousandSeparator}
        maxLength={6}
        focusOut={valueChange => {
          const newValue = (value1 ?? '') + valueChange;
          if (onChange) onChange(column.keyItem, newValue, indexRow);
          if (column?.inputTextProps?.focusOut) column.inputTextProps?.focusOut(newValue, indexRow);
        }}
        onDoubleClick={(event: any) => {
          event.stopPropagation();
        }}
        error={createErrorMessage(column.keyItem, error, errorClassName)}
      />
    </div>
  );
};

const CellButton = <TBody extends TBodyBase>(item: TBody, indexRow: number, column: TableColumn) => {
  const cellConfig = column?.cell?.(column.keyItem, indexRow);
  return (
    <ButtonPrimary
      className={'promotion-table__cell-button'}
      disabled={column.disabled || cellConfig?.disabled}
      text={column.buttonInput?.name ?? 'action.select'}
      onClick={(event: any) => {
        event.stopPropagation();
        column.buttonInput?.onClick(item, indexRow);
      }}
      onDoubleClick={(event: any) => {
        event.stopPropagation();
      }}
    />
  );
};

const CellTimePicker = (
  value: string,
  indexRow: number,
  column: TableColumn,
  onChange: (keyItem: string | number | symbol, valueChanged: string, index: number) => void,
  checkEmpty?: boolean,
  reload?: any,
  error?: string,
  errorClassName?: string,
) => {
  const cellConfig = column?.cell?.(column.keyItem, indexRow);

  return (
    <TooltipTimePicker
      hasInitValue={false}
      initValue={value}
      isPopover={true}
      disabled={column.disabled || cellConfig?.disabled}
      onChange={(_time: ITimeProps, timeStr: string) => onChange(column.keyItem, timeStr, indexRow)}
      checkEmpty={checkEmpty}
      reload={reload}
      error={createErrorMessage(column.keyItem, error, errorClassName)}
      keyError={keyError(column.keyItem, errorClassName)}
    />
  );
};

const CellDatePicker = (
  value: string,
  indexRow: number,
  column: TableColumn,
  onChange: (keyItem: string | number | symbol, valueChanged: string, index: number) => void,
  checkEmpty?: boolean,
  reload?: any,
  error?: string,
  errorClassName?: string,
) => {
  const cellConfig = column?.cell?.(column.keyItem, indexRow);
  return (
    <TooltipDatePicker
      hasInitValue={false}
      isPopover={true}
      pickerClassName={column.keyItem.toString()}
      initValue={toShortDate(value)}
      onChange={(date: Date) => onChange(column.keyItem, convertDateServer(date), indexRow)}
      isShortDate={true}
      disabled={column.disabled || cellConfig?.disabled}
      checkEmpty={checkEmpty}
      reload={reload}
      error={createErrorMessage(column.keyItem, error, errorClassName)}
      keyError={keyError(column.keyItem, errorClassName)}
    />
  );
};

const SpecialPromotionTable = <TBody extends TBodyBase>({
  columns,
  bodyItems,
  disableSelect,
  onSelectRow,
  actionDoubleClick,
  selectedRow,
  bodyItemChange,
  maxLengthData = 1000,
  isExceedRecords,
  canShowNoData = false,
  reload,
  errorItems = null,
  errorClassName,
  sort,
}: TableCommonProps<TBody>) => {
  const [selectedRowState, setSelectedRow] = useState<SelectedRow | null>(selectedRow);
  const [itemsBefore, setItemsBefore] = useState<TBody[]>(bodyItems);
  const thRefs = useRef([]);
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);
  const [columnDirtyCheck, setColumnDirtyCheck] = useState(null);
  const hasData = bodyItems?.some(item => item.record_id);

  useLayoutEffect(() => {
    const handleResize = debounce(() => {
      if (scrollRef.current) {
        const element = scrollRef.current;
        const hasVerticalScroll = element.scrollHeight > element.clientHeight;
        const hasHorizontalScroll = element.scrollWidth > element.clientWidth;
        setHasScroll(hasVerticalScroll || hasHorizontalScroll);
      }
    }, 10);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!bodyItems?.some(item => item.operation_type)) {
      setItemsBefore(bodyItems);
      return;
    }
    if (bodyItems?.length > itemsBefore?.length) {
      if (selectedRowState) {
        const index = selectedRowState.index + bodyItems?.length - itemsBefore?.length;
        const row = { ...selectedRow, index };
        setSelectedRow(row);
        onSelectRow(row);
      }
      setItemsBefore(bodyItems?.slice(0, bodyItems?.length - itemsBefore?.length).concat(itemsBefore));
      if (bodyRef.current) {
        bodyRef.current.scrollTop = 0;
      }
    }
  }, [bodyItems]);

  useEffect(() => {
    if (disableSelect) {
      return;
    }
    setSelectedRow(selectedRow);
  }, [selectedRow]);

  const handleSelectRow = (row: TBody, index: number) => {
    if (disableSelect) {
      return;
    }

    setSelectedRow({ row, index });
    if (onSelectRow) {
      onSelectRow({ row, index });
    }
  };

  const handleDoubleClickRow = (row: TBody, index: number) => {
    if (actionDoubleClick) {
      actionDoubleClick({ row, index });
    }
  };

  const onChangeCheckboxAtIndex = (keyItem: keyof TBody, index: number) => {
    const item = bodyItems[index];
    const value = item[keyItem];
    if (value === undefined || value === null) {
      if (bodyItemChange) bodyItemChange(keyItem, true, index);
    } else if (typeof value === 'boolean') {
      if (bodyItemChange) bodyItemChange(keyItem, !value, index);
    }
  };

  const onChangeInputText = (keyItem: keyof TBody, valueChanged: string | ITimeProps, index: number) => {
    if (bodyItemChange) bodyItemChange(keyItem, valueChanged, index);
  };

  const classNameIcon = (key: string | number | symbol) => {
    let className = 'promotion-table__icon-sort';

    if (sort?.key === key) {
      className += ' promotion-table__icon-sort-current';

      if (sort.type === 'DESC') {
        className += ' promotion-table__icon-sort-desc';
      }
    }

    return className;
  };

  const actionDirtyCheck = (column: TableColumn) => {
    if (bodyItems.some(item => item.operation_type)) {
      setColumnDirtyCheck(column);
      return;
    }

    actionSort(column);
  };

  const onclickOKDirtyCheck = () => {
    actionSort(columnDirtyCheck);
    setColumnDirtyCheck(null);
  };

  const actionSort = (column: TableColumn) => {
    column?.actionSort(column.keyItem, (sort.key === column.keyItem && sort?.type) === 'ASC' ? 'DESC' : 'ASC');
  };

  return (
    <div className="promotion-table">
      <ModalCommon
        modalInfo={{
          type: IModalType.confirm,
          isShow: columnDirtyCheck !== null,
          message: localizeString('MSG_CONFIRM_002'),
        }}
        handleOK={onclickOKDirtyCheck}
        handleClose={() => setColumnDirtyCheck(null)}
      />
      {isExceedRecords && (
        <div className={'promotion-table__message_warning'}>{localizeFormat('MSG_INFO_001', maxLengthData, maxLengthData)}</div>
      )}
      <div className="promotion-table__promotion-table-container">
        <div
          className={`promotion-table__table-main-header-wrapper ${hasScroll ? 'promotion-table__table-header-scroll' : 'promotion-table__table-header'}`}
        >
          <table className={`table table-responsive promotion-table__table-main-header`}>
            <thead className="promotion-table__table-header">
              <tr>
                {columns.map((column: TableColumn, index: number) => (
                  <th
                    key={index}
                    scope="col"
                    ref={el => (thRefs.current[index] = el)}
                    style={{ width: column.width }}
                    className={`${column.keyItem.toString()}${column.extraClassName?.length > 0 ? `-${column.extraClassName}` : ''}`}
                  >
                    {typeof column.title === 'string' ? localizeString(column.title) : column.title}
                    {column.actionSort && hasData && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 16 16"
                        className={classNameIcon(column.keyItem)}
                        onClick={() => actionDirtyCheck(column)}
                      >
                        <path
                          d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"
                          className="promotion-table__icon-sort-path"
                        />
                      </svg>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>
        <div ref={scrollRef} className="table table-responsive promotion-table__table-scroll">
          <table className="promotion-table__table-main-body">
            <tbody
              className={`promotion-table__table-body ${bodyItems?.length > 0 ? 'promotion-table__table-body-scroll' : 'promotion-table__table-body-empty'}`}
              ref={bodyRef}
            >
              {bodyItems?.length > 0 ? (
                <>
                  {bodyItems?.map((item: TBody, indexRow: number) => {
                    const selected = selectedRowState?.index === indexRow;
                    const deleted = item.operation_type === OperationType.Remove;
                    const isNewRow = item.operation_type === OperationType.New || item.operation_type_before === OperationType.New;
                    const errorItem = errorItems ? errorItems[indexRow] : null;
                    return (
                      <tr
                        key={indexRow}
                        onClick={() => handleSelectRow(item, indexRow)}
                        onDoubleClick={() => handleDoubleClickRow(item, indexRow)}
                        className={`promotion-table__row-data ${selected ? ' promotion-table__row-selected' : ''}${deleted ? ' record-remove' : ''}`}
                      >
                        {columns.map((column: TableColumn, indexColumn: number) => {
                          const alignCenter = column.type === 'button' || column.type === 'input' || column.type === 'checkbox';
                          const error = errorItem ? errorItem[column.keyItem] : null;
                          return (
                            <td
                              className={`promotion-table__cell ${column.keyItem.toString()}${column.extraClassName?.length > 0 ? `-${column.extraClassName}` : ''}`}
                              key={indexColumn}
                              style={{
                                textAlign: column.alignItem ?? (alignCenter ? 'center' : 'left'),
                                width: column.width,
                              }}
                            >
                              {(() => {
                                switch (column.type) {
                                  case 'checkbox':
                                    return CellCheckBox(parseBool(item[column.keyItem]), indexRow, column, onChangeCheckboxAtIndex, item.record_id);
                                  case 'input':
                                    return CellInputText(
                                      item[column.keyItem],
                                      indexRow,
                                      column,
                                      onChangeInputText,
                                      item.record_id,
                                      error,
                                      errorClassName,
                                    );
                                  case 'doubleInput':
                                    return CellDoubleInputText(
                                      item[column.keyItem],
                                      indexRow,
                                      column,
                                      onChangeInputText,
                                      item.record_id,
                                      error,
                                      errorClassName,
                                    );
                                  case 'date':
                                    return CellDatePicker(
                                      item[column.keyItem],
                                      indexRow,
                                      column,
                                      onChangeInputText,
                                      item.record_id != null,
                                      reload,
                                      error,
                                      errorClassName,
                                    );
                                  case 'time':
                                    return CellTimePicker(
                                      item[column.keyItem],
                                      indexRow,
                                      column,
                                      onChangeInputText,
                                      item.record_id != null,
                                      reload,
                                      error,
                                      errorClassName,
                                    );
                                  case 'button':
                                    return CellButton(item, indexRow, column);
                                  default:
                                    return (
                                      <CellText
                                        column={column}
                                        item={item}
                                        itemsBefore={itemsBefore}
                                        isNewRow={isNewRow}
                                        index={indexRow}
                                      />
                                    );
                                }
                              })()}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </>
              ) : (
                canShowNoData && <div className="promotion-table__no-data">{localizeString('MSG_ERR_001')}</div>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SpecialPromotionTable;
