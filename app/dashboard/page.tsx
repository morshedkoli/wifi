'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerForm from '@/components/CustomerForm';
import CustomerList from '@/components/CustomerList';
import MonthlyBalance from '@/components/MonthlyBalance';

export default function Dashboard() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">WiFi Management Dashboard</h1>
      
      <Tabs defaultValue="balance" className="space-y-4">
        <TabsList>
        <TabsTrigger value="balance">Monthly Balance</TabsTrigger>
          <TabsTrigger value="new">New Customer</TabsTrigger>
          <TabsTrigger value="active">Active Customers</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new">
          <CustomerForm />
        </TabsContent>
        
        <TabsContent value="active">
          <CustomerList status="active" />
        </TabsContent>
        
        <TabsContent value="completed">
          <CustomerList status="completed" />
        </TabsContent>
        
        <TabsContent value="balance">
          <MonthlyBalance />
        </TabsContent>
      </Tabs>
    </div>
  );
}