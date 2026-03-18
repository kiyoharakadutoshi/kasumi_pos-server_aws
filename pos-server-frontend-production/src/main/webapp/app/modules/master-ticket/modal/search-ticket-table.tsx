import { Translate } from 'react-jhipster';
import { Ticket } from '../interface';
import React from 'react';
import './modal-ticket.scss';
import { NormalButton } from 'app/components/button/flat-button/flat-button';

export const SearchTicketTable = ({ items, handleSelectRow }: { items: Ticket[]; handleSelectRow: (ticket: Ticket) => void }) => {
  return (
    <>
      {items?.length > 0 && (
        <div className="table-search-ticket-container">
          <table className="table table-bordered table-responsive">
            <thead className="table-secondary title-table">
              <tr style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                <th style={{ width: '15%' }} scope="col">
                  {<Translate contentKey="modalTicket.select" />}
                </th>
                <th style={{ width: '15%' }} scope="col">
                  {<Translate contentKey="masterTicket.ticketCode" />}
                </th>
                <th style={{ width: '30%' }} scope="col">
                  {<Translate contentKey="masterTicket.ticketName" />}
                </th>
                <th style={{ width: '15%' }} scope="col">
                  {<Translate contentKey="modalTicket.discountAmount" />}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((ticket, index) => {
                return (
                  <tr key={index} style={{ verticalAlign: 'middle' }}>
                    <td align="center">
                      <NormalButton
                        text="modalTicket.select"
                        onClick={() => handleSelectRow(ticket)}
                      />
                    </td>
                    <td>{ticket.code}</td>
                    <td>{ticket.name}</td>
                    <td style={{ textAlign: 'end' }}>{ticket.amount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};
