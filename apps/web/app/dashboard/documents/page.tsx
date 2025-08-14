import { SimplePage } from '@/modules/dashboard/components/pages/simple-page'
import { FileText } from 'lucide-react'
import AuthPageWrapper from '@/modules/authentication/components/auth-page-wrapper'

export default function DocumentsPageRoute() {
  return (
    <AuthPageWrapper requiresAuth={true} loadingType="dashboard">
      <SimplePage
        title="Documents"
        description="Manage and organize your files and documents"
        icon={<FileText className="text-muted-foreground/50 h-16 w-16" />}
      />
    </AuthPageWrapper>
  )
}
