import { useEffect } from 'react';
import { useAppDispatch } from 'app/config/store';
import { clearSession } from 'app/reducers/user-login-reducer';

export const CheckLoginHook = () => {
  const dispatch = useAppDispatch();
  const channel = new BroadcastChannel('posServerChanel');

  /**
   * useEffect: when open or reload web, check if another page is open
   */
  useEffect(() => {
    // check if other pages are open
    requestDataFrom()
      .then(() => sessionStorage.setItem('hasOpened', 'true'))
      .catch((error) => {
        const navigationType = (performance.getEntriesByType('navigation')?.[0] as any)?.type;
        console.error(error.message, 'Navigation type:', navigationType);
        // Logout when opening page for the first time
        if (navigationType === 'navigate') {
          const hasOpened = sessionStorage.getItem('hasOpened');
          if (!hasOpened || hasOpened !== 'true') {
            console.error('Logout');
            dispatch(clearSession());
          }
        }
        sessionStorage.setItem('hasOpened', 'true');
      });

    // Create channel to listen for request when opening another new page
    channel.onmessage = (event) => {
      const { type } = event.data;

      // Respond if there is a request
      if (type === 'requestData') {
        channel.postMessage({
          type: 'responseData',
        });
      }
    };
  }, []);

  /**
   * requestDataFrom: send request to other pages,
   * 1. If there is result then return result
   * 2. If there is not then return error
   * @param timeoutDuration
   */
  const requestDataFrom = (timeoutDuration = 100) => {
    return new Promise((resolve, reject) => {
      // Return error
      const timeout = setTimeout(() => {
        reject(new Error('No response received within the timeout period.'));
      }, timeoutDuration);

      // Return response
      const handleResponse = (event: any) => {
        const { type } = event.data;

        if (type === 'responseData') {
          clearTimeout(timeout);
          channel.removeEventListener('message', handleResponse);
          resolve(event.data);
        }
      };

      channel.addEventListener('message', handleResponse);

      // Send request to other pages
      channel.postMessage({ type: 'requestData' });
    });
  };
};
