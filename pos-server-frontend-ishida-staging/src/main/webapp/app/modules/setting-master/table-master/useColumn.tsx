import { useMemo } from 'react';

const UseColumn = () => {
  const columns = useMemo(() => {
    return [
      {
        accessorKey: 'store',
        header: 'settingMaster.table.store',
        textAlign: 'left',
        type: 'text',
      },
      {
        accessorKey: 'machineCode',
        header: 'settingMaster.table.machineCode',
        alignItem: 'right',
        textAlign: 'left',
        type: 'text',
      },
      {
        accessorKey: 'machineType',
        header: 'settingMaster.table.machineType',
        textAlign: 'left',
        type: 'text',
      },
      {
        accessorKey: 'typeNode',
        header: 'settingMaster.table.nodeType',
        textAlign: 'left',
        type: 'text',
      },
      {
        accessorKey: 'presetLayout',
        header: 'settingMaster.table.presetLayout',
        textAlign: 'left',
        type: 'text',
      },
      {
        accessorKey: 'ipAddress',
        header: 'settingMaster.table.ipAddress',
        textAlign: 'left',
        type: 'text',
      },
      {
        accessorKey: 'macAddress',
        header: 'settingMaster.table.macAddress',
        textAlign: 'left',
        type: 'text',
      },
    ];
  }, []);

  return { columns };
};

export default UseColumn;
