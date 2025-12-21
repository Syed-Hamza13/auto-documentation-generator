export default function GlowButton({ children, onClick, outline }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "14px 28px",
        borderRadius: "12px",
        border: outline ? "1px solid var(--primary)" : "none",
        background: outline
          ? "transparent"
          : "linear-gradient(135deg, var(--primary), var(--secondary))",
        color: "white",
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: outline
          ? "0 0 12px rgba(124,124,255,0.4)"
          : "0 0 25px rgba(0,245,255,0.6)",
      }}
    >
      {children}
    </button>
  );
}
