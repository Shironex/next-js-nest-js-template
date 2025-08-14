'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Loader2, RefreshCw, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { useCurrentUser } from '@/modules/authentication/hooks/use-current-user'
import { useRouter } from 'next/navigation'
import AuthPageWrapper from '@/modules/authentication/components/auth-page-wrapper'

interface WebhookLog {
  id: string
  stripeEventId: string
  eventType: string
  status: string
  processingTimeMs: number | null
  createdAt: string
  processedAt: string | null
  errorMessage: string | null
  userId: string | null
  customerId: string | null
  requestBody: any
  responseBody: any
}

function WebhookLogsPageContent() {
  const router = useRouter()
  const { user, isUserAuth, isLoading: isUserLoading } = useCurrentUser()
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const {
    data: logs,
    isLoading,
    refetch,
  } = useQuery<WebhookLog[]>({
    queryKey: ['webhook-logs'],
    queryFn: async () => {
      const response = await api.get('/admin/webhook-logs')
      return response.data.data
    },
    enabled: isUserAuth && user?.role === 'ADMIN',
  })

  useEffect(() => {
    if (!isUserLoading && (!isUserAuth || user?.role !== 'ADMIN')) {
      router.push('/dashboard')
    }
  }, [user, isUserAuth, isUserLoading, router])

  if (isUserLoading || !isUserAuth || user?.role !== 'ADMIN') {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'PROCESSING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'IGNORED':
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
      SUCCESS: 'default',
      FAILED: 'destructive',
      PROCESSING: 'secondary',
      IGNORED: 'outline',
      PENDING: 'outline',
      RETRY: 'secondary',
    }

    return (
      <Badge variant={variants[status] || 'outline'} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status}
      </Badge>
    )
  }

  const viewDetails = (log: WebhookLog) => {
    setSelectedLog(log)
    setIsDetailsOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhook Audit Logs</h1>
          <p className="text-muted-foreground">
            Monitor Stripe webhook events and processing status
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Webhook Events</CardTitle>
          <CardDescription>Last 100 webhook events processed by the system</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : logs && logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event ID</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Processing Time</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {log.stripeEventId.substring(0, 20)}...
                    </TableCell>
                    <TableCell className="text-sm">{log.eventType}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-sm">
                      {log.processingTimeMs ? `${log.processingTimeMs}ms` : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(log.createdAt), 'MMM dd, HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => viewDetails(log)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-muted-foreground py-8 text-center">No webhook logs found</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-h-[80vh] max-w-3xl">
          <DialogHeader>
            <DialogTitle>Webhook Event Details</DialogTitle>
            <DialogDescription>
              Full details of the webhook event and processing result
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-semibold">Event Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event ID:</span>
                      <span className="font-mono">{selectedLog.stripeEventId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event Type:</span>
                      <span>{selectedLog.eventType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(selectedLog.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processing Time:</span>
                      <span>
                        {selectedLog.processingTimeMs ? `${selectedLog.processingTimeMs}ms` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created At:</span>
                      <span>{format(new Date(selectedLog.createdAt), 'PPpp')}</span>
                    </div>
                    {selectedLog.processedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Processed At:</span>
                        <span>{format(new Date(selectedLog.processedAt), 'PPpp')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {selectedLog.errorMessage && (
                  <div>
                    <h4 className="mb-2 font-semibold">Error Details</h4>
                    <div className="bg-destructive/10 rounded-md p-3">
                      <p className="text-destructive text-sm">{selectedLog.errorMessage}</p>
                    </div>
                  </div>
                )}

                {selectedLog.userId && (
                  <div>
                    <h4 className="mb-2 font-semibold">Related Entities</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">User ID:</span>
                        <span className="font-mono">{selectedLog.userId}</span>
                      </div>
                      {selectedLog.customerId && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Customer ID:</span>
                          <span className="font-mono">{selectedLog.customerId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="mb-2 font-semibold">Request Body</h4>
                  <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
                    {JSON.stringify(selectedLog.requestBody, null, 2)}
                  </pre>
                </div>

                {selectedLog.responseBody && (
                  <div>
                    <h4 className="mb-2 font-semibold">Response Body</h4>
                    <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">
                      {JSON.stringify(selectedLog.responseBody, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function WebhookLogsPage() {
  return (
    <AuthPageWrapper requiresAuth={true} loadingType="dashboard">
      <WebhookLogsPageContent />
    </AuthPageWrapper>
  )
}
