'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';


type Customer = {
  _id: string;
  name: string;
  package: string;
  month: string;
  price: number;
  days: number;
  phone: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
};

const editFormSchema = z.object({
  days: z.number().min(1, 'Days must be at least 1'),
  paymentStatus: z.enum(['PENDING', 'PAID']),
});

export default function CustomerList({ status }: { status: 'active' | 'completed' }) {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const editForm = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      days: 30,
      paymentStatus: 'PENDING',
    },
  });

  useEffect(() => {
    fetchCustomers();
    fetchAvailableMonths();
  }, [selectedMonth, status]);

  const fetchAvailableMonths = async () => {
    try {
      const response = await fetch('/api/customers/months');
      if (!response.ok) throw new Error('Failed to fetch months');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setMonths(data);
      } else {
        // If no months are available, use current month as fallback
        setMonths([format(new Date(), 'yyyy-MM')]);
      }
    } catch (error) {
      console.error('Error fetching available months:', error);
      // Use current month as fallback in case of error
      setMonths([format(new Date(), 'yyyy-MM')]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`/api/customers?month=${selectedMonth}&status=${status}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        setCustomers([]);
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch customers. Please try again.",
      });
    }
  };

  const updatePaymentStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });
      
      if (response.ok) {
        fetchCustomers();
        toast({
          title: "Success",
          description: "Payment status updated successfully!",
        });
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment status. Please try again.",
      });
    }
  };
  
  const openEditDialog = (customer: Customer) => {
    setSelectedCustomer(customer);
    editForm.reset({
      days: customer.days,
      paymentStatus: customer.paymentStatus as 'PENDING' | 'PAID',
    });
    setIsEditDialogOpen(true);
  };
  
  const handleEditSubmit = async (values: z.infer<typeof editFormSchema>) => {
    if (!selectedCustomer) return;
    
    try {
      const response = await fetch(`/api/customers/${selectedCustomer._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      
      if (response.ok) {
        fetchCustomers();
        setIsEditDialogOpen(false);
        toast({
          title: "Success",
          description: "Customer updated successfully!",
        });
      } else {
        throw new Error('Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update customer. Please try again.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{status === 'active' ? 'Active Customers' : 'Completed Payments'}</span>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.length > 0 ? (
                months.map((month) => {
                  const [year, monthNum] = month.split('-');
                  const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
                  return (
                    <SelectItem
                      key={month}
                      value={month}
                    >
                      {format(date, 'MMMM yyyy')}
                    </SelectItem>
                  );
                })
              ) : (
                // Fallback to current month if no months are available
                <SelectItem value={format(new Date(), 'yyyy-MM')}>
                  {format(new Date(), 'MMMM yyyy')}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer._id}>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.package}</TableCell>
                <TableCell>{customer.price} TK</TableCell>
                <TableCell>{customer.month}</TableCell>
                <TableCell>{customer.days}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${customer.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : customer.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                    {customer.paymentStatus}
                  </span>
                </TableCell>
                <TableCell>{format(new Date(customer.createdAt), 'dd MMM yyyy')}</TableCell>
                <TableCell>
                  {status === 'active' && (
                    <Button
                      variant="outline"
                      onClick={() => openEditDialog(customer)}
                    >
                      Edit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value))} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}