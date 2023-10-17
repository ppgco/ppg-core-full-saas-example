export type YYYYMMDD = string;

export function day(): YYYYMMDD {
  return dayOf(new Date());
}

export function dayOf(date: Date): YYYYMMDD {
  return date.toISOString().split("T")[0];
}
