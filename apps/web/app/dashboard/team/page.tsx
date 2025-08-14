import { SimplePage } from '@/modules/dashboard/components/pages/simple-page'
import { Users } from 'lucide-react'
import AuthPageWrapper from '@/modules/authentication/components/auth-page-wrapper'

export default function TeamPageRoute() {
  return (
    <AuthPageWrapper requiresAuth={true} loadingType="dashboard">
      <SimplePage
        title="Team Management"
        description="Manage your team members and their permissions"
        icon={<Users className="text-muted-foreground/50 h-16 w-16" />}
      />
    </AuthPageWrapper>
  )
}
