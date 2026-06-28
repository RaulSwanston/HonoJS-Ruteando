import type { TranslationKey } from '../lib/engine'
import type { User } from '../models/users'

type Props = {
  t: (key: TranslationKey, ...args: string[]) => string
  user: User
  title?: string
  children: any
}

export default function DashboardLayout({ t, user, title, children }: Props) {
  return (
    <div class="dashboard-layout">
      <aside class="dashboard-sidebar">
        <div class="sidebar-header">
          <a href="/dashboard">{t('app_name')}</a>
        </div>
        <nav class="sidebar-nav">
          <a href="/dashboard">{t('dashboard_overview')}</a>
          <a href="/dashboard/profile">{t('dashboard_profile')}</a>
        </nav>
        <div class="sidebar-footer">
          <span>{user.name}</span>
          <a href="/auth/logout">{t('logout')}</a>
        </div>
      </aside>
      <main class="dashboard-main">
        {title && <h1>{title}</h1>}
        {children}
      </main>
    </div>
  )
}
