import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Widgets | CargoMax",
  description:
    "Cargomax is a modern and responsive Shipping & Logistics Admin Dashboard Template designed for cargo management, freight tracking, warehouse control, and logistics operations. Built with clean UI components and advanced features, Cargomax offers real-time shipment monitoring, driver assignments, order tracking, fleet status, and warehouse insights.",
};

const WidgetsLayout = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export default WidgetsLayout;
