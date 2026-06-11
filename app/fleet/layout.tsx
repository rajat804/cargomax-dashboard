import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Management | Cargomax",
  description:
    "Cargomax is a modern and responsive Shipping & Logistics Admin Dashboard Template designed for cargo management, freight tracking, warehouse control, and logistics operations.",
};

const ManagementLayout = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export default ManagementLayout;
