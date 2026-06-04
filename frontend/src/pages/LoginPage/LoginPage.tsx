import { SystemLogo } from '@/components/SystemLogo'
import { useLoginForm } from '@/hooks/useLoginForm'

export function LoginPage() {
  const {
    clearFormError,
    formErrorMessage,
    formState,
    handleUserCodeBlur,
    handleUserCodeKeyDown,
    isSubmitDisabled,
    isSubmitting,
    register,
    submitLogin,
  } = useLoginForm()

  const userCodeField = register('userCode')
  const passwordField = register('password')
  const userCodeErrorMessage = formState.errors.userCode?.message ?? ''
  const passwordErrorMessage = formState.errors.password?.message ?? ''

  return (
    <main className="login-page">
      <div className="login-page__inner">
        <section className="login-card" aria-labelledby="login-screen-title">
          <SystemLogo />

          <form className="login-form" aria-busy={isSubmitting} onSubmit={submitLogin} noValidate>
            <span id="login-screen-title" hidden>
              ログイン画面
            </span>

            {formErrorMessage ? (
              <div className="login-form__error" role="alert">
                {formErrorMessage}
              </div>
            ) : null}

            <div className="login-form__row">
              <label className="login-form__label" htmlFor="user-code">
                組合員コード
              </label>
              <div className="login-form__field">
                <input
                  {...userCodeField}
                  id="user-code"
                  autoComplete="username"
                  className="login-form__input"
                  inputMode="numeric"
                  maxLength={10}
                  onBlur={async (event) => {
                    userCodeField.onBlur(event)
                    clearFormError()
                    await handleUserCodeBlur(event)
                  }}
                  onChange={(event) => {
                    clearFormError()
                    userCodeField.onChange(event)
                  }}
                  onKeyDown={(event) => {
                    void handleUserCodeKeyDown(event)
                  }}
                />
                <div
                  aria-live="polite"
                  className="login-form__field-error"
                  role={userCodeErrorMessage ? 'alert' : undefined}
                >
                  {userCodeErrorMessage}
                </div>
              </div>
            </div>

            <div className="login-form__row">
              <label className="login-form__label" htmlFor="password">
                パスワード
              </label>
              <div className="login-form__field">
                <input
                  {...passwordField}
                  id="password"
                  autoComplete="current-password"
                  className="login-form__input"
                  maxLength={32}
                  type="password"
                  onBlur={(event) => {
                    passwordField.onBlur(event)
                    clearFormError()
                  }}
                  onChange={(event) => {
                    clearFormError()
                    passwordField.onChange(event)
                  }}
                />
                <div
                  aria-live="polite"
                  className="login-form__field-error"
                  role={passwordErrorMessage ? 'alert' : undefined}
                >
                  {passwordErrorMessage}
                </div>
              </div>
            </div>

            <div className="login-form__actions">
              <button className="login-form__submit" disabled={isSubmitDisabled} type="submit">
                {isSubmitting ? '送信中...' : 'ログイン'}
              </button>
            </div>

            {isSubmitting ? (
              <p className="login-form__submitting">認証中です。しばらくお待ちください。</p>
            ) : null}
          </form>
        </section>
      </div>
    </main>
  )
}