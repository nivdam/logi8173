export const animations = {
  fadeInUp: {
    "@keyframes fadeInUp": {
      from: { opacity: 0, transform: "translateY(8px)" },
      to: { opacity: 1, transform: "translateY(0)" },
    },
    animation: "fadeInUp 0.4s ease forwards",
  },
  fadeIn: {
    "@keyframes fadeIn": {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    animation: "fadeIn 0.3s ease forwards",
  },
  scaleIn: {
    "@keyframes scaleIn": {
      from: { opacity: 0, transform: "scale(0.95)" },
      to: { opacity: 1, transform: "scale(1)" },
    },
    animation: "scaleIn 0.3s ease forwards",
  },
  slideInRight: {
    "@keyframes slideInRight": {
      from: { opacity: 0, transform: "translateX(12px)" },
      to: { opacity: 1, transform: "translateX(0)" },
    },
    animation: "slideInRight 0.3s ease forwards",
  },
  pulse: {
    "@keyframes pulse": {
      "0%, 100%": { transform: "scale(1)" },
      "50%": { transform: "scale(1.05)" },
    },
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
}
