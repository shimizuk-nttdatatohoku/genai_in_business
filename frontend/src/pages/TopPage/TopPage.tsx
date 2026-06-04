import { useTopPage } from '@/hooks/useTopPage'

function formatNoticeLabel(fiscalYear: number, title: string): string {
  const fiscalYearLabel = `${fiscalYear}年度分`

  if (title.startsWith(fiscalYearLabel)) {
    return title
  }

  return `${fiscalYearLabel} ${title}`
}

export function TopPage() {
  const {
    errorMessage,
    handleOpenMyPage,
    handleLogout,
    handleOpenNotice,
    isLoading,
    isLoggingOut,
    loginName,
    notices,
    userCode,
  } = useTopPage()

  return (
    <main className="top-page">
      <div className="top-page__shell">
        <header className="top-page__header">
          <div className="top-page__header-actions">
            <button
              className="top-page__logout"
              disabled={isLoggingOut}
              onClick={() => {
                void handleLogout()
              }}
              type="button"
            >
              {isLoggingOut ? '処理中...' : 'ログアウト'}
            </button>
          </div>

          <div className="top-page__header-row">
            <h1 className="top-page__title">組合員様トップ画面</h1>
            <div className="top-page__session-info">
              <span>組合員コード：{userCode || '--------'}</span>
              <span>ログイン名：{loginName || '--------'}</span>
            </div>
          </div>
        </header>

        {errorMessage ? (
          <div className="top-page__error" role="alert">
            {errorMessage}
          </div>
        ) : null}

        <section aria-labelledby="notice-list-heading" className="top-page__section">
          <div className="top-page__section-heading" id="notice-list-heading">
            お知らせ一覧
          </div>
          <div className="top-page__section-body top-page__section-body--notice">
            {isLoading ? (
              <div aria-busy="true" aria-live="polite" className="top-page__skeleton-list">
                <span className="sr-only">お知らせを読み込み中です</span>
                <span className="top-page__skeleton-item" />
                <span className="top-page__skeleton-item" />
                <span className="top-page__skeleton-item top-page__skeleton-item--short" />
              </div>
            ) : notices.length > 0 ? (
              <ul className="top-page__notice-list">
                {notices.map((notice) => (
                  <li className="top-page__notice-item" key={notice.noticeId}>
                    <button
                      className="top-page__notice-link"
                      onClick={() => {
                        handleOpenNotice(notice.noticeId)
                      }}
                      type="button"
                    >
                      {formatNoticeLabel(notice.fiscalYear, notice.title)}
                    </button>
                    {notice.isNew ? <span className="top-page__notice-badge">New</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="top-page__empty-state">表示できるお知らせはありません</p>
            )}
          </div>
        </section>

        <section aria-labelledby="my-page-heading" className="top-page__section">
          <div className="top-page__section-heading" id="my-page-heading">
            マイページ
          </div>
          <div className="top-page__section-body top-page__section-body--compact">
            <button
              className="top-page__mypage-link"
              onClick={handleOpenMyPage}
              type="button"
            >
              マイページ
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}