import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roles & Permissions | CargoMax",
  description:
    "Define and manage user roles and permissions to control access to key features within the CargoMax logistics system. Enhance security and operational efficiency.",
  keywords: [
    "User Roles",
    "Permissions Management",
    "Access Control",
    "CargoMax",
    "User Access Levels",
    "Admin Dashboard",
    "Security Settings",
    "Role-Based Access",
    "System Permissions",
    "Team Management",
  ],
};

const RolesPermissionsLayout = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export default RolesPermissionsLayout;
