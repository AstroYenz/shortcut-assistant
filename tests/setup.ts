// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { chrome } from 'jest-chrome'
import '@testing-library/jest-dom'


beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {
  })
  jest.spyOn(console, 'warn').mockImplementation(() => {
  })
})

afterEach(() => {
  jest.restoreAllMocks()
})
