// React core & hooks
import React, { useLayoutEffect, useMemo } from 'react';
// State management
import { useAppDispatch, useAppSelector } from 'app/config/store';

// Form handling
import { useFormContext } from 'react-hook-form';

// Constants & Enums
import { DiscountType, TicketType } from '../../data-type';

// Interfaces & Type Definitions
import { ITicketSearchProps, TicketFormData } from '../../interface';
import { IDropDownItem } from '@/components/dropdown/dropdown';

// Services
import { getMasterTickets, ISuggestTicketParam, suggestTicket } from 'app/services/ticket-service';

// UI Components
import ButtonPrimary from '@/components/button/button-primary/button-primary';
import { MenuIcon } from '@/components/icons';
import TooltipNumberInputTextControl from '@/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import SelectControl from '@/components/control-form/select-control';

// Other
// Styles
import './modal-ticket.scss';
import { IStoreInfo } from 'app/reducers/store-reducer';
import { isNullOrEmpty, localizeString } from 'app/helpers/utils';
import TooltipInputTextControl from 'app/components/input-text/input-text-control';

export interface ITicketModalProps {
  isEdit: boolean;
  isDiscount?: boolean;
}

export const HeaderTicket: React.FC<ITicketModalProps> = ({ isEdit, isDiscount }) => {
  const dispatch = useAppDispatch();
  const storeInfos: IStoreInfo[] = useAppSelector((state) => state.storeReducer.stores);
  const { getValues, setValue, clearErrors } = useFormContext<TicketFormData>();

  /**
   * Create data dropdown
   */
  const stores: IDropDownItem[] = useMemo(() => {
    return storeInfos
      ?.filter((store) => store.selected)
      ?.map((store) => ({
        name: store.store_name,
        value: store.store_code,
        code: store.store_code,
      }));
  }, [storeInfos]);

  /**
   * Init data ticket for edit or create
   */
  useLayoutEffect(() => {
    setValue('baseTicket', null);

    if (!isEdit) {
      setValue('ticket.store_code', stores?.[0]?.code as string);
      setValue('ticket.store_name', stores?.[0]?.name);
    }
  }, []);

  const getStoreCode = () => {
    const { ticket } = getValues();
    return ticket?.store_code ?? (stores?.[0]?.code as string);
  };

  /**
   * API suggest base ticket
   * @param value
   */
  const suggestBaseTicket = (value: string) => {
    if (isNullOrEmpty(value)) return;

    const { addedTicketCodes } = getValues();

    // Check exist ticket added in table
    if (addedTicketCodes?.includes(value)) {
      setValue('ticket.name', localizeString('MSG_ERR_001'));
      return;
    }

    const selected_store = getStoreCode();
    setValue('ticket.source_store', selected_store);

    const param: ISuggestTicketParam = {
      type: TicketType.TBase,
      selected_store,
      code: value,
    };

    dispatch(suggestTicket(param))
      .unwrap()
      .then((response) => {
        const baseTicket = response.data?.data;
        // Reset error for ticket field
        if (baseTicket) {
          clearErrors('ticket.code');
          clearErrors('ticket.name');
          clearErrors('ticket.unit_amount');
          clearErrors('ticket.discount_value');
        }

        setValue('ticket.name', baseTicket.name ?? localizeString('MSG_ERR_001'));

        const isPriceMode = baseTicket.ticket_summary_group_code !== DiscountType.Percent;

        if (isPriceMode || !isDiscount) {
          setValue('ticket.unit_amount', baseTicket.unit_amount);
          setValue('ticket.discount_value', null);
        } else {
          setValue('ticket.unit_amount', null);
          setValue('ticket.discount_value', baseTicket.unit_amount);
        }

        setValue('ticket.ticket_summary_group_code', isPriceMode || !isDiscount ? DiscountType.Money : DiscountType.Percent);
      })
      .catch(() => setValue('ticket.name', localizeString('MSG_ERR_001')));
  };

  /**
   * Get list base ticket when show modal
   */
  const handleSearchBaseTicket = () => {
    const param: ITicketSearchProps = {
      selected_stores: [getStoreCode()],
      type: 0,
      page: 1,
      limit: 1000,
    };

    const { addedTicketCodes } = getValues();

    // API 6601
    dispatch(getMasterTickets(param))
      .unwrap()
      .then((res) => {
        const data = res?.data?.data;
        const baseTicket = {
          ...data,
          items: data?.items?.filter((item) => !addedTicketCodes?.includes(item.code)),
          noData: isNullOrEmpty(data?.items),
        };
        setValue('baseTicket', baseTicket);
      })
      .catch(() => setValue('baseTicket', { noData: true }));
  };

  return (
    <>
      <SelectControl
        className="store-code"
        name="ticket.store_code"
        label="masterTicket.store"
        items={stores}
        disabled={isEdit}
        isRequired
      />
      <div className="row-container">
        <TooltipNumberInputTextControl
          name="ticket.code"
          className="ticket-code"
          label="masterTicket.ticketCode"
          maxLength={15}
          focusOut={(value) => suggestBaseTicket(value)}
          disabled={isEdit}
          required
          errorPlacement="bottom"
        />
        <ButtonPrimary disabled={isEdit} onClick={handleSearchBaseTicket} icon={<MenuIcon />} />
      </div>
      <TooltipInputTextControl
        errorPlacement="bottom"
        title={'masterTicket.ticketName'}
        name={'ticket.name'}
        required
        maxLength={25}
      />
    </>
  );
};
