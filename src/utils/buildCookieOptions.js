export const buildCookieOptions = (type = "access") => {
  const isProd = process.env.NODE_ENV === "production";
  // Typical lifetimes; adjust as you like
  const accessMaxAgeMs = 15 * 60 * 1000;          // 15 minutes
  const refreshMaxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days

  return {
    httpOnly: true,
    secure: isProd,          // secure cookies in prod (HTTPS)
    sameSite: isProd ? "None" : "Lax", // cross-site needs "None"
    maxAge: type === "access" ? accessMaxAgeMs : refreshMaxAgeMs,
    path: "/",               // ensure consistent path for clearCookie()
  };
};
