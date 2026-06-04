import { useMyPage } from '@/hooks/useMyPage'

function formatBirthDate(value: string): string {
  return value.replace(/-/g, '/')
}

function formatPostalCode(value: string): string {
  return value.length === 7 ? `${value.slice(0, 3)}-${value.slice(3)}` : value
}

function formatPhoneNumber(value: string): string {
  if (value.includes('-')) {
    return value
  }

  if (value.length === 11) {
    return `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`
  }

  return value
}

function formatShareBalance(value: string): string {
  const amount = Number.parseFloat(value)

  if (Number.isNaN(amount)) {
    return value
  }

  return `${new Intl.NumberFormat('ja-JP', {
    maximumFractionDigits: 0,
  }).format(amount)}円`
}

export function MyPage() {
  const {
    errorMessage,
    fieldErrors,
    formValues,
    handleBack,
    handleCancel,
    handleEdit,
    handleFieldBlur,
    handleFieldChange,
    handleLogout,
    handleSave,
    isEditing,
    isLoading,
    isLoggingOut,
    isSaveDisabled,
    isSubmitting,
    memberProfile,
    successMessage,
  } = useMyPage()

  const postalCodeError = fieldErrors.postalCode
  const addressError = fieldErrors.address
  const phoneNumberError = fieldErrors.phoneNumber
  const emailError = fieldErrors.email
  const accountRegistrationInfoError = fieldErrors.accountRegistrationInfo

  return (
    <main className="my-page">
      <div className="my-page__shell">
        <header className="my-page__header">
          <div className="my-page__header-actions">
            <button
              className="my-page__logout"
              disabled={isLoggingOut}
              onClick={() => {
                void handleLogout()
              }}
              type="button"
            >
              {isLoggingOut ? '処理中...' : 'ログアウト'}
            </button>
          </div>

          <div className="my-page__header-row">
            <h1 className="my-page__title">マイページ</h1>
            <div className="my-page__session-info">
              <span>組合員コード：{memberProfile?.userCode ?? '--------'}</span>
              <span>ログイン名：{memberProfile?.userName ?? '--------'}</span>
            </div>
          </div>

          <div className="my-page__actions">
            <button
              className="my-page__button my-page__button--secondary"
              onClick={handleBack}
              type="button"
            >
              戻る
            </button>

            {isEditing ? (
              <>
                <button
                  className="my-page__button"
                  disabled={isSaveDisabled}
                  onClick={() => {
                    void handleSave()
                  }}
                  type="button"
                >
                  {isSubmitting ? '保存中...' : '保存'}
                </button>
                <button
                  className="my-page__button my-page__button--secondary"
                  disabled={isSubmitting}
                  onClick={handleCancel}
                  type="button"
                >
                  キャンセル
                </button>
              </>
            ) : (
              <button
                className="my-page__button"
                disabled={isLoading || !memberProfile?.editable}
                onClick={handleEdit}
                type="button"
              >
                編集
              </button>
            )}
          </div>
        </header>

        <section aria-labelledby="member-information-heading" className="my-page__section">
          <div className="my-page__section-heading" id="member-information-heading">
            組合員情報詳細
          </div>

          <div className="my-page__section-body">
            {errorMessage ? (
              <div className="my-page__feedback" role="alert">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="my-page__feedback my-page__feedback--success" role="status">
                {successMessage}
              </div>
            ) : null}

            {isLoading || !memberProfile ? (
              <div aria-busy="true" aria-live="polite" className="my-page__skeleton">
                <span className="sr-only">組合員情報を読み込み中です</span>
                <span className="my-page__skeleton-line" />
                <span className="my-page__skeleton-line" />
                <span className="my-page__skeleton-line my-page__skeleton-line--short" />
              </div>
            ) : (
              <form className="my-page__form" noValidate>
                <div className="my-page__grid">
                  <div className="my-page__field">
                    <span className="my-page__label">組合員コード</span>
                    <div className="my-page__value">{memberProfile.userCode}</div>
                  </div>

                  <div className="my-page__field">
                    <span className="my-page__label">組合員名</span>
                    <div className="my-page__value">{memberProfile.userName}</div>
                  </div>

                  <div className="my-page__field">
                    <span className="my-page__label">フリガナ</span>
                    <div className="my-page__value">{memberProfile.userNameKana}</div>
                  </div>

                  <div className="my-page__field">
                    <span className="my-page__label">生年月日</span>
                    <div className="my-page__value">{formatBirthDate(memberProfile.birthDate)}</div>
                  </div>

                  <div className="my-page__field">
                    <label className="my-page__label" htmlFor="postalCode">
                      郵便番号
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          className="my-page__input"
                          id="postalCode"
                          inputMode="numeric"
                          onBlur={() => {
                            handleFieldBlur('postalCode')
                          }}
                          onChange={(event) => {
                            handleFieldChange('postalCode', event.currentTarget.value)
                          }}
                          value={formValues.postalCode}
                        />
                        <div className="my-page__field-error">{postalCodeError}</div>
                      </>
                    ) : (
                      <div className="my-page__value">{formatPostalCode(memberProfile.postalCode)}</div>
                    )}
                  </div>

                  <div className="my-page__field my-page__field--wide">
                    <label className="my-page__label" htmlFor="address">
                      住所
                    </label>
                    {isEditing ? (
                      <>
                        <textarea
                          className="my-page__textarea"
                          id="address"
                          onBlur={() => {
                            handleFieldBlur('address')
                          }}
                          onChange={(event) => {
                            handleFieldChange('address', event.currentTarget.value)
                          }}
                          rows={3}
                          value={formValues.address}
                        />
                        <div className="my-page__field-error">{addressError}</div>
                      </>
                    ) : (
                      <div className="my-page__value my-page__value--multiline">{memberProfile.address}</div>
                    )}
                  </div>

                  <div className="my-page__field">
                    <label className="my-page__label" htmlFor="phoneNumber">
                      電話番号
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          className="my-page__input"
                          id="phoneNumber"
                          onBlur={() => {
                            handleFieldBlur('phoneNumber')
                          }}
                          onChange={(event) => {
                            handleFieldChange('phoneNumber', event.currentTarget.value)
                          }}
                          value={formValues.phoneNumber}
                        />
                        <div className="my-page__field-error">{phoneNumberError}</div>
                      </>
                    ) : (
                      <div className="my-page__value">{formatPhoneNumber(memberProfile.phoneNumber)}</div>
                    )}
                  </div>

                  <div className="my-page__field">
                    <label className="my-page__label" htmlFor="email">
                      メールアドレス
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          className="my-page__input"
                          id="email"
                          onBlur={() => {
                            handleFieldBlur('email')
                          }}
                          onChange={(event) => {
                            handleFieldChange('email', event.currentTarget.value)
                          }}
                          type="email"
                          value={formValues.email}
                        />
                        <div className="my-page__field-error">{emailError}</div>
                      </>
                    ) : (
                      <div className="my-page__value">{memberProfile.email}</div>
                    )}
                  </div>

                  <div className="my-page__field">
                    <span className="my-page__label">出資金残高</span>
                    <div className="my-page__value">{formatShareBalance(memberProfile.shareBalanceAmount)}</div>
                  </div>

                  <fieldset className="my-page__field my-page__field--wide my-page__radio-field">
                    <legend className="my-page__label">通知方法</legend>
                    {isEditing ? (
                      <div className="my-page__radio-group">
                        <label className="my-page__radio-option">
                          <input
                            checked={formValues.notificationMethod === 1}
                            onChange={() => {
                              handleFieldChange('notificationMethod', 1)
                            }}
                            type="radio"
                            value={1}
                          />
                          SMSでお知らせ
                        </label>
                        <label className="my-page__radio-option">
                          <input
                            checked={formValues.notificationMethod === 0}
                            onChange={() => {
                              handleFieldChange('notificationMethod', 0)
                            }}
                            type="radio"
                            value={0}
                          />
                          お知らせ不要
                        </label>
                      </div>
                    ) : (
                      <div className="my-page__value">
                        {memberProfile.notificationMethod === 1 ? 'SMSでお知らせ' : 'お知らせ不要'}
                      </div>
                    )}
                  </fieldset>

                  <div className="my-page__field">
                    <label className="my-page__label" htmlFor="accountRegistrationInfo">
                      口座登録情報
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          className="my-page__input"
                          id="accountRegistrationInfo"
                          onBlur={() => {
                            handleFieldBlur('accountRegistrationInfo')
                          }}
                          onChange={(event) => {
                            handleFieldChange('accountRegistrationInfo', event.currentTarget.value)
                          }}
                          value={formValues.accountRegistrationInfo}
                        />
                        <div className="my-page__field-error">{accountRegistrationInfoError}</div>
                      </>
                    ) : (
                      <div className="my-page__value">{memberProfile.accountRegistrationInfo || '未登録'}</div>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}