// ZoomMenu.tsx
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  valuePct: number;
  onSelectPct: (pct: number) => void;
  onDeferPct?: (pct: number) => void;
  onPageFit?: () => void; //
};

const ZOOM_STEPS = [50, 75, 100, 125, 150, 200, 300, 400];

export default function ZoomMenu({
  valuePct,
  onSelectPct,
  onDeferPct,
  onPageFit,
}: Props) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  // nearest step helpers
  const stepIndex = useMemo(() => {
    let idx = 0,
      bestDiff = Infinity;
    ZOOM_STEPS.forEach((s, i) => {
      const d = Math.abs(s - valuePct);
      if (d < bestDiff) {
        bestDiff = d;
        idx = i;
      }
    });
    return idx;
  }, [valuePct]);

  const dec = () => onSelectPct(ZOOM_STEPS[Math.max(0, stepIndex - 1)]);
  const inc = () =>
    onSelectPct(ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, stepIndex + 1)]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!popRef.current || !anchorRef.current) return;
      const t = e.target as Node;
      if (!popRef.current.contains(t) && !anchorRef.current.contains(t))
        setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 h-8 px-2 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {valuePct}%
        <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none">
          <path
            d="M19 9l-7 7-7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Popover */}
      {open && (
        <div
          ref={popRef}
          role="dialog"
          className="z-50 absolute left-0 mt-1 w-40 rounded-lg border border-gray-200 bg-white p-1 text-gray-800 shadow-lg outline-none"
        >
          {/* header: current % + -/+ */}
          <div className="flex items-center justify-between gap-1 pb-1 mb-1 border-b border-gray-200">
            <div
              id="zoomLevelButton"
              className="px-1.5 h-7 flex items-center rounded-md text-sm font-medium"
            >
              <span>{valuePct}%</span>
            </div>
            <div className="flex">
              <button
                className="h-7 w-7 rounded-md hover:bg-gray-100 inline-flex items-center justify-center"
                onClick={dec}
                aria-label="Zoom out"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <button
                className="h-7 w-7 rounded-md hover:bg-gray-100 inline-flex items-center justify-center"
                onClick={inc}
                aria-label="Zoom in"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 5v14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* options */}
          <ul className="max-h-64 overflow-auto">
            <li>
              <button
                className="w-full h-8 px-2 text-left rounded-md text-sm hover:bg-gray-100"
                onClick={() => {
                  onPageFit?.();
                  setOpen(false);
                }}
              >
                Page fit
              </button>
            </li>
            {ZOOM_STEPS.map((pct) => (
              <li key={pct}>
                <button
                  className="w-full h-8 px-2 text-left rounded-md text-sm hover:bg-gray-100"
                  onClick={() => {
                    (onDeferPct ?? onSelectPct)(pct);
                    onSelectPct(pct);
                    setOpen(false);
                  }}
                >
                  {pct}%
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
