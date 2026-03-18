import React from 'react';
import { ActionType } from './interface';
import { NegativeButton, NormalButton } from 'app/components/button/flat-button/flat-button';

export const FooterButton = ({
  disabled,
  disableConfirm,
  handleAction,
}: {
  disabled: boolean;
  disableConfirm: boolean;
  handleAction: (type: ActionType) => void;
}) => {
  return (
    <div className="footer">
      <NegativeButton text="entity.action.cancel" onClick={() => handleAction(ActionType.Cancel)} />
      <NormalButton text="entity.action.delete" disabled={disabled} onClick={() => handleAction(ActionType.Delete)} />
      <NormalButton text="entity.action.edit" disabled={disabled} onClick={() => handleAction(ActionType.Edit)} />
      <NormalButton text="entity.action.new" onClick={() => handleAction(ActionType.New)} />
      <NormalButton disabled={disableConfirm} text="entity.action.confirm" onClick={() => handleAction(ActionType.Confirm)} />
    </div>
  );
};
