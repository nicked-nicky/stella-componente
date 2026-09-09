import type { MutableRefObject, Ref } from 'react';

export function mergeRefs<T>(...refs: Array<Ref<T> | undefined | null>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as MutableRefObject<T | null>).current = node;
      }
    }
  };
}
