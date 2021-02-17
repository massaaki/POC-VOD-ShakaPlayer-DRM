import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import Button from '.'

describe('<Button />', () => {
  it('should render as a link', () => {
    render(
      <Button as="link" url="/link">
        description
      </Button>
    )
    expect(screen.getByRole('link', { name: /description/i })).toHaveAttribute(
      'href',
      '/link'
    )
  })

  it('should render as a button', async () => {
    const handleClick = jest.fn()
    render(
      <Button as="button" handleClick={handleClick}>
        description
      </Button>
    )

    const ButtonEl = screen.getByRole('button')
    userEvent.click(ButtonEl)

    waitFor(() => {
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })
})
