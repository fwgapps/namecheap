// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const simplifyObject = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj
      .map(simplifyObject)
      .filter((item) => item !== null && item !== undefined && item !== "");
  } else if (typeof obj === "object" && obj !== null) {
    const keys = Object.keys(obj);

    if (
      keys.length === 2 &&
      keys.includes("#text") &&
      keys.some((key) => key !== "#text" && obj[key] === true)
    ) {
      return obj["#text"];
    }

    if (keys.length === 2 && keys.some((key) => obj[key] === true)) {
      const keyWithValue = keys.find((key) => obj[key] !== true);
      return simplifyObject(obj[keyWithValue!]);
    }

    return Object.keys(obj).reduce(
      (acc, key) => {
        const newKey = key === "#text" ? "value" : key;
        const simplifiedValue = simplifyObject(obj[key]);

        if (simplifiedValue !== null && simplifiedValue !== undefined && simplifiedValue !== "") {
          acc[newKey] = simplifiedValue;
        }

        return acc;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as Record<string, any>,
    );
  }

  return obj;
};
