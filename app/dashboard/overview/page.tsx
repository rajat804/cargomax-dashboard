"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import OverviewPage from "@/components/overview/overviewPage";

export default function Overview() {
  const router = useRouter();

  useEffect(() => {
    // ✅ sessionStorage pehle, phir localStorage
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") || localStorage.getItem("isLoggedIn");
    const selectedBranch = sessionStorage.getItem("selectedBranch") || localStorage.getItem("selectedBranch");

    console.log("Overview - Checking auth...");
    console.log("token:", token ? "Present" : "Missing");
    console.log("isLoggedIn:", isLoggedIn);
    console.log("selectedBranch:", selectedBranch);

    if (!token || !isLoggedIn) {
      console.log("No login found, redirecting to /login");
      router.replace("/auth/login");
      return;
    }

    if (!selectedBranch) {
      console.log("No branch selected, redirecting to /select-branch");
      router.replace("/auth/select-branch");
      return;
    }
  }, [router]);

  return <OverviewPage />;
}