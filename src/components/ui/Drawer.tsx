"use client";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  children: React.ReactNode;
  ariaLabel: string;
};

export function Drawer({
  open,
  onClose,
  side = "left",
  children,
  ariaLabel,
}: DrawerProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-drawer ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={`fixed top-0 z-[70] flex h-full w-[min(100%,20rem)] flex-col border-border bg-surface shadow-xl transition-transform duration-drawer ${
          side === "left" ? "left-0 border-r" : "right-0 border-l"
        } ${open ? "translate-x-0" : side === "left" ? "-translate-x-full" : "translate-x-full"}`}
      >
        {children}
      </aside>
    </>
  );
}
