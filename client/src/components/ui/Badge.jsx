export default function Badge({ label, color = "#3b82f6", textColor = "#fff", size = "sm" }) {
  const sizeClass = size === "lg"
    ? "px-4 py-2 text-base font-semibold"
    : "px-2.5 py-1 text-xs font-medium";

  return (
    <span
      className={`inline-flex items-center rounded-full ${sizeClass}`}
      style={{ backgroundColor: `${color}25`, color, border: `1px solid ${color}40` }}
    >
      {label}
    </span>
  );
}
