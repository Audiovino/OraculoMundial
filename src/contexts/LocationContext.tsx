import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LocationContextProps {
  mapsUrl: string | null;
  setMapsUrl: (url: string | null) => void;
}

const LocationContext = createContext<LocationContextProps | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mapsUrl, setMapsUrl] = useState<string | null>(null);
  return (
    <LocationContext.Provider value={{ mapsUrl, setMapsUrl }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextProps => {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return ctx;
};
