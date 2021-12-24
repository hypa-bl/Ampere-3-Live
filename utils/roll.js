function Roll(min, max) {
  const min_int = Math.ceil(min);
  const max_int = Math.floor(max);
  const result_int = Math.random() * (max_int - min_int) + min;
  return Math.floor(result_int);
}

function RollFloat(min, max) {
  const result_float = Math.random() * (max - min) + min;
  return Math.floor(result_float);
}

module.exports = { Roll, RollFloat };