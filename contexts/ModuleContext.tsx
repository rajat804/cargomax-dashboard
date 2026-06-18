// contexts/ModuleContext.tsx

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getStorageJSON } from "@/utils/storage";

interface ModuleContextType {
  availableModules: string[];
  userModules: string[];
  isAdmin: boolean;
  loading: boolean;
  hasModule: (moduleId: string) => boolean;
  refreshModules: () => void;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export const useModules = () => {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error("useModules must be used within a ModuleProvider");
  }
  return context;
};

interface ModuleProviderProps {
  children: ReactNode;
}

// ✅ All possible modules (static list of available modules in system)
const ALL_MODULES = ["Operations", "Accounts", "Administrator", "Inventory", "Network"];

export const ModuleProvider: React.FC<ModuleProviderProps> = ({ children }) => {
  const [availableModules, setAvailableModules] = useState<string[]>([]);
  const [userModules, setUserModules] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadModules = () => {
    try {
      const userData = getStorageJSON("user");
      
      console.log("🔍 ModuleProvider - User Data:", userData);
      
      if (!userData) {
        setAvailableModules([]);
        setUserModules([]);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const isAdminUser = userData.role === 'admin' || userData.role === 'superadmin';
      setIsAdmin(isAdminUser);

      let modules: string[] = [];

      if (isAdminUser) {
        // ✅ Admin gets all modules
        modules = [...ALL_MODULES];
        console.log("👑 Admin - All modules:", modules);
      } else {
        // ✅ Get modules from user data (DYNAMIC - based on database)
        modules = userData.modules || [];
        
        // ✅ If no modules in database, return empty array (show nothing)
        // ✅ No default modules - strictly from database
        console.log("📦 User modules from DB:", modules);
      }

      console.log("✅ Final modules:", modules);
      
      setUserModules(modules);
      setAvailableModules(modules);
      setLoading(false);
    } catch (error) {
      console.error("Error loading modules:", error);
      setAvailableModules([]);
      setUserModules([]);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  const hasModule = (moduleId: string): boolean => {
    return availableModules.includes(moduleId);
  };

  const refreshModules = () => {
    setLoading(true);
    loadModules();
  };

  return (
    <ModuleContext.Provider
      value={{
        availableModules,
        userModules,
        isAdmin,
        loading,
        hasModule,
        refreshModules,
      }}
    >
      {children}
    </ModuleContext.Provider>
  );
};