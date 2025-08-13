export interface OfferDetails {
  id: number;
  offerNumber: string;
  totalPremium: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  insuranceType: string;
  coverages?: Array<{
    id: number;
    name: string;
    description: string;
    basePrice: number;
  }>;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

interface OfferDetailsModalProps {
  offer: OfferDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (offerId: number) => void;
  onReject: (offerId: number) => void;
  onRevise: (offerId: number) => void;
  isProcessing: boolean;
}

export default function OfferDetailsModal({
  offer,
  isOpen,
  onClose,
  onAccept,
  onReject,
  onRevise,
  isProcessing
}: OfferDetailsModalProps) {
  if (!isOpen || !offer) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
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
            fontSize: '1.875rem',
            fontWeight: 700,
            color: '#1e293b',
            margin: 0
          }}>
            📋 Offer Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
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

        {/* Offer Information */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Offer Number
              </div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>
                {offer.offerNumber}
              </div>
            </div>
            
            <div style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Total Premium
              </div>
              <div style={{ fontWeight: 600, color: '#059669', fontSize: '1.125rem' }}>
                {formatCurrency(offer.totalPremium)}
              </div>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Insurance Type
              </div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>
                {offer.insuranceType}
              </div>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Status
              </div>
              <div style={{
                fontWeight: 600,
                color: offer.status === 'PENDING' ? '#d97706' : 
                       offer.status === 'APPROVED' ? '#059669' : '#dc2626',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                backgroundColor: offer.status === 'PENDING' ? '#fef3c7' : 
                               offer.status === 'APPROVED' ? '#d1fae5' : '#fee2e2',
                display: 'inline-block'
              }}>
                {offer.status}
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Created At
              </div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>
                {formatDate(offer.createdAt)}
              </div>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Last Updated
              </div>
              <div style={{ fontWeight: 600, color: '#1e293b' }}>
                {formatDate(offer.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#1e293b',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            👤 Customer Information
          </h3>
          
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  Full Name
                </div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                  {offer.customer.firstName} {offer.customer.lastName}
                </div>
              </div>
              
              <div>
                <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  Email
                </div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                  {offer.customer.email}
                </div>
              </div>

              {offer.customer.phoneNumber && (
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    Phone
                  </div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {offer.customer.phoneNumber}
                  </div>
                </div>
              )}

              {offer.customer.address && (
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    Address
                  </div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {offer.customer.address}
                  </div>
                </div>
              )}

              {offer.customer.city && (
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    City
                  </div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {offer.customer.city}
                  </div>
                </div>
              )}

              {offer.customer.country && (
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    Country
                  </div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {offer.customer.country}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coverages */}
        {offer.coverages && offer.coverages.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🛡️ Selected Coverages
            </h3>
            
            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              {offer.coverages.map((coverage) => (
                <div key={coverage.id} style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>
                      {coverage.name}
                    </div>
                    <div style={{ fontWeight: 600, color: '#059669' }}>
                      {formatCurrency(coverage.basePrice)}
                    </div>
                  </div>
                  {coverage.description && (
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      {coverage.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {offer.note && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📝 Notes
            </h3>
            
            <div style={{
              padding: '1rem',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              color: '#1e293b'
            }}>
              {offer.note}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {offer.status === 'PENDING' && (
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            paddingTop: '1.5rem',
            borderTop: '2px solid #e5e7eb'
          }}>
            <button
              onClick={() => onRevise(offer.id)}
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
              ✏️ Revise Premium
            </button>

            <button
              onClick={() => onReject(offer.id)}
              disabled={isProcessing}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) e.currentTarget.style.backgroundColor = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) e.currentTarget.style.backgroundColor = '#dc2626';
              }}
            >
              ❌ Reject Offer
            </button>

            <button
              onClick={() => onAccept(offer.id)}
              disabled={isProcessing}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                opacity: isProcessing ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) e.currentTarget.style.backgroundColor = '#047857';
              }}
              onMouseLeave={(e) => {
                if (!isProcessing) e.currentTarget.style.backgroundColor = '#059669';
              }}
            >
              ✅ Accept Offer
            </button>
          </div>
        )}

        {offer.status === 'APPROVED' && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#d1fae5',
            borderRadius: '8px',
            border: '1px solid #a7f3d0',
            textAlign: 'center',
            marginTop: '1.5rem'
          }}>
            <div style={{ color: '#065f46', fontWeight: 600 }}>
              🎉 This offer has been approved and is ready for customer conversion to policy!
            </div>
          </div>
        )}

        {offer.status === 'REJECTED' && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            textAlign: 'center',
            marginTop: '1.5rem'
          }}>
            <div style={{ color: '#991b1b', fontWeight: 600 }}>
              ❌ This offer has been rejected.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
