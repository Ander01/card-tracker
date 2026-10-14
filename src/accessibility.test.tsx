import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { App } from './App'

describe('application accessibility', () => {
  it('has no automated accessibility violations on the landing view', async () => {
    const { container } = render(<App />)
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
