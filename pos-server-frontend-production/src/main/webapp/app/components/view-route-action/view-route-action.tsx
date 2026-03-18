import { RoutesProps } from 'react-router-dom';
import React, { useEffect } from 'react';
import ModalCommon, { IModalType } from 'app/components/modal/modal-common';
import { localizeString } from 'app/helpers/utils';
import { useLocation, useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { closeConfirm, ConfirmState } from 'app/reducers/confirm-reducer';
import { clearError, ErrorState } from 'app/reducers/error';

const viewRouteAction = ({ children }: RoutesProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const errorState: ErrorState = useAppSelector(state => state.error);
  const confirmState: ConfirmState = useAppSelector(state => state.confirmReducer);

  /*
  Clear tooltip when navigate screen
   */
  useEffect(() => {
    const elements = document.getElementsByClassName('custom-popover');
    Array.from(elements).forEach(element => {
      element.remove();
    });
  }, [location]);

  const handleCloseConfirmModal = () => {
    if (confirmState.message === 'MSG_CONFIRM_002') {
      navigate(confirmState.action);
    }
    setTimeout(() => {
      dispatch(closeConfirm());
    }, 100);
  };

  const handleCloseErrorModal = () => {
    dispatch(clearError());
    if (errorState.paramValidate) {
      const input =
        document.querySelector(`input[datatype="${errorState.paramValidate}"]`) ??
        document.querySelector(`textarea[datatype="${errorState.paramValidate}"]`);
      setTimeout(() => {
        (input as HTMLInputElement)?.focus();
      }, 400);
    }
  };

  return (
    <>
      <ModalCommon
        modalInfo={{
          type: IModalType.error,
          isShow: errorState?.isError || false,
          message: errorState?.message ?? '',
        }}
        handleOK={handleCloseErrorModal}
      />
      <ModalCommon
        modalInfo={{
          type: IModalType.confirm,
          isShow: confirmState.action !== null,
          message: localizeString(confirmState.message),
        }}
        handleOK={handleCloseConfirmModal}
        handleClose={() => dispatch(closeConfirm())}
      />
      <div className="view-routes">{children}</div>
    </>
  );
};

export default viewRouteAction;
