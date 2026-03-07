import './table-data.scss';
import React, { Fragment, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  CellContext,
  Column,
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  Row,
  useReactTable,
} from '@tanstack/react-table';
import { OperationType } from 'app/components/table/table-common';
import ModalCommon, { IModalType } from 'app/components/modal/modal-common';
import {
  blurInputWithTimeout,
  formatNumber,
  isEqual,
  isNullOrEmpty,
  localizeFormat,
  localizeString,
} from 'app/helpers/utils';
import _, { debounce, isNaN } from 'lodash';
import PopoverText, { PopoverTextControl } from 'app/components/popover/popover';
import { ColumnInputText, ExtendedCSSProperties, TSortType } from 'app/components/table/table-data/interface-table';
import { Property } from 'csstype';
import CheckboxControl from 'app/components/checkbox-button/checkbox-control';
import TooltipNumberInputTextControl from 'app/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import { ValidationRule, useFormContext } from 'react-hook-form';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import TooltipDatePickerControl from 'app/components/date-picker/tooltip-date-picker/tooltip-date-picker-control';
import TooltipTimePickerControl from 'app/components/time-picker/tooltip-time-picker/tooltip-time-picker-control';
import { Virtuoso } from 'react-virtuoso';
import { convertDateServer } from 'app/helpers/date-utils';
import InputTextControl from 'app/components/input-text/input-text-control';
import { KeyboardViewContext } from 'app/components/keyboard-navigation/keyboard-navigation';
import { Placement } from 'react-bootstrap/types';
import { KEYDOWN } from 'app/constants/constants';
import RadioToggleControl from '@/components/control-form/radio-toggle-control';
import SelectControl from '@/components/control-form/select-control';
import { IDropDownItem } from '@/components/dropdown/dropdown';

type TCellType =
  | 'text'
  | 'checkbox'
  | 'checkbox-expanding'
  | 'radio-expanding'
  | 'inputText'
  | 'inputNumber'
  | 'product'
  | 'button'
  | 'date'
  | 'time'
  | 'drop-down';

export interface RowBase extends Record<string, any> {
  operation_type?: OperationType;
  operation_type_before?: OperationType;
  copy?: boolean;
  record_id?: number;
}

export type IColumnDefTemplate<TProps extends object> = (
  props: TProps,
  defaultValue?: any
) => {
  disabled?: boolean;
  required?: boolean;
  pattern?: ValidationRule<RegExp>;
  value?: string;
  defaultValue?: string;
  // List value for drop-down
  valueDropDown?: IDropDownItem[];
  isHidden?: boolean;
};

type ExtendedColumnDef<T> = ColumnDef<T> & {
  accessorKey?: keyof T;
};

export interface TableDataProps<TRow extends RowBase> {
  columns: TableColumnDef<TRow>[];
  data: TRow[];
  tableType?: 'view' | 'edit';
  sort?: { key: keyof TRow; type: TSortType };
  maxLengthData?: number;
  isExceedRecords?: boolean;
  multiRowSelection?: boolean;
  enableSelectRow?: boolean;
  errorItems?: any[];
  tableKey?: string;
  onClickRow?: (row: TRow, index: number) => void;
  onDoubleClick?: (row: TRow, index: number) => void;
  showNoData?: boolean;
  defaultData?: TRow[];
  rowConfig?: (row: Row<TRow>) => { className?: string };
  actionFooter?: () => void;
  fieldSelectedRowsName?: string;
  changeStyleByRow?: (row: Row<TRow>, cell: ColumnDef<TRow>) => ExtendedCSSProperties;
  resetExpanded?: boolean;
  autoSelectedRow?: number | null;
  showNoDataNameForm?: string;
  valueIncreaseViewport?: number;
  isCalculateHeightTable?: boolean;
  selectedIndexRows?: number[];
  disableSingleRecordPadding?:boolean // Remove bottom padding when the table has only one record
}

export interface IColumnDef<TRow extends RowBase> {
  type?: TCellType;
  disabled?: boolean;
  inputTextProps?: ColumnInputText;
  buttonInput?: { name?: string; onClick: (row: TRow, index: number) => void };
  checkError?: boolean;
  actionSort?: (keyItem: keyof TRow, type: TSortType) => void;
  textAlign: Property.TextAlign | undefined;
  operationTypeKeyChange?: boolean;
  option: IColumnDefTemplate<CellContext<TRow, unknown>>;
  formatNumber?: boolean;
  numberFractionDigits?: number;
  useNameForm?: boolean;
  fixedDigit?: boolean;
  mappingContent?: (value: any) => string | number;
}

export type TableColumnDef<TRow extends RowBase> = ColumnDef<TRow> | IColumnDef<TRow>;

const createErrorMessage = (keyItem: any, error?: string, parentKey?: string) => {
  return error?.length > 0 ? localizeFormat(error, keyError(keyItem, parentKey)) : null;
};
const keyError = (keyItem: any, parentKey?: string) => `${parentKey ? `${parentKey}.` : ''}${keyItem.toString()}`;

export const nameParam = <TRow extends RowBase>(info: CellContext<TRow, string>, tableKey?: string) =>
  `${tableKey ?? ''}[${info.row?.index}].${info.column?.id}`;

const nameParamWithIndex = (index: number, tableKey?: string, key?: any) => `${tableKey ?? ''}[${index}].${key}`;

const CellText = <TRow extends RowBase>({
  valueDefault,
  row,
  value,
  formatedNumber,
  textAlign,
  numberFractionDigits,
  useForm,
  name,
  type,
  fixedDigit,
}: {
  valueDefault: any;
  value: any;
  row: TRow;
  formatedNumber?: boolean;
  textAlign?: any;
  numberFractionDigits?: number;
  useForm?: boolean;
  name?: string;
  type: 'view' | 'edit';
  fixedDigit?: boolean;
}) => {
  const isEdit =
    (row?.operation_type === OperationType.Edit || row?.operation_type_before === OperationType.Edit) &&
    _.toString(value) !== _.toString(valueDefault);

  if (isEdit && type !== 'edit')
    return (
      <PopoverText
        classNameText="table-data__edit-text"
        lineLimit={3}
        height={null}
        style={{ textAlign }}
        textAlign={textAlign}
        lineHeight={null}
        text={
          <Fragment>
            {formatedNumber ? formatNumber(valueDefault, numberFractionDigits, fixedDigit) : valueDefault}
            <br />↓<br />
            {formatedNumber ? formatNumber(value, numberFractionDigits, fixedDigit) : value}
          </Fragment>
        }
      />
    );

  if (useForm) {
    return (
      <PopoverTextControl name={name} formatedNumber={formatedNumber} textAlign={textAlign} hasBackground={false} />
    );
  }

  return (
    <PopoverText
      lineHeight={null}
      textAlign={textAlign}
      text={formatedNumber ? formatNumber(value, numberFractionDigits, fixedDigit) : value}
      lineLimit={1}
      height={null}
    />
  );
};

const CellProductInputText = <TRow extends RowBase>({
  info,
  error,
  tableKey,
  placement,
}: {
  info: CellContext<TRow, string>;
  error?: string;
  tableKey?: string;
  placement?: Placement;
}) => {
  const value = info.cell.getValue();
  let groupCode = value?.length === 2 ? value?.substring(0, 2) : '';
  if (value?.length >= 8) {
    groupCode = value.substring(value.length - 8, value.length - 6);
  }
  const productCode = value?.length >= 6 ? value?.slice(-6) : '';
  const column: IColumnDef<TRow> = info.column.columnDef as unknown as IColumnDef<TRow>;
  const disabled =
    column.disabled || (info.row?.original.record_id != null && column.inputTextProps?.disabledIfHasRecordId);

  const handleSuggest = (groupValue?: string, productValue?: string) => {
    column?.inputTextProps?.focusOut?.(`${groupValue}${productValue}`, info.row?.index);
  };

  return (
    <div
      className={`table-data__double-input-text ${disabled ? 'table-data__double-input-text-disabled' : ''}`}
      style={{ width: column.inputTextProps?.width ?? '100%' }}
    >
      <TooltipNumberInputTextControl
        className="double-input-text1"
        textAlign={column.inputTextProps?.textAlign}
        disabled={disabled}
        width="30%"
        minValue={column.inputTextProps?.minValue}
        maxValue={column.inputTextProps?.maxValue}
        addZero={true}
        thousandSeparator={column.inputTextProps?.thousandSeparator}
        maxLength={2}
        focusOut={(data) => handleSuggest(data, productCode)}
        onDoubleClick={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        error={createErrorMessage(info.column?.id, error, tableKey)}
        name={`${tableKey ?? ''}[${info.row?.index}].group_code`}
        errorPlacement={placement}
        focusOutWhenTabEnter={column.inputTextProps?.focusOutWhenTabEnter}
        onMaxLength={() => blurInputWithTimeout(column.inputTextProps?.focusOutWhenMaxLength)}
        onMaxLengthInputTable={(val) => {
          if (column.inputTextProps?.onMaxLengthInputTable) {
            column.inputTextProps?.onMaxLengthInputTable(val, info.row?.index);
            return;
          }
          if (column.inputTextProps?.onMaxLengthProductFirstInput) {
            column.inputTextProps?.onMaxLengthProductFirstInput(val, info.row?.index);
          }
        }}
        focusOutWhenDataNotChanged={column.inputTextProps?.focusOutWhenDataNotChanged}
        allowLeadingZeros={column.inputTextProps?.allowLeadingZeros}
      />
      <TooltipNumberInputTextControl
        className="double-input-text2"
        textAlign={column.inputTextProps?.textAlign}
        disabled={disabled}
        width="70%"
        // value={productCode}
        minValue={column.inputTextProps?.minValue}
        maxValue={column.inputTextProps?.maxValue}
        addZero={true}
        thousandSeparator={column.inputTextProps?.thousandSeparator}
        maxLength={6}
        focusOut={(data) => handleSuggest(groupCode, data)}
        onDoubleClick={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        error={createErrorMessage(info.column?.id, error, tableKey)}
        name={`${tableKey ?? ''}[${info.row?.index}].product_code`}
        errorPlacement={placement}
        focusOutWhenTabEnter={column.inputTextProps?.focusOutWhenTabEnter}
        onMaxLength={() => blurInputWithTimeout(column.inputTextProps?.focusOutWhenMaxLength)}
        onMaxLengthInputTable={(val) => {
          if (column.inputTextProps?.onMaxLengthInputTable) {
            column.inputTextProps?.onMaxLengthInputTable(val, info.row?.index);
            return;
          }
          if (column.inputTextProps?.onMaxLengthProductSecondInput) {
            column.inputTextProps?.onMaxLengthProductSecondInput(val, info.row?.index);
          }
        }}
        focusOutWhenDataNotChanged={column.inputTextProps?.focusOutWhenDataNotChanged}
        allowLeadingZeros={column.inputTextProps?.allowLeadingZeros}
      />
    </div>
  );
};

export const SELECTED_ROW_FORM_CONTROL = 'selectedRows';

const TableData = <TRow extends RowBase>(props: TableDataProps<TRow>) => {
  const { fieldSelectedRowsName = SELECTED_ROW_FORM_CONTROL } = props;
  const [dataDefault, setDataDefault] = useState<TRow[]>(props.defaultData);
  const bodyRef = useRef<HTMLTableSectionElement>(null);
  const [columnDirtyCheck, setColumnDirtyCheck] = useState(null);
  const hasData = props.data?.length > 0;
  const maxLengthData = props.maxLengthData ?? 1000;
  const { setValue, getValues, watch } = useFormContext();
  const [hasScroll, setHasScroll] = useState(false);
  const { setKeyboardListener, topView } = useContext(KeyboardViewContext);
  const selectedRowsForm = getValues(fieldSelectedRowsName);
  const enableSelectRow = props.enableSelectRow ?? true;
  const { changeStyleByRow = () => ({}) as ExtendedCSSProperties } = props;

  useEffect(() => {
    if (isNullOrEmpty(selectedRowsForm)) {
      table.resetRowSelection();
    }
  }, [watch(fieldSelectedRowsName)]);

  /**
   * useEffect: Handle when table has 1 record, click out to reset selected row
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (props.enableSelectRow === false) return;
      if (isNullOrEmpty(props.data) || props.data?.length > 1) return;

      const element = event.target as HTMLElement;
      if (
        element.tagName === 'svg' ||
        (typeof element?.className?.includes === 'function' && element?.className?.includes('btn-primary'))
      )
        return;
      if (topView.type !== 'main') return;

      const bodyTable = document.querySelector('[data-index="0"]');

      if (!bodyTable?.contains(event.target as Node)) {
        if (!isNullOrEmpty(getValues(fieldSelectedRowsName))) {
          table.resetRowSelection();
          setValue(fieldSelectedRowsName, null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [props.data?.length, topView]);

  useLayoutEffect(() => {
    const handleResize = debounce(() => {
      const element = document.querySelector('.table-scroll');
      if (!element) return;
      const hasVerticalScroll = element.scrollHeight > element.clientHeight;
      const hasHorizontalScroll = element.scrollWidth > element.clientWidth;
      setHasScroll(hasVerticalScroll || hasHorizontalScroll);
    }, 10);
    setTimeout(() => {
      handleResize();
    }, 50);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [props.data]);

  useEffect(() => {
    setDataDefault(props.defaultData);
  }, [props.defaultData]);

  const columns = useMemo(() => {
    return props.columns?.map((column) => {
      const type: TCellType = column['type'];
      if (isNullOrEmpty(type)) return column;
      column['cell'] = (info: CellContext<TRow, string>) => {
        const columnTable: IColumnDef<TRow> = info?.column?.columnDef as unknown as IColumnDef<TRow>;
        const option = columnTable?.option?.(info, dataDefault?.[info?.row?.index]);
        switch (type) {
          case 'text': {
            const record = dataDefault?.[info?.row?.index];
            const valueForm = getValues(nameParam(info, props.tableKey));
            return (
              <CellText
                value={option?.value ?? info.getValue() ?? info.cell?.getValue() ?? valueForm}
                valueDefault={option?.defaultValue ?? record?.[info.cell.column.id]}
                row={info?.row?.original}
                formatedNumber={columnTable?.formatNumber}
                textAlign={columnTable?.textAlign}
                numberFractionDigits={columnTable?.numberFractionDigits}
                name={nameParam(info, props.tableKey)}
                useForm={columnTable?.useNameForm}
                type={props.tableType}
                fixedDigit={columnTable?.fixedDigit}
              />
            );
          }
          case 'checkbox':
            return (
              <CheckboxControl
                name={nameParam(info, props.tableKey)}
                onChangeFunc={(event) => {
                  dataInputChange(info.column.id, event.target.checked, info.row?.index);
                }}
                disabled={columnTable?.disabled || option?.disabled}
              />
            );
          case 'checkbox-expanding': {
            const listIndex = info.row?.id?.split('.').map((value) => Number(value));
            let name = `${props.tableKey}[${listIndex[0]}]`;
            listIndex?.shift();
            while (listIndex?.length > 0) {
              name += `.subRows[${listIndex[0]}]`;
              listIndex?.shift();
            }
            name += '.choice';

            const fillData = (subRows: any[], nameForm: string) => {
              if (subRows) {
                const isSelected = getValues(name);
                const nameData = nameForm.replace('.choice', '');
                subRows.forEach((item, index) => {
                  setValue(`${nameData}.subRows[${index}].choice`, isSelected);
                  fillData(item?.subRows, `${nameData}.subRows[${index}].choice`);
                });
              }
            };

            const fillParentData = (nameChild?: string) => {
              const isSelected = getValues(nameChild);
              if (!nameChild?.includes('.subRows')) {
                // case parent level 1 does not have subRows
                setValue(nameChild, isSelected);
                return;
              }
              const parentName = nameChild.replace(/\.subRows\[\d+]\.choice$/, '');

              if (!isSelected) {
                setValue(`${parentName}.choice`, false);
                if (!parentName?.includes('subRows')) return;
                fillParentData(`${parentName}.choice`);
                return;
              }

              const parent = getValues(parentName);
              if (parent?.subRows?.every((row) => row?.choice)) {
                setValue(`${parentName}.choice`, true);
                if (!parentName?.includes('subRows')) return;
                fillParentData(`${parentName}.choice`);
              }
            };

            return (
              <CheckboxControl
                onChange={() => {
                  fillData(info.row?.original?.subRows, name);
                  fillParentData(name);
                }}
                name={name}
                disabled={columnTable?.disabled || option?.disabled}
              />
            );
          }
          case 'radio-expanding': {
            const listIndex = info.row?.id?.split('.').map((value) => Number(value));
            let name = `${props.tableKey}[${listIndex[0]}]`;
            listIndex?.shift();
            while (listIndex?.length > 0) {
              name += `.subRows[${listIndex[0]}]`;
              listIndex?.shift();
            }
            name += '.avaliable_status';

            const fillData = (subRows: any[], nameForm: string) => {
              if (subRows) {
                const isSelected = getValues(name);
                const nameData = nameForm.replace('.avaliable_status', '');
                subRows.forEach((item, index) => {
                  setValue(`${nameData}.subRows[${index}].avaliable_status`, isSelected);
                  fillData(item?.subRows, `${nameData}.subRows[${index}].avaliable_status`);
                });
              }
            };

            const fillParentData = (nameChild?: string) => {
              const isSelected = getValues(nameChild);
              if (!nameChild?.includes('.subRows')) {
                // case parent level 1 does not have subRows
                setValue(nameChild, isSelected);
                return;
              }
              const parentName = nameChild.replace(/\.subRows\[\d+]\.avaliable_status$/, '');

              if (!isSelected) {
                setValue(`${parentName}.avaliable_status`, false);
                if (!parentName?.includes('subRows')) return;
                fillParentData(`${parentName}.avaliable_status`);
                return;
              }

              const parent = getValues(parentName);
              if (parent?.subRows?.every((row) => row?.avaliable_status)) {
                setValue(`${parentName}.avaliable_status`, true);
                if (!parentName?.includes('subRows')) return;
                fillParentData(`${parentName}.avaliable_status`);
              }
            };
            return (
              <RadioToggleControl
                name={name}
                checked={false}
                onChange={() => {
                  fillData(info.row?.original?.subRows, name);
                  fillParentData(name);
                }}
              />
            );
          }
          case 'inputNumber': {
            const name = nameParam(info, props.tableKey);
            return (
              <TooltipNumberInputTextControl
                patternValidate={columnTable.option?.(info)?.pattern}
                style={{ textAlign: columnTable.textAlign }}
                required={columnTable.option?.(info)?.required}
                name={name}
                datatype={name}
                onClick={(event) => event.stopPropagation()}
                onDoubleClick={(event) => event.stopPropagation()}
                maxLength={columnTable.inputTextProps?.maxLength}
                thousandSeparator={columnTable.inputTextProps?.thousandSeparator}
                localizeKey={`${props.tableKey}.${info.column.id}`}
                textAlign={columnTable.inputTextProps?.textAlign}
                width={columnTable.inputTextProps?.width}
                minValue={columnTable.inputTextProps?.minValue}
                maxValue={columnTable.inputTextProps?.maxValue}
                addZero={columnTable.inputTextProps?.addZero}
                focusOut={(value) => columnTable.inputTextProps?.focusOut?.(value, info.row?.index)}
                onMaxLengthInputTable={(value) => columnTable.inputTextProps?.onMaxLengthInputTable?.(value, info.row?.index)}
                disabled={
                  columnTable.disabled ||
                  (info.row?.original.record_id != null && columnTable.inputTextProps?.disabledIfHasRecordId) ||
                  option?.disabled
                }
                onChange={(value) => {
                  dataInputChange(info.column.id, value, info.row?.index);
                }}
                error={createErrorMessage(
                  info.column?.id,
                  props.errorItems?.[info.row?.index]?.[info.column?.id],
                  props.tableKey
                )}
                errorPlacement={columnTable?.inputTextProps?.errorPlacement}
                focusOutWhenTabEnter={columnTable.inputTextProps?.focusOutWhenTabEnter}
                onMaxLength={() => blurInputWithTimeout(columnTable.inputTextProps?.focusOutWhenMaxLength)}
                focusOutWhenDataNotChanged={columnTable.inputTextProps?.focusOutWhenDataNotChanged}
                allowLeadingZeros={columnTable.inputTextProps?.allowLeadingZeros}
                isNegative={columnTable.inputTextProps?.isNegative}
              />
            );
          }
          case 'inputText': {
            const name = nameParam(info, props.tableKey);
            return (
              <InputTextControl
                patternValidate={columnTable.option?.(info)?.pattern}
                style={{ textAlign: columnTable.textAlign }}
                localizeKey={`${props.tableKey}.${info.column.id}`}
                required={columnTable.option?.(info)?.required}
                onChange={(event: any) => {
                  setValue(name, event.target.value);
                  dataInputChange(info.column.id, event.target.value, info.row?.index);
                }}
                maxLength={columnTable?.inputTextProps?.maxLength}
                onClick={(event) => event.stopPropagation()}
                onDoubleClick={(event) => event.stopPropagation()}
                disabled={columnTable.disabled || option?.disabled}
                errorValue={createErrorMessage(
                  info.column.id,
                  props.errorItems?.[info.row?.index]?.[info.column.id],
                  props.tableKey
                )}
                name={name}
                datatype={name}
                errorPlacement={columnTable?.inputTextProps?.errorPlacement}
                onBlur={(e) => columnTable.inputTextProps?.focusOut?.(e.target.value, info.row?.index)}
              />
            );
          }

          case 'product':
            return (
              <CellProductInputText
                info={info}
                tableKey={props.tableKey}
                error={createErrorMessage(
                  info.column?.id,
                  props.errorItems?.[info.row?.index]?.[info.column?.id],
                  props.tableKey
                )}
                placement={columnTable?.inputTextProps?.errorPlacement}
              />
            );

          case 'button':
            return (
              <ButtonPrimary
                className={'table-data__cell-button'}
                disabled={columnTable.disabled || option?.disabled}
                text={columnTable.buttonInput?.name ?? 'action.select'}
                onClick={(event: any) => {
                  event.stopPropagation();
                  columnTable.buttonInput?.onClick(info.row?.original, info.row?.index);
                }}
                onDoubleClick={(event) => event.stopPropagation()}
              />
            );
          case 'date':
            return (
              <TooltipDatePickerControl
                name={nameParam(info, props.tableKey)}
                onChange={(value) => dataInputChange(info.column.id, convertDateServer(value), info.row?.index)}
                isPopover={true}
                keyError={`${props.tableKey}.${info.column?.id}`}
                required={columnTable.option?.(info)?.required}
                patternValidate={columnTable.option?.(info)?.pattern}
                checkEmpty={info.row?.original.record_id != null}
                hasInitValue={false}
                disabled={
                  columnTable.disabled ||
                  (info.row?.original.record_id != null && columnTable.inputTextProps?.disabledIfHasRecordId) ||
                  option?.disabled
                }
                errorPlacement={columnTable?.inputTextProps?.errorPlacement}
                calendarPlacement={columnTable?.inputTextProps?.tooltipPlacement}
              />
            );
          case 'time':
            return (
              <TooltipTimePickerControl
                name={nameParam(info, props.tableKey)}
                keyError={`${props.tableKey}.${info.column.id}`}
                onChange={(_time, value) => dataInputChange(info.column.id, value, info.row?.index)}
                required={columnTable.option?.(info)?.required}
                patternValidate={columnTable.option?.(info)?.pattern}
                checkEmpty={info.row?.original.record_id != null}
                disabled={
                  columnTable.disabled ||
                  (info.row?.original.record_id != null && columnTable.inputTextProps?.disabledIfHasRecordId) ||
                  option?.disabled
                }
                errorPlacement={columnTable?.inputTextProps?.errorPlacement}
                timePlacement={columnTable?.inputTextProps?.tooltipPlacement}
                isPopover={true}
              />
            );
          case 'drop-down':
            return !option?.isHidden ? (
              <SelectControl
                name={nameParam(info, props.tableKey)}
                items={option?.valueDropDown ?? []}
                disabled={columnTable.disabled || option?.disabled}
                isRequired={columnTable.option?.(info)?.required}

              />
            ) : null;
          default:
            break;
        }
      };
      return column;
    });
  }, [props.data, dataDefault, props.defaultData, props.columns]);

  const renderCells = (row: Row<TRow>, isPaddingRow = false): JSX.Element[] => {
    const visibleCells = row?.getVisibleCells() ?? [];

    return visibleCells.map((cell) => {
      const columnDef = cell.column.columnDef;
      const width = columnDef.size;
      const textAlign = (columnDef as unknown as IColumnDef<TRow>).textAlign;
      const styleChange = changeStyleByRow(row, cell);
      const styleProps = (columnDef as ExtendedColumnDef<TRow>).accessorKey === styleChange.columnName && styleChange;

      return (
        <td
          key={cell?.id}
          className={`table-data__cell ${cell.column?.id}`}
          style={{
            width: `${width}%`,
            justifyContent: textAlign,
            ...styleProps,
          }}
        >
          {!isPaddingRow && flexRender(columnDef.cell, cell.getContext())}
        </td>
      );
    });
  };

  /**
   * Handle update dataDefault when data change
   * Update selected rows
   */
  useEffect(() => {
    if (props.tableType === 'edit') return;

    // InCase add new record
    if (props.data?.length > dataDefault?.length) {
      const numberRowAdd = props.data?.length - dataDefault?.length;
      // Add new record to dataDefault
      setDataDefault(props.data?.slice(0, numberRowAdd).concat(dataDefault));

      // Update record selected
      const selectedRows = [];
      const rows = table.getRowModel().rows;
      rows
        .filter((row) => row?.getIsSelected())
        .forEach((row) => {
          const index = row?.index + numberRowAdd;
          rows?.[index]?.toggleSelected(true);
          selectedRows.push(rows?.[index]);
        });

      // Update record selected to react hook form
      setValue(fieldSelectedRowsName, selectedRows);

      if (bodyRef.current) {
        bodyRef.current.scrollTop = 0;
      }
    }
  }, [props.data]);

  const actionDirtyCheck = (column: Column<TRow>) => {
    if (
      props.data?.some((item) => item?.operation_type) ||
      getValues(props.tableKey)?.some((item: TRow) => item?.operation_type)
    ) {
      setColumnDirtyCheck(column);
      return;
    }

    actionSort(column);
  };

  const onclickOKDirtyCheck = () => {
    actionSort(columnDirtyCheck);
    setColumnDirtyCheck(null);
  };

  const actionSort = (column: Column<TRow>) => {
    const columnDef = column.columnDef as unknown as IColumnDef<TRow>;
    columnDef?.actionSort(column?.id, (props.sort.key === column?.id && props.sort?.type) === 'ASC' ? 'DESC' : 'ASC');
  };

  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  // reset expanding
  useEffect(() => {
    table?.resetExpanded();
  }, [props?.resetExpanded]);
  // auto selected row
  useEffect(() => {
    if (props.data?.length > 0 && props?.autoSelectedRow >= 0) {
      const firstRowId = table.getRowModel().rows[props?.autoSelectedRow]?.id;
      table.resetRowSelection();

      if (firstRowId) {
        const selectedRows = [];
        const rows = table.getRowModel().rows;
        rows
          .filter((row) => row?.getIsSelected())
          .forEach((row) => {
            selectedRows.push(row);
          });
        setTimeout(() => {
          table?.setRowSelection({ [firstRowId]: true });
          setValue(fieldSelectedRowsName, [rows?.[0]]);
        }, 50);
      }
    }
  }, [props.data]);

  const table = useReactTable({
    data: props.data ?? [],
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    enableExpanding: true,
    getSubRows: (row) => row?.subRows,
    columns: columns as ColumnDef<TRow>[],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    enableMultiRowSelection: props.multiRowSelection ?? false,
    enableRowSelection: enableSelectRow,
    getExpandedRowModel: getExpandedRowModel(),
  });

  /**
   * Initial selected row with index row
   */
  useEffect(() => {
    setTimeout(() => {
      if (isNullOrEmpty(props?.selectedIndexRows)) return;
      if (getValues(fieldSelectedRowsName)?.length > 0) return;

      const selectedRows = table?.getRowModel()?.rows?.filter((row) => props?.selectedIndexRows?.includes(row.index));
      selectedRows?.forEach((row) => {
        row?.toggleSelected(true);
      });

      setValue(fieldSelectedRowsName, selectedRows);
    }, 50)
  }, []);

  const operationTypeKeys = table
    .getAllColumns()
    ?.filter((column) => (column.columnDef as unknown as IColumnDef<TRow>)?.operationTypeKeyChange)
    ?.map((column) => column.id);

  const dataInputChange = (key: any, value: any, index: number) => {
    if (!operationTypeKeys.includes(key)) return;
    const record = getValues(`${props.tableKey}[${index}]`);
    const recordDefault = props.defaultData?.[index];
    if (!record || !recordDefault) return;

    // Update operation_type when value change
    if (!isEqual(value, recordDefault[key])) {
      setValue(
        nameParamWithIndex(index, props.tableKey, 'operation_type'),
        record.record_id !== null && !isNaN(record.record_id) ? OperationType.Edit : OperationType.New
      );
      return;
    }

    // Reset operation_type when all value not change
    if (
      operationTypeKeys.every((operationTypeKey) => isEqual(recordDefault[operationTypeKey], record[operationTypeKey]))
    ) {
      setValue(nameParamWithIndex(index, props.tableKey, 'operation_type'), null);
    }
  };

  const classNameIcon = (key: string | number | symbol) => {
    let className = 'table-data__icon-sort';

    if (props.sort?.key === key) {
      className += ' table-data__icon-sort-current';

      if (props.sort?.type === 'DESC') {
        className += ' table-data__icon-sort-desc';
      }
    }

    return className;
  };

  const onClickRow = (row: Row<TRow>) => {
    if (!enableSelectRow) return;
    props.onClickRow?.(row?.original, row?.index);
    if (props.multiRowSelection) {
      row?.toggleSelected(!row?.getIsSelected());
      const selectedRows: Row<TRow>[] = getValues(fieldSelectedRowsName);
      if (!selectedRows) return;
      if (row?.getIsSelected()) {
        setValue(
          fieldSelectedRowsName,
          selectedRows.filter((item) => item.index !== row?.index)
        );
      } else {
        selectedRows?.push(row);
        setValue(fieldSelectedRowsName, selectedRows);
      }
      return;
    }

    if (!row?.getIsSelected()) {
      row?.toggleSelected(true);
      setValue(fieldSelectedRowsName, [row]);
    }
  };

  // Add element to tab, enter
  useEffect(() => {
    setTimeout(() => {
      setKeyboardListener(props.data);
    }, 5000);
  }, [props.data]);

  return (
    <div className="table-data">
      <ModalCommon
        modalInfo={{
          type: IModalType.confirm,
          isShow: columnDirtyCheck !== null,
          message: localizeString('MSG_CONFIRM_002'),
        }}
        handleOK={onclickOKDirtyCheck}
        handleClose={() => setColumnDirtyCheck(null)}
      />
      {props.isExceedRecords && (
        <div className={'table-data__message_warning'}>
          {localizeFormat('MSG_INFO_001', maxLengthData, maxLengthData)}
        </div>
      )}
      <div className="table-data__table-container">
        <div
          className={`table-data__table-main-header-wrapper ${hasScroll ? 'table-data__table-header-scroll' : 'table-data__table-header'}`}
        >
          <table className={`table table-responsive table-data__table-main-header`}>
            <thead className="table-data__table-header">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup?.id}>
                  {headerGroup.headers.map((header) => {
                    const columnDef = header.column.columnDef as unknown as IColumnDef<TRow>;
                    const headerCom =
                      typeof header.column.columnDef.header === 'string'
                        ? localizeString(header.column.columnDef.header)
                        : header.column.columnDef.header;
                    return (
                      <th
                        key={header?.id}
                        colSpan={header.colSpan}
                        scope="col"
                        style={{ width: `${header.column.columnDef.size}%` }}
                        className={header.column?.id}
                      >
                        {flexRender(headerCom, header.getContext())}
                        {columnDef.actionSort && hasData && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="30"
                            height="30"
                            viewBox="0 0 16 16"
                            className={classNameIcon(header.column?.id)}
                            onClick={() => actionDirtyCheck(header.column)}
                          >
                            <path
                              d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"
                              className="table-data__icon-sort-path"
                            />
                          </svg>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
          </table>
        </div>
        <table
          className={`table-data__table-main-body ${props.data?.length > 0 ? '' : 'table-data__table-body-empty'}`}
        >
          <tbody
            className={`table-data__table-body ${hasScroll ? 'table-data__table-body-background' : ''}`.trim()}
            ref={bodyRef}
          >
            {props.data?.length > 0 ? (
              <Virtuoso
                increaseViewportBy={props.valueIncreaseViewport || 0}
                style={{
                  height: props.isCalculateHeightTable
                    ? `${table.getRowModel().rows?.length > 10 ? 400 : table.getRowModel().rows?.length * 44}px`
                    : null,
                }}
                tabIndex={-1}
                className="table-scroll"
                totalCount={table?.getRowModel().rows?.length}
                itemContent={(indexRow) => {
                  const row = table?.getRowModel().rows[indexRow];
                  const rowSelected =
                    enableSelectRow &&
                      (row?.getIsSelected() || selectedRowsForm?.some((item: Row<TRow>) => item?.index === indexRow))
                      ? 'table-data__row-selected'
                      : '';
                  const remove = row?.original?.operation_type === OperationType.Remove ? ' record-remove' : '';
                  const rowConfig = props.rowConfig?.(row);
                  const redText =
                    row?.original?.operation_type === OperationType.New ||
                      row?.original?.operation_type_before === OperationType.New ||
                      row?.original?.copy
                      ? 'table-data__red-text'
                      : '';
                  return (
                    <Fragment>
                      <tr
                        key={row?.id}
                        className={`table-data__row-data ${redText} ${!enableSelectRow ? 'row-data-non-select' : 'row-data-can-select'}
                        ${rowSelected} ${remove} ${rowConfig?.className ?? ''}`.trim()}
                        onClick={() => onClickRow(row)}
                        onDoubleClick={() => props.onDoubleClick?.(row?.original, row?.index)}
                      >
                        {renderCells(row)}
                      </tr>
                      {props.data?.length === 1 && (
                        <tr className={`table-data__row-data ${props.disableSingleRecordPadding?'disable-single-record-padding':''}`}>
                          {renderCells(row, true)}
                        </tr>)}
                    </Fragment>
                  );
                }}
              />
            ) : (
              (props.showNoData || getValues(props.showNoDataNameForm ?? 'showNoData') === true) && (
                <div className="table-data__no-data">{localizeString('MSG_ERR_001')}</div>
              )
            )}
          </tbody>
          {props.actionFooter && (
            <tfoot>
              <tr className="table-data__record-add">
                <td
                  className="record-add-cell"
                  onClick={props.actionFooter}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === KEYDOWN.Space) props?.actionFooter();
                  }}
                >
                  +
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default TableData;
