const typeCache: { [label: string]: boolean } = {};

export function type<T>(label: T | ''): T {
  if (typeCache[<string>label]) {
    throw new Error(`Type "${label}" is not unique`);
  }
  typeCache[<string>label] = true;
  return <T>label;
}
