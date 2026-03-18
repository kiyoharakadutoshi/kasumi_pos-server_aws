import DayOfWeekControl from 'app/components/input/day-of-week/day-of-week-control';
import { Translate } from 'react-jhipster';
import React, { useMemo } from 'react';
import './modal-ticket.scss';
import RadioControl from '@/components/control-form/radio-control';
import TooltipNumberInputTextControl from 'app/components/input-text/tooltip-input-text/tooltip-number-input-text-control';
import SelectControl from '@/components/control-form/select-control';
import TooltipDatePickerControl from 'app/components/date-picker/tooltip-date-picker/tooltip-date-picker-control';
import TooltipTimePickerControl from '@/components/time-picker/tooltip-time-picker/tooltip-time-picker-control';
import { ITicketModalProps } from 'app/modules/master-ticket/modal/ticket-modal/header-ticket';
import { useFormContext } from 'react-hook-form';
import { TicketFormData } from 'app/modules/master-ticket/interface';
import { isEqual } from 'app/helpers/utils';
import { DateCategoryType, DiscountType, TimeService } from 'app/modules/master-ticket/data-type';
import { APPLY_TYPE, DATE_CATEGORY_TYPE, DISCOUNT_TYPE } from 'app/modules/master-ticket/config-data';

export const DiscountExtra: React.FC<ITicketModalProps> = () => {
  const { watch, getValues, setValue } = useFormContext<TicketFormData>();

  /**
   * Check is mode edit price or percent
   */
  const isPriceMode = useMemo(() => {
    const { ticket } = getValues();
    return !isEqual(ticket.ticket_summary_group_code, DiscountType.Percent);
  }, [watch('ticket.ticket_summary_group_code')]);

  const disabledTime = !isEqual(watch('ticket.time_service'), TimeService.ServiceTime);

  /**
   * Clear data unit_amount and payment_code when change discount type
   */
  const onChangeDiscountType = () => {
    const { categoryDiscountPriceItems, categoryDiscountPercentItems } = getValues();
    setValue('ticket.unit_amount', null);
    setValue('ticket.discount_value', null);
    setValue(
      'ticket.payment_code',
      (!isPriceMode ? categoryDiscountPriceItems : categoryDiscountPercentItems)?.[0]?.value as string
    );
  };

  const onChangeTimeService = () => {
    setValue('ticket.start_time', '00:00');
    setValue('ticket.end_time', '23:59');
  };

  return (
    <>
      <div className="discount-amount">
        <RadioControl
          isRequired
          className="discount-type"
          label="modalTicket.discount_type"
          isVertical={true}
          name="ticket.ticket_summary_group_code"
          listValues={DISCOUNT_TYPE}
          onChange={onChangeDiscountType}
        />

        <div className="input-amount">
          <TooltipNumberInputTextControl
            disabled={!isPriceMode}
            name="ticket.unit_amount"
            minValue={1}
            maxLength={6}
            thousandSeparator=","
            required={isPriceMode}
            localizeKey="salesReport.table.discountAmount"
            errorPlacement="bottom"
          />
          <div className="row-container">
            <TooltipNumberInputTextControl
              minValue={1}
              maxValue={99}
              disabled={isPriceMode}
              className="amount-price"
              name="ticket.discount_value"
              required={!isPriceMode}
              localizeKey="specialPromotion.discount_value"
              errorPlacement="bottom"
            />
            <span>%</span>
          </div>
        </div>

        <div className="category-discount">
          <SelectControl
            value={isPriceMode ? watch('ticket.payment_code') : null}
            disabled={!isPriceMode}
            name="ticket.payment_code"
            itemsName="categoryDiscountPriceItems"
            onChange={(item) => setValue('ticket.payment_code', item.value as string)}
            errorPlacement="bottom"
          />
          <SelectControl
            value={!isPriceMode ? watch('ticket.payment_code') : null}
            disabled={isPriceMode}
            name="ticket.payment_code"
            itemsName="categoryDiscountPercentItems"
            errorPlacement="bottom"
            onChange={(item) => setValue('ticket.payment_code', item.value as string)}
          />
        </div>
      </div>

      <RadioControl
        className="discount-date-type"
        label="modalTicket.timeService"
        name="ticket.time_service"
        listValues={APPLY_TYPE}
        onChange={onChangeTimeService}
      />

      <div className="row-container date-time-container">
        <span className="date-time-title">
          <Translate contentKey="modalTicket.dateTime" />
        </span>
        <TooltipDatePickerControl
          keyError="specialPromotion.start_date"
          errorPlacement="top"
          required
          name="ticket.start_date"
          isPopover
        />
        <TooltipTimePickerControl
          keyError="specialPromotion.start_time"
          disabled={disabledTime}
          required={!disabledTime}
          name="ticket.start_time"
          errorPlacement="top"
          isPopover
        />
        <span className="date-time-separator">～</span>
        <TooltipDatePickerControl
          keyError="specialPromotion.end_date"
          required
          name="ticket.end_date"
          errorPlacement="top"
          isPopover
        />
        <TooltipTimePickerControl
          keyError="specialPromotion.end_time"
          required={!disabledTime}
          disabled={disabledTime}
          name="ticket.end_time"
          errorPlacement="top"
          isPopover
        />
      </div>

      <div className="discount-apply-date">
        <RadioControl
          className="discount-date-type"
          label="modalTicket.applyDate"
          name="ticket.date_categorize_type_code"
          listValues={DATE_CATEGORY_TYPE}
        />
        <DayOfWeekControl
          name="ticket"
          dataType="number"
          disable={watch('ticket.date_categorize_type_code') === DateCategoryType.EveryDay}
        />
      </div>
    </>
  );
};
