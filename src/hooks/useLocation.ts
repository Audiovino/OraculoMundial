import { useEffect, useState } from 'react';
import { BrowserLocationResult, IpLocationResult, getBrowserGeolocation, getIpLocation } from '../utils/locationDetector';

export type LocationStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface UseLocationState {
  status: LocationStatus;
  ipLocation: IpLocationResult | null;
  browserLocation: BrowserLocationResult | null;
  error?: string;
}

export function useLocation(enabled: boolean = true, requestBrowserPermission: boolean = false) {
  const [state, setState] = useState<UseLocationState>({
    status: 'idle',
    ipLocation: null,
    browserLocation: null,
    error: undefined
  });

  useEffect(() => {
    if (!enabled) return;

    const loadLocation = async () => {
      setState(prev => ({ ...prev, status: 'loading', error: undefined }));

      try {
        const ipLocation = await getIpLocation();
        let browserLocation: BrowserLocationResult | null = null;

        if (requestBrowserPermission) {
          try {
            browserLocation = await getBrowserGeolocation();
          } catch (error) {
            browserLocation = null;
          }
        }

        setState({
          status: 'loaded',
          ipLocation,
          browserLocation,
          error: undefined
        });
      } catch (error) {
        setState({
          status: 'error',
          ipLocation: null,
          browserLocation: null,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    };

    loadLocation();
  }, [enabled, requestBrowserPermission]);

  return state;
}
