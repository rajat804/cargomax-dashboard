import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports | CargoMax",
  description:
    "Analyze logistics performance with in-depth reports on delivery efficiency, revenue trends, and fleet productivity. Gain insights to improve operational decisions.",
  keywords: [
    "Logistics Reports",
    "CargoMax",
    "Delivery Performance",
    "Revenue Analysis",
    "Fleet Efficiency",
    "Supply Chain Analytics",
    "Logistics KPIs",
    "Transportation Insights",
    "Operational Reports",
    "Warehouse Analytics"
  ],
};

const ReportsLayout = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export default ReportsLayout;
