import { Discount, ShoppingTicket, Ticket, TicketFormData } from 'app/modules/master-ticket/interface';
import { UseFormSetError } from 'react-hook-form/dist/types/form';
import { isValidDate, isValidTime, localizeFormat, localizeString, parseBool } from 'app/helpers/utils';
import { DateCategoryType, TicketType } from 'app/modules/master-ticket/data-type';

export const validateTicket = (
  type: TicketType,
  ticket: Ticket | Discount | ShoppingTicket,
  setError: UseFormSetError<TicketFormData>
): boolean => {
  if (type === TicketType.TDiscount) {
    return validateDiscount(ticket as Discount, setError);
  }

  return true;
};

export const validateDiscount = (ticket: Discount, setError: UseFormSetError<TicketFormData>) => {
  return isValidTimeService(ticket, setError) && isValidDateCategory(ticket, setError);
};

const isValidTimeService = (ticket: Discount, setError: UseFormSetError<TicketFormData>): boolean => {
  if (!isValidDate(ticket.start_date) || !isValidDate(ticket.end_date)) return false;
  if (!isValidTime(ticket.start_time) || !isValidTime(ticket.end_time)) return false;

  if (`${ticket.start_date} ${ticket.start_time}` >= `${ticket.end_date} ${ticket.end_time}`) {
    setError('ticket.start_date', { message: localizeString('MSG_VAL_051') });
    return false;
  }

  return true;
};

const isValidDateCategory = (ticket: Discount, setError: UseFormSetError<TicketFormData>): boolean => {
  if (ticket.date_categorize_type_code !== DateCategoryType.DayOfWeek) return true;

  if (
    parseBool(ticket.is_monday) ||
    parseBool(ticket.is_tuesday) ||
    parseBool(ticket.is_wednesday) ||
    parseBool(ticket.is_thursday) ||
    parseBool(ticket.is_friday) ||
    parseBool(ticket.is_saturday) ||
    parseBool(ticket.is_sunday)
  )
    return true;

  setError('ticket.is_monday', { message: localizeFormat('MSG_VAL_027', 'modalTicket.dayOfWeekVal') });
  return false;
};
