// components/TopBar.tsx
"use client";

import { useEffect, useState, useRef } from "react";
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
  Home,
  HelpCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { logout } from "@/services/api";
import { getStorageJSON, clearAuthStorage } from "@/utils/storage";
import { useModules } from "@/contexts/ModuleContext";

// Import navigation data and helper
import {
  commonNavGroups,
  moduleNavGroups,
  helpAndSupportGroup,
  extractAllPages,
} from "@/lib/navigation";

interface TopBarProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
  selectedModule: string;
  onModuleSelect: (module: string) => void;
}

// All available modules with icons
const ALL_MODULES = [
  { id: "Operations", name: "Operations", icon: Settings },
  { id: "Accounts", name: "Accounts", icon: DollarSign },
  { id: "Administrator", name: "Administrator", icon: ShieldCheck },
  { id: "Inventory", name: "Inventory", icon: BoxesIcon },
  { id: "Network", name: "Network", icon: Network },
];

// Build the complete list of searchable pages from all navigation
function buildSearchablePages() {
  const allPages: Array<{ path: string; name: string; module: string; icon: React.ElementType }> = [];

  // Dashboard pages
  const dashboardPages = extractAllPages(commonNavGroups);
  allPages.push(...dashboardPages);

  // Module pages
  for (const moduleKey of Object.keys(moduleNavGroups)) {
    const groups = moduleNavGroups[moduleKey];
    const pages = extractAllPages(groups);
    allPages.push(...pages.map(p => ({ ...p, module: moduleKey })));
  }

  // Help & Support pages
  const helpPages = extractAllPages([helpAndSupportGroup]);
  allPages.push(...helpPages);

  return allPages;
}

const ALL_SEARCHABLE_PAGES = buildSearchablePages();

export function TopBar({ toggleSidebar, sidebarOpen, selectedModule, onModuleSelect }: TopBarProps) {
  const router = useRouter();
  const { availableModules, userModules, isAdmin, loading } = useModules();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [userName, setUserName] = useState<string>("User");
  const [userRole, setUserRole] = useState<string>("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof ALL_SEARCHABLE_PAGES>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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

  // Filter modules based on user's access
  const filteredModules = ALL_MODULES.filter(module => {
    if (isAdmin) return true;
    return availableModules.includes(module.id);
  });

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

  const showModuleSelector = filteredModules.length > 0;

  // --- Search: only show pages from accessible modules ---
  const getAccessiblePages = () => {
    if (isAdmin) return ALL_SEARCHABLE_PAGES;
    return ALL_SEARCHABLE_PAGES.filter(page => {
      // Dashboard and Help & Support are always accessible
      if (page.module === "Dashboard" || page.module === "Help & Support") return true;
      return availableModules.includes(page.module);
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.trim();
    setSearchQuery(query);

    if (query === "") {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const accessible = getAccessiblePages();
    const filtered = accessible.filter(page =>
      page.name.toLowerCase().includes(query.toLowerCase()) ||
      page.path.toLowerCase().includes(query.toLowerCase()) ||
      page.module.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
    setIsSearchOpen(true);
  };

  const handleSearchSelect = (path: string) => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchOpen(false);
    router.push(path);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      handleSearchSelect(searchResults[0].path);
    } else if (e.key === "Escape") {
      setSearchQuery("");
      setSearchResults([]);
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  // Keyboard shortcut: Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        
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
        
        {!showModuleSelector && !isAdmin && (
          <span className="text-sm text-muted-foreground">No modules assigned</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block" ref={searchContainerRef}>
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="search"
            placeholder="Search pages... (Ctrl+K)"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => {
              if (searchQuery.trim() !== "") {
                const accessible = getAccessiblePages();
                const filtered = accessible.filter(page =>
                  page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  page.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  page.module.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setSearchResults(filtered);
                setIsSearchOpen(filtered.length > 0);
              }
            }}
            className="w-64 rounded-md pl-8"
          />
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-80 overflow-y-auto rounded-md border bg-background shadow-lg">
              {searchResults.map((page) => (
                <button
                  key={page.path}
                  onClick={() => handleSearchSelect(page.path)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <page.icon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col items-start">
                    <span>{page.name}</span>
                    <span className="text-xs text-muted-foreground">{page.module}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          {isSearchOpen && searchQuery.trim() !== "" && searchResults.length === 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-md border bg-background p-4 text-center text-sm text-muted-foreground shadow-lg">
              No pages found for "{searchQuery}"
            </div>
          )}
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