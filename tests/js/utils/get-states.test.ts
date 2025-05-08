import changeState from '@sx/keyboard-shortcuts/change-state'
import extractText from '@sx/utils/extract-text'
import _getStates, {ShortcutWorkflowStates} from '@sx/utils/get-states'
import sleep from '@sx/utils/sleep'

// Mocking dependencies
jest.mock('@sx/keyboard-shortcuts/change-state')
jest.mock('@sx/utils/extract-text')
jest.mock('@sx/utils/sleep')

const mockedChangeState = changeState as jest.Mock
const mockedExtractText = extractText as jest.Mock
const mockedSleep = sleep as jest.Mock

describe('_getStates', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize state map correctly', async () => {
    mockedChangeState.mockResolvedValue(undefined)
    mockedSleep.mockResolvedValue(undefined)
    document.body.innerHTML = '<div data-perma-id="popover"><div aria-multiselectable="true"></div></div>'

    const result = await _getStates()

    const expectedStateMap: ShortcutWorkflowStates = {
      'Backlog': [],
      'Unstarted': [],
      'Started': [],
      'Done': []
    }

    expect(result).toEqual(expectedStateMap)
  })

  it('should process dropdown elements and assign values to respective states', async () => {
    mockedChangeState.mockResolvedValue(undefined)
    mockedSleep.mockResolvedValue(undefined)
    mockedExtractText.mockImplementation((div) => div.textContent?.trim() || '')

    document.body.innerHTML = `
      <div data-perma-id="popover">
        <div aria-multiselectable="true">
          <ul aria-multiselectable="true">
            <div>
              <li><div></div><div>Backlog</div></li>
              <li><div></div><div></div><div>In Progress</div></li>
              <li><div></div><div>Unstarted</div></li>
              <li><div></div><div></div><div>To Do</div></li>
            </div>
          </ul>
        </div>
      </div>
    `

    const result = await _getStates()

    const expectedStateMap: ShortcutWorkflowStates = {
      'Backlog': ['In Progress'],
      'Unstarted': ['To Do'],
      'Started': [],
      'Done': []
    }

    expect(result).toEqual(expectedStateMap)
  })

  it('should handle cases where there are no list items', async () => {
    mockedChangeState.mockResolvedValue(undefined)
    mockedSleep.mockResolvedValue(undefined)
    document.body.innerHTML = '<div data-perma-id="popover"><div aria-multiselectable="true"></div></div>'

    const result = await _getStates()

    const expectedStateMap: ShortcutWorkflowStates = {
      'Backlog': [],
      'Unstarted': [],
      'Started': [],
      'Done': []
    }

    expect(result).toEqual(expectedStateMap)
  })

  it('should handle cases where changeState or sleep fails', async () => {
    mockedChangeState.mockRejectedValue(new Error('Failed to change state'))
    mockedSleep.mockResolvedValue(undefined)

    await expect(_getStates()).rejects.toThrow('Failed to change state')
  })
})
