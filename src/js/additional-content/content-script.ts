export class AdditionalContent {
  static populate(text?: string): void {
    if (text === undefined) {
      return
    }

    const taskSection = this.getSection()
    taskSection.innerText = taskSection.innerText + text
  }

  static duplicateTasks(): Element {
    const taskSection = document.querySelector('[data-type="task"]')
    if (!taskSection) {
      throw new Error('Could not find task section')
    }
    const clone = taskSection.cloneNode(true)
    const parent = taskSection.parentNode
    if (!parent) {
      throw new Error('Could not find parent of task section')
    }
    return parent.insertBefore(clone, taskSection) as Element
  }

  static refactorSection(section: HTMLDivElement): HTMLDivElement {
    const header = section.querySelector('.section-head') as HTMLDivElement
    header.innerText = 'AI Response'
    section = section.querySelector('.tasks')!
    section.innerHTML = ''
    section.setAttribute('data-type', 'ai-response')
    section.className = 'markdown-formatted'
    return section
  }

  static getSection(): HTMLDivElement {
    const section = document.querySelector('[data-type="ai-response"]')
    if (!section) {
      const duplicate = this.duplicateTasks()
      return this.refactorSection(duplicate as HTMLDivElement)
    }
    return section as HTMLDivElement
  }
}

// NOTE: Message listener moved to unified router in content-bridge.ts
// AdditionalContent.populate() is now called by the unified router
