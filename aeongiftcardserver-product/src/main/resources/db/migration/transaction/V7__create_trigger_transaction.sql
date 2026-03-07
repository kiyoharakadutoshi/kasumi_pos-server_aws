CREATE TRIGGER trg_transaction_before_update
BEFORE UPDATE ON transaction
FOR EACH ROW
BEGIN
    SET NEW.record_update_date = CURRENT_DATE();
    SET NEW.record_update_time = CURRENT_TIME();
END;

CREATE TRIGGER trg_settlement_history_before_update
BEFORE UPDATE ON settlement_history
FOR EACH ROW
BEGIN
    SET NEW.record_update_date = CURRENT_DATE();
    SET NEW.record_update_time = CURRENT_TIME();
END;