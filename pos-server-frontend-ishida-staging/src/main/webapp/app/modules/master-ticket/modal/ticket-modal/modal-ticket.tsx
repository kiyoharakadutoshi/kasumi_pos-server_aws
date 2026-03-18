import React, { useLayoutEffect } from 'react';
import './modal-ticket.scss';
import { DefaultModalProps, Ticket, TicketFormData } from '../../interface';
import { DiscountType, TicketType } from '../../data-type';
import { useAppDispatch } from 'app/config/store';
import DefaultModal from 'app/components/modal/default-modal/default-modal';
import { ModalMode } from 'app/components/modal/default-modal/default-enum';
import { useFormContext } from 'react-hook-form';
import { HeaderTicket } from 'app/modules/master-ticket/modal/ticket-modal/header-ticket';
import BaseTicketTable from 'app/modules/master-ticket/modal/base-ticket/base-ticket-table';
import { ShoppingTicketExtra } from 'app/modules/master-ticket/modal/ticket-modal/shopping-ticket-extra';
import { DiscountExtra } from 'app/modules/master-ticket/modal/ticket-modal/discount-extra';
import { getMasters } from 'app/services/master-service';
import { ItemMasterCode } from 'app/reducers/master-reducer';
import { isEqual, isNullOrEmpty, localizeFormat } from 'app/helpers/utils';
import _ from 'lodash';
import { validateTicket } from 'app/modules/master-ticket/modal/ticket-modal/validate';
import { getBaseTicket } from 'app/services/ticket-service';
import { OperationType } from 'app/components/table/table-common';

const TicketModal: React.FC<DefaultModalProps> = ({ mode, type, closeModal }) => {
  const dispatch = useAppDispatch();
  const { getValues, setValue, watch, clearErrors, handleSubmit, setError } = useFormContext<TicketFormData>();
  const isEdit = mode === ModalMode.Edit;

  // Init title modal
  let title: string;
  if (type === TicketType.TShoppingTicket) {
    title = isEdit ? 'modalTicket.title.editShoppingTicket' : 'modalTicket.title.addShoppingTicket';
  } else {
    title = isEdit ? 'modalTicket.title.editDiscount' : 'modalTicket.title.addDiscount';
  }

  /**
   * API 1503 get master code category
   */
  useLayoutEffect(() => {
    const { categoryShoppingItems, categoryDiscountPercentItems, categoryDiscountPriceItems } = getValues();

    // Check exist data master code => stop call API 1503
    if (
      !isNullOrEmpty(categoryDiscountPriceItems) &&
      !isNullOrEmpty(categoryDiscountPercentItems) &&
      !isNullOrEmpty(categoryShoppingItems)
    ) {
      setupData();
      return;
    }

    dispatch(getMasters({ master_code: ['MC6601', 'MC6602', 'MC6603'] }))
      .unwrap()
      .then((res) => {
        const result = res?.data?.data;
        setValue('categoryShoppingItems', mapMasterCodeItems(result?.[0]?.items));
        setValue('categoryDiscountPriceItems', mapMasterCodeItems(result?.[1]?.items));
        setValue('categoryDiscountPercentItems', mapMasterCodeItems(result?.[2]?.items));
        setupData();
      });
  }, []);

  /**
   * Setup data for dropdown
   */
  const setupData = () => {
    if (isEdit) return;
    const { categoryShoppingItems, categoryDiscountPriceItems } = getValues();

    const categories = type === TicketType.TShoppingTicket ? categoryShoppingItems : categoryDiscountPriceItems;
    const paymentCode = categories?.some((item) => isEqual(item.value, 19)) ? '19' : _.toString(categories?.[0]?.value);
    setValue('ticket.payment_code', paymentCode);
  };

  /**
   * Map master code to Dropdown items
   * @param items
   */
  const mapMasterCodeItems = (items: ItemMasterCode[]) =>
    items?.map((item) => ({
      value: item.setting_data_type,
      code: item.setting_data_type,
      name: item.event_group_name,
    }));

  /**
   * Action Click confirm button -> validate
   */
  const actionRegister = () => {
    clearErrors();
    handleSubmit(
      (data) => confirmTicket(data),
      () => validateTicket(type, getValues('ticket'), setError)
    )();
  };

  /**
   * Action validate valid ticket
   * @param data
   */
  const confirmTicket = (data: TicketFormData) => {
    if (!validateTicket(type, data.ticket, setError)) return;

    const existedTicket = data.ticket?.record_id > 0;

    // API 6602 check exist ticket
    dispatch(
      getBaseTicket({
        type: existedTicket ? type : TicketType.TBase,
        selected_store: existedTicket ? data.ticket?.store_code : data.ticket?.source_store,
        code: data.ticket.code,
      })
    )
      .unwrap()
      .then((response) => {
        if (!response.data?.data) {
          setErrorCode();
          return;
        } else {
          // Validate success => close modal and fill data to table
          const ticket = data.ticket;
          const operation_type = existedTicket ? OperationType.Edit : OperationType.New;
          ticket.operation_type = operation_type;
          ticket.operation_type_before = operation_type;
          if (type === TicketType.TDiscount && ticket.ticket_summary_group_code === DiscountType.Percent) {
            ticket.unit_amount = ticket.discount_value;
          }
          closeModal(data.ticket);
        }
      })
      .catch(setErrorCode);
  };

  /**
   * Set error for ticket code field
   */
  const setErrorCode = () => {
    if (isEdit) {
      setError('ticket.name', { message: localizeFormat('MSG_VAL_020', 'masterTicket.ticketName') });
      return;
    }
    setError('ticket.code', { message: localizeFormat('MSG_VAL_020', 'masterTicket.ticketCode') });
  };

  /**
   * Action select ticket in table search
   * @param ticket
   */
  const onSelectBaseTicket = (ticket: Ticket) => {
    clearErrors();
    setValue('baseTicket', null);
    setValue('ticket.name', ticket.name);
    const isPriceMode = ticket.ticket_summary_group_code !== DiscountType.Percent;

    const  isPrice = isPriceMode || type !== TicketType.TDiscount;

    if (isPrice) {
      setValue('ticket.unit_amount', ticket.unit_amount);
      setValue('ticket.discount_value', null);
    } else {
      setValue('ticket.unit_amount', null);
      setValue('ticket.discount_value', ticket.unit_amount);
    }

    setValue('ticket.ticket_summary_group_code', isPrice ? DiscountType.Money : DiscountType.Percent);
    setValue('ticket.code', ticket.code);
    setValue('ticket.source_store', ticket.store_code);
  };

  /**
   * Action cancel
   */
  const cancelAction = () => {
    clearErrors();
    closeModal();
  };

  return (
    <DefaultModal
      className="ticket-modal"
      headerType={isEdit ? ModalMode.Edit : ModalMode.Add}
      titleModal={title}
      cancelAction={cancelAction}
      confirmAction={actionRegister}
    >
      <div
        className="ticket-modal__container"
        style={{ '--table-row': watch('baseTicket.items')?.length } as React.CSSProperties}
      >
        <HeaderTicket isEdit={isEdit} isDiscount={type === TicketType.TDiscount} />
        {type === TicketType.TShoppingTicket ? (
          <ShoppingTicketExtra isEdit={isEdit} />
        ) : (
          <DiscountExtra isEdit={isEdit} />
        )}
        <BaseTicketTable handleSelect={onSelectBaseTicket} />
      </div>
    </DefaultModal>
  );
};

export default TicketModal;
