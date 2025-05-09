import extractText from '@sx/utils/extract-text'


describe('Extract Text', () => {
  it('should extract text from HTML string', () => {
    const htmlContent: string = '<div class="some class">Some<br> Text</div>'
    const text = extractText(htmlContent)
    expect(text).toBe('Some Text')
  })
  it('should extract text from HTML element', () => {
    const htmlContent: string = '<div class="some class"><div>Some</div><br> Text</div>'
    const div = document.createElement('div')
    div.innerHTML = htmlContent
    const text = extractText(div)
    expect(text).toBe('Some Text')
  })
})
