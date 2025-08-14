import { AnalyticsPage } from '@/modules/dashboard/components/pages/analytics-page'
import AuthPageWrapper from '@/modules/authentication/components/auth-page-wrapper'

export default function AnalyticsPageRoute() {
  return (
    <AuthPageWrapper requiresAuth={true} loadingType="dashboard">
      <AnalyticsPage />
    </AuthPageWrapper>
  )
}
