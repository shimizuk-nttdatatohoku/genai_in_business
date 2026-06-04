import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { http } from 'msw'
import { HttpResponse } from 'msw'

import { App } from '../src/App'
import { server } from '../src/mocks/server'

function renderApp(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>,
  )
}

describe('DividendNoticePage', () => {
  it('navigates from the top page to the dividend notice detail page', async () => {
    const user = userEvent.setup()

    renderApp(['/top'])

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: '2026年度分 出資配当金・出資金残高等のお知らせ',
        }),
      ).toBeInTheDocument()
    })

    await user.click(
      screen.getByRole('button', {
        name: '2026年度分 出資配当金・出資金残高等のお知らせ',
      }),
    )

    await waitFor(() => {
      expect(screen.getByLabelText('配当金の受取方法')).toBeInTheDocument()
    })

    expect(screen.getByText('配当金のお受取に関する情報')).toBeInTheDocument()
  })

  it('updates the receipt method and shows a success message', async () => {
    const user = userEvent.setup()

    renderApp(['/dividend-notices/ntc-2026-0001'])

    await waitFor(() => {
      expect(screen.getByLabelText('配当金の受取方法')).toHaveValue('BANK_TRANSFER')
    })

    await user.selectOptions(screen.getByLabelText('配当金の受取方法'), 'COUNTER_PICKUP')
    await user.click(screen.getByRole('button', { name: '確定' }))

    await waitFor(() => {
      expect(screen.getByText('配当金受取方法を更新しました')).toBeInTheDocument()
    })

    expect(screen.getByLabelText('配当金の受取方法')).toHaveValue('COUNTER_PICKUP')
  })

  it('shows a business error when the update request is rejected', async () => {
    const user = userEvent.setup()

    server.use(
      http.put('*/api/v1/dividend-notices/:noticeId/receipt-method', () => {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            errors: [{ code: 'E_201', message: '受付期間外のため変更できません' }],
          },
          { status: 400 },
        )
      }),
    )

    renderApp(['/dividend-notices/ntc-2026-0001'])

    await waitFor(() => {
      expect(screen.getByLabelText('配当金の受取方法')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: '確定' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('受付期間外のため変更できません')
    })
  })

  it('renders the receipt method as read-only when updates are not allowed', async () => {
    server.use(
      http.get('*/api/v1/dividend-notices/:noticeId', () => {
        return HttpResponse.json(
          {
            success: true,
            data: {
              noticeId: 'ntc-2026-0001',
              title: '2026年度分 出資配当金・出資金残高等のお知らせ',
              userCode: '123456',
              loginName: '阿部〇〇',
              receiptStatus: 'RECEIVED',
              receiptMethod: 'BANK_TRANSFER',
              receiptMethodOptions: [{ code: 'BANK_TRANSFER', label: '登録口座振込' }],
              canUpdateReceiptMethod: false,
              receiptMethodChangeDeadline: '2026-03-20',
              receiptMethodNote: '受取済のため変更できません。',
              detailItems: [
                { itemName: '出資金残高', value: '5,000円', note: '202X年X月XX日現在' },
              ],
              precautions: [],
            },
            errors: [],
          },
          { status: 200 },
        )
      }),
    )

    renderApp(['/dividend-notices/ntc-2026-0001'])

    await waitFor(() => {
      expect(screen.getByText('受取済')).toBeInTheDocument()
    })

    expect(screen.getByLabelText('配当金の受取方法')).toBeDisabled()
    expect(screen.getByRole('button', { name: '確定' })).toBeDisabled()
  })
})