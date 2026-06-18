"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  DollarSign,
  ShieldCheck,
  BoxesIcon,
  Network,
  Menu,
  X,
  Bell,
  User,
  Search,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { logout } from "@/services/api";
import { getStorageJSON, clearAuthStorage } from "@/utils/storage";
import { useModules } from "@/contexts/ModuleContext";

interface TopBarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
  selectedModule: string;
  onModuleSelect: (module: string) => void;
}

// ✅ All available modules with icons (STATIC LIST)
const ALL_MODULES = [
  { id: "Operations", name: "Operations", icon: Settings },
  { id: "Accounts", name: "Accounts", icon: DollarSign },
  { id: "Administrator", name: "Administrator", icon: ShieldCheck },
  { id: "Inventory", name: "Inventory", icon: BoxesIcon },
  { id: "Network", name: "Network", icon: Network },
];

export function TopBar({ toggleSidebar, sidebarOpen, selectedModule, onModuleSelect }: TopBarProps) {
  const router = useRouter();
  const { availableModules, userModules, isAdmin, loading } = useModules();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [userName, setUserName] = useState<string>("User");
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = getStorageJSON("user");
      if (userData) {
        setUserName(
          userData.name ||
          userData.email?.split("@")[0] ||
          "User"
        );
        setUserRole(userData.role || "user");
      }
    }
  }, []);

  // ✅ DYNAMIC: Filter modules based on user's available modules
  const filteredModules = ALL_MODULES.filter(module => {
    // Admin sees all modules
    if (isAdmin) return true;
    // User sees only assigned modules
    return availableModules.includes(module.id);
  });

  console.log("🔍 User Modules:", availableModules);
  console.log("📦 Filtered Modules:", filteredModules.map(m => m.id));

  // ✅ Get current module
  const getEffectiveModule = () => {
    if (selectedModule === "Dashboard" || selectedModule === "Help & Support") {
      return filteredModules.length > 0 ? filteredModules[0].id : "Operations";
    }
    if (filteredModules.some(m => m.id === selectedModule)) {
      return selectedModule;
    }
    return filteredModules.length > 0 ? filteredModules[0].id : "Operations";
  };
  
  const effectiveSelectedModule = getEffectiveModule();
  const selectedModuleData = filteredModules.find(m => m.id === effectiveSelectedModule) || filteredModules[0];

  // ✅ Update parent if needed
  useEffect(() => {
    if (effectiveSelectedModule !== selectedModule && filteredModules.length > 0) {
      onModuleSelect(effectiveSelectedModule);
    }
  }, [effectiveSelectedModule, selectedModule, onModuleSelect, filteredModules]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      clearAuthStorage();
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout error:", error);
      clearAuthStorage();
      window.location.href = "/auth/login";
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin' || role === 'superadmin') {
      return 'bg-blue-100 text-blue-700';
    }
    return 'bg-green-100 text-green-700';
  };

  // ✅ Show module selector only if user has at least one module
  const showModuleSelector = filteredModules.length > 0;

  if (loading) {
    return (
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-pulse bg-muted rounded"></div>
          <div className="h-8 w-32 animate-pulse bg-muted rounded"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse bg-muted rounded-full"></div>
          <div className="h-8 w-8 animate-pulse bg-muted rounded-full"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 shadow-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        
        {/* ✅ Show module selector only if user has modules */}
        {showModuleSelector && (
          <div className="hidden md:block relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              )}
            >
              {selectedModuleData && (
                <>
                  <selectedModuleData.icon className="h-4 w-4" />
                  <span>{selectedModuleData.name}</span>
                </>
              )}
              <ChevronDown className={cn("h-4 w-4 transition-transform", isDropdownOpen && "rotate-180")} />
            </button>
            
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute left-0 top-full mt-2 z-50 w-56 rounded-md border bg-background shadow-lg">
                  {filteredModules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => {
                        onModuleSelect(module.id);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                        effectiveSelectedModule === module.id && "bg-accent text-accent-foreground"
                      )}
                    >
                      <module.icon className="h-4 w-4" />
                      <span>{module.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        
        {showModuleSelector && (
          <div className="md:hidden">
            <select
              value={effectiveSelectedModule}
              onChange={(e) => onModuleSelect(e.target.value)}
              className="flex h-9 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {filteredModules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* ✅ Show message if no modules assigned */}
        {!showModuleSelector && !isAdmin && (
          <span className="text-sm text-muted-foreground">
            No modules assigned
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 rounded-md pl-8"
          />
        </div>
        
        <ThemeToggle />
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>
        
        <div className="relative">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="hidden text-sm font-medium md:inline-block">{userName}</span>
            <span className={cn(
              "hidden text-xs px-2 py-0.5 rounded-full md:inline-block",
              getRoleBadge(userRole)
            )}>
              {isAdmin ? 'Admin' : 'User'}
            </span>
            <ChevronDown className={cn("hidden h-4 w-4 text-muted-foreground md:block transition-transform", isProfileDropdownOpen && "rotate-180")} />
          </div>
          
          {isProfileDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-md border bg-background shadow-lg">
                <div className="border-b px-4 py-3">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                  {userModules.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t">
                      {userModules.map((module) => (
                        <span key={module} className="text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                          {module}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                      No modules assigned
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}