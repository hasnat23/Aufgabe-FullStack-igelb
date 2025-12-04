import { expect, it, describe, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AddWebsiteForm } from '../components/AddWebsiteForm'

describe('AddWebsiteForm', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnSubmit = vi.fn().mockResolvedValue(undefined)
  })

  it('should render form inputs', () => {
    render(<AddWebsiteForm onSubmit={mockOnSubmit} />)
    
    expect(screen.getByLabelText(/website name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/url/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add website/i })).toBeInTheDocument()
  })

  it('should validate URL format', async () => {
    render(<AddWebsiteForm onSubmit={mockOnSubmit} />)
    
    const nameInput = screen.getByLabelText(/website name/i)
    const urlInput = screen.getByLabelText(/url/i)
    const submitButton = screen.getByRole('button', { name: /add website/i })

    fireEvent.change(nameInput, { target: { value: 'Test Site' } })
    fireEvent.change(urlInput, { target: { value: 'invalid-url' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid url format/i)).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should submit valid form data', async () => {
    render(<AddWebsiteForm onSubmit={mockOnSubmit} />)
    
    const nameInput = screen.getByLabelText(/website name/i) as HTMLInputElement
    const urlInput = screen.getByLabelText(/url/i) as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /add website/i })

    fireEvent.change(nameInput, { target: { value: 'Google' } })
    fireEvent.change(urlInput, { target: { value: 'https://google.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('Google', 'https://google.com')
    })

    // Form should be cleared after submission
    expect(nameInput.value).toBe('')
    expect(urlInput.value).toBe('')
  })

  it('should display error message on submission failure', async () => {
    const errorMessage = 'Network error: 500'
    mockOnSubmit.mockRejectedValueOnce(new Error(errorMessage))
    
    render(<AddWebsiteForm onSubmit={mockOnSubmit} />)
    
    const nameInput = screen.getByLabelText(/website name/i)
    const urlInput = screen.getByLabelText(/url/i)
    const submitButton = screen.getByRole('button', { name: /add website/i })

    fireEvent.change(nameInput, { target: { value: 'Test' } })
    fireEvent.change(urlInput, { target: { value: 'https://test.com' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument()
    })
  })
})
