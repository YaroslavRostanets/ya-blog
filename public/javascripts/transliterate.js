function transliterate(word) {
  var a = {
    "ї": "yi",
    "і": "i",
    "й": "i",
    "ц": "ts",
    "у": "u",
    "к": "k",
    "е": "e",
    "н": "n",
    "г": "g",
    "ш": "sh",
    "щ": "sch",
    "з": "z",
    "х": "h",
    "ф": "f",
    "ы": "i",
    "в": "v",
    "а": "a",
    "п": "p",
    "р": "r",
    "о": "o",
    "л": "l",
    "д": "d",
    "ж": "zh",
    "э": "e",
    "я": "ya",
    "ч": "ch",
    "с": "s",
    "м": "m",
    "и": "i",
    "т": "t",
    "б": "b",
    "ю": "yu",
    " ": "-"
  };
  return word.trim().toLowerCase().split('').map(function (char) {
    return a[char] || '';
  }).join("");
}