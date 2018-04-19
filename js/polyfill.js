// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

// https://stackoverflow.com/questions/1179366/is-there-a-javascript-strcmp
if (typeof(String.prototype.localeCompare) === 'undefined') {
    String.prototype.localeCompare = function(str, locale, options) {
        return ((this == str) ? 0 : ((this > str) ? 1 : -1));
    };
}
