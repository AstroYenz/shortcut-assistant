import { AdditionalContent } from '@sx/additional-content/content-script'


describe('AdditionalContent', () => {
  beforeEach(() => {
    document.body.innerHTML = (`
      <div data-type="task">
        <div class="section-head">Tasks</div>
        <div class="tasks"></div>
      </div>
    `)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  test('populate should append text to the section', () => {
    const text = 'Sample text'
    AdditionalContent.populate(text)
    const section = document.querySelector('[data-type="ai-response"]') as HTMLElement
    expect(section.innerText).toContain(text)
  })

  test('duplicateTasks should clone the task section', () => {
    const clone = AdditionalContent.duplicateTasks()
    const taskSections = document.querySelectorAll('[data-type="task"]')
    expect(taskSections.length).toBe(2)
    expect(clone).toBeDefined()
  })

  test('duplicateTasks should throw an error if task section is not found', () => {
    document.body.innerHTML = '' // Remove all elements
    expect(() => AdditionalContent.duplicateTasks()).toThrow('Could not find task section')
  })

  test('duplicateTasks should throw an error if parent of task section is not found', () => {
    const taskSection = document.querySelector('[data-type="task"]')
    if (taskSection) {
      jest.spyOn(taskSection, 'parentNode', 'get').mockReturnValue(null)
    }
    expect(() => AdditionalContent.duplicateTasks()).toThrow('Could not find parent of task section')
  })

  test('refactorSection should modify the section as expected', () => {
    const section = document.querySelector('[data-type="task"]') as HTMLDivElement
    const refactoredSection = AdditionalContent.refactorSection(section)
    expect(refactoredSection.getAttribute('data-type')).toBe('ai-response')
    expect(refactoredSection.className).toBe('markdown-formatted')
  })

  test('getSection should return existing section or create a new one', () => {
    let section = AdditionalContent.getSection()
    expect(section.getAttribute('data-type')).toBe('ai-response')

    section = AdditionalContent.getSection()
    expect(section).toBe(document.querySelector('[data-type="ai-response"]'))
  })

  test('populate should not throw error if text is undefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(AdditionalContent.populate(undefined)).toBeUndefined()
  })
})
