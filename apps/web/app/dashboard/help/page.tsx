import { SimplePage } from '@/modules/dashboard/components/pages/simple-page'
import { HelpCircle } from 'lucide-react'
import AuthPageWrapper from '@/modules/authentication/components/auth-page-wrapper'

export default function HelpPageRoute() {
  return (
    <AuthPageWrapper requiresAuth={true} loadingType="dashboard">
      <SimplePage
        title="Help Center"
        description="Get help and learn how to use our platform effectively"
        icon={<HelpCircle className="text-muted-foreground/50 h-16 w-16" />}
      />
    </AuthPageWrapper>
  )
}
