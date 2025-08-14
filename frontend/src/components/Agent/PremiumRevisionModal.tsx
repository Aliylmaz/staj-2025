import React, { useState } from 'react';

interface PremiumRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newPremium: number, note: string) => void;
  currentPremium: number;
  isProcessing: boolean;
}

export default function PremiumRevisionModal({
  isOpen,
  onClose,
  onSubmit,
  currentPremium,
  isProcessing
}: PremiumRevisionModalProps) {
  const [newPremium, setNewPremium] = useState(currentPremium.toString());
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ premium?: string; note?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { premium?: string; note?: string } = {};
    
    if (!newPremium || isNaN(Number(newPremium)) || Number(newPremium) <= 0) {
      newErrors.premium = 'Please enter a valid premium amount';
    }
    
    if (!note.trim()) {
      newErrors.note = 'Please provide a reason for the premium revision';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(Number(newPremium), note.trim());
  };

  const handleClose = () => {
    setNewPremium(currentPremium.toString());
    setNote('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '2px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#1e293b',
            margin: 0
          }}>
            ✏️ Revise Premium
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: '#64748b',
              padding: '0.5rem',
              borderRadius: '50%',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ✕
          </button>
        </div>

        {/* Current Premium Display */}
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.5rem'
        }}>
          <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Current Premium
          </div>
          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '1.125rem' }}>
            {formatCurrency(currentPremium)}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '0.5rem'
            }}>
              New Premium Amount (TRY)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newPremium}
              onChange={(e) => {
                setNewPremium(e.target.value);
                if (errors.premium) setErrors(prev => ({ ...prev, premium: undefined }));
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errors.premium ? '2px solid #dc2626' : '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.2s',
                WebkitAppearance: 'none',
                MozAppearance: 'textfield'
              }}
              placeholder="Enter new premium amount"
            />
            {errors.premium && (
              <div style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {errors.premium}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '0.5rem'
            }}>
              Revision Reason *
            </label>
            <textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (errors.note) setErrors(prev => ({ ...prev, note: undefined }));
              }}
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errors.note ? '2px solid #dc2626' : '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical',
                transition: 'border-color 0.2s'
              }}
              placeholder="Please explain why you are revising the premium..."
            />
            {errors.note && (
              <div style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {errors.note}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) e.currentTarget.style.backgroundColor = '#4b5563';
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) e.currentTarget.style.backgroundColor = '#6b7280';
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) e.currentTarget.style.backgroundColor = '#d97706';
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) e.currentTarget.style.backgroundColor = '#f59e0b';
              }}
            >
              {isProcessing ? 'Processing...' : 'Submit Revision'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

