// constants/modules.ts

export interface Module {
  id: string;
  name: string;
  icon: any;
  description?: string;
  order?: number;
}

export const ALL_MODULES: Module[] = [
  { 
    id: "Operations", 
    name: "Operations", 
    icon: null, // Icon will be set in component
    description: "Manage all operations and transactions",
    order: 1
  },
  { 
    id: "Accounts", 
    name: "Accounts", 
    icon: null,
    description: "Manage financial transactions and accounts",
    order: 2
  },
  { 
    id: "Administrator", 
    name: "Administrator", 
    icon: null,
    description: "System administration and configuration",
    order: 3
  },
  { 
    id: "Inventory", 
    name: "Inventory", 
    icon: null,
    description: "Manage inventory and stock",
    order: 4
  },
  { 
    id: "Network", 
    name: "Network", 
    icon: null,
    description: "Manage network and hubs",
    order: 5
  },
];

export const DEFAULT_USER_MODULES = ["Operations", "Accounts", "Inventory", "Network"];

export const ADMIN_MODULES = ALL_MODULES.map(m => m.id);

export const MODULE_ICONS: Record<string, any> = {
  Operations: null,
  Accounts: null,
  Administrator: null,
  Inventory: null,
  Network: null,
};