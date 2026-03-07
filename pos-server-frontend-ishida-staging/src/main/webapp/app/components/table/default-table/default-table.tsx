import React, { useEffect, useState } from 'react';
import './default-table.scss';
import { SelectedRow } from 'app/components/table/table-common';

export interface TitleName {
  keyName: string; // Keys of fields to print in table
  title: string | React.ReactNode; // Name of title in table
  width?: number;
}
interface DefaultTableProps {
  titleTable: TitleName[];
  fontSize?: string;
  dataTables: any[];
  onRowSelect?: (row: any) => void;
  clearTable?: boolean;
  actionDoubleClick?: (row: SelectedRow) => void;
  selectRow?: any;
}

const DefaultTable: React.FC<DefaultTableProps> = ({
  fontSize,
  titleTable,
  dataTables,
  onRowSelect,
  clearTable,
  selectRow,
  actionDoubleClick,
}) => {
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const handleRowClick = (row: any) => {
    setSelectedRow(row);
    if (onRowSelect) {
      onRowSelect(row);
    }
  };
  const classNameTicket = (data: any) => {
    if (data?.operation_type === 3) {
      if (data?.operation_type_before === 1 || data?.operation_type_before === 2) {
        return 'record-remove-new';
      }
      return 'record-remove';
    }
    if (data?.operation_type === 1 || data?.operation_type === 2) {
      return 'record-new';
    }
    return '';
  };

  const handleDoubleClickRow = (row: any) => {
    if (actionDoubleClick) {
      actionDoubleClick(row);
    }
  };

  useEffect(() => {
    if (clearTable) {
      setSelectedRow(null);
    }
  }, [clearTable]);

  useEffect(() => {
    if (selectRow) {
      setSelectedRow(selectRow);
    }
  }, [selectRow]);

  return (
    <div
      style={{ fontSize: fontSize ?? '24px' }}
      className={`default-table-body-container ${dataTables?.length > 1000 && 'border-max-record'}`}
    >
      {dataTables?.length > 1000 && <div className={'table-notice'}>検索結果が1000件を超えたため、 最初の1000件を表示しています。</div>}
      <table className={'table table-striped'}>
        <thead className={'title-table table-secondary'}>
          <tr>
            {titleTable?.map((data, index) => {
              return (
                <th key={index} scope="col" className="text-center" style={{ width: `${data.width}%` }}>
                  {data?.title}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {dataTables?.map((dataTable, index) => {
            const isSelected = selectedRow === dataTable;

            return (
              <tr
                key={index}
                onClick={() => handleRowClick(dataTable)}
                onDoubleClick={() => handleDoubleClickRow(dataTable)}
                className={`${classNameTicket(dataTable)} ${isSelected ? 'table-primary' : ''}`}
              >
                {titleTable?.map(title => {
                  return (
                    <td className={'content-table'} id={title?.keyName} style={{ width: `${title.width}%` }}>
                      {dataTable[title?.keyName]}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DefaultTable;
