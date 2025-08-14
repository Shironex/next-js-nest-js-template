import { OverviewPage } from '@/modules/dashboard/components/pages/overview-page'
import AuthPageWrapper from '@/modules/authentication/components/auth-page-wrapper'

export default function DashboardPage() {
  return (
    <AuthPageWrapper requiresAuth={true} loadingType="dashboard">
      <OverviewPage />
    </AuthPageWrapper>
  )
}
