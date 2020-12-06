
let sCount = 0;
const rString = global.String;

global.String = function () {
  sCount += 1;
  return Reflect.construct(rString, arguments, rString);
}

Object.getOwnPropertyNames(rString).forEach(p => {
  if (typeof rString[p] === 'function') {
    global.String[p] = rString[p];
  }
});

module.exports = function () {return sCount;};

