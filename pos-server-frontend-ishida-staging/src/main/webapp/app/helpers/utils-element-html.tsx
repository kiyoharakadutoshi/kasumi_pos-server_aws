import { MutableRefObject } from 'react';
import { isNullOrEmpty } from 'app/helpers/utils';
import { BUTTON_DROPDOWN_CLASS_NAME } from 'app/components/dropdown/dropdown';

export const handleFocusListElement = (focusableElements: any[], e: any, isCalendar?: boolean) => {
  const elementsFocus = focusableElements?.filter((element) => {
    if (element.className.includes('disable')) return false;

    const styleCSS = window.getComputedStyle(element);
    if (styleCSS?.display === 'none' || styleCSS?.visibility === 'hidden') return false;
    if (!isCalendar && element?.className?.includes('date-picker__calendar')) return false;
    const isTimePicker = element.tagName === 'BUTTON' && element.className.includes('input-time-picker');
    return !element.disabled && !element.getAttribute('aria-disabled') && !isTimePicker;
  });
  if (isNullOrEmpty(elementsFocus)) return;

  const firstElement = elementsFocus[0];
  const lastElement = elementsFocus[elementsFocus.length - 1];
  e.preventDefault();
  const index = elementsFocus.findIndex((item) => {
    return item === document.activeElement || [...item.childNodes]?.includes(document.activeElement);
  });

  if (e.shiftKey) {
    if (index < 0 || document.activeElement === firstElement) {
      focusElement(lastElement);
      return;
    }
    focusElement(elementsFocus[index - 1]);
    return;
  }

  if (index < 0 || document.activeElement === lastElement) {
    focusElement(firstElement);
    return;
  }

  focusElement(elementsFocus[index + 1]);
};

export const focusElement = (element?: HTMLElement) => {
  element?.focus();
  if (element?.tagName === 'INPUT') {
    (element as HTMLInputElement)?.select();
  }
};

export const functionKeys = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'Escape'];

export const getFocusableElements = (element: any, includeSidebarElement?: boolean, filterDisable?: boolean) => {
  if (!element || typeof element.querySelectorAll !== 'function') return null;
  let elements = [
    ...element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ),
  ];

  if (filterDisable) {
    elements = elements.filter((item: HTMLElement) => !item.hasAttribute('disabled'))
  }

  if (!includeSidebarElement) {
    return elements.filter((item) => !item.className.includes('sidebar-store_'));
  }

  return elements;
};

export const focusFirstInput = (ref: MutableRefObject<any>) => {
  if (!ref.current) return null;
  const element = ref.current.querySelector(
    `input:not([disabled]), button:not([disabled]).${BUTTON_DROPDOWN_CLASS_NAME}`
  );
  element?.focus();
  if (element?.tagName === 'INPUT') {
    (element as HTMLInputElement)?.select();
  }
};

export const focusInputElementTable = (
  data?: { record_id?: number }[],
  focusFirst?: boolean,
  keyItemFocusHasData?: string,
  keyItemFocusNoData?: string
) => {
  const itemsData = data?.filter((item) => item.record_id);
  if (itemsData?.length > 0) {
    const index = focusFirst ? 0 : itemsData.length - 1;
    let elements = document.querySelectorAll(`td.${keyItemFocusHasData} input:not([disabled])`);
    let inputElement = elements[index] as HTMLInputElement;

    if (!inputElement) {
      elements = document.querySelectorAll(`td.${keyItemFocusHasData} div input:not([disabled])`);
      inputElement = elements[index] as HTMLInputElement;
    }

    inputElement?.focus();
    setTimeout(() => {
      inputElement?.select();
    }, 100);
    return;
  }

  if (isNullOrEmpty(keyItemFocusNoData)) {
    return;
  }

  let element = document.querySelector(`td.${keyItemFocusNoData} input:not([disabled])`);
  if (element) {
    (element as HTMLInputElement)?.focus();
    return;
  }

  element = document.querySelector(`td.${keyItemFocusNoData} div input:not([disabled])`);
  (element as HTMLInputElement)?.focus();
};
