import { useEffect, useRef } from "react";

interface TourFinaleProps {
  open: boolean;
  onClose: () => void;
}

export default function TourFinale({ open, onClose }: TourFinaleProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    buttonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-navy-950/60"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-finale-title"
        className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
      >
        <h2
          id="tour-finale-title"
          className="font-display text-2xl font-bold text-ink"
        >
          Your turn
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Click the blue connection button, wait about 10 seconds while events
          buffer, then switch back online and watch the queue flush. You can
          replay this tour anytime with Take a tour.
        </p>
        <div className="mt-5 flex justify-end">
          <button
            ref={buttonRef}
            onClick={onClose}
            className="rounded-md bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
