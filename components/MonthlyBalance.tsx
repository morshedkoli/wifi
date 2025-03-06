'use client';

import { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type BalanceData = {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  customerCount: number;
  paidCustomers: number;
};

export default function MonthlyBalance() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  useEffect(() => {
    fetchMonths();
    fetchBalanceData();
  }, [selectedMonth]);

  const fetchMonths = async () => {
    try {
      const response = await fetch('/api/customers/months');
      const data = await response.json();
      setAvailableMonths(data);
      
      // If no month is selected and we have months available, select the first one
      if (data.length > 0 && (!selectedMonth || !data.includes(selectedMonth))) {
        setSelectedMonth(data[0]);
      }
    } catch (error) {
      console.error('Error fetching available months:', error);
    }
  };

  const fetchBalanceData = async () => {
    try {
      const response = await fetch(`/api/balance?month=${selectedMonth}`);
      const data = await response.json();
      setBalanceData(data);
    } catch (error) {
      console.error('Error fetching balance data:', error);
    }
  };

  const chartData = balanceData ? [
    {
      name: 'Amount',
      Total: balanceData.totalAmount,
      Paid: balanceData.paidAmount,
      Pending: balanceData.pendingAmount,
    }
  ] : [];

  const formatMonthDisplay = (monthStr: string) => {
    try {
      const date = parse(monthStr, 'yyyy-MM', new Date());
      return format(date, 'MMMM yyyy');
    } catch (error) {
      return monthStr; // Fallback to original string if parsing fails
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Monthly Balance Report</span>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((month) => (
                <SelectItem
                  key={month}
                  value={month}
                >
                  {formatMonthDisplay(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {balanceData && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{balanceData.totalAmount} TK</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{balanceData.paidAmount} TK</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{balanceData.customerCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-medium">Paid Customers</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-bold">{balanceData.paidCustomers}</div>
                </CardContent>
              </Card>
            </div>

            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Total" fill="#8884d8" />
                  <Bar dataKey="Paid" fill="#82ca9d" />
                  <Bar dataKey="Pending" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}