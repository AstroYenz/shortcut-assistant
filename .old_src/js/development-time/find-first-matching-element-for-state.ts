export function findFirstMatchingElementForState(state: string): Record<string, Element | undefined> | null {
  // Get all elements with the class 'value'
  const elementsWithValueClass = Array.from(document.querySelectorAll('.value'))

  // Find the first element where a child element contains the text 'In Development'
  const foundElement = elementsWithValueClass.find((element) => {
    const child = Array.from(element.children).find(child => child.innerHTML === state)
    return Boolean(child)
  })

  if (foundElement) {
    const child = Array.from(foundElement.children).find(child => child.innerHTML === state)
    return { element: foundElement, child }
  }

  return null
}
