// hooks/useModulePermission.ts

import { useModules } from "@/contexts/ModuleContext";

export const useModulePermission = () => {
  const { availableModules, isAdmin, hasModule } = useModules();

  const canAccess = (moduleId: string): boolean => {
    if (isAdmin) return true;
    return hasModule(moduleId);
  };

  const getVisibleModules = (allModules: string[]): string[] => {
    if (isAdmin) return allModules;
    return allModules.filter(m => availableModules.includes(m));
  };

  return {
    canAccess,
    getVisibleModules,
    availableModules,
    isAdmin,
  };
};