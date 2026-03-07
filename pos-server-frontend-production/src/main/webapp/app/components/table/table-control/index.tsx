import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flexRender, Row, Table } from '@tanstack/react-table';
// import { useVirtualizer } from '@tanstack/react-virtual';
import _ from 'lodash';

// Components
import { EmployeeRecord } from '@/modules/employee-setting/employee-setting';
import { localizeString } from '@/helpers/utils';

// Styles
import './styles.scss';
import { KeyboardViewContext } from 'app/components/keyboard-navigation/keyboard-navigation';

type TableControlProps<T> = {
  dataTable: T[];
  table?: Table<T>;
  onDoubleClickRow?: () => void;
  selectedRowId: string;
  onClickRow: (rowData: T) => void;
  unikeySelected?: string[];
};

const TableControl = React.memo(
  ({
    table,
    dataTable,
    onDoubleClickRow,
    onClickRow,
    selectedRowId,
    unikeySelected,
  }: TableControlProps<EmployeeRecord>): JSX.Element => {
    const tableContainerRef = useRef(null);
    const [message, setMessage] = useState('');
    const { setKeyboardListener } = useContext(KeyboardViewContext);

    /**
     * useEffect: Add event tab, enter when table re-render element can focus
     */
    useEffect(() => {
      if (dataTable?.length > 0) {
        setTimeout(() => {
          setKeyboardListener(Math.random());
        }, 50);
      }
    }, [onClickRow]);

    /**
     * The function sets the length of the cells in the header
     *  to be equal to the length of the cells in the tbody.
     *
     * @param {booleam} hasData The cash report has data
     */
    const calculatorWidthCellHeader = (hasData?: boolean) => {
      const tableControl = document.querySelector('table.scroll');

      if (!table) return;
      const theadCells = tableControl?.querySelectorAll('thead th') as unknown as HTMLElement[];
      const firstRowCells = tableControl?.querySelectorAll('tbody tr:first-child td');

      theadCells.forEach((header, index) => {
        const bodyCell = firstRowCells[index] as HTMLElement;
        if (bodyCell) {
          bodyCell.style.width = `${header.offsetWidth + 3}px`;
        }
      });
    };

    const { rows } = table.getRowModel();

    // const rowVirtualizer = useVirtualizer({
    //   count: rows.length,
    //   estimateSize: () => 0,
    //   getScrollElement: () => tableContainerRef.current,
    //   measureElement:
    //     typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
    //       ? element => element?.getBoundingClientRect().height
    //       : undefined,
    //   overscan: 5,
    // });

    /**
     * Listen for resize and keydown events
     */
    useLayoutEffect(() => {
      const hasData = dataTable?.length > 0;
      calculatorWidthCellHeader(hasData);
      window.addEventListener('resize', () => calculatorWidthCellHeader(hasData));

      return () => {
        window.removeEventListener('resize', () => calculatorWidthCellHeader(hasData));
      };
    });

    /**
     *
     */
    useEffect(() => {
      if (dataTable?.length === 0) {
        setMessage(localizeString('MSG_ERR_001'));
      } else {
        setMessage('');
      }
    }, [dataTable?.length]);

    return (
      <div className="table-control-box" ref={tableContainerRef}>
        <table className="scroll">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    style={{
                      width: `${header.column.columnDef.size}%`,
                    }}
                    key={header.id}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {/* {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="row-table">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))} */}

            {dataTable?.length > 0 ? (
              table.getRowModel().rows.map((virtualRow) => {
                const row = rows[virtualRow.index] as unknown as Row<EmployeeRecord>;

                return (
                  <>
                    <TableRow
                      key={row.id}
                      row={row}
                      virtualRow={virtualRow}
                      onDoubleClickRow={onDoubleClickRow}
                      selectedRowId={selectedRowId}
                      onClickRow={onClickRow}
                      unikeySelected={unikeySelected}
                    />
                    {dataTable?.length === 1 && <tr className="row-one-record"></tr>}
                  </>
                );
              })
            ) : (
              <tr className="row_no-data">
                <div className="w-full">
                  <div className="table-common__no-data">{message}</div>
                </div>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
);

type TableRowProps<T> = {
  row: Row<T>;
  virtualRow: Row<T>;
  onDoubleClickRow: () => void;
  selectedRowId: string;
  onClickRow: (rowData: T) => void;
  unikeySelected: string[];
};

const TableRow = React.memo(
  ({
    row,
    virtualRow,
    onDoubleClickRow,
    selectedRowId,
    onClickRow,
    unikeySelected,
  }: TableRowProps<EmployeeRecord>) => {
    const getValueByPath = (obj: EmployeeRecord, path: string) => {
      const keys = path.split('.');
      return keys.reduce((acc, key) => acc && acc[key], obj);
    };

    const isCreate = row.original.isCreate;
    const unikeyRow = unikeySelected
      .map((item) => {
        return getValueByPath(row.original, item);
      })
      .join('');

    return (
      <tr
        data-index={virtualRow.index}
        key={row.id}
        className={`row-table ${unikeyRow === selectedRowId ? 'selected' : ''} ${isCreate ? 'create-row' : ''}`}
        // ref={node => rowVirtualizer.measureElement(node)}
        onClick={() => onClickRow(row.original)}
        onDoubleClick={onDoubleClickRow}
      >
        {row.getVisibleCells().map((cell) => (
          <td className={`${row.original.isDelete ? 'delete-row' : ''}`} key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
    );
  }
);

export default TableControl;
