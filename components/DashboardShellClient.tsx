"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";

export default function DashboardShellClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState("Operations");

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 991);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <Sidebar 
        open={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        selectedModule={selectedModule}
        onModuleSelect={setSelectedModule}
      />
      {/* Updated margin-left from lg:ml-64 to lg:ml-80 to match sidebar width (w-80 = 20rem = 320px) */}
      <div className="flex flex-1 flex-col ml-0 lg:ml-80">
        <TopBar 
          toggleSidebar={toggleSidebar} 
          sidebarOpen={sidebarOpen}
          selectedModule={selectedModule}
          onModuleSelect={setSelectedModule}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </>
  );
}