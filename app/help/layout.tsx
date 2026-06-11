import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & Logs | CargoMax",
  description:
    "Access support resources and view system activity logs. Get help with common issues and maintain visibility over system events in CargoMax.",
  keywords: [
    "CargoMax Help",
    "Support Center",
    "System Logs",
    "Activity Logs",
    "Help & Logs",
    "Troubleshooting",
    "User Assistance",
    "Log History",
    "Tech Support",
    "CargoMax Dashboard Support"
  ],
};

const HelpLogsLayout = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export default HelpLogsLayout;
