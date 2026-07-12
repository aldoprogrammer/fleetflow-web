import { OrderTracker } from "@/components/orders/OrderTracker";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return <OrderTracker orderId={id} />;
}
