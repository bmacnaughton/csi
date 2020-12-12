
let strCalls = 0;
let objCalls = 0;
const rString = global.String;

global.String = function () {
  if (new.target) {
    objCalls += 1;
    return Reflect.construct(rString, arguments, rString);
  } else {
    strCalls += 1;
    return Reflect.apply(rString, this, arguments);
  }
}

Object.getOwnPropertyNames(rString).forEach(p => {
  if (typeof rString[p] === 'function') {
    global.String[p] = rString[p];
  }
});

module.exports = function () {
  return {strCalls, objCalls};
};

