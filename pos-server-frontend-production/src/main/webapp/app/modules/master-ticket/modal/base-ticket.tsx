import React, { forwardRef, useState, useEffect, useRef, useImperativeHandle } from 'react';
import { translate, Translate } from 'react-jhipster';
import { OperationType, TicketType } from '../data-input';
import { BaseTicket, DefaultModalProps, Discount, ShoppingTicket, TicketRef } from '../interface';
import { DiscountExtra } from './discount-extra';
import { ShoppingTicketExtra } from './shopping-ticket-extra';
import './modal-ticket.scss';
import { NormalDropdown, InputText } from 'app/components/input/input';
import NumberInputText from 'app/components/input/input-text/number-input';
import _ from 'lodash';
import DefaultButton from 'app/components/button/flat-button/default-button/default-button';
import { suggestTicket } from 'app/services/ticket-service';

export const BaseTicketComponent = forwardRef<TicketRef, DefaultModalProps>(
  ({ isEdit, type, stores, ticket, ticketSearch, actionSearch }, ref) => {
    const [ticketSuggest, setTicketSuggest] = useState<BaseTicket>(null);

    const [ticketCode, setTicketCode] = useState<string>(ticket ? ticket.code : '');

    const [ticketName, setTicketName] = useState<string>(ticket ? _.toString(ticket.new_name ? ticket.new_name : ticket.name) : '');

    useEffect(() => {
      if (ticketSearch) {
        setTicketSuggest(ticketSearch);
        setTicketCode(ticketSearch.code);
        setTicketName(ticketSearch.name);
      }
    }, [ticketSearch]);

    const updatedListStoreApply = stores.map((store, index) => ({
      id: _.toString(index),
      value: store.store_code,
      label: `${store.store_code} : ${store.store_name}`,
    }));

    const [storesSelected, setStores] = useState(ticket ? ticket.store_code : stores.length > 0 ? stores[0].store_code : '');

    const storeName = () => {
      const name = stores.find(store => store.store_code === storesSelected).store_name ?? '';
      return name;
    };

    const ticketRef = useRef<TicketRef>(null);
    const getDataTicket = () => {
      if (ticketRef.current) {
        const ticketData = ticketRef.current.getData();
        ticketData.store_code = storesSelected;
        ticketData.store_name = storeName();
        ticketData.code = ticketCode;
        ticketData.type = ticket?.record_id ? OperationType.Edit : OperationType.New;
        const ticketNameTrimmed = ticketName.trim();
        if (ticket?.record_id) {
          ticketData.new_name = ticketNameTrimmed;
        } else {
          ticketData.name = ticketNameTrimmed;
        }
        return ticketData;
      }
      return null;
    };

    const suggestBaseTicket = (value: string) => {
      if (value.length === 0) {
        setTicketName('');
        return;
      }
      suggestTicket(TicketType.Base, storesSelected, value)
        .then(data => {
          const baseTicket = data as BaseTicket;
          setTicketName(baseTicket ? baseTicket.name : translate('MSG_ERR_001'));
          setTicketSuggest(baseTicket);
        })
        .catch(() => setTicketName(translate('MSG_ERR_001')));
    };

    const handleTicketNameChange = (value: string) => {
      setTicketName(value);
    };

    useImperativeHandle(ref, () => ({
      getData() {
        return getDataTicket();
      },
    }));

    return (
      <div>
        <table className="table-modal-ticket table-response">
          <tbody>
            <tr>
              <td>
                <Translate contentKey="masterTicket.store" />
                <span style={{ color: '#FA1E1E' }}>*</span>
              </td>
              <td>
                <NormalDropdown
                  marginBottom={0}
                  selectedDataDropdown={`${storesSelected} : ${storeName()}`}
                  onDropdownChange={(_, value) => setStores(value)}
                  required={true}
                  width={type === TicketType.ShoppingCart ? '400px' : '650px'}
                  options={updatedListStoreApply}
                  disabled={isEdit}
                />
              </td>
            </tr>
            <tr>
              <td>
                <Translate contentKey="masterTicket.ticketCode" />
                <span style={{ color: '#FA1E1E' }}>*</span>
              </td>
              <td style={{ display: 'flex', alignItems: 'center' }}>
                <NumberInputText
                  datatype="code"
                  maxLength={15}
                  disabled={isEdit}
                  required={true}
                  width={type === TicketType.ShoppingCart ? '400px' : '650px'}
                  value={ticketCode}
                  onChange={(value: string) => setTicketCode(value)}
                  focusOut={value => suggestBaseTicket(value)}
                />
                {type === TicketType.Discount && <ButtonSearchTicket disabled={isEdit} actionSearch={() => actionSearch(storesSelected)} />}
              </td>
              {type === TicketType.ShoppingCart && (
                <td>
                  <ButtonSearchTicket disabled={isEdit} actionSearch={() => actionSearch(storesSelected)} />
                </td>
              )}
            </tr>
            <tr>
              <td>
                <Translate contentKey="masterTicket.ticketName" />
                <span style={{ color: '#FA1E1E' }}>*</span>
              </td>
              <td>
                <InputText
                  datatype="name"
                  required={true}
                  width={type === TicketType.ShoppingCart ? '400px' : '650px'}
                  value={ticketName}
                  onChange={(e: any) => handleTicketNameChange(e.target.value)}
                />
              </td>
            </tr>
            {type === TicketType.ShoppingCart ? (
              <ShoppingTicketExtra ref={ticketRef} ticket={ticket as ShoppingTicket} ticketSuggest={ticketSuggest} />
            ) : (
              <DiscountExtra ref={ticketRef} ticket={ticket as Discount} ticketSuggest={ticketSuggest} />
            )}
          </tbody>
        </table>
      </div>
    );
  },
);

const ButtonSearchTicket = ({ disabled, actionSearch }: { disabled?: boolean; actionSearch: () => void }) => {
  return (
    <DefaultButton
      onClick={() => actionSearch()}
      disabled={disabled}
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 14">
          <g id="menu" transform="translate(1 1)">
            <line
              id="Line_283"
              data-name="Line 283"
              x2="18"
              transform="translate(0 6)"
              fill="none"
              stroke="#171616"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <line
              id="Line_284"
              data-name="Line 284"
              x2="18"
              fill="none"
              stroke="#171616"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <line
              id="Line_285"
              data-name="Line 285"
              x2="18"
              transform="translate(0 12)"
              fill="none"
              stroke="#171616"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </g>
        </svg>
      }
      width="40px"
    />
  );
};
