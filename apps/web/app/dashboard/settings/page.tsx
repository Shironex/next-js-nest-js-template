import { SettingsPage } from '@/modules/dashboard/components/pages/settings-page'
import AuthPageWrapper from '@/modules/authentication/components/auth-page-wrapper'

export default function SettingsPageRoute() {
  return (
    <AuthPageWrapper requiresAuth={true} loadingType="dashboard">
      <SettingsPage />
    </AuthPageWrapper>
  )
}
