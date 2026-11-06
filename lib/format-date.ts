const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

function ordinalSuffix(day: number) {
  const lastTwoDigits = day % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return "TH";
  }

  switch (day % 10) {
    case 1:
      return "ST";
    case 2:
      return "ND";
    case 3:
      return "RD";
    default:
      return "TH";
  }
}

function ordinalDay(day: number) {
  return `${day}${ordinalSuffix(day)}`;
}

export function formatDate(date: Date) {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError("Cannot format an invalid date.");
  }

  const day = date.getUTCDate();
  const month = MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${ordinalDay(day)} ${month}, ${year}`;
}

export function formatDateRange(startDate: Date, endDate: Date) {
  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    endDate < startDate
  ) {
    throw new RangeError("Cannot format an invalid date range.");
  }

  const startDay = startDate.getUTCDate();
  const endDay = endDate.getUTCDate();
  const startMonth = MONTHS[startDate.getUTCMonth()];
  const endMonth = MONTHS[endDate.getUTCMonth()];
  const startYear = startDate.getUTCFullYear();
  const endYear = endDate.getUTCFullYear();

  if (startYear === endYear && startMonth === endMonth) {
    return `${ordinalDay(startDay)} - ${ordinalDay(endDay)} ${endMonth}, ${endYear}`;
  }

  if (startYear === endYear) {
    return `${ordinalDay(startDay)} ${startMonth} - ${ordinalDay(endDay)} ${endMonth}, ${endYear}`;
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}
