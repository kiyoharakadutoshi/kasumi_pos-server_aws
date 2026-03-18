import { EventKeyTabs } from "../enum-master-stores";

/**
 * Check if the current tab should be shown based on the key event.
 * @param keyEvent 
 * @param tab 
 * @returns 
 */
const isShowTabs = (keyEvent: EventKeyTabs, tab: EventKeyTabs) => {
  return keyEvent !== tab ? 'is-hidden' : '';
};

const CODE_PAYMENT_METHOD_AEONPAY = '3';

export { isShowTabs, CODE_PAYMENT_METHOD_AEONPAY };