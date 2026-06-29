"use client";

import { useState, useEffect } from "react";

interface User {
  companyName: string;
  email: string;
  branch: string;
  financialYear: string;
}

// Default values (sessionStorage empty hone par)
const DEFAULT_USER: User = {
  companyName: "GOLDEN ROADWAYS & LOGISTICS PVT LTD",
  email: "ADMIN@GMAIL.COM",
  branch: "CORPORATE OFFICE",
  financialYear: "2026-2027",
};

export const useSessionUser = (): User => {
  const [user, setUser] = useState<User>(DEFAULT_USER);

  useEffect(() => {
    const fetchUser = () => {
      try {
        const userDataStr = sessionStorage.getItem("user");
        const selectedBranch = sessionStorage.getItem("selectedBranch");

        if (userDataStr) {
          const parsed = JSON.parse(userDataStr);
          setUser({
            companyName: parsed.companyName || DEFAULT_USER.companyName,
            email: parsed.email || DEFAULT_USER.email,
            branch: selectedBranch || parsed.branch || DEFAULT_USER.branch,
            financialYear: parsed.financialYear || DEFAULT_USER.financialYear,
          });
        } else {
          // Agar sessionStorage mein user nahi hai toh default show karein
          setUser(DEFAULT_USER);
        }
      } catch (error) {
        console.error("Failed to parse user data from sessionStorage", error);
        setUser(DEFAULT_USER);
      }
    };

    fetchUser();

    // Dusre tabs mein change ho toh update ho
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "user" || event.key === "selectedBranch") {
        fetchUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return user;
};