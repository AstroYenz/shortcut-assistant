/**
 * Converts a camelCase string to a snake_case string.
 * @param {string} camelCaseString - The camelCase string to convert.
 * @return {string} The snake_case version of the input string.
 */
function camelToSnake(camelCaseString: string): string {
  return camelCaseString.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}

export default camelToSnake
