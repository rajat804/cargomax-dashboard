import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | CargoMax",
  description:
    "Get in touch with the CargoMax team for support, inquiries, or partnership opportunities. We're here to help with your logistics and warehouse needs.",
  keywords: [
    "Contact CargoMax",
    "Customer Support",
    "Logistics Help",
    "Warehouse Inquiries",
    "CargoMax Support",
    "Logistics Assistance",
    "Partnership Inquiries",
    "Contact Page",
    "Reach CargoMax",
    "Support Center"
  ],
};

const ContactLayout = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

export default ContactLayout;
