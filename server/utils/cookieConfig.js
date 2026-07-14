const isProd = process.env.NODE_ENV === "production" || process.env.RENDER === "true";

export const getCookieOptions = (maxAge) => {
  const options = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
  };
  if (maxAge !== undefined) {
    options.maxAge = maxAge;
  }
  return options;
};
