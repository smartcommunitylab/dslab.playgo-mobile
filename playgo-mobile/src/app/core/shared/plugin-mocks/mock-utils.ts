/* eslint-disable prefer-arrow/prefer-arrow-functions */
export function getMockMethodAnnotation({
  doLog,
  logPrefix,
}: {
  doLog: boolean;
  logPrefix: string;
}) {
  return function mockMethod(opts: { async: boolean } = { async: false }) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const targetMethod = descriptor.value;
      descriptor.value = function (...args: any[]) {
        if (doLog) {
          console.log(`${logPrefix}.${propertyKey} called:`, ...args);
        }
        const res = targetMethod.apply(this, args);
        if (opts.async) {
          return (async () => {
            const promiseRes = await res;
            await time(200);
            if (doLog) {
              console.log(`${logPrefix}.${propertyKey} finished:`, promiseRes);
            }
            return promiseRes;
          })();
        } else {
          if (doLog) {
            console.log(`${logPrefix}.${propertyKey} result`, res);
          }
        }
      };
      return descriptor;
    };
  };
}

async function time(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}
