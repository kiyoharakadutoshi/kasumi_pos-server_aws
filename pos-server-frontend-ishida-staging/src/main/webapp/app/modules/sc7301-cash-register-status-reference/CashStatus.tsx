import React from 'react';
import { cashRegisterStatusOption } from '@/modules/sc7301-cash-register-status-reference/sc7301-cash-register-status-interface';
import { HourglassIcon } from '@/components/icons/hourglass-icon';
import { CancelIcon, CheckSquareIcon, PowerIcon } from '@/components/icons';
import PopoverText from '@/components/popover/popover';
import { localizeString } from '@/helpers/utils';

const CashStatus = ({ status }: { status: number }) => {
  const statusContent = cashRegisterStatusOption[status];

  const getIcon = () => {
    const calcIconMethod = {
      0: {
        statusName: 'inactive-status',
        icon: <PowerIcon />,
      },
      1: {
        statusName: 'unopened-status',
        icon: <HourglassIcon />,
      },
      2: {
        statusName: 'unpaid-status',
        icon: <CancelIcon />,
      },
      3: {
        statusName: 'settled-status',
        icon: <CheckSquareIcon />,
      }
    };
    return calcIconMethod[status] ?? '';
  };

  return (
    <div className={`status-box ${getIcon().statusName}`}>
      <div className="icon-status">{getIcon().icon}</div>
      <PopoverText text={localizeString(statusContent)} lineLimit={1} />
    </div>
  );
};

export default CashStatus;
