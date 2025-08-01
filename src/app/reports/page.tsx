
'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { generateReport } from '@/ai/flows/generate-report';
import { Bot, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mockStoresData = {
  stores: [
    {
      id: 'store-001',
      name: 'Downtown Fashion',
      location: 'New York',
      sales: {
        last_month: 85234.5,
        this_month: 92143.75,
        top_products: [
          { name: 'Vintage Denim Jacket', units_sold: 150 },
          { name: 'Classic White Tee', units_sold: 320 },
        ],
      },
      inventory: {
        total_items: 4500,
        stock_level: 'optimal',
        low_stock_items: ['Silk Scarf', 'Leather Belt'],
      },
      user_activity: {
        new_customers: 120,
        repeat_customers: 350,
        average_session_duration_minutes: 8.5,
      },
    },
    {
      id: 'store-002',
      name: 'Uptown Appliances',
      location: 'Los Angeles',
      sales: {
        last_month: 150321.0,
        this_month: 145876.2,
        top_products: [
          { name: 'Smart Refrigerator', units_sold: 40 },
          { name: 'Air Fryer Pro', units_sold: 210 },
        ],
      },
      inventory: {
        total_items: 1200,
        stock_level: 'high',
        low_stock_items: [],
      },
      user_activity: {
        new_customers: 85,
        repeat_customers: 210,
        average_session_duration_minutes: 12.2,
      },
    },
    {
      id: 'store-003',
      name: 'Kitchen Corner',
      location: 'Chicago',
      sales: {
        last_month: 45000.0,
        this_month: 52000.5,
        top_products: [
          { name: 'Non-stick Pan Set', units_sold: 180 },
          { name: "Chef's Knife", units_sold: 250 },
        ],
      },
      inventory: {
        total_items: 8000,
        stock_level: 'optimal',
        low_stock_items: ['Blender X', 'Coffee Grinder'],
      },
      user_activity: {
        new_customers: 250,
        repeat_customers: 400,
        average_session_duration_minutes: 6.8,
      },
    },
  ],
};

export default function ReportsPage() {
  const [metrics, setMetrics] = useState('sales growth, top selling products by category, and inventory status');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState('');
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setReport('');
    try {
      const result = await generateReport({
        metrics,
        storesData: JSON.stringify(mockStoresData),
      });
      setReport(result.report);
      toast({
        title: 'Report Generated',
        description: 'Your report has been successfully created.',
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate the report. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">AI Report Generator</h1>
          <p className="text-muted-foreground">
            Generate intelligent reports on key business metrics using AI.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Metrics</CardTitle>
            <CardDescription>
              Enter the metrics you want to include in the report, separated by commas. The report will be generated using sample data for all stores.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="metrics">Metrics</Label>
              <Textarea
                id="metrics"
                placeholder="e.g., sales, inventory, user activity"
                value={metrics}
                onChange={(e) => setMetrics(e.target.value)}
                rows={3}
                disabled={isLoading}
              />
            </div>
            <Button onClick={handleGenerateReport} disabled={isLoading || !metrics}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Generating...' : 'Generate Report'}
            </Button>
          </CardContent>
        </Card>

        {(isLoading || report) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" /> Generated Report
              </CardTitle>
              <CardDescription>
                Below is the report generated by the AI based on your specified metrics and sample store data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {report}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
