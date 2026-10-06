

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5000",
  "https://portfolio-rho-wheat-61.vercel.app",
  "https://www.mohamednagah.me"
];

const envOrigin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.trim() : null;
const envOrigins = envOrigin
  ? envOrigin.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigin = Array.from(new Set([...defaultOrigins, ...envOrigins]));

export default allowedOrigin;

