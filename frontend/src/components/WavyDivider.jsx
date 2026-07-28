export default function WavyDivider({ color = "var(--color-primary)" }) {
  return (
    <svg
      className="wavy-divider"
      viewBox="0 0 500 40"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 20 Q 60 0, 120 20 T 240 20 T 360 20 T 500 10"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
