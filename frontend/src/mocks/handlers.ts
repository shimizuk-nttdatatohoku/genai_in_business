import { HttpResponse, http } from 'msw'

interface LoginBody {
  userCode?: string
  password?: string
}

interface UpdateReceiptMethodBody {
  receiptMethod?: string
}

interface UpdateMyProfileBody {
  postalCode?: string
  address?: string
  phoneNumber?: string
  email?: string
  notificationMethod?: number
  accountRegistrationInfo?: string
}

function isLoginBody(value: unknown): value is LoginBody {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const userCode = Reflect.get(value, 'userCode')
  const password = Reflect.get(value, 'password')

  return (
    (typeof userCode === 'string' || typeof userCode === 'undefined') &&
    (typeof password === 'string' || typeof password === 'undefined')
  )
}

function isUpdateReceiptMethodBody(value: unknown): value is UpdateReceiptMethodBody {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const receiptMethod = Reflect.get(value, 'receiptMethod')

  return typeof receiptMethod === 'string' || typeof receiptMethod === 'undefined'
}

function isUpdateMyProfileBody(value: unknown): value is UpdateMyProfileBody {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const postalCode = Reflect.get(value, 'postalCode')
  const address = Reflect.get(value, 'address')
  const phoneNumber = Reflect.get(value, 'phoneNumber')
  const email = Reflect.get(value, 'email')
  const notificationMethod = Reflect.get(value, 'notificationMethod')
  const accountRegistrationInfo = Reflect.get(value, 'accountRegistrationInfo')

  return (
    (typeof postalCode === 'string' || typeof postalCode === 'undefined') &&
    (typeof address === 'string' || typeof address === 'undefined') &&
    (typeof phoneNumber === 'string' || typeof phoneNumber === 'undefined') &&
    (typeof email === 'string' || typeof email === 'undefined') &&
    (typeof notificationMethod === 'number' || typeof notificationMethod === 'undefined') &&
    (typeof accountRegistrationInfo === 'string' || typeof accountRegistrationInfo === 'undefined')
  )
}

export const handlers = [
  http.get('*/api/v1/dividend-notices', () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          userCode: '123456',
          loginName: '阿部〇〇',
          items: [
            {
              noticeId: 'ntc-2026-0001',
              fiscalYear: 2026,
              title: '2026年度分 出資配当金・出資金残高等のお知らせ',
              isNew: true,
              publishedAt: '2026-04-01T00:00:00Z',
            },
            {
              noticeId: 'ntc-2025-0001',
              fiscalYear: 2025,
              title: '2025年度分 出資配当金・出資金残高等のお知らせ',
              isNew: false,
              publishedAt: '2025-04-01T00:00:00Z',
            },
          ],
          pagination: {
            page: 1,
            pageSize: 20,
            totalCount: 2,
          },
        },
        errors: [],
      },
      { status: 200 },
    )
  }),

  http.post('*/api/v1/auth-sessions', async ({ request }) => {
    const body = await request.json()

    if (!isLoginBody(body) || !body.userCode) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          errors: [{ code: 'E_101', message: '組合員コードは必須です' }],
        },
        { status: 400 },
      )
    }

    if (!/^\d{6,10}$/.test(body.userCode)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          errors: [{ code: 'E_102', message: '組合員コードの形式が正しくありません' }],
        },
        { status: 400 },
      )
    }

    if (body.password !== 'password123') {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          errors: [
            { code: 'E_001', message: '組合員コードまたはパスワードが正しくありません' },
          ],
        },
        { status: 401 },
      )
    }

    return HttpResponse.json(
      {
        sessionId: 'session-001',
        userCode: body.userCode,
        loginName: '山田 太郎',
        csrfToken: 'csrf-token',
        lastLoginAt: '2026-06-01T09:00:00+09:00',
      },
      { status: 201 },
    )
  }),

  http.delete('*/api/v1/auth-sessions/current', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('*/api/v1/dividend-notices/:noticeId', ({ params }) => {
    if (params.noticeId !== 'ntc-2026-0001') {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          errors: [{ code: 'E_404', message: 'お知らせが見つかりません' }],
        },
        { status: 404 },
      )
    }

    return HttpResponse.json(
      {
        success: true,
        data: {
          noticeId: 'ntc-2026-0001',
          title: '2026年度分 出資配当金・出資金残高等のお知らせ',
          userCode: '123456',
          loginName: '阿部〇〇',
          receiptStatus: 'UNRECEIVED',
          receiptMethod: 'BANK_TRANSFER',
          receiptMethodOptions: [
            { code: 'BANK_TRANSFER', label: '登録口座振込' },
            { code: 'ACCOUNT_TRANSFER', label: '出資振替' },
            { code: 'COUNTER_PICKUP', label: '現金受取' },
          ],
          canUpdateReceiptMethod: true,
          receiptMethodChangeDeadline: '2026-03-20',
          receiptMethodNote:
            '現金受取用バーコードの発行は店頭コードの入力が必要ですので、店舗サービスカウンターでご案内のうえご利用ください。',
          detailItems: [
            { itemName: '出資金残高', value: '5,000円', note: '202X年X月XX日現在' },
            { itemName: '出資配当率', value: '1.20%', note: 'XX回総代会決定事項' },
            { itemName: '出資配当率（税引後）', value: '1.159%', note: '出資配当金は増資日よりお預かりした期間の日割計算です' },
          ],
          precautions: [
            '[C]については20XX年X月XX日に出資金に加算いたしますので、お手続きは不要です。',
            'その際の出資金は税代金翌日よりお預かりしたものといたします。',
            '[C]を現金でお受取希望の場合は、こちらをご確認ください。',
          ],
        },
        errors: [],
      },
      { status: 200 },
    )
  }),

  http.put('*/api/v1/dividend-notices/:noticeId/receipt-method', async ({ params, request }) => {
    if (params.noticeId !== 'ntc-2026-0001') {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          errors: [{ code: 'E_404', message: 'お知らせが見つかりません' }],
        },
        { status: 404 },
      )
    }

    const body = await request.json()

    if (!isUpdateReceiptMethodBody(body) || !body.receiptMethod) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          errors: [{ code: 'E_101', message: '配当金受取方法を選択してください' }],
        },
        { status: 400 },
      )
    }

    if (!['BANK_TRANSFER', 'ACCOUNT_TRANSFER', 'COUNTER_PICKUP'].includes(body.receiptMethod)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          errors: [{ code: 'E_102', message: '配当金受取方法を正しく選択してください' }],
        },
        { status: 400 },
      )
    }

    if (body.receiptMethod === 'ACCOUNT_TRANSFER') {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          errors: [{ code: 'E_201', message: '受付期間外のため変更できません' }],
        },
        { status: 400 },
      )
    }

    return HttpResponse.json(
      {
        success: true,
        data: {
          noticeId: 'ntc-2026-0001',
          receiptStatus: 'UNRECEIVED',
          receiptMethod: body.receiptMethod,
          updatedAt: '2026-06-03T09:20:00Z',
          message: '配当金受取方法を更新しました',
        },
        errors: [],
      },
      { status: 200 },
    )
  }),

  http.get('*/api/v1/users/me', () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          userCode: '123456',
          userName: '阿部〇〇',
          userNameKana: 'アベ〇〇',
          birthDate: '1987-11-01',
          postalCode: '9999999',
          address: '宮城県仙台市青葉区中央1-1-2',
          phoneNumber: '090-1234-5678',
          email: 'xxxxxx@coop.co.jp',
          shareBalanceAmount: '5000.00',
          notificationMethod: 1,
          accountRegistrationInfo: '未登録',
          editable: true,
        },
        errors: [],
      },
      { status: 200 },
    )
  }),

  http.put('*/api/v1/users/me', async ({ request }) => {
    const body = await request.json()

    if (!isUpdateMyProfileBody(body)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          errors: [{ code: 'E_101', message: '入力内容を確認してください' }],
        },
        { status: 400 },
      )
    }

    if (!body.postalCode || !body.address || !body.phoneNumber || !body.email) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          errors: [{ code: 'E_101', message: '必須項目を入力してください' }],
        },
        { status: 400 },
      )
    }

    if (!/^\d{7}$/.test(body.postalCode)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          errors: [{ code: 'E_102', message: '郵便番号の形式が正しくありません' }],
        },
        { status: 400 },
      )
    }

    if (!/^[0-9-]+$/.test(body.phoneNumber)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          errors: [{ code: 'E_102', message: '電話番号の形式が正しくありません' }],
        },
        { status: 400 },
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          errors: [{ code: 'E_102', message: 'メールアドレスの形式が正しくありません' }],
        },
        { status: 400 },
      )
    }

    return HttpResponse.json(
      {
        success: true,
        data: {
          updatedAt: '2026-06-03T09:35:00Z',
          message: '更新しました',
        },
        errors: [],
      },
      { status: 200 },
    )
  }),
]