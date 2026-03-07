import React, { useEffect, useRef, useState } from 'react';
import './modal-ticket.scss';
import { Translate } from 'react-jhipster';
import { DiscountType, TicketType } from '../data-input';
import ModalCommon, { IModalInfo, IModalType } from 'app/components/modal/modal-common';
import { TicketRef, DefaultModalProps, Discount, Ticket, BaseTicket } from '../interface';
import { SearchTicketTable } from './search-ticket-table';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { clearDataModal } from '../reducer/ticket-reducer';
import { isNullOrEmpty, localizeFormat } from 'app/helpers/utils';
import { setErrorValidate } from 'app/reducers/error';
import { BaseTicketComponent } from './base-ticket';
import DefaultModal from 'app/components/modal/default-modal/default-modal';
import { ModalMode } from 'app/components/modal/default-modal/default-enum';
import { getBaseTickets, getMasterTickets } from 'app/services/ticket-service';

const TicketModal: React.FC<DefaultModalProps> = ({ stores, isEdit, type, ticket, closeModal }) => {
  const dispatch = useAppDispatch();
  const [modalInfo, setModalInfo] = useState<IModalInfo>({ isShow: false });
  const [baseTickets, setBaseTickets] = useState<Ticket[]>([]);
  const [ticketSearch, setTicketSearch] = useState<BaseTicket>(null);
  const baseTicketValidate = useAppSelector(state => state.ticketReducer.baseTicket);
  const [selectedTicket, setSelectedTicket] = useState<Ticket>(null);

  let title = '';
  if (type === TicketType.ShoppingCart) {
    title = isEdit ? 'modalTicket.title.editShoppingTicket' : 'modalTicket.title.addShoppingTicket';
  } else {
    title = isEdit ? 'modalTicket.title.editDiscount' : 'modalTicket.title.addDiscount';
  }
  const ticketRef = useRef<TicketRef>(null);

  useEffect(() => {
    if (baseTicketValidate) {
      closeModal(selectedTicket);
      dispatch(clearDataModal());
    }
  }, [baseTicketValidate]);

  const actionRegister = () => {
    if (ticketRef.current) {
      const ticketData = ticketRef.current.getData();
      validate(ticketData);
    }
  };

  const validate = (ticketData: Ticket) => {
    if (!isEdit && isNullOrEmpty(ticketData.code)) {
      dispatch(setErrorValidate({ param: 'code', message: localizeFormat('MSG_VAL_001', 'masterTicket.ticketCode') }));
      return;
    }
    if (isNullOrEmpty(ticketData.name) || (ticket?.record_id && isNullOrEmpty(ticketData.new_name))) {
      dispatch(setErrorValidate({ param: 'name', message: localizeFormat('MSG_VAL_001', 'masterTicket.ticketName') }));
      return;
    }
    if (isNaN(ticketData.amount) || (ticket?.record_id && isNaN(ticketData.new_amount))) {
      dispatch(
        setErrorValidate({
          param: ticketData.discount_type === DiscountType.Money ? 'amount-money' : 'amount-percent',
          message: localizeFormat(
            'MSG_VAL_001',
            type === TicketType.ShoppingCart
              ? 'modalTicket.amountShoppingTicket'
              : ticketData.discount_type === DiscountType.Money
                ? 'modalTicket.amountMoneyDiscount'
                : 'modalTicket.amountPercentDiscount',
          ),
        }),
      );

      return;
    }

    if (ticketData.discount_type === DiscountType.Percent && ticketData.amount === 0) {
      showError(localizeFormat('MSG_VAL_021', 'modalTicket.amountPercentDiscount', '0'));
      return;
    }

    if (type === TicketType.Discount) {
      const discount = ticketData as Discount;
      const startDate = new Date(discount.start_date_time);
      const endDate = new Date(discount.end_date_time);
      if (
        startDate.getFullYear() >= endDate.getFullYear() &&
        startDate.getMonth() >= endDate.getMonth() &&
        startDate.getDate() > endDate.getDate()
      ) {
        showError(localizeFormat('MSG_VAL_004', 'modalTicket.startDate', 'modalTicket.endDate'));
        return;
      }

      if (discount.start_date_time >= discount.end_date_time) {
        showError(localizeFormat('MSG_VAL_004', 'modalTicket.startTime', 'modalTicket.endTime'));
        return;
      }

      if (
        discount.date_categorize_type_code === 2 &&
        !discount.is_sunday &&
        !discount.is_monday &&
        !discount.is_tuesday &&
        !discount.is_wednesday &&
        !discount.is_thursday &&
        !discount.is_friday &&
        !discount.is_saturday
      ) {
        showError(localizeFormat('MSG_VAL_027', 'modalTicket.dayOfWeekVal'));
      }
    }
    setSelectedTicket(ticketData);
    dispatch(getBaseTickets({ type, select_store: ticketData.store_code, code: ticketData.code }));
  };

  const showError = (message: string) => {
    setModalInfo({ isShow: true, type: IModalType.error, message });
  };

  const handleCloseModal = () => {
    setModalInfo({ isShow: false });
  };

  const actionSearch = (store: string) => {
    dispatch(getMasterTickets({ params: { type: TicketType.Base }, body: { selected_stores: [store] } }));
  };

  return (
    <DefaultModal
      headerType={isEdit ? ModalMode.Edit : ModalMode.Add}
      titleModal={title}
      cancelAction={() => closeModal()}
      confirmAction={actionRegister}
    >
      <ModalCommon modalInfo={modalInfo} handleOK={handleCloseModal} />
      <BaseTicketComponent
        isEdit={isEdit}
        ref={ticketRef}
        stores={stores}
        type={type}
        ticket={ticket}
        ticketSearch={ticketSearch}
        actionSearch={actionSearch}
      />
      <SearchTicketTable
        items={baseTickets}
        handleSelectRow={row => {
          setTicketSearch({
            code: row.code,
            name: row.name,
            amount: row.amount,
            discount_type: row.discount_type,
          });
          setBaseTickets([]);
        }}
      />
    </DefaultModal>
  );
};

export default TicketModal;
