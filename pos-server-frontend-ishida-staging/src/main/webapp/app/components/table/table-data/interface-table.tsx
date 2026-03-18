import { CSSProperties, ReactNode } from 'react';
import { Placement } from 'react-bootstrap/types';
import { OperationType } from 'app/components/table/table-common';
import { RowBase } from 'app/components/table/table-data/table-data';
import { Row } from '@tanstack/react-table';

export type TSortType = 'ASC' | 'DESC';

export type ExtendedCSSProperties = CSSProperties & {
  columnName: keyof Record<any, any>;
};

export interface TBodyBase {
  operation_type?: OperationType;
  operation_type_before?: OperationType;
  copy?: boolean;
  record_id?: number;
  isError?: boolean;
}

export interface ColumnInputText {
  type?: 'text' | 'number';
  textAlign?: 'left' | 'center' | 'right';
  maxLength?: number;
  addZero?: boolean;
  minValue?: number;
  maxValue?: number;
  width?: string;
  focusOut?: (value: string, index: number) => void;
  disabledIfHasRecordId?: boolean;
  thousandSeparator?: string;
  tooltipPlacement?: Placement;
  errorPlacement?: Placement;
  focusOutWhenTabEnter?: boolean;
  focusOutWhenMaxLength?: boolean;
  onMaxLengthInputTable?: (value: string, index: number) => void;
  /**
   * Only use with columns of type product.
   * Triggered when the maximum character length is reached 
   * for the first input field in the product column.
   * 
   * Example:
   * 
   * ```typescript
   * inputTextProps: {
   *   disabledIfHasRecordId: true,
   *   addZero: true,
   *   textAlign: 'right',
   *   focusOut: suggestMycompanyCode,
   *   onMaxLengthProductFirstInput (_, index) {
   *     handleFocusNextElement(index);
   *   },
   *   onMaxLengthProductSecondInput (_, index) {
   *     handleFocusNextElement(index);
   *   },
   * },
   * ```
   */
  onMaxLengthProductFirstInput?: (value: string, index: number) => void;
  /**
   * Only use with columns of type product.
   * Triggered when the maximum character length is reached 
   * for the second input field in the product column.
   * 
   * Example:
   * 
   * ```typescript
   * inputTextProps: {
   *   disabledIfHasRecordId: true,
   *   addZero: true,
   *   textAlign: 'right',
   *   focusOut: suggestMycompanyCode,
   *   onMaxLengthProductFirstInput (_, index) {
   *     handleFocusNextElement(index);
   *   },
   *   onMaxLengthProductSecondInput (_, index) {
   *     handleFocusNextElement(index);
   *   },
   * },
   * ```
   */
  onMaxLengthProductSecondInput?: (value: string, index: number) => void;
  focusOutWhenDataNotChanged?: boolean;
  allowLeadingZeros?: boolean;
  isNegative?: boolean;
}

export interface TableColumn<TBody = any> {
  title: string | ReactNode;
  width?: string;
  alignItem?: 'left' | 'center' | 'right';
  keyItem: keyof TBody;
  extraValue?: string;
  type?: 'text' | 'checkbox' | 'input' | 'doubleInput' | 'button' | 'date' | 'time';
  disabled?: boolean;
  inputTextProps?: ColumnInputText;
  buttonInput?: { name?: string; onClick: (row: TBody, index: number) => void };
  mappingValue?: any;
  extraClassName?: string;
  checkError?: boolean;
  actionSort?: (keyItem: keyof TBody, type: TSortType) => void;
  cell?: (key: keyof TBody, index: number) => { disabled?: boolean };
  formatNumber?: boolean;
}

export interface SelectedRow<TBody = any> {
  row?: TBody;
  index?: number;
}

export interface TableCommonProps<TBody> {
  columns: TableColumn<TBody>[];
  bodyItems: TBody[];
  disableSelect?: boolean;
  selectedRow?: SelectedRow<TBody>;
  onSelectRow?: (row: SelectedRow) => void;
  actionDoubleClick?: (row: SelectedRow) => void;
  bodyItemChange?: (key: keyof TBody, value: any, index: number) => void;
  maxLengthData?: number;
  isExceedRecords?: boolean;
  width?: number;
  height?: number;
  canShowNoData?: boolean;
  reload?: any;
  errorItems?: any[];
  errorClassName?: string;
  sort?: { key: keyof TBody; type: TSortType };
}

export interface FormTableDataBase<TRow extends RowBase> {
  selectedRows?: Row<TRow>[];
  showNoData?: boolean;
}
