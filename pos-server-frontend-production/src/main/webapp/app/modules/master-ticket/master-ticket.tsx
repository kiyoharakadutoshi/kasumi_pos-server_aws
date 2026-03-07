import { Translate, translate } from 'react-jhipster';
import './master-ticket.scss';
import ModalCommon, { IModalInfo, IModalType } from 'app/components/modal/modal-common';
import ApplyStores from '../../shared/apply-store/apply-stores';
import ModalTicket from './modal/modal-ticket';
import { TicketType, OperationType, MatchingType } from './data-input';
import { Ticket, ActionType, CsvDataTicket, MasterTicketUpdate, ShoppingTicket, Discount } from './interface';
import { searchTypeValues, ticketTypeValues } from './data-input';
import { TableTicket } from './table-ticket';
import { FooterButton } from './ticket-footer';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { NormalButton } from 'app/components/button/flat-button/flat-button';
import { InputText, NormalDropdown } from 'app/components/input/input';
import { NormalRadioButton } from 'app/components/radio-button/radio-button';
import React, { useState, useEffect } from 'react';
import { addTicket, clear, deleteTicket, TicketState, updateTicket } from './reducer/ticket-reducer';
import { localizeFormat, localizeString } from 'app/helpers/utils';
import { IStoreSate, setApplyStores } from 'app/reducers/store-reducer';
import { confirmTickets, getMasterTickets } from 'app/services/ticket-service';
import Header from 'app/components/header/header';

export const LIMIT_RECORD = 1000;

export const MasterTicket = () => {
  const dispatch = useAppDispatch();
  const [type, setType] = useState(TicketType.ShoppingCart);
  const [ticketName, setTicketName] = useState('');
  const [matching, setMatching] = useState(MatchingType.Include);
  const [action, setAction] = useState<ActionType>(ActionType.None);
  const [searchTicketType, setSearchTicketType] = useState(TicketType.ShoppingCart);
  const ticketState: TicketState = useAppSelector(state => state.ticketReducer);
  const [selectedRow, setSelectedRow] = useState<Ticket | ShoppingTicket | Discount | null>(null);
  const [modalInfo, setModalInfo] = useState<IModalInfo>({ isShow: false });
  const [canConfirm, setCanConfirm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setEditMode] = useState(false);
  const [csvData, setCsvData] = useState<CsvDataTicket>(null);
  const storeState: IStoreSate = useAppSelector(state => state.storeReducer);

  useEffect(() => {
    actionSearch();
  }, []);

  useEffect(() => {
    setCanConfirm(
      ticketState &&
        ticketState.tickets?.item_list.some(
          (ticket: Ticket) => (ticket.type != null && ticket.type !== OperationType.None) || ticket.deleted,
        ),
    );
  }, [ticketState]);

  useEffect(() => {
    if (selectedRow) {
      setCsvData({
        store_code: selectedRow.store_code,
        store_name: selectedRow.store_name,
        code: selectedRow.code,
        name: selectedRow.name,
        amount: selectedRow.amount,
        include: storeState.applyStores.some(store => store.store_code === selectedRow.store_code) ? '*' : '',
      });
    } else {
      setCsvData(null);
    }
  }, [selectedRow]);

  const actionSearch = () => {
    setSelectedRow(null);
    setSearchTicketType(type);
    dispatch(
      getMasterTickets({
        params: { type: type, name: ticketName, search_type: matching, page: 1, limit: 1000 },
        body: { selected_stores: storeState.stores.map(e => e.store_code) },
      }),
    );
  };

  const handleAction = (actionType: ActionType) => {
    setAction(actionType);
    switch (actionType) {
      case ActionType.Delete:
        handleDelete();
        return;
      case ActionType.New:
        handleAdd();
        return;
      case ActionType.Edit:
        handleEdit();
        return;
      case ActionType.Cancel:
        handleCancel();
        return;
      case ActionType.Confirm:
        handleConfirm();
        return;
      default:
        return;
    }
  };

  const handleConfirm = () => {
    const ticketUpdates = ticketState.tickets?.item_list
      .filter(
        (ticket: Ticket) =>
          (ticket.type !== undefined && ticket.type === OperationType.New && !ticket.deleted) || ticket.type === OperationType.Edit,
      )
      .map((ticket: Ticket) => {
        const data = {
          ...ticket,
          ticketName: ticket.new_name ? ticket.new_name : ticket.name,
          amount: ticket.new_amount ? ticket.new_amount : ticket.amount,
          type: ticket.deleted ? OperationType.Remove : ticket.type,
        };
        delete data['new_amount'];
        delete data['new_name'];
        delete data['deleted'];
        return data;
      });
    const registeredStores = storeState.applyStores.filter(store => store.selected).map(store => store.store_code);
    const data: MasterTicketUpdate = {
      type: type,
      shopping_tickets: type === TicketType.ShoppingCart ? ticketUpdates : null,
      discounts: type === TicketType.Discount ? ticketUpdates : null,
      registered_stores: registeredStores,
    };

    dispatch(confirmTickets(data));
  };

  const handleCancel = () => {
    setType(TicketType.ShoppingCart);
    setTicketName('');
    setMatching(MatchingType.Include);
    setAction(ActionType.None);
    clear();
    setSelectedRow(null);
  };

  const handleAdd = () => {
    setEditMode(false);
    if (storeState.applyStores) {
      setModalInfo({ isShow: true, type: IModalType.info, message: localizeString('MSG_INFO_002') });
      return;
    }
    setShowModal(true);
  };

  const handleEdit = () => {
    setEditMode(true);
    if (selectedRow.deleted) {
      setModalInfo({ isShow: true, type: IModalType.error, message: translate('MSG_ERR_010') });
      return;
    }
    if (storeState.applyStores) {
      if (
        selectedRow.code !== storeState.storeDefault.store_code &&
        ticketState.tickets?.item_list.find(
          (ticket: Ticket) => ticket.store_code === storeState.storeDefault.store_code && ticket.code === selectedRow.code && ticket.deleted,
        )
      ) {
        setModalInfo({ isShow: true, type: IModalType.error, message: translate('MSG_ERR_008') });
        return;
      }
      setModalInfo({ isShow: true, type: IModalType.confirm, message: localizeFormat('MSG_CONFIRM_001', 'masterTicket.ticketCode') });
      return;
    }
    handleEdit();
  };

  const handleDelete = () => {
    if (storeState.storeDefault) {
      if (
        selectedRow.store_code !== storeState.storeDefault.store_code &&
        ticketState.tickets.item_list.find(
          (ticket: Ticket) => ticket.store_code === storeState.storeDefault.store_code && ticket.code === selectedRow.code && ticket.deleted,
        )
      ) {
        setModalInfo({ isShow: true, type: IModalType.error, message: translate('MSG_ERR_008') });
        return;
      }
      setModalInfo({ isShow: true, type: IModalType.confirm, message: localizeFormat('MSG_CONFIRM_001', 'masterTicket.ticketCode') });
      return;
    }
    deleteRecord();
  };

  const deleteRecord = () => {
    dispatch(deleteTicket(selectedRow));
  };

  const handleOKModal = (type: IModalType) => {
    handleCloseModal();
    switch (type) {
      case IModalType.confirm:
        if (action === ActionType.Delete) {
          deleteRecord();
          break;
        }
        setShowModal(true);
        break;
      case IModalType.info:
        setShowModal(true);
        break;
      default:
        break;
    }
  };

  const handleCloseModal = () => {
    setModalInfo({ isShow: false });
  };

  const closeModal = (ticket?: ShoppingTicket | Discount) => {
    setShowModal(false);
    if (ticket) {
      if (!isEditMode) {
        dispatch(addTicket({ storeState, ticket }));
      } else {
        dispatch(updateTicket(ticket));
        setSelectedRow(ticket);
      }
    }
  };

  return (
    <div>
      <ModalCommon modalInfo={modalInfo} handleOK={handleOKModal} />
      <Header
        title="masterTicket.title"
        csv={{
          fileName: translate('masterTicket.title'),
          csvData: [csvData],
          listTitleTable: [
            translate('masterTicket.storeCode'),
            translate('masterTicket.storeName'),
            translate('masterTicket.ticketCode'),
            translate('masterTicket.ticketName'),
            translate('masterTicket.amount'),
            translate('apply-store.title'),
          ],
        }}
        printer={{ disabled: true }}
      />
      {showModal && (
        <ModalTicket
          type={searchTicketType}
          isEdit={isEditMode}
          closeModal={closeModal}
          stores={storeState.stores}
          ticket={isEditMode ? selectedRow : null}
        />
      )}
      <div className="ticket-container">
        <div className="group-search">
          <NormalRadioButton
            text={<Translate contentKey="masterTicket.type" />}
            required
            widthText="100px"
            listCheckBox={ticketTypeValues()}
            nameGroupRadio="checkbox-1"
            value={type}
            onChange={setType}
          />
          <div className="flex-row">
            <InputText
              label="masterTicket.ticketName"
              width="300px"
              value={ticketName}
              onChange={(e: any) => setTicketName(e.target.value)}
            />
            <span style={{ width: '4px' }} />
            <NormalDropdown
              width="200px"
              options={searchTypeValues()}
              onDropdownChange={(_: any, value: React.SetStateAction<MatchingType>) => setMatching(value)}
            />
            <span style={{ width: '50px' }} />
            <NormalButton text="entity.action.search" onClick={actionSearch} />
          </div>
        </div>
        {ticketState && ticketState.tickets?.total_count > LIMIT_RECORD && (
          <div className="limit-record">{localizeFormat('MSG_INFO_001', LIMIT_RECORD, LIMIT_RECORD)}</div>
        )}
        <div className="flex-row-scroll">
          <TableTicket selectedRow={selectedRow} handleSelectRow={ticket => setSelectedRow(ticket)} items={ticketState.tickets?.item_list} />
          {storeState.storeDefault && <ApplyStores stores={storeState.applyStores} onChange={stores => dispatch(setApplyStores(stores))} />}
        </div>
        <FooterButton disabled={selectedRow === null} disableConfirm={!canConfirm} handleAction={handleAction} />
      </div>
    </div>
  );
};

export default MasterTicket;
