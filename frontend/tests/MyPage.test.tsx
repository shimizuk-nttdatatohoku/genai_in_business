import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'

import { App } from '../src/App'
import { server } from '../src/mocks/server'

function renderApp(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>,
  )
}

describe('MyPage', () => {
  it('navigates from the top page to the my page', async () => {
    const user = userEvent.setup()

    renderApp(['/top'])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'マイページ' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'マイページ' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'マイページ' })).toBeInTheDocument()
    })

    expect(screen.getByText('組合員情報詳細')).toBeInTheDocument()
  })

  it('switches to edit mode, saves the profile, and shows a success message', async () => {
    const user = userEvent.setup()

    renderApp(['/my-page'])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '編集' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: '編集' }))
    await user.clear(screen.getByLabelText('郵便番号'))
    await user.type(screen.getByLabelText('郵便番号'), '9800014')
    await user.clear(screen.getByLabelText('住所'))
    await user.type(screen.getByLabelText('住所'), '宮城県仙台市青葉区本町1-1-1')
    await user.clear(screen.getByLabelText('電話番号'))
    await user.type(screen.getByLabelText('電話番号'), '080-1111-2222')
    await user.clear(screen.getByLabelText('メールアドレス'))
    await user.type(screen.getByLabelText('メールアドレス'), 'updated@coop.co.jp')
    await user.clear(screen.getByLabelText('口座登録情報'))
    await user.type(screen.getByLabelText('口座登録情報'), '登録済み')
    await user.click(screen.getByRole('radio', { name: 'お知らせ不要' }))
    await user.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('更新しました')
    })

    expect(screen.queryByLabelText('電話番号')).not.toBeInTheDocument()
    expect(screen.getByText('980-0014')).toBeInTheDocument()
    expect(screen.getByText('宮城県仙台市青葉区本町1-1-1')).toBeInTheDocument()
    expect(screen.getByText('080-1111-2222')).toBeInTheDocument()
    expect(screen.getByText('updated@coop.co.jp')).toBeInTheDocument()
    expect(screen.getByText('お知らせ不要')).toBeInTheDocument()
    expect(screen.getByText('登録済み')).toBeInTheDocument()
  })

  it('shows validation errors and does not submit invalid values', async () => {
    const user = userEvent.setup()

    renderApp(['/my-page'])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '編集' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: '編集' }))
    await user.clear(screen.getByLabelText('郵便番号'))
    await user.type(screen.getByLabelText('郵便番号'), '123')
    await user.tab()
    await user.clear(screen.getByLabelText('メールアドレス'))
    await user.type(screen.getByLabelText('メールアドレス'), 'invalid-mail')
    await user.tab()
    await user.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => {
      expect(screen.getByText('郵便番号は半角数字7桁で入力してください')).toBeInTheDocument()
    })

    expect(screen.getByText('メールアドレスの形式が正しくありません')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows an API error when the update request is rejected', async () => {
    const user = userEvent.setup()

    server.use(
      http.put('*/api/v1/users/me', () => {
        return HttpResponse.json(
          {
            success: false,
            data: null,
            errors: [{ code: 'E_201', message: '現在は組合員情報を更新できません' }],
          },
          { status: 400 },
        )
      }),
    )

    renderApp(['/my-page'])

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '編集' })).toBeEnabled()
    })

    await user.click(screen.getByRole('button', { name: '編集' }))
    await user.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('現在は組合員情報を更新できません')
    })
  })
})