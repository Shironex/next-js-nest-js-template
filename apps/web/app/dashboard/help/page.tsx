import { SimplePage } from '@/modules/dashboard/components/pages/simple-page'
import { HelpCircle } from 'lucide-react'

export default function HelpPageRoute() {
  return (
    <SimplePage
      title="Help Center"
      description="Get help and learn how to use our platform effectively"
      icon={<HelpCircle className="text-muted-foreground/50 h-16 w-16" />}
    />
  )
}
