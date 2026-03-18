// React & Hooks
import React, { useEffect, useMemo, useState } from 'react';

// Redux
import { useAppDispatch, useAppSelector } from 'app/config/store';

// React Hook Form
import { FormProvider, useForm } from 'react-hook-form';

// Internationalization (i18n)
import { Translate, translate } from 'react-jhipster';

// Helpers & Utilities
import { formatValue, isNullOrEmpty, localizeFormat, localizeString } from 'app/helpers/utils';

// Constants, Enums, Interfaces
import { OperationType } from 'app/components/table/table-common';
import { setError } from '@/reducers/error';
import { IStoreInfo, IStoreSate } from 'app/reducers/store-reducer';
import { confirmTickets, getMasterTickets } from 'app/services/ticket-service';

import { CsvDataTicket, Discount, MasterTicketUpdate, ShoppingTicket, Ticket, TicketFormData } from './interface';

import { DiscountType, SEARCH_TYPE_OPTIONS, TicketType } from './data-type';

// Common Components
import Header from 'app/components/header/header';
import BottomButton from 'app/components/bottom-button/bottom-button';
import SidebarStore from 'app/components/sidebar-store-default/sidebar-store/sidebar-store';
import TableData, { TableColumnDef } from '@/components/table/table-data/table-data';

// Form Controls
import SelectControl from '@/components/control-form/select-control';
import RadioControl from '@/components/control-form/radio-control';
import InputControl from '@/components/control-form/input-control';

// Modals & Buttons
import ModalCommon, { IModalInfo, IModalType } from 'app/components/modal/modal-common';
import FuncKeyDirtyCheckButton from 'app/components/button/func-key-dirty-check/func-key-dirty-check-button';

// Page-Specific Components
// Styles
import './master-ticket.scss';
import { CellContext } from '@tanstack/react-table';
import ModalTicket from 'app/modules/master-ticket/modal/ticket-modal/modal-ticket';
import {
  discountDefault,
  formatAmount,
  shoppingTicketDefault,
  TICKET_DEFAULT_VALUE,
  TYPE_OPTION_LIST,
} from 'app/modules/master-ticket/config-data';
import { ModalMode } from 'app/components/modal/default-modal/default-enum';
import { TICKET_STORE_CODE_DEFAULT } from 'app/constants/constants';
import RegisterStoreControl from 'app/components/register-store';

export const MasterTicket = () => {
  const dispatch = useAppDispatch();
  const [modalInfo, setModalInfo] = useState<IModalInfo>({ isShow: false });
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [csvData, setCsvData] = useState<CsvDataTicket>(null);
  const storeState: IStoreSate = useAppSelector((state) => state.storeReducer);
  const selectedStores = useAppSelector((state) => state.storeReducer.selectedStores) ?? [];

  const isStoreDefault = useMemo(() => selectedStores?.includes(TICKET_STORE_CODE_DEFAULT), [selectedStores]);

  const hasStore = !isNullOrEmpty(selectedStores);

  const formConfig = useForm<TicketFormData>({
    defaultValues: TICKET_DEFAULT_VALUE,
  });
  const { watch, reset, getValues, setValue } = formConfig;

  const type = useMemo(() => {
    const { ticketType, ticketSearchType } = getValues();
    return ticketSearchType ?? ticketType;
  }, [watch('ticketType'), watch('ticketSearchType')]);

  const hasChangedTicket = useMemo(
    () => getValues('tickets')?.some((ticket) => ticket?.operation_type),
    [watch('tickets')]
  );

  const selectedRow = watch('selectedRows')?.[0];
  const nonSelectedRow = isNullOrEmpty(watch('selectedRows'));

  useEffect(() => {
    if (isNullOrEmpty(selectedStores)) return;
    setTimeout(() => {
      focusFirstElement();
    }, 100);
  }, []);

  useEffect(() => {
    const { tickets } = getValues();
    const ticket = tickets?.[selectedRow?.index];
    if (ticket) {
      setCsvData({
        store_code: ticket?.store_code,
        store_name: ticket?.store_name,
        code: ticket?.code,
        name: ticket?.name,
        amount: ticket?.unit_amount,
        include: storeState.applyStores.some((store) => store.store_code === ticket?.store_code) ? '*' : '',
      });
    } else {
      setCsvData(null);
    }
  }, [selectedRow]);

  /**
   * Check ticket default deleted -> can't handle record
   * @param tickets
   * @param record
   */
  const checkTicketDefaultDeleted = (tickets: Ticket[], record: Ticket) => {
    if (
      record.store_code !== TICKET_STORE_CODE_DEFAULT &&
      tickets?.some(
        (ticket) =>
          ticket?.store_code === TICKET_STORE_CODE_DEFAULT &&
          ticket?.code === record.code &&
          ticket?.operation_type === OperationType.Remove
      )
    ) {
      dispatch(setError(localizeString('MSG_ERR_008')));
      return true;
    }

    return false;
  };

  /**
   * Delete/Un-delete record select
   */
  const deleteTicket = () => {
    const tickets = getValues('tickets');
    const record: Ticket = tickets?.[selectedRow?.index];
    if (!record) return;
    const operationType =
      record?.operation_type === OperationType.Remove ? record?.operation_type_before : OperationType.Remove;
    tickets[selectedRow?.index] = {
      ...record,
      operation_type: operationType,
    };
    setValue('tickets', tickets);
  };

  /**
   * Handle action delete
   */
  const handleDeleteTicket = () => {
    const tickets = getValues('tickets');
    const record: Ticket = tickets?.[selectedRow?.index];
    if (!record) return;

    // Check has store default
    if (!isStoreDefault) {
      deleteTicket();
      return;
    }

    // Can't delete ticket if ticket default deleted
    if (checkTicketDefaultDeleted(tickets, record)) return;

    // Show modal confirm delete ticket default
    if (record.store_code === TICKET_STORE_CODE_DEFAULT) {
      setModalInfo({
        isShow: true,
        type: IModalType.confirm,
        message: localizeFormat('MSG_INFO_001', 'masterTicket.ticketCode'),
        extraData: OperationType.Remove,
      });
      return;
    }

    deleteTicket();
  };

  /**
   * AP6601 Search list ticket
   */
  const actionSearch = () => {
    setValue('selectedRows', null);
    setValue('ticketSearchType', getValues('ticketType'));
    setValue('addedTicketCodes', []);

    const param = {
      keyword: getValues('keyword'),
      selected_stores: selectedStores,
      type: getValues('ticketType'),
      search_type: Number(getValues('searchType')),
      page: 1,
      limit: 1000,
    };

    dispatch(getMasterTickets(param))
      .unwrap()
      .then((res) => {
        const result = res?.data?.data;
        setValue('isExceedRecords', result?.is_exceed_records);
        formConfig.setValue('tickets', result?.items);
        formConfig.setValue('defaultTickets', result?.items);
        formConfig.setValue('showNoData', isNullOrEmpty(result?.items));
      })
      .catch(() => formConfig.setValue('showNoData', true));
  };

  const handleClearData = () => {
    const { registerStores } = getValues();
    registerStores.forEach(item => item.selected = false)
    reset({ registerStores });
    focusFirstElement();
  };

  const columns = React.useMemo<TableColumnDef<Ticket>[]>(
    () => [
      {
        accessorKey: 'store',
        header: 'masterTicket.store',
        size: 30,
        type: 'text',
        textAlign: 'left',
        option(info: CellContext<Ticket, unknown>, defaultItem: Ticket) {
          const record = info?.row?.original;
          return {
            value: formatValue(record?.store_code, record?.store_name),
            defaultValue: formatValue(defaultItem?.store_code, defaultItem?.store_name),
          };
        },
      },
      {
        accessorKey: 'code',
        textAlign: 'left',
        header: 'masterTicket.ticketCode',
        type: 'text',
        size: 15,
      },
      {
        accessorKey: 'name',
        textAlign: 'left',
        header: 'masterTicket.ticketName',
        type: 'text',
        size: 35,
      },
      {
        accessorKey: 'amount',
        textAlign: 'left',
        header: 'masterTicket.amount',
        type: 'text',
        size: 20,
        option(info: CellContext<Ticket, unknown>, defaultItem: Ticket) {
          const record = info?.row?.original;
          return {
            value: formatAmount(record?.unit_amount, record?.ticket_summary_group_code),
            defaultValue: formatAmount(defaultItem?.unit_amount, defaultItem?.ticket_summary_group_code),
          };
        },
      },
    ],
    []
  );

  /**
   * Action confirm add, update, delete ticket
   */
  const handleConfirm = () => {
    const listTicket: Ticket[] = getValues('tickets');
    const tickets: MasterTicketUpdate = {
      type,
      registered_stores:
        getValues('registerStores')
          ?.filter((store) => store.selected)
          ?.map((store) => store.store_code) || [],
    };

    if (type === TicketType.TShoppingTicket) {
      tickets.shopping_tickets = [];
    } else if (type === TicketType.TDiscount) {
      tickets.discounts = [];
    }

    for (const data of listTicket) {
      if (data?.operation_type && (data.record_id > 0 || data?.operation_type !== OperationType.Remove)) {
        if (type === TicketType.TShoppingTicket) {
          tickets.shopping_tickets?.push({ ...data });
        } else {
          tickets.discounts?.push({ ...data });
        }
      }
    }

    // AP6603
    dispatch(confirmTickets(tickets))
      .unwrap()
      .then(() => {
        actionSearch();
      })
      .catch(() => {});
  };

  /**
   * Action add
   */
  const handleAdd = () => {
    if (isStoreDefault) {
      setModalInfo({
        isShow: true,
        type: IModalType.info,
        message: localizeString('MSG_INFO_002'),
        extraData: ModalMode.Add,
      });
      return;
    }

    setValue('ticket', type === TicketType.TDiscount ? discountDefault : shoppingTicketDefault);
    setModalMode(ModalMode.Add);
  };

  const handleEdit = () => {
    const { tickets } = getValues();
    const ticket = tickets?.[selectedRow?.index];

    if (ticket?.operation_type === OperationType.Remove) {
      dispatch(setError(localizeString('MSG_VAL_008')));
      return;
    }

    // Can't edit ticket if ticket default deleted
    if (checkTicketDefaultDeleted(tickets, ticket)) return;

    if (ticket?.store_code === TICKET_STORE_CODE_DEFAULT) {
      setModalInfo({
        isShow: true,
        type: IModalType.confirm,
        message: localizeFormat('MSG_INFO_001', 'masterTicket.ticketCode'),
        extraData: ModalMode.Edit,
      });
      return;
    }

    if (ticket?.ticket_summary_group_code === DiscountType.Percent) {
      ticket.discount_value = ticket?.unit_amount;
      ticket.unit_amount = null;
    }

    setValue('ticket', ticket);
    setModalMode(ModalMode.Edit);
  };

  /**
   * Action Click button OK on modal info with store default
   */
  const handleOKModal = () => {
    switch (modalInfo.extraData) {
      case ModalMode.Add:
        setValue('ticket', type === TicketType.TDiscount ? discountDefault : shoppingTicketDefault);
        setModalMode(modalInfo.extraData);
        break;
      case ModalMode.Edit:
        setValue('ticket', getValues('tickets')?.[selectedRow?.index]);
        setModalMode(modalInfo.extraData);
        break;
      case OperationType.Remove:
        deleteTicket();
        break;
      default:
        break;
    }

    setModalInfo({ isShow: false });
  };

  /**
   * Action close modal -> add/edit ticket
   * @param ticket
   */
  const closeModal = (ticket?: ShoppingTicket | Discount) => {
    const mode = modalMode;
    setModalMode(null);
    if (!ticket) return;

    const { tickets, selectedRows, addedTicketCodes, registerStores } = getValues();

    // Add ticket
    if (mode === ModalMode.Add) {
      const addedTicketCodesTmp = addedTicketCodes ?? [];

      const stores = registerStores?.filter((store) => store.selected && selectedStores?.includes(store.store_code));

      if (!isStoreDefault || stores?.length > 0) {
        addedTicketCodesTmp.push(ticket?.code);
      }

      setValue('addedTicketCodes', addedTicketCodesTmp);
      setValue('tickets', copyTicket(ticket, stores).concat(tickets ?? []));
      return;
    }

    const index = selectedRows?.[0]?.index;
    tickets[index] = ticket;
    setValue('tickets', tickets);
    return;
  };

  const copyTicket = (ticket: ShoppingTicket | Discount, stores: IStoreInfo[]): Ticket[] => {
    if (!isStoreDefault) return [ticket];

    if (isNullOrEmpty(stores)) return [];

    return stores?.map((store) => ({
      ...ticket,
      store_code: store?.store_code,
      store_name: store?.store_name,
    }));
  };

  const focusFirstElement = (isExpand?: boolean, isDirty?: boolean) => {
    if (isExpand || isDirty) return;
    const element: HTMLButtonElement = document.querySelector('.radio-button__input');
    element?.focus();
  };

  return (
    <div>
      <FormProvider {...formConfig}>
        <ModalCommon modalInfo={modalInfo} handleOK={handleOKModal} />
        <Header
          title="masterTicket.title"
          confirmBack={hasChangedTicket}
          hasESC={true}
          csv={{
            disabled: !csvData,
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
        <div className={'master-ticket__main'}>
          <SidebarStore
            onClickSearch={() => {}}
            expanded={true}
            onChangeCollapseExpand={focusFirstElement}
            selectMultiple
            hasData={watch('tickets')?.length > 0}
            actionConfirm={handleClearData}
          />
          {/* Input search */}
          <div className={'master-ticket__search'}>
            <div className="master-ticket__type">
              <label className="label-radio">
                <Translate contentKey={'masterTicket.type'} />
                <span className="text-require">*</span>
              </label>
              <RadioControl
                isVertical={false}
                name="ticketType"
                value={watch('ticketType')}
                listValues={TYPE_OPTION_LIST}
              />
            </div>
            <div className={'master-ticket__product-group'}>
              <InputControl
                name="keyword"
                className="input-condition-keyword"
                labelText="masterTicket.ticketName"
                disabled={!hasStore}
              />
              <SelectControl
                name="searchType"
                items={SEARCH_TYPE_OPTIONS}
                isHiddenCode={true}
                onChange={(e) => e.value}
                disabled={!hasStore}
              />
              <FuncKeyDirtyCheckButton
                text="action.f12Search"
                funcKey={'F12'}
                onClickAction={actionSearch}
                okDirtyCheckAction={actionSearch}
                name={'action.f12Search'}
                dirtyCheck={hasChangedTicket}
                disabled={!hasStore}
              />
            </div>
          </div>
          {modalMode && <ModalTicket type={type} mode={modalMode} closeModal={closeModal} />}
        </div>
        <div className="ticket-container">
          <div className="master-ticket__table d-flex">
            <TableData<Ticket>
              columns={columns}
              tableKey="tickets"
              data={watch('tickets') ?? []}
              defaultData={watch('defaultTickets')}
              onDoubleClick={() => handleEdit()}
              isExceedRecords={watch('isExceedRecords')}
            />
            <div
              className={`master-ticket__table-right flex-shrink-1 ${isStoreDefault ? 'ms-3' : ''}`}
              style={isStoreDefault ? { width: '25vw' } : {}}
            >
              {isStoreDefault && <RegisterStoreControl />}
            </div>
          </div>
          <BottomButton
            disableEdit={nonSelectedRow}
            disableConfirm={!hasChangedTicket}
            disableAdd={!hasStore}
            disableDelete={nonSelectedRow}
            clearAction={handleClearData}
            dirtyCheckClear={hasChangedTicket}
            deleteAction={handleDeleteTicket}
            editAction={handleEdit}
            addAction={handleAdd}
            confirmAction={handleConfirm}
            disabledClear={isNullOrEmpty(watch('tickets'))}
          />
        </div>
      </FormProvider>
    </div>
  );
};

export default MasterTicket;
