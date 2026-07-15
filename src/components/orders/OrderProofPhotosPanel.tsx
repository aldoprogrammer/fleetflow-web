"use client";

import { Camera, ImageIcon } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactElement,
} from "react";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  extractApiErrorMessage,
  getOrder,
  uploadOrderPhoto,
  type OrderPhoto,
  type OrderResponse,
} from "@/lib/api/orders";
import { formatDateTime } from "@/lib/orders/display";
import {
  canUploadDeliveryProof,
  canUploadDepartureProof,
} from "@/lib/orders/operations";
import { subscribeOrderUpdates } from "@/lib/realtime/bus";
import { useAuthStore } from "@/stores/auth-store";

interface OrderProofPhotosPanelProps {
  order: OrderResponse;
  onOrderUpdated?: (order: OrderResponse) => void;
}

function ProofPhotoGrid({
  photos,
  emptyLabel,
}: {
  photos: OrderPhoto[];
  emptyLabel: string;
}): ReactElement {
  if (photos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((photo) => (
        <a
          key={photo.id}
          href={photo.url}
          target="_blank"
          rel="noreferrer"
          className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt="Proof photo"
            className="aspect-square w-full object-cover transition group-hover:scale-[1.02]"
          />
          <p className="px-2 py-1.5 text-[11px] text-slate-500">
            {formatDateTime(photo.createdAt)}
          </p>
        </a>
      ))}
    </div>
  );
}

export function OrderProofPhotosPanel({
  order,
  onOrderUpdated,
}: OrderProofPhotosPanelProps): ReactElement | null {
  const session = useAuthStore((state) => state.session);
  const departureInputRef = useRef<HTMLInputElement>(null);
  const deliveryInputRef = useRef<HTMLInputElement>(null);
  const [uploadingType, setUploadingType] = useState<
    "DEPARTURE" | "DELIVERY" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [liveOrder, setLiveOrder] = useState(order);

  useEffect(() => {
    setLiveOrder(order);
  }, [order]);

  useEffect(() => {
    return subscribeOrderUpdates((orderId) => {
      if (orderId !== order.id) {
        return;
      }
      void getOrder(order.id)
        .then((refreshed) => {
          setLiveOrder(refreshed);
          onOrderUpdated?.(refreshed);
        })
        .catch(() => {
          // Parent may refetch; ignore transient errors here.
        });
    });
  }, [onOrderUpdated, order.id]);

  const permissions = session?.user.permissions ?? [];
  const driverId = session?.user.driverId;
  const canUploadDeparture = canUploadDepartureProof(
    liveOrder.status,
    permissions,
    liveOrder,
    driverId,
  );
  const canUploadDelivery = canUploadDeliveryProof(
    liveOrder.status,
    permissions,
    liveOrder,
    driverId,
  );

  const photos = liveOrder.photos ?? [];
  const departurePhotos = photos.filter((photo) => photo.type === "DEPARTURE");
  const deliveryPhotos = photos.filter((photo) => photo.type === "DELIVERY");

  const handleUpload = async (
    type: "DEPARTURE" | "DELIVERY",
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setError(null);
    setUploadingType(type);

    try {
      await uploadOrderPhoto(liveOrder.id, type, file);
      const refreshed = await getOrder(liveOrder.id);
      setLiveOrder(refreshed);
      onOrderUpdated?.(refreshed);
    } catch (uploadError) {
      setError(extractApiErrorMessage(uploadError));
    } finally {
      setUploadingType(null);
    }
  };

  const showPanel =
    photos.length > 0 ||
    liveOrder.status === "ASSIGNED" ||
    liveOrder.status === "PICKED_UP" ||
    liveOrder.status === "DELIVERED";

  if (!showPanel) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
          <ImageIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Proof photos
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Before pickup and after delivery. Driver uploads sync here automatically.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Before pickup</p>
              <p className="text-xs text-slate-500">Departure proof · {departurePhotos.length} photo(s)</p>
            </div>
            {canUploadDeparture ? (
              <>
                <input
                  ref={departureInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                  onChange={(event) => void handleUpload("DEPARTURE", event)}
                />
                <SubmitButton
                  type="button"
                  loading={uploadingType === "DEPARTURE"}
                  loadingLabel="Uploading..."
                  onClick={() => departureInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Upload
                </SubmitButton>
              </>
            ) : null}
          </div>
          <ProofPhotoGrid
            photos={departurePhotos}
            emptyLabel="No departure photos yet."
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">After delivery</p>
              <p className="text-xs text-slate-500">Delivery proof · {deliveryPhotos.length} photo(s)</p>
            </div>
            {canUploadDelivery ? (
              <>
                <input
                  ref={deliveryInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                  onChange={(event) => void handleUpload("DELIVERY", event)}
                />
                <SubmitButton
                  type="button"
                  loading={uploadingType === "DELIVERY"}
                  loadingLabel="Uploading..."
                  onClick={() => deliveryInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Upload
                </SubmitButton>
              </>
            ) : null}
          </div>
          <ProofPhotoGrid
            photos={deliveryPhotos}
            emptyLabel="No delivery photos yet."
          />
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
