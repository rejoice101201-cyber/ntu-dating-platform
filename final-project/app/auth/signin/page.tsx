import { redirect } from 'next/navigation';

// 專案目前使用 /auth/login（JWT 自訂登入）；
// 保留 /auth/signin 作為相容入口，避免舊連結 404
export default function SignInPage() {
  redirect('/auth/login');
}
