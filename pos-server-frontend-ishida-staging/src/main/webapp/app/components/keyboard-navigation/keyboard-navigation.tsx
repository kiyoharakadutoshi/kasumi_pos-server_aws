import React, { createContext, useEffect, useState } from 'react';
import { getFocusableElements, handleFocusListElement } from 'app/helpers/utils-element-html';
import { useLocation } from 'react-router';
import { isNullOrEmpty } from 'app/helpers/utils';
import { BASE_CONTENT_CLASS_NAME } from 'app/app';
import { ignoreFunctionKeyHook } from 'app/hooks/keyboard-hook';
import { URL_MAPPING } from 'app/router/url-mapping';

export type TypeView = 'main' | 'store' | 'modal' | 'dialog' | 'calendar' | 'loading';

const ignoreURLs = [`/${URL_MAPPING.SC7401}`, `/${URL_MAPPING.SC0301}` ];

export interface IView {
  type: TypeView;
  element: HTMLElement;
}

interface IKeyboardViewContext {
  addView: (type: TypeView, element: HTMLElement) => void;
  removeView: (type: TypeView) => void;
  setKeyboardListener: (data: any) => void;
  topView: IView;
}

export const KeyboardViewContext = createContext<IKeyboardViewContext | undefined>(undefined);

interface IKeyboardNavigationProps {
  children: React.ReactNode;
}

/*
  Class that handles keyboard key press actions.
  Manages the views displayed on the screen: Main, sidebar store, modal, dialog.
  Add action to the view displayed on top
 */

const KeyboardNavigation = (props: IKeyboardNavigationProps) => {
  const [dataListener, setDataListener] = useState<any>(null);
  const location = useLocation();
  const [views, setViews] = useState<IView[]>([]);
  const topView = isNullOrEmpty(views) ? null : views[views.length - 1];

  ignoreFunctionKeyHook({});

  useEffect(() => {
    addView('main', document.querySelector(`.${BASE_CONTENT_CLASS_NAME}`));
  }, []);

  useEffect(() => {
    const currentView = views[views?.length - 1];
    if (!currentView) return;
    if (ignoreURLs.includes(location.pathname) && currentView.type === 'main') return;

    const focusableElements = getFocusableElements(
      currentView?.element,
      currentView?.type === 'store'
    );
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

    document.addEventListener('keydown', onKeydown);
    return () => {
      document.removeEventListener('keydown', onKeydown);
    };
  }, [views, location.pathname, dataListener]);

  const addView = (type: TypeView, element: HTMLElement) => {
    setViews((prevViews) => {
      if (type === 'main') {
        const results = prevViews.filter((item) => item.type !== 'main');
        results.unshift({ type, element });
        return results;
      }
      return [...prevViews, { type, element }];
    });
  };

  const removeView = (type: TypeView) => {
    setViews((prevViews) => {
      const lastIndex =
        prevViews.length - 1 - [...prevViews].reverse().findIndex((item) => item.type === type);
      if (lastIndex < 0 || lastIndex >= prevViews.length) {
        return prevViews;
      }
      return [...prevViews.slice(0, lastIndex), ...prevViews.slice(lastIndex + 1)];
    });
  };

  const setKeyboardListener = (data: any) => {
    setDataListener(data);
  };

  return (
    <KeyboardViewContext.Provider value={{ addView, removeView, setKeyboardListener, topView }}>
      {props.children}
    </KeyboardViewContext.Provider>
  );
};

export default KeyboardNavigation;
