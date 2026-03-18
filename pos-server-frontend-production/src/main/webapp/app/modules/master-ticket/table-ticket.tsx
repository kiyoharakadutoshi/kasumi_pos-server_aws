import { Translate } from "react-jhipster";
import { OperationType, DiscountType } from "./data-input";
import { Ticket } from "./interface";
import React from "react";

export const TableTicket = ({
  items,
  selectedRow,
  handleSelectRow,
}: {
  items: Ticket[];
  selectedRow: Ticket;
  handleSelectRow: (ticket: Ticket) => void;
}) => {
  const classNameTicket = (ticket: Ticket) => {
    let className = "";
    if (ticket.deleted) {
      className += "record-remove";
    }
    if (ticket.type === OperationType.New) {
      className += " record-new";
    }
    return className;
  };

  return (
    <div style={{ width: "100%" }} className="table-container">
      {items?.length > 0 && (
        <table className="table table-bordered table-responsive">
          <thead className="table-secondary title-table">
            <tr style={{ verticalAlign: "middle", textAlign: "center" }}>
              <th style={{ width: "15%" }} scope="col">
                {<Translate contentKey="masterTicket.store" />}
              </th>
              <th style={{ width: "15%" }} scope="col">
                {<Translate contentKey="masterTicket.ticketCode" />}
              </th>
              <th style={{ width: "30%" }} scope="col">
                {<Translate contentKey="masterTicket.ticketName" />}
              </th>
              <th style={{ width: "30%" }} scope="col">
                {<Translate contentKey="masterTicket.amount" />}
              </th>
            </tr>
          </thead>
          <tbody>
            {items?.map((ticket, index) => {
              const selected =
                selectedRow &&
                ticket.store_code === selectedRow.store_code &&
                ticket.code === selectedRow.code;
              const isEdit = ticket.type === OperationType.Edit;
              const isEditedName =
                isEdit && ticket.new_name && ticket.new_name !== ticket.name;
              const isEditedAmount =
                isEdit && ticket.amount && ticket.amount !== ticket.amount;
              return (
                <tr
                  key={index}
                  onClick={() => handleSelectRow(ticket)}
                  className={`${classNameTicket(ticket)}
                    ${selected ? "table-primary" : ""}`}
                >
                  <td>
                    {ticket.store_code} : {ticket.store_name}
                  </td>
                  <td>{ticket.code}</td>
                  <td className={isEditedName ? "record-edit" : ""}>
                    {ticket.name}
                    {isEditedName && (
                      <div>
                        ↓<br />
                        {ticket.new_name}
                      </div>
                    )}
                  </td>
                  <td className={isEditedAmount ? "record-edit" : ""}>
                    {ticket.amount}
                    {isEditedAmount && (
                      <div>
                        ↓<br />
                        {ticket.new_amount}
                      </div>
                    )}
                    {ticket.discount_type === DiscountType.Money ? "円" : "%"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
