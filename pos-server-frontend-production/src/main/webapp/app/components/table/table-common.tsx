import { Translate } from 'react-jhipster';
import React, { Fragment, ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import './table-common.scss';
import { escapeHTML, isNullOrEmpty, localizeFormat, localizeString, parseBool } from 'app/helpers/utils';
import NumberInputText from 'app/components/input/input-text/number-input';
import { CheckBoxStyled } from 'app/components/radio-button/styled';
import _, { debounce } from 'lodash';
import { Popover } from 'bootstrap/dist/js/bootstrap.esm.min.js';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';

export enum OperationType {
  New = 1,
  Edit = 2,
  Remove = 3,
}

export interface TBodyBase {
  operation_type?: OperationType;
  operation_type_before?: OperationType;
  copy?: boolean;
}

export interface ColumnInputText {
  maxLength?: number;
  addZero?: boolean;
  suggest?: (value: string, index: number) => void;
}

export interface TableColumn<TBody = any> {
  title: string | ReactNode;
  width?: number;
  alignItem?: 'left' | 'center' | 'right';
  keyItem: keyof TBody;
  extraValue?: string;
  type?: 'text' | 'checkbox' | 'input' | 'button' | 'doubleInput';
  disable?: boolean;
  inputTextInput?: ColumnInputText;
  buttonInput?: { name?: string; onClick: (row: TBody, index: number) => void };
  isHiddenExtraValue?: boolean;
  formatFunction?: any;
  formatValue?: (value: string | number) => string;
}

export interface SelectedRow<TBody = any> {
  row?: TBody;
  index?: number;
}

interface TableCommonProps<TBody> {
  columns: TableColumn<TBody>[];
  bodyItems: TBody[];
  disableSelect?: boolean;
  selectedRow?: SelectedRow<TBody>;
  onSelectRow?: (row: SelectedRow) => void;
  actionDoubleClick?: (row: SelectedRow) => void;
  bodyItemChange?: (items: TBody[]) => void;
  maxLengthData?: number;
  totalCount?: number;
  width?: number;
  height?: number;
  canShowNoData?: boolean;
  maxHeightBodyTable?: string;
  formatFields?: string[];
  formatFuntion?: any;
}

const CellText = <TBody extends TBodyBase>({
  itemsBefore,
  index,
  item,
  isNewRow,
  column,
  formatFields,
}: {
  itemsBefore: TBody[];
  item: TBody;
  index: number;
  column: TableColumn;
  isNewRow: boolean;
  formatFields: string[];
}) => {
  let extraValue = '';
  if (!column.isHiddenExtraValue) {
    extraValue = column.extraValue
      ? ` ${column.extraValue}`
      : column.keyItem === 'store_code'
        ? `：${item['store_name']}`
        : '';
  }

  let beforeValue = null;
  let isEdit = false;
  let newValue = item[column.keyItem];
  const cellRef = useRef<HTMLDivElement>(null);

  if (!isNullOrEmpty(formatFields)) {
    if (formatFields.includes(column.keyItem as any)) {
      newValue = column?.formatFunction(newValue);
    }
  }
  useLayoutEffect(() => {
    const cellElement = cellRef.current;
    if (!cellElement) return;

    let isContentOverflowing = cellElement.scrollWidth > cellElement.clientWidth;
    if (isEdit && !isContentOverflowing) {
      const beforeItem = cellElement.children[0];
      isContentOverflowing = beforeItem?.scrollWidth > beforeItem?.clientWidth;
    }

    if (!isContentOverflowing) return;

    // eslint-disable-next-line no-new
    const popover = new Popover(cellRef.current, {
      customClass: 'custom-popover',
      trigger: 'hover',
      html: true,
      content: isEdit
        ? `<div>${escapeHTML(beforeValue)}${column.keyItem === 'store_code' ? `：${escapeHTML(itemsBefore?.[index]?.['store_name'])}` : ''}</div>
           <div>↓</div>
           <div>${escapeHTML(newValue)}${escapeHTML(extraValue)?.replace(/ /g, '\u00A0')}\`}</div>`
        : `<div>${escapeHTML(newValue)}${escapeHTML(extraValue)}</div>`,
    });

    const handleMouseLeave = () => {
      const elements = document.getElementsByClassName('custom-popover');
      Array.from(elements).forEach((element) => {
        element.remove();
      });
    };

    cellElement.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      popover?.dispose();
      cellElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  });

  if (item.operation_type === OperationType.Edit && index < itemsBefore?.length) {
    beforeValue = itemsBefore[index][column.keyItem] ?? '';
    // handle format value
    if (!isNullOrEmpty(formatFields) && formatFields.includes(column.keyItem as any)) {
      beforeValue = column?.formatFunction(beforeValue);
    }
    // Compare value
    isEdit = _.toString(newValue) !== _.toString(beforeValue);
  }

  return (
    <div
      className={`table-common__cell-text ${isNewRow || item.copy || isEdit ? 'table-common__red-text' : ''}`}
      ref={cellRef}
    >
      {isEdit && (
        <>
          <div className="table-common__edit-before-value">
            {column.formatValue
              ? column.formatValue(beforeValue)
              : beforeValue + (column.keyItem === 'store_code' ? `：${itemsBefore?.[index]?.['store_name']}` : '')}
          </div>
          <div>↓</div>
        </>
      )}
      {`${String(column.formatValue ? column.formatValue(newValue) : newValue ?? '')?.replace(/ /g, '\u00A0') ?? ''}${String(extraValue)?.replace(/ /g, '\u00A0')}`}
    </div>
  );
};

const CellCheckBox = (
  selected: boolean,
  indexRow: number,
  column: TableColumn,
  onChange: (keyItem: string | number | symbol, index: number) => void
) => {
  return (
    <div className="table-common__cell-data">
      <CheckBoxStyled
        type="checkbox"
        checked={selected}
        onChange={() => onChange(column.keyItem, indexRow)}
        disabled={column.disable}
        onClick={(event) => event.stopPropagation()}
      />{' '}
      {column.extraValue}
    </div>
  );
};

const CellInputText = ({
  value,
  indexRow,
  column,
  onChange,
  heightInput,
}: {
  value: string;
  indexRow: number;
  column: TableColumn;
  onChange: (keyItem: string | number | symbol, valueChanged: string, index: number) => void;
  heightInput?: string;
}) => {
  return (
    <NumberInputText
      value={value}
      disabled={column.disable}
      width="100%"
      addZero={column.inputTextInput?.addZero}
      maxLength={column.inputTextInput?.maxLength}
      focusOut={(valueChange) => {
        onChange(column.keyItem, valueChange, indexRow);
        column.inputTextInput?.suggest(valueChange, indexRow);
      }}
      className={'table-common-input'}
      borderRadius={0}
      marginBottom={0}
      backgroundColor={'while'}
      onDoubleClick={(event: any) => {
        event.stopPropagation();
      }}
      height={heightInput}
    />
  );
};

const CellButton = <TBody extends TBodyBase>(item: TBody, indexRow: number, column: TableColumn) => {
  return (
    <ButtonPrimary
      disabled={column.disable}
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

const TableCommon = <TBody extends TBodyBase>({
  columns,
  bodyItems,
  disableSelect,
  onSelectRow,
  actionDoubleClick,
  selectedRow,
  bodyItemChange,
  maxLengthData = 1000,
  totalCount,
  width = window.screen.width - 407, // Calculate default width table = width screen - padding left
  height = window.innerHeight - 176,
  canShowNoData = false,
  maxHeightBodyTable,
  formatFields,
}: TableCommonProps<TBody>) => {
  const [selectedRowState, setSelectedRow] = useState<SelectedRow | null>(selectedRow);
  const [itemsBefore, setItemsBefore] = useState<TBody[]>(bodyItems);
  const thRefs = useRef([]);
  const [widthColumns, setWidthColumns] = useState<number[]>([]);
  const limitRecord = (maxLengthData && totalCount && totalCount > maxLengthData) || false;
  const bodyRef = useRef<HTMLTableSectionElement>(null);

  useLayoutEffect(() => {
    const handleResize = debounce(() => {
      if (isNullOrEmpty(widthColumns)) {
        setWidthColumns(thRefs.current?.map((th) => th?.getBoundingClientRect().width));
      }
    }, 10);

    if (isNullOrEmpty(widthColumns)) {
      setWidthColumns(thRefs.current?.map((th) => th?.getBoundingClientRect().width));
    }

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!bodyItems?.some((item) => item.operation_type)) {
      setItemsBefore(bodyItems);
      return;
    }
    if (bodyItems?.length > itemsBefore?.length) {
      if (selectedRow) {
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

  const onChangeCheckboxAtIndex = (keyItem: string | number | symbol, index: number) => {
    const items = [...bodyItems];
    const value = items[index][keyItem];
    if (value === undefined || value === null) {
      items[index] = { ...items[index], [keyItem]: true };
      if (bodyItemChange) bodyItemChange(items);
    } else if (typeof value === 'boolean') {
      items[index] = { ...items[index], [keyItem]: !value };
      if (bodyItemChange) bodyItemChange(items);
    }
  };
  const onChangeInputText = (
    keyItem: string | number | symbol,
    valueChanged: string | number,
    index: string | number
  ) => {
    const items = [...bodyItems];
    items[index] = { ...items[index], [keyItem]: valueChanged };
    if (bodyItemChange) bodyItemChange(items);
  };

  return (
    <div className="table-common" style={{ height: `${height}px` }}>
      {limitRecord && (
        <div className={'table-common__message_warning'}>
          {localizeFormat('MSG_INFO_001', maxLengthData, maxLengthData)}
        </div>
      )}
      <div className="table-common__table-common-container">
        <table className={`table table-responsive ${bodyItems?.length > 0 && 'table-common__table-scroll'}`}>
          <thead className="table-common__table-header" /* style={{ width: `${width}px` }} */>
            <tr className={'table-common-row'}>
              {columns.map((column: TableColumn, index: number) => (
                <th
                  key={index}
                  scope="col"
                  style={{ width: `${column.width}%` }}
                  ref={(el) => (thRefs.current[index] = el)}
                >
                  {typeof column.title === 'string' ? <Translate contentKey={column.title} /> : column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className={`table-common__table-body ${bodyItems?.length > 0 && 'table-common__table-body-scroll'}`}
            ref={bodyRef}
            style={{
              maxHeight: maxHeightBodyTable
                ? maxHeightBodyTable
                : height -
                  (thRefs.current[0] ? thRefs.current[0].getBoundingClientRect().height : 0) -
                  (limitRecord ? 32 : 0) -
                  (window.innerWidth < window.screen.width ? 17 : 0),
            }}
          >
            {bodyItems?.length > 0 ? (
              <>
                {bodyItems?.map((item: TBody, indexRow: number) => {
                  const selected = selectedRowState?.index === indexRow;
                  const deleted = item.operation_type === OperationType.Remove;
                  const isNewRow =
                    item.operation_type === OperationType.New || item.operation_type_before === OperationType.New;
                  return (
                    <tr
                      key={indexRow}
                      onClick={() => handleSelectRow(item, indexRow)}
                      onDoubleClick={() => handleDoubleClickRow(item, indexRow)}
                      className={`table-common-row ${selected ? ' table-common__row-selected' : ''}${deleted ? ' record-remove' : ''}`}
                    >
                      {columns.map((column: TableColumn, indexColumn: number) => {
                        const alignCenter =
                          column.type === 'button' || column.type === 'input' || column.type === 'checkbox';
                        return (
                          <td
                            className="table-common__cell"
                            key={indexColumn}
                            style={{
                              justifyContent: column.alignItem ?? (alignCenter ? 'center' : 'left'),
                              width: `${widthColumns[indexColumn]}px`,
                            }}
                          >
                            {(() => {
                              switch (column.type) {
                                case 'text':
                                  break;
                                case 'checkbox':
                                  return CellCheckBox(
                                    parseBool(item[column.keyItem]),
                                    indexRow,
                                    column,
                                    onChangeCheckboxAtIndex
                                  );
                                case 'input':
                                  return (
                                    <CellInputText
                                      value={item?.[column.keyItem]}
                                      indexRow={indexRow}
                                      column={column}
                                      onChange={onChangeInputText}
                                      heightInput={'48px'}
                                    />
                                  );
                                case 'doubleInput':
                                  return (
                                    <>
                                      <CellInputText
                                        value={item[column.keyItem]}
                                        indexRow={indexRow}
                                        column={column}
                                        onChange={onChangeInputText}
                                        heightInput={'48px'}
                                      />
                                      <CellInputText
                                        value={item[column.keyItem]}
                                        indexRow={indexRow}
                                        column={column}
                                        onChange={onChangeInputText}
                                        heightInput={'48px'}
                                      />
                                    </>
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
                                      formatFields={formatFields}
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
                <tr className={'table-row_padding-bottom'}>
                  {columns.map((_value, indexColumn: number) => (
                    <td
                      key={indexColumn}
                      className="table-common__cell"
                      style={{
                        width: `${widthColumns[indexColumn]}px`,
                      }}
                    ></td>
                  ))}
                </tr>
              </>
            ) : (
              canShowNoData && <div className="table-common__no-data">{localizeString('MSG_ERR_001')}</div>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableCommon;
