import Image from "next/image";

const SIZE_MAP = {
  sm: { container: "w-8 h-8", text: "text-[10px]", px: 32 },
  md: { container: "w-14 h-14", text: "text-sm",    px: 56 },
  lg: { container: "w-20 h-20", text: "text-lg",    px: 80 },
};

/**
 * @param {Object} props
 * @param {string} [props.src]
 * @param {string} [props.alt]
 * @param {"sm"|"md"|"lg"} [props.size]
 */
export default function Avatar({ src, name, alt = "", size = "md" }) {
  const { container, text, px } = SIZE_MAP[size] ?? SIZE_MAP.md;

  // Derive initials from alt (username or full name)
  const initials = alt
    .split(/[\s_]/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <div className={`${container} ring-2 ring-primary p-0.5 overflow-hidden shrink-0 object-cover`}>
        <Image
          src={src}
          alt={alt}
          width={px}
          height={px}
          className="w-full h-full object-cover"
        /> {name}
      </div>
    );
  }

  return (
    <div
      className={`${container} bg-surface-container-highest ring-2 ring-primary flex items-center justify-center shrink-0`}
    >
      <span className={`font-mono font-bold text-primary ${text}`}>
        {initials || "?"}
      </span>
    </div>
  );
}
