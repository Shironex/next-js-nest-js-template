import { SimplePage } from '@/modules/dashboard/components/pages/simple-page'
import { Bell } from 'lucide-react'
import AuthPageWrapper from '@/modules/authentication/components/auth-page-wrapper'

export default function NotificationsPageRoute() {
  return (
    <AuthPageWrapper requiresAuth={true} loadingType="dashboard">
      <SimplePage
        title="Notifications"
        description="Stay updated with your account activity and system alerts"
        icon={<Bell className="text-muted-foreground/50 h-16 w-16" />}
      />
    </AuthPageWrapper>
  )
}
