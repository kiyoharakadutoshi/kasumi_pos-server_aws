import { TableColumnDef } from '@/components/table/table-data/table-data';
import { IBatchReport } from '@/modules/batch-report/batch-report-interface';
import React from 'react';

const useColumn = (store: string) => {
  const columns = React.useMemo<TableColumnDef<IBatchReport>[]>(
    () => [
      {
        accessorKey: 'type',
        header: 'batchReport.dataType',
        size: 9,
        type: 'text',
        textAlign: 'center',
      },
      {
        accessorKey: 'batch_id',
        textAlign: 'left',
        type: 'text',
        header: 'batchReport.fileName',
        size: 38,
      },
      {
        accessorKey: 'start_date_time',
        type: 'text',
        textAlign: 'start',
        header: 'batchReport.startDateTime',
        size: 12.5,
      },
      {
        accessorKey: 'end_date_time',
        type: 'text',
        textAlign: 'start',
        header: 'batchReport.endDateTime',
        size: 12.5,
      },
      {
        accessorKey: 'duration',
        type: 'text',
        textAlign: 'right',
        header: 'batchReport.duration',
        size: 10,
        formatNumber: true,
        numberFractionDigits: 1,
      },
      {
        accessorKey: 'total_record',
        type: 'text',
        textAlign: 'right',
        header: 'batchReport.totalRecord',
        size: 10,
        formatNumber: true,
      },
      {
        accessorKey: 'speed',
        type: 'text',
        textAlign: 'right',
        formatNumber: true,
        numberFractionDigits: 1,
        header: 'batchReport.speed',
        size: 8,
      },
    ],
    [store]
  );

  return { columns };
};

export default useColumn;
