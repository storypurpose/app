import * as _ from 'lodash';

const typeCache: { [label: string]: boolean } = {};

export function type<T>(label: T | ''): T {
  if (typeCache[<string>label]) {
    throw new Error(`Type "${label}" is not unique`);
  }
  typeCache[<string>label] = true;
  return <T>label;
}

export function groupChildren(children: any, groupByField: any) {
  const grouped = _.groupBy(children, groupByField);
  return Object.keys(grouped).map(key => {
    return { label: key, total: grouped[key].length, children: grouped[key] };
  });
}


