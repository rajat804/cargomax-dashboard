import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | CargoMax",
  description:
    "Configure your system preferences, user roles, permissions, and notification settings to tailor CargoMax to your operational needs.",
  keywords: [
    "CargoMax Settings",
    "System Configuration",
    "User Roles",
    "Permissions Management",
    "Notification Settings",
    "Logistics Platform",
    "Warehouse Software Settings",
    "Admin Panel",
    "Access Control",
    "Logistics Management Tools"
  ],
};

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export default SettingsLayout;
