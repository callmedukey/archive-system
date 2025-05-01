export function enumToPgEnum<T extends Record<string, string>>(
  myEnum: T
): [T[keyof T], ...T[keyof T][]] {
  return Object.values(myEnum).map((value: string) => `${value}`) as [
    T[keyof T],
    ...T[keyof T][]
  ];
}
