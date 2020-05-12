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

function logEvent(e) {
  console.log(
    `${e.type}, target: ${e.target.id}, currentTarget: ${e.currentTarget.id}, timeStamp: ${e.timeStamp}`
  );
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export { arrayLast, has, presence, logEvent, clamp };
