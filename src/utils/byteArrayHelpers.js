class ByteArrayHelpers {
  static concatByteArrays(arr1, arr2) {
    const combined = new Uint8Array(arr1.length + arr2.length);
    combined.set(arr1, 0);
    combined.set(arr2, arr1.length);
    return combined;
  }
  static trimTrailingZeros(data) {
    let i = data.length - 1;
    while (i >= 0 && data[i] === 0) {
      i--;
    }
    return data.slice(0, i + 1);
  }
  static flipBytes(original) {
    return original.slice().reverse();
  }
  static arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }
}

export default ByteArrayHelpers;
