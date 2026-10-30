// Only public astrologer profiles are valid post-login destinations.
export function getLoginReturnPath(search = "") {
  const path = new URLSearchParams(search).get("next");
  return /^\/astrologer\/[1-9]\d*$/.test(path || "") ? path : "/";
}
