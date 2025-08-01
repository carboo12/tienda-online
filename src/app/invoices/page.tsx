
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

export default function InvoicesPage() {
  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Invoicing</h1>
            <p className="text-muted-foreground">Manage and track all your invoices.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
          <CardDescription>A list of recent invoices will be displayed here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/50">
            <p className="text-muted-foreground">No invoices to display.</p>
          </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">This is where pagination would go.</p>
        </CardFooter>
      </Card>
    </AppShell>
  );
}
