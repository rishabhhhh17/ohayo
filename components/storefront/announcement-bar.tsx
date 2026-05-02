export function AnnouncementBar() {
  return (
    <div
      role="region"
      aria-label="Promotion"
      className="bg-cocoa text-cream"
    >
      <div className="container flex h-9 items-center justify-center px-4 text-center">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest">
          Get 15% off your order with code{' '}
          <span className="font-mono font-bold text-cream-light">WELCOME15</span>
        </p>
      </div>
    </div>
  );
}
