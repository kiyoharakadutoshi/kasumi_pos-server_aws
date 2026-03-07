import React, { useContext, useEffect, useRef, useState } from 'react';
import { translate } from 'react-jhipster';
import { Modal } from 'reactstrap';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { useNavigate } from 'react-router-dom';
import './modal-common.scss';
import { BLUE_545F95, GREEN_639554, RED_ff003a } from 'app/constants/color';
import { setCloseModal } from 'app/reducers/error';
import ButtonPrimary from 'app/components/button/button-primary/button-primary';
import { functionKeys, getFocusableElements, handleFocusListElement } from 'app/helpers/utils-element-html';
import { KeyboardViewContext } from 'app/components/keyboard-navigation/keyboard-navigation';

export enum IModalType {
  error,
  confirm,
  info,
}

export interface IModalInfo {
  isShow: boolean;
  type?: IModalType;
  message?: string;
}

export interface IModalCommonProps {
  modalInfo: IModalInfo;
  handleOK?: (type: IModalType) => void;
  handleClose?: () => void;
}

const ModalCommon: React.FC<IModalCommonProps> = ({ modalInfo, handleOK, handleClose }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(modalInfo?.isShow ?? false);
  const isAuthenticated: boolean = useAppSelector(state => state.loginReducer.isAuthenticated);
  const { addView, removeView } = useContext(KeyboardViewContext);
  const modalCommonRef = useRef(null);
  const [focusableElements, setFocusableElements] = useState([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setShowModal(modalInfo?.isShow ?? false);
  }, [modalInfo]);

  useEffect(() => {
    dispatch(setCloseModal(!showModal));
  }, [showModal]);

  /*
    Ignore function key of screen below
   */
  useEffect(() => {
    const handleTabPress = (e: any) => {
      if (functionKeys.includes(e.key)) {
        e.stopPropagation();
        e.preventDefault();
        return;
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleTabPress, true);
      addView('dialog', null);
    } else {
      removeView('dialog');
    }

    return () => {
      document.removeEventListener('keydown', handleTabPress, true);
    };
  }, [showModal]);

  /*
    Handle add function keydown
   */
  useEffect(() => {
    const handleKeydown = (e: any) => {
      if (e.key === 'Enter') {
        e.stopPropagation();
        e.preventDefault();

        if (modalInfo.type === IModalType.confirm) {
          handleFocusListElement(focusableElements, e);
        } else {
          handleClickOK();
        }
        return;
      }

      if (e.key === 'Tab') {
        e.stopPropagation();
        handleFocusListElement(focusableElements, e);
      }
    };

    if (focusableElements?.length > 0 && showModal) {
      document.addEventListener('keydown', handleKeydown, true);
      focusableElements[0].focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeydown, true);
    };
  }, [focusableElements, showModal]);

  const findElementTabAndEnter = () => {
    setFocusableElements(getFocusableElements(modalCommonRef.current));
  };

  const closeModal = () => {
    setShowModal(false);
    if (handleClose) handleClose();
  };

  const handleClickOK = () => {
    if (!isAuthenticated) navigate('/login');
    setShowModal(false);
    handleOK && handleOK(modalInfo.type);
  };

  let color = '';
  switch (modalInfo?.type) {
    case IModalType.confirm:
      color = GREEN_639554;
      break;
    case IModalType.error:
      color = RED_ff003a;
      break;
    case IModalType.info:
      color = BLUE_545F95;
      break;
    default:
      break;
  }

  return (
    <Modal
      zIndex="100000"
      isOpen={showModal}
      backdrop="static"
      className="modal-common"
      autoFocus={false}
      innerRef={modalCommonRef}
      onOpened={findElementTabAndEnter}
    >
      <div className="modal-common__dialog-header" style={{ backgroundColor: color }} />
      <div className="modal-common__dialog-body">
        <div className="modal-common__dialog-message">{modalInfo?.message?.split('\n').map(msg => <div key={msg}>{msg}</div>) ?? ''}</div>
        <div
          className="modal-common__dialog-button"
          style={{
            justifyContent: `${modalInfo?.type === IModalType.confirm ? 'space-between' : 'end'}`,
          }}
        >
          {modalInfo?.type === IModalType.confirm && <ButtonPrimary text={translate('entity.action.cancel')} onClick={closeModal} />}
          <ButtonPrimary text={'OK'} onClick={handleClickOK} dataFocus="button-primary" />
        </div>
      </div>
    </Modal>
  );
};

export default ModalCommon;
