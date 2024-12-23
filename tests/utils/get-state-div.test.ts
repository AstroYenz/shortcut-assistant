import {getStateDiv} from '../../.old_src/js/utils/get-state-div'


interface MockParentDiv extends Element {
  querySelectorAll: jest.Mock;
}

describe('get state div', () => {
  it('returns the div on match', () => {
    const childDivs = [{innerText: 'In Development ', tagName: 'DIV', children: []}]
    const parentDiv = {querySelectorAll: jest.fn().mockReturnValue(childDivs)} as MockParentDiv
    jest.spyOn(document, 'querySelector').mockReturnValueOnce(parentDiv)

    const result = getStateDiv('In Development')

    expect(result).toEqual(childDivs[0])

  })

  it('return null on no match', () => {
    const childDivs = [{innerText: 'Other', children: []}]
    const parentDiv = {querySelectorAll: jest.fn().mockReturnValue(childDivs)} as MockParentDiv

    jest.spyOn(document, 'querySelector').mockReturnValueOnce(parentDiv)

    const result = getStateDiv('In Development')

    expect(result).toEqual(null)

  })

  it('logs an error with no parent div', () => {
    const parentDiv = null

    jest.spyOn(document, 'querySelector').mockReturnValueOnce(parentDiv)

    jest.spyOn(console, 'error').mockImplementation(() => {
    })
    getStateDiv('In Development')

    expect(console.error).toHaveBeenCalledWith('The parent div with class "list apply-on-click" was not found.')

  })
})
