"use client";

import { DriverAssignedOrdersPanel } from "@/components/orders/DriverAssignedOrdersPanel";
import { OrderTrackForm } from "@/components/orders/OrderTrackForm";

export default function TrackOrderPage() {
  return (
    <div className="space-y-8">
      <DriverAssignedOrdersPanel />
      <OrderTrackForm />
    </div>
  );
}
