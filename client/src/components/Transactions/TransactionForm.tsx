import React, { useState } from 'react';
import { Category, TransactionFormData } from '../../types';

interface TransactionFormProps {
  categories: Category[];
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: TransactionFormData;
  isEditing?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  categories,
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<TransactionFormData>(
    initialData || {
      amount: 0,
      description: '',
      category_id: 0,
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' || name === 'category_id' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!formData.category_id) {
      setError('Please select a category');
      return;
    }

    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="label">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              className="input-field"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Category</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="">Select a category</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input-field"
            rows={3}
            placeholder="Enter a description (optional)"
          />
        </div>

        <div>
          <label className="label">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;