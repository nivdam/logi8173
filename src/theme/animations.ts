// Keyframes defined globally in theme/index.ts globalCss.
// These helpers just apply the animation property.

export const animations = {
  fadeInUp: {
    animation: "fadeInUp 0.4s ease forwards",
  },
  scaleIn: {
    animation: "scaleIn 0.3s ease forwards",
  },
  pulse: {
    animation: "pulse 2s ease-in-out infinite",
  },
  cardHover: {
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px -5px rgba(0, 0, 0, 0.08)",
    },
    "&:active": {
      transform: "translateY(0)",
    },
  },
  listItem: (index: number) => ({
    opacity: 0,
    animation: `fadeInUp 0.4s ease forwards`,
    animationDelay: `${index * 0.05}s`,
  }),
  delayedFadeInUp: (delaySec: number) => ({
    opacity: 0,
    animation: `fadeInUp 0.4s ease ${delaySec}s forwards`,
  }),
}
