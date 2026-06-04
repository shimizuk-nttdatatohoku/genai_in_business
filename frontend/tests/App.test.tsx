import { HttpResponse, delay, http } from 'msw'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { App } from '../src/App'
import { server } from '../src/mocks/server'

function renderApp(initialEntries: string[] = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>,
  )
}

describe('App', () => {
  it('renders the login form', () => {
    renderApp()

    expect(screen.getByRole('heading', { name: 'WEB出資配当システム' })).toBeInTheDocument()
    expect(screen.getByLabelText('組合員コード')).toHaveValue('')
    expect(screen.getByLabelText('パスワード')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeDisabled()
  })

  it('shows a validation error when the user code format is invalid', async () => {
    const user = userEvent.setup()

    renderApp()

    await user.type(screen.getByLabelText('組合員コード'), '12ab')
    await user.tab()

    expect(
      screen.getByText('組合員コードは半角数字6桁以上10桁以下で入力してください'),
    ).toBeInTheDocument()
  })

  it('shows the submitting state while the login request is in flight', async () => {
    const user = userEvent.setup()

    server.use(
      http.post('*/api/v1/auth-sessions', async () => {
        await delay(120)

        return HttpResponse.json(
          {
            sessionId: 'session-001',
            userCode: '123456',
            loginName: '山田 太郎',
            csrfToken: 'csrf-token',
            lastLoginAt: '2026-06-01T09:00:00+09:00',
          },
          { status: 201 },
        )
      }),
    )

    renderApp()

    await user.type(screen.getByLabelText('組合員コード'), '123456')
    await user.type(screen.getByLabelText('パスワード'), 'password123')
    await user.click(screen.getByRole('button', { name: 'ログイン' }))

    expect(screen.getByRole('button', { name: '送信中...' })).toBeDisabled()
    expect(screen.getByText('認証中です。しばらくお待ちください。')).toBeInTheDocument()
  })

  it('navigates to the top page after a successful login', async () => {
    const user = userEvent.setup()

    renderApp()

    await user.type(screen.getByLabelText('組合員コード'), '123456')
    await user.type(screen.getByLabelText('パスワード'), 'password123')
    await user.click(screen.getByRole('button', { name: 'ログイン' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '組合員様トップ画面' })).toBeInTheDocument()
      expect(
        screen.getByRole('button', {
          name: '2026年度分 出資配当金・出資金残高等のお知らせ',
        }),
      ).toBeInTheDocument()
    })
  })

  it('shows the authentication error and clears the password', async () => {
    const user = userEvent.setup()

    server.use(
      http.post('*/api/v1/auth-sessions', () => {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            errors: [{ code: 'E_001', message: '組合員コードまたはパスワードが正しくありません' }],
          },
          { status: 401 },
        )
      }),
    )

    renderApp()

    await user.type(screen.getByLabelText('組合員コード'), '123456')
    await user.type(screen.getByLabelText('パスワード'), 'invalid-pass')
    await user.click(screen.getByRole('button', { name: 'ログイン' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        '組合員コードまたはパスワードが正しくありません',
      )
    })

    expect(screen.getByLabelText('パスワード')).toHaveValue('')
  })

  it('shows the system error when the API returns E_901', async () => {
    const user = userEvent.setup()

    server.use(
      http.post('*/api/v1/auth-sessions', () => {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            errors: [{ code: 'E_901', message: '時間をおいて再度お試しください' }],
          },
          { status: 500 },
        )
      }),
    )

    renderApp()

    await user.type(screen.getByLabelText('組合員コード'), '123456')
    await user.type(screen.getByLabelText('パスワード'), 'password123')
    await user.click(screen.getByRole('button', { name: 'ログイン' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('時間をおいて再度お試しください')
    })
  })

  it('renders the top page notice list and login information', async () => {
    renderApp(['/top'])

    await waitFor(() => {
      expect(screen.getByText('組合員コード：123456')).toBeInTheDocument()
    })

    expect(screen.getByText('ログイン名：阿部〇〇')).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: '2026年度分 出資配当金・出資金残高等のお知らせ',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'マイページ' })).toBeEnabled()
  })

  it('shows the empty state when there are no dividend notices', async () => {
    server.use(
      http.get('*/api/v1/dividend-notices', () => {
        return HttpResponse.json(
          {
            success: true,
            data: {
              userCode: '123456',
              loginName: '阿部〇〇',
              items: [],
              pagination: {
                page: 1,
                pageSize: 20,
                totalCount: 0,
              },
            },
            errors: [],
          },
          { status: 200 },
        )
      }),
    )

    renderApp(['/top'])

    await waitFor(() => {
      expect(screen.getByText('表示できるお知らせはありません')).toBeInTheDocument()
    })
  })

  it('redirects to the login form when the top page request returns E_001', async () => {
    server.use(
      http.get('*/api/v1/dividend-notices', () => {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            errors: [{ code: 'E_001', message: 'セッションの有効期限が切れました' }],
          },
          { status: 401 },
        )
      }),
    )

    renderApp(['/top'])

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'WEB出資配当システム' })).toBeInTheDocument()
    })
  })

  it('logs out from the top page and returns to the login form', async () => {
    const user = userEvent.setup()

    renderApp(['/top'])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'ログアウト' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'ログアウト' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'WEB出資配当システム' })).toBeInTheDocument()
    })
  })
})