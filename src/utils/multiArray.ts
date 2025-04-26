/**
 * utility function for creating empty multidimentional arrays #
 * usage e.g. var arr = createArray(3, 2) => [new Array(2),new Array(2),new Array(2)]
 */
export const createMultiArray = (length: number, ...rest: number[]) => {
  const arr = new Array(length || 0); // sparse array of length items

  let i = length;

  if (rest.length > 0) {
    // are there more params
    // loop through the array backwards and call createArray with first value (a number) of unused param
    // @ts-ignore
    while (i--) arr[length - 1 - i] = createMultiArray.apply(rest[0], rest);
  }

  return arr;
};

// e.g. with createArray(100,100)
// length = 100
// arr = [...100 empty slots...]
// rest = [100]
// then loop
// from 100 backwards
// arr = [ createArray(), ]
