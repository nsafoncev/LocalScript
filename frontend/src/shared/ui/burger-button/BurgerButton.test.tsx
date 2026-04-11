import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BurgerButton } from './BurgerButton'

describe('BurgerButton', () => {
  it('reflects active state through aria-pressed', () => {
    render(<BurgerButton isActive={true} label="Открыть меню" />)

    expect(screen.getByRole('button', { name: /открыть меню/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('calls click handler', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <BurgerButton isActive={false} label="Открыть меню" onClick={onClick} />,
    )

    await user.click(screen.getByRole('button', { name: /открыть меню/i }))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
