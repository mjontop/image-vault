export function sanitizeCustomDateString(dateString: string): string {
  const trimmedValue = dateString.trim();

  const customIsoRegex = /T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/;

  if (customIsoRegex.test(trimmedValue)) {
    return trimmedValue.replace(
      customIsoRegex,
      "T$1:$2:$3.$4Z"
    );
  }

  return trimmedValue;
}

export function extractDateFromString(value: string): string | null {
  if (!value) {
    return null;
  }

  const dateTimeRegex = /(\d{4})(\d{2})(\d{2})[_-]?(\d{2})(\d{2})(\d{2})(\d{3})/;

  const matchedValue = value.match(dateTimeRegex);

  if (!matchedValue) {
    return null;
  }

  const [
    ,
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    milliseconds,
  ] = matchedValue;

  const extractedDate = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    Number(seconds),
    Number(milliseconds)
  );

  return isNaN(extractedDate.getTime()) ? null : extractedDate.toString();
}