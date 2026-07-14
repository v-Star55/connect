

export const getCookieOptions = (maxAge) => {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  };
  if (maxAge !== undefined) {
    options.maxAge = maxAge;
  }
  return options;
};
