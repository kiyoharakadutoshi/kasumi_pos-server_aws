import React from 'react';

// Components
import TableData, { TableColumnDef } from '@/components/table/table-data/table-data';

// Hooks and Utilities
import { useFormContext } from 'react-hook-form';

// Types and Interfaces

// Styles
import './styles.scss';
import { Ticket, TicketFormData } from 'app/modules/master-ticket/interface';
import { CellContext } from '@tanstack/react-table';
import { formatAmount } from 'app/modules/master-ticket/config-data';

export interface MasterTicketTableModal {
  code?: string;
  name?: string;
  amount?: string;
}

interface BaseTicketTableProps {
  handleSelect: (data: Ticket) => void;
}

const BaseTicketTable = ({ handleSelect }: BaseTicketTableProps) => {
  const { watch } = useFormContext<TicketFormData>();
  const baseTicket = watch('baseTicket');

  const columns = React.useMemo<TableColumnDef<Ticket>[]>(
    () => [
      {
        header: 'productList.button_choose',
        size: 10,
        type: 'button',
        textAlign: 'center',
        keyItem: 'isChose',
        buttonInput: {
          name: 'modalCategoryProduct.table.button_choose',
          onClick: handleSelect,
        },
      },
      {
        accessorKey: 'code',
        textAlign: 'left',
        header: 'masterTicket.ticketCode',
        type: 'text',
        size: 20,
      },
      {
        accessorKey: 'name',
        textAlign: 'left',
        header: 'masterTicket.ticketName',
        type: 'text',
        size: 45,
      },
      {
        accessorKey: 'unit_amount',
        textAlign: 'right',
        header: 'modalTicket.discountAmount',
        type: 'text',
        option(info: CellContext<Ticket, unknown>) {
          const record = info?.row?.original;
          return {
            value: formatAmount(record.unit_amount, record.ticket_summary_group_code),
          };
        },
        size: 25,
      },
    ],
    []
  );

  if (baseTicket)
    return (
      <TableData<MasterTicketTableModal>
        showNoData={baseTicket?.noData}
        columns={columns}
        data={baseTicket?.items}
        enableSelectRow={false}
        isExceedRecords={baseTicket?.isExceedRecords}
      />
    );

  return <></>;
};

export default BaseTicketTable;
