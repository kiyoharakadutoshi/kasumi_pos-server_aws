import { RefObject, useContext, useEffect } from 'react';
import { functionKeys, getFocusableElements, handleFocusListElement } from 'app/helpers/utils-element-html';
import { KeyboardViewContext } from 'app/components/keyboard-navigation/keyboard-navigation';

interface FocusElementKeydownHookProps {
  ref: RefObject<HTMLElement>;
  showStore?: boolean;
  addEventIfShowStore?: boolean;
  dataChange?: any;
}

export const focusElementKeydownHook = ({ showStore, addEventIfShowStore, dataChange, ref }: FocusElementKeydownHookProps) => {
  useEffect(() => {
    const focusableElements = getFocusableElements(ref, showStore);

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        handleFocusListElement(focusableElements, e);
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        handleFocusListElement(focusableElements, e);
        return;
      }
    };

    if ((!addEventIfShowStore && !showStore) || (addEventIfShowStore && showStore)) {
      document.addEventListener('keydown', onKeydown);
    }

    return () => {
      document.removeEventListener('keydown', onKeydown);
    };
  }, [showStore, dataChange]);
};

/*
  Function to handle set data changes for KeyboardNavigation.tsx.
  When data changes, the number of focused elements is changed
  => Handle tab, enter correctly according to reality
 */
export const elementChangeKeyListener = (elementChange: any) => {
  const { setKeyboardListener } = useContext(KeyboardViewContext);

  useEffect(() => {
    setKeyboardListener(elementChange);
  }, [elementChange]);
};

interface IgnoreFunctionKeyHook {
  ignoreKeys?: string[];
}

export const ignoreFunctionKeyHook = ({ ignoreKeys = functionKeys }: IgnoreFunctionKeyHook) => {
  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (ignoreKeys?.includes(e.key)) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', onKeydown);

    return () => {
      document.removeEventListener('keydown', onKeydown);
    };
  }, []);
};
