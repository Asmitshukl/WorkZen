import React, { useState } from 'react';
import { generatePayrun } from '@api/payrollAPI';
import { useNotification } from '@hooks/useNotification';
import Select from '@components/common/Select';
import Button from '@components/common/Button';
import Card from '@components/common/Card';

const PayrunGenerator = ({ onSuccess }) => {
  const { showSuccess, showError } = useNotification();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('default', { month: 'long' })
  }));

  const years = Array.from({ length: 5 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { value: y, label: y.toString() };
  });

  const handleGenerate = async () => {
    try {
      setLoading(true);
      await generatePayrun({ month, year });
      showSuccess('Payrun generated successfully');
      onSuccess?.();
    } catch (error) {
      showError(error.message || 'Failed to generate payrun');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Generate Payrun">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Month"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            options={months}
          />
          <Select
            label="Year"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            options={years}
          />
        </div>
        <Button onClick={handleGenerate} loading={loading} className="w-full">
          Generate Payrun
        </Button>
      </div>
    </Card>
  );
};

export default PayrunGenerator;