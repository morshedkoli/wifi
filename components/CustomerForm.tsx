'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parse, addMonths } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(11, 'Phone number must be at least 11 digits'),
  package: z.enum(['BASIC', 'STANDARD', 'PREMIUM']),
  days: z.number().min(1, 'Days must be at least 1'),
  month: z.string(),
});

const packagePrices = {
  BASIC: 500,
  STANDARD: 700,
  PREMIUM: 1000,
};

export default function CustomerForm() {
  const { toast } = useToast();
  const currentDate = new Date();
  const currentMonth = format(currentDate, 'yyyy-MM');
  const previousMonth = format(addMonths(currentDate, -1), 'yyyy-MM');
  const nextMonth = format(addMonths(currentDate, 1), 'yyyy-MM');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  
  useEffect(() => {
    fetchAvailableMonths();
  }, []);

  const fetchAvailableMonths = async () => {
    try {
      const response = await fetch('/api/customers/months');
      if (!response.ok) throw new Error('Failed to fetch months');
      const data = await response.json();
      
      const allMonths = [previousMonth, currentMonth, nextMonth, ...(data || [])];
        setAvailableMonths(Array.from(new Set(allMonths)).sort());
        
        if (!allMonths.includes(form.getValues('month'))) {
          form.setValue('month', currentMonth);
        }
    } catch (error) {
      console.error('Error fetching available months:', error);
      // Use current month as fallback in case of error
      setAvailableMonths([currentMonth]);
    }
  };
  
  const formatMonthDisplay = (monthStr: string) => {
    try {
      const date = parse(monthStr, 'yyyy-MM', new Date());
      return format(date, 'MMMM yyyy');
    } catch (error) {
      return monthStr; // Fallback to original string if parsing fails
    }
  };
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      package: 'BASIC',
      days: 30,
      month: currentMonth,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const price = packagePrices[values.package as keyof typeof packagePrices];
    
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, price }),
      });
      
      if (response.ok) {
        form.reset();
        toast({
          title: "Success",
          description: "Customer added successfully!",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add customer');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add customer. Please try again.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Customer</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="Enter phone number" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="package"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Package</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a package" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BASIC">Basic (500 TK)</SelectItem>
                      <SelectItem value="STANDARD">Standard (700 TK)</SelectItem>
                      <SelectItem value="PREMIUM">Premium (1000 TK)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a month" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableMonths.length > 0 ? (
                        availableMonths.map((month) => (
                          <SelectItem key={month} value={month}>
                            {formatMonthDisplay(month)}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value={currentMonth}>
                          {format(currentDate, 'MMMM yyyy')} (Current)
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">Add Customer</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}