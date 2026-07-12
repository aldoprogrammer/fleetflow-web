"use client";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import dynamic from "next/dynamic";
import { Fragment, useEffect, useState, type ReactElement } from "react";
import type { LatLng } from "@/components/maps/MapPicker";

const MapPicker = dynamic(
  () => import("@/components/maps/MapPicker").then((mod) => mod.MapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[380px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
        Loading map...
      </div>
    ),
  },
);

interface LocationMapModalProps {
  open: boolean;
  title: string;
  description?: string;
  value?: LatLng | null;
  defaultCenter?: LatLng;
  onClose: () => void;
  onConfirm: (position: LatLng, label?: string) => void;
}

export function LocationMapModal({
  open,
  title,
  description,
  value,
  defaultCenter,
  onClose,
  onConfirm,
}: LocationMapModalProps): ReactElement {
  const [draft, setDraft] = useState<LatLng | null>(value ?? null);
  const [draftLabel, setDraftLabel] = useState<string | undefined>();

  useEffect(() => {
    if (open) {
      setDraft(value ?? null);
      setDraftLabel(undefined);
    }
  }, [open, value]);

  const handleConfirm = (): void => {
    if (!draft) return;
    onConfirm(draft, draftLabel);
    onClose();
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[120]">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-[1px]" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
          <div className="flex min-h-full items-center justify-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-2 scale-[0.98]"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-2 scale-[0.98]"
            >
              <DialogPanel className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
                <DialogTitle className="text-lg font-semibold text-slate-900">
                  {title}
                </DialogTitle>
                {description ? (
                  <p className="mt-1 text-sm text-slate-600">{description}</p>
                ) : null}

                <div className="mt-4">
                  {open ? (
                    <MapPicker
                      active={open}
                      value={draft}
                      defaultCenter={defaultCenter}
                      onChange={(position, label) => {
                        setDraft(position);
                        if (label) setDraftLabel(label);
                      }}
                      onConfirm={handleConfirm}
                    />
                  ) : null}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
