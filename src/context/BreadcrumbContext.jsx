import React, { createContext, useContext, useState, useCallback } from "react";

const BreadcrumbContext = createContext();

export const useBreadcrumbMetadata = () => {
  const context = useContext(BreadcrumbContext);
  return context || {};
};

export const BreadcrumbProvider = ({ children }) => {
  const [metadata, setMetadata] = useState({});

  const updateMetadata = useCallback((newMetadata) => {
    setMetadata((prev) => ({ ...prev, ...newMetadata }));
  }, []);

  const clearMetadata = useCallback(() => {
    setMetadata({});
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ metadata, updateMetadata, clearMetadata }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

