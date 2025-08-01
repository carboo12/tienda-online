
'use client';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

const logData = [
    { id: 1, user: 'user1@example.com', action: 'CREATE_INVOICE', details: 'Invoice #INV-0012 created for Customer A', timestamp: '2023-10-27 10:00:00', status: 'Success' },
    { id: 2, user: 'user2@example.com', action: 'UPDATE_PRODUCT', details: 'Product SKU #PROD-554 updated quantity to 50', timestamp: '2023-10-27 10:05:12', status: 'Success' },
    { id: 3, user: 'Admin', action: 'DELETE_USER', details: 'User account for user3@example.com deleted', timestamp: '2023-10-27 10:15:34', status: 'Warning' },
    { id: 4, user: 'user1@example.com', action: 'CREATE_ORDER', details: 'Order #ORD-987 created', timestamp: '2023-10-27 11:20:05', status: 'Success' },
    { id: 5, user: 'user2@example.com', action: 'LOGIN_ATTEMPT', details: 'Failed login attempt from IP 192.168.1.10', timestamp: '2023-10-27 11:30:15', status: 'Error' },
    { id: 6, user: 'Admin', action: 'VIEW_REPORT', details: 'Viewed AI sales report for Q3', timestamp: '2023-10-27 12:00:00', status: 'Info' },
];

export default function LogPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.username !== 'Admin') {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.username !== 'Admin') {
    return <AppShell><div>Loading...</div></AppShell>;
  }

  return (
    <AppShell>
       <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Action Log</h1>
          <p className="text-muted-foreground">
            A log of all user actions within the system. For admin eyes only.
          </p>
        </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
          <CardDescription>All user actions are recorded here for auditing purposes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logData.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell className="text-muted-foreground">{log.details}</TableCell>
                  <TableCell>
                    <Badge variant={
                      log.status === 'Error' ? 'destructive' :
                      log.status === 'Warning' ? 'secondary' : 'default'
                    }>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{log.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
