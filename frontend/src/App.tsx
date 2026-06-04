import { Navigate, Route, Routes } from 'react-router-dom'

import { DividendNoticePage } from '@/pages/DividendNoticePage'
import { LoginPage } from '@/pages/LoginPage'
import { MyPage } from '@/pages/MyPage'
import { TopPage } from '@/pages/TopPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/top" element={<TopPage />} />
      <Route path="/my-page" element={<MyPage />} />
      <Route path="/dividend-notices/:noticeId" element={<DividendNoticePage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}