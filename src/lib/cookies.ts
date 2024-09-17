export const setCookie = ({
  name,
  value,
  expDays,
}: {
  name: string;
  value: string | boolean;
  expDays?: number;
}) => {
  const formattedValue = typeof value === "boolean" ? value.toString() : value;

  const date = new Date();
  if (!!expDays) {
    date.setTime(date.getTime() + expDays * 24 * 60 * 60 * 1000);
  }
  const expires = date.toUTCString();
  if (typeof window === "object") {
    document.cookie = `${name}=${formattedValue}${
      expDays ? `; expires=${expires}` : ""
    }; path=/`;
  }
};

export const getCookie = (name: string): string | undefined => {
  if (typeof window === "object") {
    const decodedCookies = decodeURIComponent(document.cookie).split(";");
    const cookie = decodedCookies.find((x) => x.includes(name));
    const value = cookie?.trim().replace(name + "=", "");

    return value;
  }
  return undefined;
};

export const isCookieTrue = (name: string) => {
  const value = getCookie(name);
  return value === "true";
};
