import { forwardRef, useState, useEffect, useImperativeHandle } from 'react';
import { Translate } from 'react-jhipster';
import { categoryShoppingTickets, DiscountType, OperationType, shoppingTicketRadioValues } from '../data-input';
import { TicketRef, ShoppingTicketProps } from '../interface';
import React from 'react';
import './modal-ticket.scss';
import NormalRadioButton from 'app/components/radio-button/normal-radio-button/normal-radio-button';
import { NormalDropdown } from 'app/components/input/input';
import { localizeString } from 'app/helpers/utils';
import NumberInputText from 'app/components/input/input-text/number-input';
import _ from 'lodash';

export const ShoppingTicketExtra = forwardRef<TicketRef, ShoppingTicketProps>(({ ticket, ticketSuggest: ticketSuggest }, ref) => {
  const titleCheckBoxValueInit = [
    {
      isChecked: ticket ? ticket.can_return : false,
      value: localizeString('modalTicket.canReturn'),
    },
    {
      isChecked: ticket ? ticket.can_exchange : true,
      value: localizeString('modalTicket.canExchange'),
    },
    {
      isChecked: ticket ? ticket.can_change : false,
      value: localizeString('modalTicket.canChange'),
    },
    {
      isChecked: ticket ? ticket.can_just_fix : false,
      value: localizeString('modalTicket.canJustFix'),
    },
    {
      isChecked: ticket ? ticket.is_drawer : true,
      value: localizeString('modalTicket.isDrawer'),
    },
    {
      isChecked: ticket ? ticket.can_cancel : true,
      value: localizeString('modalTicket.canCancel'),
    },
    {
      isChecked: ticket ? ticket.can_void : true,
      value: localizeString('modalTicket.canVoid'),
    },
    {
      isChecked: ticket ? ticket.can_over_deposit : false,
      value: localizeString('modalTicket.canOverDeposit'),
    },
    {
      isChecked: ticket ? ticket.can_change_count : false,
      value: localizeString('modalTicket.canChangeCount'),
    },
    {
      isChecked: ticket ? ticket.is_point_prohibition : false,
      value: localizeString('modalTicket.isPointProhibition'),
    },
  ];

  const [ticketFlags, setTicketFlags] = useState(titleCheckBoxValueInit);
  const [discountAmount, setDiscountAmount] = useState<string>(_.toString(ticket?.new_amount ? ticket?.new_amount : ticket?.amount) ?? '');
  const [paymentTicketType, setPaymentTicketType] = useState(ticket ? ticket.category : 15);
  const handleChangeButtonRadio = (index: number, newValue: number | ((prevState: number) => number)) => {
    setTicketFlags(prevTypes => {
      const newTypes = [...prevTypes];
      newTypes[_.toString(index)].isChecked = newValue;
      return newTypes;
    });
  };

  useEffect(() => {
    if (ticketSuggest) {
      setDiscountAmount(_.toString(ticketSuggest.amount));
    }
  }, [ticketSuggest]);

  useImperativeHandle(ref, () => ({
    getData() {
      return {
        record_id: ticket ? ticket.record_id : null,
        company_code: ticket ? ticket.company_code : '',
        store_code: ticket ? ticket.store_code : '',
        store_name: ticket ? ticket.store_name : '',
        code: ticket ? ticket.code : '',
        new_name: ticket ? ticket.new_name : null,
        new_amount: ticket?.record_id ? parseInt(discountAmount, 10) : null,
        name: ticket ? ticket.name : '',
        amount: ticket?.record_id ? ticket.amount : parseInt(discountAmount, 10),
        discount_type: DiscountType.Money,
        category: paymentTicketType,
        type: ticket ? OperationType.Edit : OperationType.New,
        can_return: ticketFlags[0].isChecked,
        can_exchange: ticketFlags[1].isChecked,
        can_change: ticketFlags[2].isChecked,
        can_just_fix: ticketFlags[3].isChecked,
        is_drawer: ticketFlags[4].isChecked,
        can_cancel: ticketFlags[5].isChecked,
        can_void: ticketFlags[6].isChecked,
        can_over_deposit: ticketFlags[7].isChecked,
        can_change_count: ticketFlags[8].isChecked,
        is_point_prohibition: ticketFlags[9].isChecked,
      };
    },
  }));

  const handleInputChange = (value: string) => {
    setDiscountAmount(value);
  };

  return (
    <>
      <tr>
        <td>
          <Translate contentKey="modalTicket.discountAmount" />
          <span style={{ color: '#FA1E1E' }}>*</span>
        </td>
        <td>
          <NumberInputText
            datatype="amount-money"
            maxLength={6}
            required={true}
            width={'400px'}
            value={discountAmount}
            onChange={(e: any) => handleInputChange(e)}
          />
        </td>
        <td>
          <Translate contentKey="modalTicket.unit" />
        </td>
      </tr>
      {(() => {
        const rows = [];
        for (let i = 0; i < ticketFlags.length - 5; i++) {
          rows.push(
            <tr key={i}>
              <td>{titleCheckBoxValueInit[i].value}</td>
              <td>
                <NormalRadioButton
                  text=""
                  required
                  widthText="350px"
                  listCheckBox={shoppingTicketRadioValues()}
                  nameGroupRadio={`checkbox-modal-ticket-${i}`}
                  value={Number(ticketFlags[i].isChecked)}
                  onChange={e => handleChangeButtonRadio(i, e)}
                />
              </td>

              <td>{titleCheckBoxValueInit[i + 5].value}</td>
              <td>
                <NormalRadioButton
                  text=""
                  required
                  widthText="350px"
                  listCheckBox={shoppingTicketRadioValues()}
                  nameGroupRadio={`checkbox-modal-ticket-${i + 5}`}
                  value={Number(ticketFlags[i + 5].isChecked)}
                  onChange={e => handleChangeButtonRadio(i + 5, e)}
                />
              </td>
            </tr>,
          );
        }
        return rows;
      })()}
      <tr>
        <td>
          <Translate contentKey="modalTicket.paymentTicketType" />
          <span style={{ color: '#FA1E1E' }}>*</span>
        </td>
        <td>
          <NormalDropdown
            position={'top'}
            value={paymentTicketType}
            onDropdownChange={(_: any, value: React.SetStateAction<number>) => setPaymentTicketType(value)}
            widthText={'240px'}
            required={true}
            options={categoryShoppingTickets()}
          />
        </td>
      </tr>
    </>
  );
});
