import { useDividendNoticePage } from '@/hooks/useDividendNoticePage'

function formatReceiptStatusLabel(receiptStatus: 'UNRECEIVED' | 'RECEIVED'): string {
  return receiptStatus === 'RECEIVED' ? '受取済' : '未受取'
}

export function DividendNoticePage() {
  const {
    detail,
    errorMessage,
    fieldErrorMessage,
    handleBack,
    handleLogout,
    handleReceiptMethodChange,
    handleSubmit,
    isLoading,
    isLoggingOut,
    isReceiptReadOnly,
    isSubmitting,
    isSubmitDisabled,
    selectedReceiptMethod,
    successMessage,
  } = useDividendNoticePage()

  return (
    <main className="dividend-page">
      <div className="dividend-page__shell">
        <header className="dividend-page__header">
          <div className="dividend-page__header-actions">
            <button
              className="dividend-page__logout"
              disabled={isLoggingOut}
              onClick={() => {
                void handleLogout()
              }}
              type="button"
            >
              {isLoggingOut ? '処理中...' : 'ログアウト'}
            </button>
          </div>

          <div className="dividend-page__header-row">
            <h1 className="dividend-page__title">
              {detail?.title ?? '出資配当金・出資金残高等のお知らせ'}
            </h1>
            <div className="dividend-page__session-info">
              <span>組合員コード：{detail?.userCode ?? '--------'}</span>
              <span>ログイン名：{detail?.loginName ?? '--------'}</span>
            </div>
          </div>

          <div className="dividend-page__actions">
            <button
              className="dividend-page__button dividend-page__button--secondary"
              onClick={handleBack}
              type="button"
            >
              戻る
            </button>
            <button
              className="dividend-page__button"
              disabled={isSubmitDisabled}
              onClick={() => {
                void handleSubmit()
              }}
              type="button"
            >
              {isSubmitting ? '処理中...' : '確定'}
            </button>
          </div>
        </header>

        <section className="dividend-page__section" aria-labelledby="receipt-information-heading">
          <div className="dividend-page__section-heading" id="receipt-information-heading">
            配当金のお受取に関する情報
          </div>
          <div className="dividend-page__section-body">
            {errorMessage ? (
              <div className="dividend-page__feedback" role="alert">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="dividend-page__feedback dividend-page__feedback--success" role="status">
                {successMessage}
              </div>
            ) : null}

            {isLoading || !detail ? (
              <div aria-busy="true" aria-live="polite" className="dividend-page__skeleton">
                <span className="sr-only">出資配当情報を読み込み中です</span>
                <span className="dividend-page__skeleton-line" />
                <span className="dividend-page__skeleton-line dividend-page__skeleton-line--short" />
                <span className="dividend-page__skeleton-line" />
              </div>
            ) : (
              <div className="dividend-page__receipt-grid">
                <div className="dividend-page__receipt-fields">
                  <div className="dividend-page__receipt-row">
                    <div className="dividend-page__receipt-label">配当金の受取状況</div>
                    <div className="dividend-page__status">
                      {formatReceiptStatusLabel(detail.receiptStatus)}
                    </div>
                  </div>

                  <div className="dividend-page__receipt-row">
                    <label className="dividend-page__receipt-label" htmlFor="receipt-method">
                      配当金の受取方法
                    </label>
                    <div className="dividend-page__select-wrap">
                      <select
                        className="dividend-page__select"
                        disabled={isReceiptReadOnly}
                        id="receipt-method"
                        onChange={(event) => {
                          handleReceiptMethodChange(event.currentTarget.value)
                        }}
                        value={selectedReceiptMethod}
                      >
                        {detail.receiptMethodOptions.map((option) => (
                          <option key={option.code} value={option.code}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div
                        aria-live="polite"
                        className="dividend-page__field-error"
                        role={fieldErrorMessage ? 'alert' : undefined}
                      >
                        {fieldErrorMessage}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dividend-page__note">
                  {detail.receiptMethodChangeDeadline ? (
                    <p>
                      受取可能期間は、受取方法確定後〜{detail.receiptMethodChangeDeadline}です。
                    </p>
                  ) : null}
                  {detail.receiptMethodNote ? <p>{detail.receiptMethodNote}</p> : null}
                  {isReceiptReadOnly ? (
                    <p>受取済または受付期間外のため、受取方法は変更できません。</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="dividend-page__section" aria-labelledby="dividend-detail-heading">
          <div className="dividend-page__section-heading" id="dividend-detail-heading">
            出資配当金・出資金残高情報
          </div>
          <div className="dividend-page__section-body">
            {isLoading || !detail ? (
              <div aria-hidden="true" className="dividend-page__skeleton">
                <span className="dividend-page__skeleton-line" />
                <span className="dividend-page__skeleton-line" />
                <span className="dividend-page__skeleton-line dividend-page__skeleton-line--short" />
              </div>
            ) : (
              <>
                {detail.precautions.length > 0 ? (
                  <ul className="dividend-page__precautions">
                    {detail.precautions.map((precaution) => (
                      <li key={precaution}>{precaution}</li>
                    ))}
                  </ul>
                ) : null}

                {detail.detailItems.length > 0 ? (
                  <div className="dividend-page__table-wrap">
                    <table className="dividend-page__table">
                      <thead>
                        <tr>
                          <th scope="col">項目</th>
                          <th scope="col">値</th>
                          <th scope="col">補足</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.detailItems.map((item) => (
                          <tr key={item.itemName}>
                            <th scope="row">{item.itemName}</th>
                            <td>{item.value}</td>
                            <td>{item.note ?? '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="dividend-page__empty">表示できる出資配当情報がありません</p>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}