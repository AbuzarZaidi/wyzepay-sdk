class ByteArrayHelpers {
    /**
     * Concatenate two byte arrays.
     * @param arr1 - The first byte array.
     * @param arr2 - The second byte array.
     * @returns A new concatenated Uint8Array.
     */
    static concatByteArrays(arr1: Uint8Array, arr2: Uint8Array): Uint8Array {
      const combined = new Uint8Array(arr1.length + arr2.length);
      combined.set(arr1, 0);
      combined.set(arr2, arr1.length);
      return combined;
    }
  
    /**
     * Trim trailing zeros from a byte array.
     * @param data - The input byte array.
     * @returns A new Uint8Array without trailing zeros.
     */
    static trimTrailingZeros(data: Uint8Array): Uint8Array {
      let i = data.length - 1;
      while (i >= 0 && data[i] === 0) {
        i--;
      }
      return data.slice(0, i + 1);
    }
  
    /**
     * Flip the bytes of a byte array (reverse order).
     * @param original - The original byte array.
     * @returns A new Uint8Array with reversed byte order.
     */
    static flipBytes(original: Uint8Array): Uint8Array {
      return original.slice().reverse();
    }
  
    /**
     * Check if two byte arrays are equal.
     * @param arr1 - The first byte array.
     * @param arr2 - The second byte array.
     * @returns True if the arrays are equal, otherwise false.
     */
    static arraysEqual(arr1: Uint8Array, arr2: Uint8Array): boolean {
      if (arr1.length !== arr2.length) return false;
      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
      }
      return true;
    }
  }
  
  export default ByteArrayHelpers;
  