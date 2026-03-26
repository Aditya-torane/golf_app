/**
 * MySQL JSON columns are often returned as objects/arrays by mysql2.
 * TEXT columns return strings. Normalize to a plain value.
 */
function parseJsonColumn(value, fallback) {
  if (value == null || value === "") return fallback;
  if (Buffer.isBuffer(value)) {
    try {
      return JSON.parse(value.toString("utf8"));
    } catch {
      return fallback;
    }
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  if (typeof value === "object") {
    return value;
  }
  return fallback;
}

module.exports = parseJsonColumn;
