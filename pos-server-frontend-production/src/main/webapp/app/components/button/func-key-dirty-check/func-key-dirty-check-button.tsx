import React, { ReactNode, useEffect, useState } from 'react';
import ModalCommon, { IModalType } from 'app/components/modal/modal-common';
import { isNullOrEmpty, localizeString } from 'app/helpers/utils';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import { Controller, useFormContext } from 'react-hook-form';

interface IFuncKeyDirtyCheckProps {
  funcKey?: string;
  dirtyCheck?: boolean;
  okDirtyCheckAction?: () => void;
  onClickAction?: () => void;
  onClickCancel?: () => void;
  text?: string;
  icon?: ReactNode;
  disabled?: boolean;
  funcKeyListener?: any;
  className?: string;
  dirtyName?: string;
  name?: string;
}

export const actionDirtyCheck = () => {
  const event = new Event('actionDirtyCheck');
  window.dispatchEvent(event);
};

const FuncKeyDirtyCheckButton: React.FC<IFuncKeyDirtyCheckProps> = ({
  okDirtyCheckAction,
  onClickAction,
  onClickCancel,
  dirtyCheck,
  disabled,
  funcKey = 'F12',
  text = 'action.F12Search',
  funcKeyListener,
  className,
  name
}) => {
  const [showDirtyCheck, setShowDirtyCheck] = useState(false);

  useEffect(() => {
    if (isNullOrEmpty(funcKey)) return;

    const handleFuncKey = (event: KeyboardEvent) => {
      if (event.key === funcKey && !disabled) {
        event.preventDefault();
        handleOnclick();
      }
    };

    window.addEventListener('keydown', handleFuncKey);
    return () => {
      window.removeEventListener('keydown', handleFuncKey);
    };
  }, [dirtyCheck, funcKeyListener, disabled]);

  const handleOnclick = () => {
    if (dirtyCheck) {
      setShowDirtyCheck(true);
      return;
    }
    if (showDirtyCheck) setShowDirtyCheck(false);
    if (onClickAction) onClickAction();
  };
  return (
    <>
      {dirtyCheck && (
        <ModalCommon
          modalInfo={{
            type: IModalType.confirm,
            isShow: showDirtyCheck,
            message: localizeString('MSG_CONFIRM_002'),
          }}
          handleOK={() => {
            if (okDirtyCheckAction) okDirtyCheckAction();
            setShowDirtyCheck(false);
          }}
          handleClose={() => {
            setShowDirtyCheck(false);
            onClickCancel && onClickCancel();
          }}
        />
      )}
      <ButtonPrimary
        text={text}
        onClick={handleOnclick}
        disabled={disabled}
        className={className}
        name={name}
      />
    </>
  );
};

export default FuncKeyDirtyCheckButton;

export const FuncKeyDirtyCheckButtonControl = (props: IFuncKeyDirtyCheckProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      render={({ field }) => <FuncKeyDirtyCheckButton {...props} dirtyCheck={field.value} />}
      control={control}
      name={props.dirtyName}
    />
  );
};
