import camelToSnake from '../../../src/js/utils/camel-to-snake'


describe('Camel To Snake', () => {
  it('should convert camel case to snake case', () => {
    expect(camelToSnake('camelCase')).toBe('camel_case')
  })

  it('should convert camel case to snake case with multiple words', () => {
    expect(camelToSnake('camelCaseString')).toBe('camel_case_string')
  })
})
