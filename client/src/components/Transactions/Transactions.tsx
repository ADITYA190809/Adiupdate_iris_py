import React, { useState, useEffect } from 'react';
import { transactionsAPI, categoriesAPI } from '../../services/api';
import { Transaction, Category, TransactionFormData } from '../../types';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [transactionsResponse, categoriesResponse] = await Promise.all([
        transactionsAPI.getAll(),
        categoriesAPI.getAll()
      ]);
      
      setTransactions(transactionsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const params: any = {};
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await transactionsAPI.getAll(params);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleAddTransaction = async (formData: TransactionFormData) => {
    try {
      await transactionsAPI.create(formData);
      fetchTransactions();
      setShowForm(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const handleEditTransaction = async (formData: TransactionFormData) => {
    if (!editingTransaction) return;
    
    try {
      await transactionsAPI.update(editingTransaction.id, formData);
      fetchTransactions();
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await transactionsAPI.delete(id);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          Add Transaction
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <span className="text-success-600 font-bold">↗</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Income</p>
              <p className="text-xl font-semibold text-success-600">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
                <span className="text-danger-600 font-bold">↘</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <p className="text-xl font-semibold text-danger-600">
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                (totalIncome - totalExpense) >= 0 ? 'bg-success-100' : 'bg-danger-100'
              }`}>
                <span className={`font-bold ${
                  (totalIncome - totalExpense) >= 0 ? 'text-success-600' : 'text-danger-600'
                }`}>
                  =
                </span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Net Balance</p>
              <p className={`text-xl font-semibold ${
                (totalIncome - totalExpense) >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatCurrency(totalIncome - totalExpense)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="input-field"
            >
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="label">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="input-field"
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => setFilters({ type: '', category: '', startDate: '', endDate: '' })}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Transactions list */}
      <TransactionList
        transactions={transactions}
        categories={categories}
        onEdit={setEditingTransaction}
        onDelete={handleDeleteTransaction}
      />

      {/* Transaction form modal */}
      {(showForm || editingTransaction) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <TransactionForm
              categories={categories}
              onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
              onCancel={() => {
                setShowForm(false);
                setEditingTransaction(null);
              }}
              initialData={editingTransaction ? {
                amount: editingTransaction.amount,
                description: editingTransaction.description || '',
                category_id: editingTransaction.category_id,
                type: editingTransaction.type,
                date: editingTransaction.date,
              } : undefined}
              isEditing={!!editingTransaction}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;