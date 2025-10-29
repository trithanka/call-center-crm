import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [navOpen, setNavOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("Dashboard");

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState) {
      setNavOpen(JSON.parse(savedState));
    }
  }, []);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarState', JSON.stringify(navOpen));
  }, [navOpen]);

  const toggleSidebar = () => {
    setNavOpen(!navOpen);
  };

  const closeSidebar = () => {
    setNavOpen(false);
  };

  const openSidebar = () => {
    setNavOpen(true);
  };

  const setActiveNavItem = (item) => {
    setActiveItem(item);
  };

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && navOpen) {
        setNavOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navOpen]);

  // Handle body overflow on mobile
  useEffect(() => {
    const isLarge = window.innerWidth >= 1024;
    document.body.style.overflow = (navOpen && !isLarge) ? 'hidden' : 'unset';
  }, [navOpen]);

  const value = {
    navOpen,
    activeItem,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    setActiveNavItem
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};
