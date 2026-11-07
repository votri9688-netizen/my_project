'use client';
import { createContext, useContext, useState } from 'react';
import Sidebar from './Sidebar';

const SidebarContext = createContext({
  isOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
  toggleSidebar: () => {},
});

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        openSidebar: () => setIsOpen(true),
        closeSidebar: () => setIsOpen(false),
        toggleSidebar: () => setIsOpen((prev) => !prev),
      }}
    >
      <div className="flex min-h-screen bg-slate-50 text-slate-900">
        <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">{children}</div>
      </div>
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
