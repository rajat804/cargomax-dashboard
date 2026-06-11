import { LiveShipmentMap } from "@/components/map/live-shipment-map";
import PageHeader from "@/components/shared/PageHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map - Cargomax Dashboard",
  description:
    "Cargomax is a modern and responsive Shipping & Logistics Admin Dashboard Template designed for cargo management, freight tracking, warehouse control, and logistics operations.",
};

export default function LiveShipmentMapPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        pageTitle="Live Shipment Map"
        pageDes="Track all active shipments in real-time across global logistics networks"
      />

      {/* Main Map Component */}
      <LiveShipmentMap />
    </div>
  );
}
