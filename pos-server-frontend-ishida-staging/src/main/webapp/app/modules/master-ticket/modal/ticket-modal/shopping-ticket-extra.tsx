import React from 'react';
import './modal-ticket.scss';

import TooltipNumberInputTextControl from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import RadioControl from '@/components/control-form/radio-control';
import { IRadioButtonValue } from '@/components/radio-button-component/radio-button';
import { ITicketModalProps } from 'app/modules/master-ticket/modal/ticket-modal/header-ticket';
import SelectControl from 'app/components/control-form/select-control';

const TYPE_OPTION_LIST: IRadioButtonValue[] = [
  {
    id: 0,
    textValue: 'modalTicket.true',
  },
  {
    id: 1,
    textValue: 'modalTicket.false',
  },
];

export const ShoppingTicketExtra: React.FC<ITicketModalProps> = () => {
  return (
    <>
      <div className="row-container">
        <TooltipNumberInputTextControl
          name="ticket.unit_amount"
          label="modalTicket.discountAmount"
          datatype="masterTicket.amount"
          thousandSeparator=","
          maxLength={6}
          required={true}
          minValue={1}
        />
        <span>円</span>
      </div>
      <div className="radio-row-shopping">
        <RadioControl
          className="radio-left-shopping"
          label="modalTicket.canReturn"
          name="ticket.can_return"
          listValues={TYPE_OPTION_LIST}
        />
        <RadioControl
          className="radio-right-shopping"
          label="modalTicket.canCancel"
          name="ticket.can_cancel"
          listValues={TYPE_OPTION_LIST}
        />
      </div>

      <div className="radio-row-shopping">
        <RadioControl
          className="radio-left-shopping"
          label="modalTicket.canResale"
          name="ticket.can_resale"
          listValues={TYPE_OPTION_LIST}
        />
        <RadioControl
          className="radio-right-shopping"
          label="modalTicket.canVoid"
          name="ticket.can_void"
          listValues={TYPE_OPTION_LIST}
        />
      </div>

      <div className="radio-row-shopping">
        <RadioControl
          className="radio-left-shopping"
          label="modalTicket.canChange"
          name="ticket.can_change"
          listValues={TYPE_OPTION_LIST}
        />
        <RadioControl
          className="radio-right-shopping"
          label="modalTicket.canOverDeposit"
          name="ticket.can_over_deposit"
          listValues={TYPE_OPTION_LIST}
        />
      </div>

      <div className="radio-row-shopping">
        <RadioControl
          className="radio-left-shopping"
          label="modalTicket.canJustFix"
          name="ticket.can_just_fix"
          listValues={TYPE_OPTION_LIST}
        />
        <RadioControl
          className="radio-right-shopping"
          label="modalTicket.canChangeCount"
          name="ticket.can_change_count"
          listValues={TYPE_OPTION_LIST}
        />
      </div>

      <div className="radio-row-shopping">
        <RadioControl
          className="radio-left-shopping"
          label="modalTicket.isDrawer"
          name="ticket.is_drawer"
          listValues={TYPE_OPTION_LIST}
        />
        <RadioControl
          className="radio-right-shopping"
          label="modalTicket.isPointProhibition"
          name="ticket.is_point_prohibition"
          listValues={TYPE_OPTION_LIST}
        />
      </div>
      <SelectControl
        required
        errorPlacement="top"
        name="ticket.payment_code"
        className="unit-option"
        label="modalTicket.paymentTicketType"
        itemsName='categoryShoppingItems'
        isRequired
      />
    </>
  );
};
