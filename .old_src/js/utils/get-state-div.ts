function findDivWithText(element: HTMLElement, searchText: string): boolean {
  // Check if current element is a div and matches the searchText
  if (element.tagName === 'DIV' && element.innerText.trim() === searchText) {
    return true
  }
  // Otherwise, check all child elements
  return Array.from(element.children).some(child => findDivWithText(<HTMLElement>child, searchText))
}

function getStateDiv(text: string): HTMLElement | null {
  const parentDiv: HTMLElement | null = document.querySelector('[data-perma-id="popover"]')
  let foundDiv: HTMLElement | null = null

  if (parentDiv) {
    const childDivs: NodeListOf<HTMLElement> = parentDiv.querySelectorAll('li')
    childDivs.forEach((div) => {
      if (findDivWithText(div, text)) {
        foundDiv = div
      }
    })
  }
  else {
    console.error('The parent div with class "list apply-on-click" was not found.')
  }

  return foundDiv
}

export { getStateDiv }
