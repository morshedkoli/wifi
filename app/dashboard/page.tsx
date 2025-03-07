'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerForm from '@/components/CustomerForm';
import CustomerList from '@/components/CustomerList';
import MonthlyBalance from '@/components/MonthlyBalance';

export default function Dashboard() {
  return (
    <div className="container mx-auto py-4 px-4 sm:px-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">WiFi Management Dashboard</h1>
      
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="w-full flex-wrap h-auto gap-2 bg-transparent">
        
          <TabsTrigger value="new" className="flex-1 min-w-[120px]">New Customer</TabsTrigger>
          <TabsTrigger value="active" className="flex-1 min-w-[120px]">Active Customers</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1 min-w-[120px]">Completed</TabsTrigger>
          <TabsTrigger value="balance" className="flex-1 min-w-[120px]">Monthly Balance</TabsTrigger>
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