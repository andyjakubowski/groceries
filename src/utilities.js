function arrayLast(array) {
  return array[array.length - 1];
}

function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function presence(object, key) {
  if (has(object, key)) {
    return object[key];
  } else {
    return null;
  }
}

export { arrayLast, has, presence };
