import { SimplePage } from '@/modules/dashboard/components/pages/simple-page'
import { Bell } from 'lucide-react'

export default function NotificationsPageRoute() {
  return (
    <SimplePage
      title="Notifications"
      description="Stay updated with your account activity and system alerts"
      icon={<Bell className="text-muted-foreground/50 h-16 w-16" />}
    />
  )
}
