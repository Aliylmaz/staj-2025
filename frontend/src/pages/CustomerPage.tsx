import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../contexts/CustomerContext';
import html2pdf from 'html2pdf.js';

import { 
  getMyOffers, 
  getMyPolicies, 
  getMyClaims, 
  getMyPayments, 
  getMyDocuments, 
  getCoveragesByInsuranceType, 
  getAllAgents, 
  requestOffer, 
  createClaim, 
  makePayment, 
  uploadDocument,
  updateIndividualCustomer,
  updateCorporateCustomer,
  getOfferById,
  getCoveragesByOfferId,
  acceptOfferAndCreatePolicy
} from '../services/customerApi';
import type { AgentDto, CoverageDto } from '../services/customerApi';

export default function CustomerPage() {
  const [currentModule, setCurrentModule] = useState<'dashboard' | 'offers' | 'policies' | 'claims' | 'payments' | 'documents' | 'profile'>('dashboard');
  const navigate = useNavigate();
  
  console.log('🔍 CustomerPage - About to call useCustomer hook');
  const { customer, customerId, loading: contextLoading, error: contextError, isReady, refreshCustomer } = useCustomer();
  console.log('🔍 CustomerPage - useCustomer hook result:', { customer, customerId, contextLoading, contextError, isReady });

  // Data states
  const [offers, setOffers] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [agents, setAgents] = useState<AgentDto[]>([]);
  const [coverages, setCoverages] = useState<CoverageDto[]>([]);
  const [selectedCoverages, setSelectedCoverages] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [coveragesLoading, setCoveragesLoading] = useState(false);

  // Offer action loading states

  const [offerActionError, setOfferActionError] = useState<string | null>(null);
  const [offerActionSuccess, setOfferActionSuccess] = useState<string | null>(null);
  const [viewingPolicy, setViewingPolicy] = useState(false);

  // Form states
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showOfferDetails, setShowOfferDetails] = useState(false);
  
  // Status filter state
  const [selectedStatus, setSelectedStatus] = useState<string>(() => {
    const saved = localStorage.getItem('customerOffersStatusFilter');
    return saved || 'ALL';
  });
  
  // PDF export ref
  const offerDetailsRef = useRef<HTMLDivElement>(null);
  
  // PDF export function for offers
  const handleExportToPDF = async () => {
    if (!selectedOffer) return;
    
    try {
      // Show loading state
      const exportButton = document.querySelector('[data-pdf-export]') as HTMLButtonElement;
      if (exportButton) {
        exportButton.disabled = true;
        exportButton.innerHTML = '⏳ Generating PDF...';
      }
      
      // Create a temporary container for the offer PDF
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        padding: 2rem;
        background: white;
        font-family: Arial, sans-serif;
        color: #1e293b;
        max-width: 800px;
        margin: 0 auto;
      `;
      
      // Add company header
      const companyHeader = document.createElement('div');
      companyHeader.innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem; border-bottom: 3px solid #2563eb; padding-bottom: 1rem;">
          <h1 style="font-size: 2.5rem; font-weight: 700; color: #1e40af; margin: 0;">Insurance Company</h1>
          <p style="font-size: 1.25rem; color: #64748b; margin: 0.5rem 0 0 0;">Offer Details Report</p>
          <p style="font-size: 1rem; color: #94a3b8; margin: 0.5rem 0 0 0;">Generated on ${new Date().toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      `;
      tempContainer.appendChild(companyHeader);
      
      // Add offer summary section
      const offerSummary = document.createElement('div');
      offerSummary.style.cssText = `
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border: 2px solid #cbd5e1;
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 2rem;
      `;
      
      offerSummary.innerHTML = `
        <h2 style="font-size: 1.75rem; font-weight: 700; color: #1e293b; margin: 0 0 1.5rem 0; text-align: center;">
          📋 Offer Summary
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
          <div style="text-align: center;">
            <div style="font-size: 0.875rem; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem;">
              Offer Number
            </div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #1e293b; font-family: monospace;">
              ${selectedOffer.offerNumber || 'N/A'}
            </div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 0.875rem; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem;">
              Status
            </div>
            <div style="
              font-size: 1.25rem; font-weight: 700; 
              color: ${selectedOffer.status === 'PENDING' ? '#f59e0b' : 
                       selectedOffer.status === 'APPROVED' ? '#059669' : 
                       selectedOffer.status === 'REJECTED' ? '#dc2626' : '#6b7280'};
              background: ${selectedOffer.status === 'PENDING' ? '#fef3c7' : 
                          selectedOffer.status === 'APPROVED' ? '#d1fae5' : 
                          selectedOffer.status === 'REJECTED' ? '#fee2e2' : '#f1f5f9'};
              padding: 0.5rem 1rem;
              border-radius: 8px;
              display: inline-block;
              border: 2px solid ${selectedOffer.status === 'PENDING' ? '#f59e0b' : 
                                selectedOffer.status === 'APPROVED' ? '#059669' : 
                                selectedOffer.status === 'REJECTED' ? '#dc2626' : '#6b7280'};
            ">
              ${selectedOffer.status || 'N/A'}
            </div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 0.875rem; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem;">
              Total Premium
            </div>
            <div style="font-size: 2rem; font-weight: 800; color: #059669; background: #f0fdf4; padding: 0.75rem; border-radius: 8px; border: 3px solid #bbf7d0;">
              €${selectedOffer.totalPremium || 0}
            </div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 0.875rem; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem;">
              Insurance Type
            </div>
            <div style="font-size: 1.25rem; font-weight: 700; color: #1e293b; background: #f1f5f9; padding: 0.75rem; border-radius: 8px; border: 2px solid #e2e8f0;">
              ${selectedOffer.insuranceType ? selectedOffer.insuranceType.charAt(0).toUpperCase() + selectedOffer.insuranceType.slice(1).toLowerCase() : 'N/A'}
            </div>
          </div>
        </div>
      `;
      tempContainer.appendChild(offerSummary);
      
      // Add offer details section
      const offerDetails = document.createElement('div');
      offerDetails.style.cssText = `
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 2rem;
      `;
      
      offerDetails.innerHTML = `
        <h3 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0 0 1.5rem 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">
          📋 Offer Information
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
          <div>
            <div style="font-size: 0.875rem; font-weight: 600; color: #64748b; margin-bottom: 0.5rem;">Offer Number</div>
            <div style="font-size: 1.125rem; font-weight: 700; color: #1e293b; background: #f8fafc; padding: 0.75rem; border-radius: 8px; border: 1px solid #e5e7eb; font-family: monospace;">
              ${selectedOffer.offerNumber || 'N/A'}
            </div>
          </div>
          <div>
            <div style="font-size: 0.875rem; font-weight: 600; color: #64748b; margin-bottom: 0.5rem;">Status</div>
            <div style="
              font-size: 1.125rem; font-weight: 700; text-align: center;
              background: ${selectedOffer.status === 'PENDING' ? '#fef3c7' : 
                          selectedOffer.status === 'APPROVED' ? '#dcfce7' : 
                          selectedOffer.status === 'REJECTED' ? '#fee2e2' : '#e0e7ff'};
              color: ${selectedOffer.status === 'PENDING' ? '#92400e' : 
                      selectedOffer.status === 'APPROVED' ? '#166534' : 
                      selectedOffer.status === 'REJECTED' ? '#991b1b' : '#3730a3'};
              padding: 0.75rem; border-radius: 8px; border: 1px solid #e5e7eb;
            ">
              ${selectedOffer.status || 'N/A'}
            </div>
          </div>
          <div>
            <div style="font-size: 0.875rem; font-weight: 600; color: #64748b; margin-bottom: 0.5rem;">Insurance Type</div>
            <div style="font-size: 1.125rem; font-weight: 700; color: #1e293b; background: #f8fafc; padding: 0.75rem; border-radius: 8px; border: 1px solid #e5e7eb;">
              ${selectedOffer.insuranceType ? selectedOffer.insuranceType.charAt(0).toUpperCase() + selectedOffer.insuranceType.slice(1).toLowerCase() : 'N/A'}
            </div>
          </div>
          <div>
            <div style="font-size: 0.875rem; font-weight: 600; color: #64748b; margin-bottom: 0.5rem;">Total Premium</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #059669; background: #f0fdf4; padding: 0.75rem; border-radius: 8px; border: 2px solid #bbf7d0;">
              €${selectedOffer.totalPremium || 0}
            </div>
          </div>
        </div>
      `;
      tempContainer.appendChild(offerDetails);
      
      // Add customer information if available
      if (selectedOffer.customer && selectedOffer.customer.user) {
        const customerInfo = document.createElement('div');
        customerInfo.style.cssText = `
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        `;
        
        customerInfo.innerHTML = `
          <h3 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0 0 1.5rem 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">
            👤 Customer Information
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
            <div>
              <div style="font-size: 0.875rem; font-weight: 600; color: #64748b; margin-bottom: 0.5rem;">Customer Name</div>
              <div style="font-size: 1.125rem; font-weight: 700; color: #1e293b; background: #f8fafc; padding: 0.75rem; border-radius: 8px; border: 1px solid #e5e7eb;">
                ${selectedOffer.customer.user.firstName || ''} ${selectedOffer.customer.user.lastName || ''}
              </div>
            </div>
            <div>
              <div style="font-size: 0.875rem; font-weight: 600; color: #64748b; margin-bottom: 0.5rem;">Customer Type</div>
              <div style="font-size: 1.125rem; font-weight: 700; color: #1e293b; background: #f8fafc; padding: 0.75rem; border-radius: 8px; border: 1px solid #e5e7eb;">
                ${selectedOffer.customer.customerType ? selectedOffer.customer.customerType.charAt(0).toUpperCase() + selectedOffer.customer.customerType.slice(1).toLowerCase() : 'N/A'}
              </div>
            </div>
            <div>
              <div style="font-size: 0.875rem; font-weight: 600; color: #64748b; margin-bottom: 0.5rem;">Email</div>
              <div style="font-size: 1.125rem; font-weight: 700; color: #1e293b; background: #f8fafc; padding: 0.75rem; border-radius: 8px; border: 1px solid #e5e7eb;">
                ${selectedOffer.customer.user.email || 'N/A'}
              </div>
            </div>
            <div>
              <div style="font-size: 0.875rem; font-weight: 600; color: #64748b; margin-bottom: 0.5rem;">Address</div>
              <div style="font-size: 1.125rem; font-weight: 700; color: #1e293b; background: #f8fafc; padding: 0.75rem; border-radius: 8px; border: 1px solid #e5e7eb;">
                ${selectedOffer.customer.address || 'N/A'}
              </div>
            </div>
          </div>
        `;
        tempContainer.appendChild(customerInfo);
      }
      
      // Add agent information if available
      if (selectedOffer.agent && selectedOffer.agent.user) {
        const agentInfo = document.createElement('div');
        agentInfo.style.cssText = `
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        `;
        
        agentInfo.innerHTML = `
          <h3 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0 0 1.5rem 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">
            👨‍💼 Assigned Agent
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
            <div>
              <div style="font-size: 0.875rem; font-weight: 600; color: #64748b; margin-bottom: 0.5rem;">Agent Name</div>
              <div style="font-size: 1.125rem; font-weight: 700; color: #1e293b; background: #f8fafc; padding: 0.75rem; border-radius: 8px; border: 1px solid #e5e7eb;">
                ${selectedOffer.agent.user.firstName || ''} ${selectedOffer.agent.user.lastName || ''}
              </div>
            </div>
            <div>
              <div style="font-size: 0.875rem; font-weight: 600; color: #64748b; margin-bottom: 0.5rem;">Agent Email</div>
              <div style="font-size: 1.125rem; font-weight: 700; color: #1e293b; background: #f8fafc; padding: 0.75rem; border-radius: 8px; border: 1px solid #e5e7eb;">
                ${selectedOffer.agent.user.email || 'N/A'}
              </div>
            </div>
          </div>
        `;
        tempContainer.appendChild(agentInfo);
      }
      
      // Add coverages section if available
      if (selectedOffer.coverages && selectedOffer.coverages.length > 0) {
        const coveragesSection = document.createElement('div');
        coveragesSection.style.cssText = `
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        `;
        
        coveragesSection.innerHTML = `
          <h3 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0 0 1.5rem 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">
            🛡️ Selected Coverages (${selectedOffer.coverages.length})
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            ${selectedOffer.coverages.map((coverage: any) => `
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                  <h4 style="font-size: 1.125rem; font-weight: 700; color: #1e293b; margin: 0;">${coverage.name || 'N/A'}</h4>
                  <span style="font-size: 1rem; font-weight: 700; color: #059669; background: #f0fdf4; padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid #bbf7d0;">
                    €${coverage.basePrice || 0}
                  </span>
                </div>
                <div style="margin-bottom: 0.75rem;">
                  <span style="font-size: 0.75rem; font-weight: 600; color: #6b7280; background: #e5e7eb; padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace;">
                    ${coverage.code || 'N/A'}
                  </span>
                </div>
                <p style="font-size: 0.875rem; color: #64748b; margin: 0; line-height: 1.5;">
                  ${coverage.description || 'No description available'}
                </p>
              </div>
            `).join('')}
          </div>
        `;
        tempContainer.appendChild(coveragesSection);
      }
      
      // Add notes section if available
      if (selectedOffer.note) {
        const notesSection = document.createElement('div');
        notesSection.style.cssText = `
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        `;
        
        notesSection.innerHTML = `
          <h3 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0 0 1.5rem 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">
            📝 Additional Notes
          </h3>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem;">
            <p style="font-size: 1rem; color: #374151; margin: 0; line-height: 1.6;">
              ${selectedOffer.note}
            </p>
          </div>
        `;
        tempContainer.appendChild(notesSection);
      }
      
      // Add timeline section
      const timelineSection = document.createElement('div');
      timelineSection.style.cssText = `
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 2rem;
      `;
      
      timelineSection.innerHTML = `
        <h3 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0 0 1.5rem 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">
          ⏰ Offer Timeline
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
          <div>
            <div style="font-size: 0.875rem; font-weight: 600; color: #64748b; margin-bottom: 0.5rem;">Created Date</div>
            <div style="font-size: 1rem; font-weight: 600; color: #1e293b; background: #f8fafc; padding: 0.75rem; border-radius: 8px; border: 1px solid #e5e7eb;">
              ${selectedOffer.createdAt ? new Date(selectedOffer.createdAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'N/A'}
            </div>
          </div>
          ${selectedOffer.updatedAt && selectedOffer.updatedAt !== selectedOffer.createdAt ? `
            <div>
              <div style="font-size: 0.875rem; font-weight: 600; color: #64748b; margin-bottom: 0.5rem;">Last Updated</div>
              <div style="font-size: 1rem; font-weight: 600; color: #1e293b; background: #f8fafc; padding: 0.75rem; border-radius: 8px; border: 1px solid #e5e7eb;">
                ${new Date(selectedOffer.updatedAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ` : ''}
          ${selectedOffer.acceptedAt ? `
            <div>
              <div style="font-size: 0.875rem; font-weight: 600; color: #64748b; margin-bottom: 0.5rem;">Accepted Date</div>
              <div style="font-size: 1rem; font-weight: 600; color: #059669; background: #f0fdf4; padding: 0.75rem; border-radius: 8px; border: 1px solid #bbf7d0;">
                ${new Date(selectedOffer.acceptedAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ` : ''}
          ${selectedOffer.convertedAt ? `
            <div>
              <div style="font-size: 0.875rem; font-weight: 600; color: #64748b; margin-bottom: 0.5rem;">Converted to Policy</div>
              <div style="font-size: 1rem; font-weight: 600; color: #059669; background: #f0fdf4; padding: 0.75rem; border-radius: 8px; border: 1px solid #bbf7d0;">
                ${new Date(selectedOffer.convertedAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ` : ''}
        </div>
      `;
      tempContainer.appendChild(timelineSection);
      
      // Add footer
      const footer = document.createElement('div');
      footer.style.cssText = `
        text-align: center;
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 2px solid #e5e7eb;
        color: #64748b;
        font-size: 0.875rem;
      `;
      footer.innerHTML = `
        <p style="margin: 0;">This document was generated automatically by the Insurance Management System</p>
        <p style="margin: 0.5rem 0 0 0;">Offer ID: ${selectedOffer.id || 'N/A'}</p>
      `;
      tempContainer.appendChild(footer);
      
      // Generate PDF with better options
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `offer-${selectedOffer.offerNumber || 'details'}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };
      
      await html2pdf().set(opt).from(tempContainer).save();
      
      // Show success message
      alert('PDF exported successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      // Reset button state
      const exportButton = document.querySelector('[data-pdf-export]') as HTMLButtonElement;
      if (exportButton) {
        exportButton.disabled = false;
        exportButton.innerHTML = '📄 Export to PDF';
      }
    }
  };
  
  // PDF export function for all policies
  const handleExportPoliciesToPDF = async () => {
    try {
      // Create a temporary container for policies
      const tempContainer = document.createElement('div');
      tempContainer.style.padding = '2rem';
      tempContainer.style.background = 'white';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      
      // Add header
      const header = document.createElement('div');
      header.innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 1rem;">
          <h1 style="font-size: 2rem; font-weight: 700; color: #1e293b; margin: 0;">My Insurance Policies</h1>
          <p style="font-size: 1rem; color: #64748b; margin: 0.5rem 0 0 0;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      `;
      tempContainer.appendChild(header);
      
      // Add policies
      policies.forEach((policy) => {
        const policyDiv = document.createElement('div');
        policyDiv.style.cssText = `
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          page-break-inside: avoid;
        `;
        
        policyDiv.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
            <div>
              <h3 style="font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0 0 0.5rem 0;">
                Policy #${policy.policyNumber}
              </h3>
              <p style="font-size: 0.875rem; color: #64748b; margin: 0;">
                Insurance Type: ${policy.insuranceType || 'N/A'}
              </p>
            </div>
            <div style="text-align: right;">
              <div style="
                background: ${policy.status === 'ACTIVE' ? '#d1fae5' : '#fee2e2'};
                color: ${policy.status === 'ACTIVE' ? '#059669' : '#dc2626'};
                padding: 0.25rem 0.75rem;
                border-radius: 6px;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
              ">
                ${policy.status}
              </div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
            <div>
              <div style="font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 0.25rem;">
                Premium
              </div>
              <div style="font-size: 1.125rem; font-weight: 700; color: #059669;">
                €${policy.premium}
              </div>
            </div>
            <div>
              <div style="font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: 600; color: #1e293b;">
                ${policy.startDate ? new Date(policy.startDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div>
              <div style="font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 0.25rem;">
                End Date
              </div>
              <div style="font-size: 1rem; font-weight: 600; color: #1e293b;">
                ${policy.endDate ? new Date(policy.endDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div>
              <div style="font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 0.25rem;">
                Payment Status
              </div>
              <div style="
                background: ${policy.payment && policy.payment.status === 'SUCCESS' ? '#d1fae5' : '#fef3c7'};
                color: ${policy.payment && policy.payment.status === 'SUCCESS' ? '#059669' : '#f59e0b'};
                padding: 0.25rem 0.75rem;
                border-radius: 6px;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                display: inline-block;
              ">
                ${policy.payment ? policy.payment.status : 'PENDING'}
              </div>
            </div>
          </div>
          
          ${policy.description ? `
            <div style="margin-top: 1rem;">
              <div style="font-size: 0.875rem; font-weight: 600; color: #1e293b; margin-bottom: 0.5rem;">
                Description:
              </div>
              <p style="font-size: 0.875rem; color: #64748b; margin: 0; line-height: 1.5;">
                ${policy.description}
              </p>
            </div>
          ` : ''}
        `;
        
        tempContainer.appendChild(policyDiv);
      });
      
      // Add summary
      const summary = document.createElement('div');
      summary.style.cssText = `
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        border-radius: 12px;
        padding: 1.5rem;
        margin-top: 2rem;
        text-align: center;
      `;
      
      const totalPremium = policies
        .filter(p => p.payment && p.payment.status === 'SUCCESS')
        .reduce((sum, p) => sum + p.premium, 0);
      
      summary.innerHTML = `
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #059669; margin: 0 0 1rem 0;">
          Summary
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
          <div>
            <div style="font-size: 0.875rem; font-weight: 600; color: #059669; margin-bottom: 0.25rem;">
              Total Policies
            </div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #059669;">
              ${policies.length}
            </div>
          </div>
          <div>
            <div style="font-size: 0.875rem; font-weight: 600; color: #059669; margin-bottom: 0.25rem;">
              Active Policies
            </div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #059669;">
              ${policies.filter(p => p.status === 'ACTIVE').length}
            </div>
          </div>
          <div>
            <div style="font-size: 0.875rem; font-weight: 600; color: #059669; margin-bottom: 0.25rem;">
              Total Premium
            </div>
            <div style="font-size: 1.5rem; font-weight: 700; color: #059669;">
              €${totalPremium}
            </div>
          </div>
        </div>
      `;
      
      tempContainer.appendChild(summary);
      
      // Generate PDF
      const opt = {
        margin: 1,
        filename: `my-policies-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(tempContainer).save();
      
      // Show success message
      alert('Policies PDF exported successfully!');
      
    } catch (error) {
      console.error('Error generating policies PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Form data
  const [insuranceType, setInsuranceType] = useState<'VEHICLE' | 'HEALTH' | 'HOME'>('VEHICLE');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [note, setNote] = useState('');
  
  // Dynamic form data based on insurance type
  const [vehicleData, setVehicleData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    plateNumber: '',
    vin: '',
    engineNumber: '',
    fuelType: 'PETROL' as any,
    gearType: 'MANUAL' as any,
    usageType: 'PERSONAL' as any,
    kilometers: 0,
    registrationDate: new Date().toISOString().split('T')[0]
  });
  
  const [healthData, setHealthData] = useState({
    dateOfBirth: '',
    gender: '',
    medicalHistory: '',
    height: 0,
    weight: 0,
    smoker: false,
    chronicDiseases: '',
    currentMedications: '',
    allergies: '',
    familyMedicalHistory: '',
    bloodType: '',
    CustomerId: ''
  });
  
  const [homeData, setHomeData] = useState({
    address: '',
    buildingAge: 0,
    squareMeters: 0,
    earthquakeResistance: false,
    floorNumber: 0,
    totalFloors: 0,
    customerId: ''
  });
  const [claimFormData, setClaimFormData] = useState({ description: '', amount: 0 });
  const [paymentFormData, setPaymentFormData] = useState({ 
    amount: 0,
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [documentFormData, setDocumentFormData] = useState({ file: null as File | null });

  // Profile update form state
  const [showProfileUpdate, setShowProfileUpdate] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    country: '',
    postalCode: ''
  });

  // Debug localStorage values on mount
  useEffect(() => {
    console.log('🔍 CustomerPage - localStorage debug:');
    console.log('🔍 Token:', localStorage.getItem('token'));
    console.log('🔍 UserRole:', localStorage.getItem('userRole'));
    console.log('🔍 CustomerId:', localStorage.getItem('customerId'));
  }, []);

  // Customer ID guard for data fetching
  useEffect(() => {
    if (isReady && customerId) {
      console.log('✅ CustomerPage - Context is ready and customerId exists, fetching data:', customerId);
      fetchAllData();
    } else {
      console.log('⏳ CustomerPage - Context not ready or customerId missing:', { isReady, customerId });
    }
  }, [isReady, customerId]);

  // Fetch coverages when insurance type changes
  useEffect(() => {
    if (showOfferForm && insuranceType && isReady) {
      fetchCoveragesByInsuranceType();
    }
  }, [insuranceType, showOfferForm, isReady]);

  const fetchCoveragesByInsuranceType = async () => {
    try {
      console.log('🔍 fetchCoveragesByInsuranceType called with insuranceType:', insuranceType);
      setCoveragesLoading(true);
      const coveragesData = await getCoveragesByInsuranceType(insuranceType);
      console.log('🔍 Fetched coverages data:', coveragesData);
      setCoverages(coveragesData);
      setSelectedCoverages([]); // Reset selected coverages when insurance type changes
      console.log('🔍 Reset selectedCoverages to empty array');
    } catch (error) {
      console.error('Error fetching coverages:', error);
      setCoverages([]);
    } finally {
      setCoveragesLoading(false);
    }
  };

  const handleCoverageToggle = (coverageId: number) => {
    console.log('🔍 handleCoverageToggle called with coverageId:', coverageId);
    setSelectedCoverages(prev => {
      const isCurrentlySelected = prev.includes(coverageId);
      console.log('🔍 Coverage currently selected:', isCurrentlySelected);
      
      if (isCurrentlySelected) {
        const newSelection = prev.filter(id => id !== coverageId);
        console.log('🔍 Removing coverage, new selection:', newSelection);
        return newSelection;
      } else {
        const newSelection = [...prev, coverageId];
        console.log('🔍 Adding coverage, new selection:', newSelection);
        return newSelection;
      }
    });
  };

  const fetchAllData = async () => {
    if (!isReady || !customerId) {
      console.log('⏳ CustomerPage - Context not ready or customerId missing, skipping data fetch');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 CustomerPage - Fetching all data with customerId:', customerId);
      
      // Check token before making API calls
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ CustomerPage - No token found, cannot fetch data');
        return;
      }
      
      const [offersData, policiesData, claimsData, paymentsData, documentsData, agentsData] = await Promise.all([
        getMyOffers(),
        getMyPolicies(),
        getMyClaims(),
        getMyPayments(),
        getMyDocuments(),
        getAllAgents()
      ]);
      setOffers(offersData);
      setPolicies(policiesData);
      console.log('🔍 CustomerPage - Policies data:', policiesData);
      setClaims(claimsData);
      setPayments(paymentsData);
      setDocuments(documentsData);
      setAgents(agentsData);
      console.log('✅ CustomerPage - All data fetched successfully');
    } catch (error: any) {
      console.error('❌ CustomerPage - Error fetching data:', error);
      
      // Handle 401 error specifically
      if (error.response?.status === 401) {
        console.log('❌ CustomerPage - 401 error, token might be expired');
        // Don't redirect here, let axios interceptor handle it
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async () => {
    if (!isReady) {
      console.log('⏳ CustomerPage - Context not ready, cannot create offer');
      return;
    }

    try {
      // Debug token status
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      const currentCustomerId = localStorage.getItem('customerId');
      
      console.log('🔍 handleCreateOffer - Token exists:', !!token);
      console.log('🔍 handleCreateOffer - User role:', userRole);
      console.log('🔍 handleCreateOffer - Customer ID:', currentCustomerId);
      console.log('🔍 handleCreateOffer - Token value:', token);
      
      const requestData: any = {
        insuranceType,
        note,
        coverageIds: selectedCoverages
      };
      
      // Only include agentId if it's not empty
      if (selectedAgentId && selectedAgentId.trim() !== '') {
        requestData.agentId = selectedAgentId;
      }
      
      // Add specific data based on insurance type
      switch (insuranceType) {
        case 'VEHICLE':
          requestData.vehicleRequest = vehicleData;
          break;
        case 'HEALTH':
          requestData.healthDetailRequest = healthData;
          break;
        case 'HOME':
          requestData.homeDetailRequest = homeData;
          break;
      }
      
      const response = await requestOffer(requestData);
      console.log('✅ Offer created successfully:', response);
      
      // Show success message
      alert(`✅ Offer created successfully!\n\nOffer Number: ${response.offerNumber}\nStatus: PENDING\n\nYour offer is now waiting for agent approval. You will be notified once an agent reviews your request.`);
      
      setShowOfferForm(false);
      setInsuranceType('VEHICLE');
      setSelectedAgentId('');
      setNote('');
      setSelectedCoverages([]);
      // Reset form data
      setVehicleData({
        make: '', model: '', year: new Date().getFullYear(), plateNumber: '', vin: '', engineNumber: '',
        fuelType: 'PETROL', gearType: 'MANUAL', usageType: 'PERSONAL', kilometers: 0,
        registrationDate: new Date().toISOString().split('T')[0]
      });
      setHealthData({
        dateOfBirth: '', gender: '', medicalHistory: '', height: 0, weight: 0, smoker: false,
        chronicDiseases: '', currentMedications: '', allergies: '', familyMedicalHistory: '', bloodType: '', CustomerId: ''
      });
      setHomeData({
        address: '', buildingAge: 0, squareMeters: 0, earthquakeResistance: false, floorNumber: 0, totalFloors: 0, customerId: ''
      });
      // Refresh customer data and context
      await refreshCustomer();
      fetchAllData();
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleOfferClick = async (offer: any) => {
    try {
      console.log('🔍 handleOfferClick - offer data:', offer);
      
      // Fetch detailed offer information from API
      const detailedOffer = await getOfferById(offer.id);
      console.log('🔍 handleOfferClick - detailed offer from API:', detailedOffer);
      
      // Fetch coverages for this offer separately
      const offerCoverages = await getCoveragesByOfferId(offer.id);
      console.log('🔍 handleOfferClick - offer coverages:', offerCoverages);
      
      // Merge coverages with the detailed offer
      const offerWithCoverages = {
        ...detailedOffer,
        coverages: offerCoverages
      };
      
      setSelectedOffer(offerWithCoverages);
      setShowOfferDetails(true);
    } catch (error) {
      console.error('Error fetching offer details:', error);
      alert('Error fetching offer details. Please try again.');
    }
  };





  const handleViewPolicy = async (policyId: number) => {
    try {
      setViewingPolicy(true);
      console.log('📄 handleViewPolicy - navigating to policy:', policyId);
      
      // Navigate to policies module to show the policy
      setCurrentModule('policies');
      
      // Clear any success/error messages
      setOfferActionSuccess(null);
      setOfferActionError(null);
      
    } catch (error) {
      console.error('Error viewing policy:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error viewing policy. Please try again.';
      setOfferActionError(errorMessage);
      setTimeout(() => setOfferActionError(null), 5000); // Clear error after 5 seconds
    } finally {
      setViewingPolicy(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      // Validate required fields
      if (!profileFormData.firstName || !profileFormData.lastName || !profileFormData.email) {
        alert('Please fill in all required fields (First Name, Last Name, Email)');
        return;
      }

      if (!customer?.id) {
        alert('Customer ID not found. Please try again.');
        return;
      }

      // Prepare update request
      const updateRequest = {
        firstName: profileFormData.firstName,
        lastName: profileFormData.lastName,
        email: profileFormData.email,
        address: profileFormData.address,
        city: profileFormData.city,
        country: profileFormData.country,
        postalCode: profileFormData.postalCode
      };

      // Update customer information
      if (customer.customerType === 'CORPORATE') {
        await updateCorporateCustomer(customer.id, updateRequest);
      } else {
        await updateIndividualCustomer(customer.id, updateRequest);
      }

      alert('Profile updated successfully!');
      setShowProfileUpdate(false);
      
      // Reset form data
      setProfileFormData({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        country: '',
        postalCode: ''
      });
      
      // Refresh customer data and context
      await refreshCustomer();
      fetchAllData();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const openProfileUpdate = () => {
    if (customer) {
      setProfileFormData({
        firstName: customer.user?.firstName || '',
        lastName: customer.user?.lastName || '',
        email: customer.user?.email || '',
        address: customer.address || '',
        city: customer.city || '',
        country: customer.country || '',
        postalCode: customer.postalCode || ''
      });
    }
    setShowProfileUpdate(true);
  };

  const handleCreateClaim = async () => {
    if (!isReady || !selectedPolicyId) {
      console.log('⏳ CustomerPage - Context not ready or no policy selected');
      return;
    }

    try {
      await createClaim({
        policyId: selectedPolicyId,
        description: claimFormData.description,
        amount: claimFormData.amount,
        claimDate: new Date().toISOString()
      });
      setShowClaimForm(false);
      setClaimFormData({ description: '', amount: 0 });
      setSelectedPolicyId(null);
      fetchAllData();
    } catch (error) {
      console.error('Error creating claim:', error);
    }
  };

  const handleMakePayment = async () => {
    if (!isReady || !selectedPolicyId) {
      console.log('⏳ CustomerPage - Context not ready or no policy selected');
      return;
    }

    // Get the selected policy to get the total premium
    const selectedPolicy = policies.find(p => p.id === selectedPolicyId);
    if (!selectedPolicy) {
      console.error('Selected policy not found');
      return;
    }

    console.log('🔍 handleMakePayment - Starting payment process');
    console.log('🔍 handleMakePayment - Selected Policy ID:', selectedPolicyId);
    console.log('🔍 handleMakePayment - Selected Policy:', selectedPolicy);
    console.log('🔍 handleMakePayment - Payment Form Data:', paymentFormData);

    // Validate payment form data
    if (!paymentFormData.cardNumber || !paymentFormData.cardHolder || 
        !paymentFormData.expiryDate || !paymentFormData.cvv) {
      alert('Please fill in all payment details (Card Number, Card Holder, Expiry Date, CVV)');
      return;
    }

    try {
      console.log('🔍 handleMakePayment - Calling makePayment API...');
      const paymentRequest = {
        amount: selectedPolicy.premium, // Use policy's premium
        paymentMethod: 'CARD',
        cardNumber: paymentFormData.cardNumber,
        cardHolder: paymentFormData.cardHolder,
        expiryDate: paymentFormData.expiryDate,
        cvv: paymentFormData.cvv
      };
      console.log('🔍 handleMakePayment - Payment Request:', paymentRequest);
      console.log('🔍 handleMakePayment - Payment Request JSON:', JSON.stringify(paymentRequest, null, 2));
      console.log('🔍 handleMakePayment - Card Number Type:', typeof paymentFormData.cardNumber);
      console.log('🔍 handleMakePayment - Card Number Length:', paymentFormData.cardNumber?.length);
      console.log('🔍 handleMakePayment - CVV Type:', typeof paymentFormData.cvv);
      console.log('🔍 handleMakePayment - CVV Length:', paymentFormData.cvv?.length);
      
      const result = await makePayment(selectedPolicyId, paymentRequest);
      console.log('🔍 handleMakePayment - Payment API Response:', result);
      
      // Show success message
      alert('Payment processed successfully! Your policy is now active.');
      
      setShowPaymentForm(false);
      setPaymentFormData({ 
        amount: 0,
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
      });
      setSelectedPolicyId(null);
      fetchAllData();
    } catch (error) {
      console.error('❌ Error making payment:', error);
      alert('Payment failed. Please check your card details and try again.');
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedPolicyId || !documentFormData.file) return;
    try {
      console.log('🔄 Uploading document:', documentFormData.file.name);
      const uploadedDocument = await uploadDocument(documentFormData.file);
      console.log('✅ Document uploaded successfully:', uploadedDocument);
      
      // Show success message
      alert('Document uploaded successfully!');
      
      // Close modal and reset form
      setShowDocumentUpload(false);
      setDocumentFormData({ file: null });
      setSelectedPolicyId(null);
      
      // Refresh data
      await fetchAllData();
    } catch (error) {
      console.error('❌ Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const handleConvertOfferToPolicy = async (offerId: number) => {
    if (!isReady) {
      console.log('⏳ CustomerPage - Context not ready, cannot convert offer to policy');
      return;
    }

    try {
      console.log('🔄 Converting offer to policy:', offerId);
      
      // Call backend API to convert offer to policy
      const newPolicy = await acceptOfferAndCreatePolicy(offerId);
      
      console.log('✅ Offer converted to policy successfully:', newPolicy);
      
      // Show success message
      setOfferActionSuccess('Offer converted to policy successfully! You can now view policy details and make payments.');
      setTimeout(() => setOfferActionSuccess(null), 5000);
      
      // Close the offer details modal if open
      setShowOfferDetails(false);
      setSelectedOffer(null);
      
      // Refresh the data to show the new policy
      await fetchAllData();
      
    } catch (error) {
      console.error('❌ Error converting offer to policy:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error converting offer to policy. Please try again.';
      setOfferActionError(errorMessage);
      setTimeout(() => setOfferActionError(null), 5000);
    }
  };

  // Show loading state while context is loading or customer data is not ready
  if (contextLoading || !isReady) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            border: '4px solid #bfdbfe',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{
            fontSize: '1.125rem',
            fontWeight: 500,
            color: '#334155',
            margin: 0
          }}>
            {contextLoading ? 'Loading customer data...' : 'Preparing customer dashboard...'}
          </p>
          <p style={{
            fontSize: '0.875rem',
            color: '#64748b',
            marginTop: '0.5rem'
          }}>
            {contextLoading ? 'Please wait while we fetch your information' : 'Setting up your personalized dashboard'}
          </p>
        </div>
      </div>
    );
  }

  if (contextError) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #fef2f2 50%, #fdf2f8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '28rem',
          margin: '0 auto',
          padding: '2rem'
        }}>
          <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: '0.5rem'
          }}>Error Loading Data</h2>
          <p style={{
            color: '#dc2626',
            marginBottom: '1rem'
          }}>{contextError}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #db2777 100%)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)'}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }



  const renderDashboard = () => (
    <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 700, 
          color: '#1e293b',
          marginBottom: '0.5rem'
        }}>
          Customer Dashboard
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#64748b',
          margin: 0
        }}>
          Welcome back! Here's your insurance overview and quick actions.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* My Policies */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                My Policies
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {policies.length}
              </div>
            </div>
            <div style={{ fontSize: '2rem' }}>📄</div>
          </div>
        </div>

        {/* Active Offers */}
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                Active Offers
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {offers.filter(o => o.status === 'PENDING').length}
              </div>
            </div>
            <div style={{ fontSize: '2rem' }}>📋</div>
          </div>
        </div>

        {/* My Claims */}
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                My Claims
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                {claims.length}
              </div>
            </div>
            <div style={{ fontSize: '2rem' }}>🔑</div>
          </div>
        </div>

        {/* Total Premium */}
        <div style={{
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: 'white',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                Total Premium
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                €{policies
                  .filter(p => p.payment && p.payment.status === 'SUCCESS')
                  .reduce((sum, p) => sum + p.premium, 0)
                }
              </div>
            </div>
            <div style={{ fontSize: '2rem' }}>💳</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          color: '#1e293b',
          marginBottom: '1rem'
        }}>
          Quick Actions
        </h2>
        <div style={{ 
          display: 'grid', 
                     gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                     gap: '1.5rem'
        }}>
          <button 
            onClick={() => setCurrentModule('offers')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span>📋</span>
            Request Offer
          </button>

          <button 
            onClick={() => setCurrentModule('documents')}
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span>📁</span>
            Upload Document
          </button>

          <button 
            onClick={() => setCurrentModule('claims')}
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span>🔑</span>
            File Claim
          </button>
        </div>
      </div>
    </div>
  );

  const renderModuleContent = () => {
    switch (currentModule) {
      case 'dashboard':
        return renderDashboard();
             case 'offers':
         return (
           <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
             <div style={{ marginBottom: '2rem' }}>
               <h1 style={{
                 fontSize: '2.5rem',
                 fontWeight: 700,
                 color: '#1e293b',
                 marginBottom: '0.5rem'
               }}>
                 My Offers
               </h1>
               <p style={{
                 fontSize: '1.1rem',
                 color: '#64748b',
                 margin: 0
               }}>
                 View and manage your insurance offers
               </p>
             </div>

             <div style={{ marginBottom: '2rem' }}>
               <button
                 onClick={() => setShowOfferForm(true)}
                 style={{
                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                   color: 'white',
                   border: 'none',
                   borderRadius: '12px',
                   padding: '1rem 2rem',
                   fontSize: '1rem',
                   fontWeight: 600,
                   cursor: 'pointer',
                   transition: 'transform 0.2s',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5rem'
                 }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
               >
                 <span>📋</span>
                 Request New Offer
               </button>
             </div>

                          {/* Status Filter */}
             <div style={{ 
               marginBottom: '2rem',
               display: 'flex',
               flexDirection: 'column',
               gap: '1rem',
               background: 'white',
               padding: '1.5rem',
               borderRadius: '12px',
               boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
               border: '1px solid #e5e7eb'
             }}>
                                <div style={{
                   display: 'flex',
                   flexDirection: 'column',
                   gap: '0.5rem',
                   flex: 1
                 }}>
                   <label style={{
                     fontSize: '0.875rem',
                     fontWeight: 600,
                     color: '#374151',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '0.5rem'
                   }}>
                     <span>🔍</span>
                     Filter by Status:
                   </label>
                                    <div style={{
                   display: 'flex',
                   flexWrap: 'wrap',
                   gap: '0.5rem',
                   alignItems: 'center'
                 }}>
                   <select
                     value={selectedStatus}
                     onChange={(e) => {
                       const newStatus = e.target.value;
                       setSelectedStatus(newStatus);
                       localStorage.setItem('customerOffersStatusFilter', newStatus);
                     }}
                     style={{
                       padding: '0.5rem 1rem',
                       border: '2px solid #e5e7eb',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       backgroundColor: 'white',
                       color: '#374151',
                       cursor: 'pointer',
                       minWidth: '150px',
                       transition: 'border-color 0.2s',
                       fontWeight: 500
                     }}
                     onFocus={(e) => e.target.style.borderColor = '#667eea'}
                     onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                   >
                     <option value="ALL">📋 All Statuses</option>
                     <option value="PENDING">⏳ Pending</option>
                     <option value="APPROVED">✅ Approved</option>
                     <option value="REJECTED">❌ Rejected</option>
                     <option value="CONVERTED">🔄 Converted</option>
                   </select>
                                    <div style={{
                   fontSize: '0.75rem',
                   color: '#6b7280',
                   padding: '0.5rem 1rem',
                   background: '#f3f4f6',
                   borderRadius: '6px',
                   border: '1px solid #e5e7eb',
                   display: 'flex',
                   flexDirection: 'column',
                   gap: '0.25rem',
                   minWidth: '120px',
                   textAlign: 'center'
                 }}>
                   <div style={{ fontWeight: 600 }}>
                     {offers.filter(offer => selectedStatus === 'ALL' || offer.status === selectedStatus).length} offer(s) found
                   </div>
                   {selectedStatus !== 'ALL' && (
                     <div style={{ fontSize: '0.625rem', opacity: 0.8, fontStyle: 'italic' }}>
                       {selectedStatus === 'PENDING' && '⏳ Waiting for agent review'}
                       {selectedStatus === 'APPROVED' && '✅ Ready to convert to policy'}
                       {selectedStatus === 'REJECTED' && '❌ Offer was not accepted'}
                       {selectedStatus === 'CONVERTED' && '🔄 Already converted to policy'}
                     </div>
                   )}
                 </div>
                 </div>
               </div>
               
               {/* Quick Status Buttons */}
               <div style={{
                 display: 'flex',
                 flexWrap: 'wrap',
                 gap: '0.5rem',
                 paddingTop: '0.5rem',
                 borderTop: '1px solid #e5e7eb'
               }}>
                 {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CONVERTED'].map((status) => {
                   const count = status === 'ALL' 
                     ? offers.length 
                     : offers.filter(offer => offer.status === status).length;
                   
                   return (
                     <button
                       key={status}
                       onClick={() => {
                         setSelectedStatus(status);
                         localStorage.setItem('customerOffersStatusFilter', status);
                       }}
                       style={{
                         padding: '0.5rem 1rem',
                         borderRadius: '6px',
                         fontSize: '0.75rem',
                         fontWeight: 500,
                         cursor: 'pointer',
                         transition: 'all 0.2s',
                         background: selectedStatus === status 
                           ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                           : '#f3f4f6',
                         color: selectedStatus === status ? 'white' : '#374151',
                         border: selectedStatus === status ? 'none' : '1px solid #e5e7eb',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '0.5rem'
                       }}
                       onMouseEnter={(e) => {
                         if (selectedStatus !== status) {
                           e.currentTarget.style.background = '#e5e7eb';
                         }
                       }}
                       onMouseLeave={(e) => {
                         if (selectedStatus !== status) {
                           e.currentTarget.style.background = '#f3f4f6';
                         }
                       }}
                     >
                       <span>{status === 'ALL' ? '📋 All' : status === 'PENDING' ? '⏳ Pending' : status === 'APPROVED' ? '✅ Approved' : status === 'REJECTED' ? '❌ Rejected' : '🔄 Converted'}</span>
                       <span style={{
                         background: selectedStatus === status ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                         padding: '0.125rem 0.375rem',
                         borderRadius: '4px',
                         fontSize: '0.625rem',
                         fontWeight: 600,
                         minWidth: '1.5rem',
                         textAlign: 'center',
                         display: 'inline-block',
                         lineHeight: '1',
                         userSelect: 'none',
                         flexShrink: 0,
                         boxSizing: 'border-box',
                         whiteSpace: 'nowrap',
                         overflow: 'hidden'
                       }}>
                         {count}
                       </span>
                     </button>
                   );
                 })}
               </div>
             </div>

             {loading ? (
               <div style={{
                 display: 'flex',
                 justifyContent: 'center',
                 alignItems: 'center',
                 padding: '3rem'
               }}>
                 <div style={{
                   width: '3rem',
                   height: '3rem',
                   border: '4px solid #e5e7eb',
                   borderTop: '4px solid #3b82f6',
                   borderRadius: '50%',
                   animation: 'spin 1s linear infinite'
                 }}></div>
               </div>
             ) : offers.filter(offer => selectedStatus === 'ALL' || offer.status === selectedStatus).length === 0 ? (
               <div style={{
                 textAlign: 'center',
                 padding: '3rem',
                 background: 'white',
                 borderRadius: '16px',
                 boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
               }}>
                 <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
                 <h3 style={{
                   fontSize: '1.5rem',
                   fontWeight: 600,
                   color: '#1e293b',
                   marginBottom: '1rem'
                 }}>
                   {selectedStatus === 'ALL' ? 'No Offers Yet' : `No ${selectedStatus} Offers`}
                 </h3>
                 <p style={{
                   color: '#64748b',
                   marginBottom: '2rem'
                 }}>
                   {selectedStatus === 'ALL' 
                     ? "You don't have any insurance offers yet. Start by requesting an offer to get comprehensive coverage for your needs."
                     : `You don't have any ${selectedStatus.toLowerCase()} offers. Try changing the status filter or request a new offer.`
                   }
                 </p>
                 <button
                   onClick={() => setShowOfferForm(true)}
                   style={{
                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                     color: 'white',
                     border: 'none',
                     borderRadius: '12px',
                     padding: '1rem 2rem',
                     fontSize: '1rem',
                     fontWeight: 600,
                     cursor: 'pointer',
                     transition: 'transform 0.2s'
                   }}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                 >
                   <span>📋</span>
                   Request Your First Offer
                 </button>
               </div>
             ) : (
               <div style={{
                 display: 'grid',
                 gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                 gap: '1.5rem'
               }}>
                                  {offers
                   .filter(offer => selectedStatus === 'ALL' || offer.status === selectedStatus)
                                        .sort((a, b) => {
                       // Sort by status priority and then by creation date
                       const statusPriority: Record<string, number> = { 'PENDING': 1, 'APPROVED': 2, 'CONVERTED': 3, 'REJECTED': 4 };
                       const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 5;
                       const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 5;
                       
                       if (aPriority !== bPriority) {
                         return aPriority - bPriority;
                       }
                       
                       // If same status, sort by creation date (newest first)
                       return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                     })
                   .map((offer) => (
                     <div key={offer.id} style={{
                       background: 'white',
                       borderRadius: '16px',
                       padding: '1.5rem',
                       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                       border: '1px solid #e5e7eb',
                       transition: 'transform 0.2s, box-shadow 0.2s',
                       cursor: 'pointer',
                       position: 'relative',
                       overflow: 'hidden'
                     }}
                     onClick={() => handleOfferClick(offer)}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.transform = 'translateY(-4px)';
                       e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.transform = 'translateY(0)';
                       e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                     }}
                     >
                       {/* Status indicator bar */}
                       <div style={{
                         position: 'absolute',
                         top: 0,
                         left: 0,
                         right: 0,
                         height: '4px',
                         background: offer.status === "PENDING" ? '#f59e0b' : 
                                   offer.status === "APPROVED" ? '#10b981' : 
                                   offer.status === "REJECTED" ? '#ef4444' : 
                                   offer.status === "CONVERTED" ? '#3b82f6' : '#6b7280'
                       }}
                       />
                       
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                         <div style={{
                           width: '3rem',
                           height: '3rem',
                           background: offer.status === "PENDING" ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                                     offer.status === "APPROVED" ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                                     offer.status === "REJECTED" ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                                     offer.status === "CONVERTED" ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' :
                                     'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                           borderRadius: '12px',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           color: 'white',
                           fontSize: '1.5rem'
                         }}>
                           {offer.status === "PENDING" ? "⏳" : 
                            offer.status === "APPROVED" ? "✅" : 
                            offer.status === "REJECTED" ? "❌" : 
                            offer.status === "CONVERTED" ? "🔄" : "📋"}
                         </div>
                         <span style={{
                           padding: '0.25rem 0.75rem',
                           borderRadius: '9999px',
                           fontSize: '0.75rem',
                           fontWeight: 500,
                           background: offer.status === "PENDING" ? '#fef3c7' : 
                                     offer.status === "APPROVED" ? '#dcfce7' : 
                                     offer.status === "REJECTED" ? '#fee2e2' : 
                                     offer.status === "CONVERTED" ? '#dbeafe' : '#e0e7ff',
                           color: offer.status === "PENDING" ? '#92400e' : 
                                 offer.status === "APPROVED" ? '#166534' : 
                                 offer.status === "REJECTED" ? '#991b1b' : 
                                 offer.status === "CONVERTED" ? '#1e40af' : '#3730a3'
                         }}>
                           {offer.status}
                         </span>
                       </div>
                     <h3 style={{
                       fontSize: '1.25rem',
                       fontWeight: 700,
                       color: '#1e293b',
                       marginBottom: '1rem'
                     }}>
                       {offer.offerNumber}
                     </h3>
                     <div style={{ marginBottom: '1.5rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Insurance Type:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>
                           {offer.insuranceType ? offer.insuranceType.charAt(0).toUpperCase() + offer.insuranceType.slice(1).toLowerCase() : 'N/A'}
                         </span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Premium:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>€{offer.totalPremium}</span>
                       </div>
                       {offer.note && (
                         <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                           <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Note:</div>
                           <div style={{ color: '#1e293b', fontSize: '0.875rem' }}>{offer.note}</div>
                         </div>
                       )}
                     </div>

                      {offer.status === 'APPROVED' && (
                        <button
                          onClick={() => handleConvertOfferToPolicy(offer.id)}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          Convert to Policy
                        </button>
                      )}
                      {offer.status === 'PENDING' && (
                        <div style={{
                          padding: '0.75rem 1rem',
                          background: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #f59e0b',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          textAlign: 'center'
                        }}>
                          ⏳ Waiting for agent to review and select coverages
                        </div>
                      )}
                     {offer.status === 'REJECTED' && (
                       <button
                         onClick={() => setCurrentModule('offers')}
                         style={{
                           width: '100%',
                           padding: '0.75rem 1rem',
                           background: 'linear-gradient(135deg, #dc2626 0%, #db2777 100%)',
                           color: 'white',
                           border: 'none',
                           borderRadius: '8px',
                           fontSize: '0.875rem',
                           fontWeight: 600,
                           cursor: 'pointer',
                           transition: 'transform 0.2s'
                         }}
                         onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                         onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                       >
                         Rejected
                       </button>
                     )}
                     {offer.status === 'CONVERTED' && (
                       <button
                         onClick={() => {
                           console.log('🔍 Go to Policy clicked for offer:', offer);
                           console.log('🔍 Current token:', localStorage.getItem('token'));
                           console.log('🔍 Current user role:', localStorage.getItem('userRole'));
                           console.log('🔍 Current customer ID:', localStorage.getItem('customerId'));
                           setCurrentModule('policies');
                         }}
                         style={{
                           width: '100%',
                           padding: '0.75rem 1rem',
                           background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                           color: 'white',
                           border: 'none',
                           borderRadius: '8px',
                           fontSize: '0.875rem',
                           fontWeight: 600,
                           cursor: 'pointer',
                           transition: 'transform 0.2s'
                         }}
                         onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                         onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                       >
                         Go to Policy
                       </button>
                     )}
                   </div>
                 ))}
               </div>
             )}
           </div>
         );
             case 'policies':
         return (
           <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
             <div style={{ marginBottom: '2rem' }}>
               <div style={{ 
                 display: 'flex', 
                 justifyContent: 'space-between', 
                 alignItems: 'flex-start',
                 marginBottom: '1rem'
               }}>
                 <div>
                   <h1 style={{
                     fontSize: '2.5rem',
                     fontWeight: 700,
                     color: '#1e293b',
                     marginBottom: '0.5rem'
                   }}>
                     My Policies
                   </h1>
                   <p style={{
                     fontSize: '1.1rem',
                     color: '#64748b',
                     margin: 0
                   }}>
                     Manage your active insurance coverage and policies
                   </p>
                 </div>
                 
                 {/* Export All Policies to PDF Button */}
                 {policies.length > 0 && (
                   <button
                     onClick={() => handleExportPoliciesToPDF()}
                     style={{
                       background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                       color: 'white',
                       border: 'none',
                       borderRadius: '12px',
                       padding: '0.875rem 1.75rem',
                       fontSize: '0.875rem',
                       fontWeight: 700,
                       cursor: 'pointer',
                       transition: 'all 0.3s ease',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '0.75rem',
                       boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.4)',
                       position: 'relative',
                       overflow: 'hidden'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                       e.currentTarget.style.boxShadow = '0 8px 25px 0 rgba(16, 185, 129, 0.6)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.transform = 'translateY(0) scale(1)';
                       e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(16, 185, 129, 0.4)';
                     }}
                   >
                     <span style={{ fontSize: '1.1rem' }}>📄</span>
                     Export All to PDF
                   </button>
                 )}
               </div>
             </div>

             <div style={{ marginBottom: '2rem' }}>
               <button
                 onClick={() => setCurrentModule('offers')}
                 style={{
                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                   color: 'white',
                   border: 'none',
                   borderRadius: '12px',
                   padding: '1rem 2rem',
                   fontSize: '1rem',
                   fontWeight: 600,
                   cursor: 'pointer',
                   transition: 'transform 0.2s',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5rem'
                 }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
               >
                 <span>📋</span>
                 Request New Policy
               </button>
             </div>

             {loading ? (
               <div style={{
                 display: 'flex',
                 justifyContent: 'center',
                 alignItems: 'center',
                 padding: '3rem'
               }}>
                 <div style={{
                   width: '3rem',
                   height: '3rem',
                   border: '4px solid #e5e7eb',
                   borderTop: '4px solid #3b82f6',
                   borderRadius: '50%',
                   animation: 'spin 1s linear infinite'
                 }}></div>
               </div>
                          ) : policies.length === 0 && offers.filter(offer => offer.status === 'APPROVED').length === 0 ? (
               <div style={{
                 textAlign: 'center',
                 padding: '3rem',
                 background: 'white',
                 borderRadius: '16px',
                 boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
               }}>
                 <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                 <h3 style={{
                   fontSize: '1.5rem',
                   fontWeight: 600,
                   color: '#1e293b',
                   marginBottom: '1rem'
                 }}>
                   No Policies Yet
                 </h3>
                 <p style={{
                   color: '#64748b',
                   marginBottom: '2rem'
                 }}>
                   You don't have any active insurance policies yet. Start by requesting an offer to get comprehensive coverage for your needs.
                 </p>
                 <button
                   onClick={() => setCurrentModule('offers')}
                   style={{
                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                     color: 'white',
                     border: 'none',
                     borderRadius: '12px',
                     padding: '1rem 2rem',
                     fontSize: '1rem',
                     fontWeight: 600,
                     cursor: 'pointer',
                     transition: 'transform 0.2s'
                   }}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                 >
                   <span>📋</span>
                   Request Your First Policy
                 </button>
               </div>
             ) : (
               <div>
                 {/* Show approved offers that can be converted to policies */}
                 {offers.filter(offer => offer.status === 'APPROVED').map((offer) => (
                   <div key={`offer-${offer.id}`} style={{
                     background: 'white',
                     borderRadius: '16px',
                     padding: '1.5rem',
                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                     border: '2px solid #10b981',
                     transition: 'transform 0.2s, box-shadow 0.2s'
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.transform = 'translateY(-4px)';
                     e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.transform = 'translateY(0)';
                     e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                   }}
                   >
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                       <div style={{
                         width: '3rem',
                         height: '3rem',
                         background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                         borderRadius: '12px',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: 'white',
                         fontSize: '1.5rem'
                       }}>
                         ✅
                       </div>
                       <span style={{
                         padding: '0.25rem 0.75rem',
                         borderRadius: '9999px',
                         fontSize: '0.75rem',
                         fontWeight: 500,
                         background: '#dcfce7',
                         color: '#166534'
                       }}>
                         APPROVED OFFER
                       </span>
                     </div>
                     <h3 style={{
                       fontSize: '1.25rem',
                       fontWeight: 700,
                       color: '#1e293b',
                       marginBottom: '1rem'
                     }}>
                       {offer.offerNumber}
                     </h3>
                     <div style={{ marginBottom: '1.5rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Insurance Type:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>{offer.insuranceType}</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Premium:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>€{offer.totalPremium}</span>
                       </div>
                     </div>
                     <button
                       onClick={() => handleConvertOfferToPolicy(offer.id)}
                       style={{
                         width: '100%',
                         background: '#10b981',
                         color: 'white',
                         border: 'none',
                         borderRadius: '8px',
                         padding: '0.75rem 1rem',
                         fontSize: '0.875rem',
                         fontWeight: 600,
                         cursor: 'pointer',
                         transition: 'all 0.2s'
                       }}
                       onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                       onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                     >
                       📋 Convert to Policy
                     </button>
                   </div>
                 ))}
                 
                 {/* Show existing policies */}
                 {policies.map((policy) => (
                                        <div key={policy.id} style={{
                       background: 'white',
                       borderRadius: '16px',
                       padding: '1.5rem',
                       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                       border: policy.payment && policy.payment.status === "SUCCESS" 
                         ? '2px solid #10b981' 
                         : '1px solid #e5e7eb',
                       transition: 'transform 0.2s, box-shadow 0.2s',
                       position: 'relative',
                       overflow: 'hidden'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.transform = 'translateY(-4px)';
                       e.currentTarget.style.boxShadow = policy.payment && policy.payment.status === "SUCCESS"
                         ? '0 10px 25px -3px rgba(16, 185, 129, 0.2)'
                         : '0 10px 25px -3px rgba(0, 0, 0, 0.1)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.transform = 'translateY(0)';
                       e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                     }}
                     >
                       {/* Payment Status Indicator Bar */}
                       <div style={{
                         position: 'absolute',
                         top: 0,
                         left: 0,
                         right: 0,
                         height: '4px',
                         background: policy.payment && policy.payment.status === "SUCCESS" ? '#10b981' : '#f59e0b'
                       }}
                       />
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                       <div style={{
                         width: '3rem',
                         height: '3rem',
                         background: policy.payment && policy.payment.status === "SUCCESS" 
                           ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                           : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                         borderRadius: '12px',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: 'white',
                         fontSize: '1.5rem'
                       }}>
                         {policy.payment && policy.payment.status === "SUCCESS" ? "✅" : "📄"}
                       </div>
                       <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                         {/* Policy Status Badge */}
                         <span style={{
                           padding: '0.25rem 0.75rem',
                           borderRadius: '9999px',
                           fontSize: '0.75rem',
                           fontWeight: 500,
                           background: policy.status === "ACTIVE" ? '#dcfce7' : policy.status === "PENDING" ? '#fef3c7' : '#fee2e2',
                           color: policy.status === "ACTIVE" ? '#166534' : policy.status === "PENDING" ? '#92400e' : '#991b1b'
                         }}>
                           {policy.status}
                         </span>
                         {/* Payment Status Badge */}
                         {policy.payment && (
                           <span style={{
                             padding: '0.25rem 0.75rem',
                             borderRadius: '9999px',
                             fontSize: '0.75rem',
                             fontWeight: 500,
                             background: policy.payment.status === "SUCCESS" ? '#dcfce7' : '#fef3c7',
                             color: policy.payment.status === "SUCCESS" ? '#166534' : '#92400e',
                             display: 'flex',
                             alignItems: 'center',
                             gap: '0.25rem'
                           }}>
                             {policy.payment.status === "SUCCESS" ? '✅' : '⏳'} 
                             {policy.payment.status === "SUCCESS" ? 'Paid' : 'Pending'}
                           </span>
                         )}
                       </div>
                     </div>
                     <h3 style={{
                       fontSize: '1.25rem',
                       fontWeight: 700,
                       color: '#1e293b',
                       marginBottom: '1rem'
                     }}>
                       {policy.policyNumber}
                     </h3>
                     <div style={{ marginBottom: '1.5rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Insurance Type:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>{policy.insuranceType}</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Premium:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>€{policy.premium}</span>
                       </div>
                       {/* Payment Status */}
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Payment Status:</span>
                         <span style={{ 
                           fontWeight: 600, 
                           color: policy.payment && policy.payment.status === 'SUCCESS' ? '#166534' : '#dc2626',
                           display: 'flex',
                           alignItems: 'center',
                           gap: '0.25rem'
                         }}>
                           {policy.payment && policy.payment.status === 'SUCCESS' ? (
                             <>
                               ✅ Paid
                               <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                 ({new Date(policy.payment.paymentDate || policy.createdAt).toLocaleDateString()})
                               </span>
                             </>
                           ) : (
                             <>
                               ❌ Pending
                               <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                 (Payment required)
                               </span>
                             </>
                           )}
                         </span>
                       </div>
                     </div>
                     {policy.status === 'PENDING_PAYMENT' ? (
                       <button
                         onClick={() => {
                           setShowPaymentForm(true);
                           setSelectedPolicyId(policy.id);
                         }}
                         style={{
                           width: '100%',
                           background: '#10b981',
                           color: 'white',
                           border: 'none',
                           borderRadius: '8px',
                           padding: '0.75rem 1rem',
                           fontSize: '0.875rem',
                           fontWeight: 600,
                           cursor: 'pointer',
                           transition: 'all 0.2s'
                         }}
                         onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                         onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                       >
                         💳 Make Payment
                       </button>
                     ) : policy.status === 'ACTIVE' ? (
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                         {/* Check if payment is already successful */}
                         {policy.payment && policy.payment.status === 'SUCCESS' ? (
                           <div style={{
                             padding: '0.75rem 1rem',
                             background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                             color: 'white',
                             border: 'none',
                             borderRadius: '8px',
                             fontSize: '0.875rem',
                             fontWeight: 600,
                             textAlign: 'center',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             gap: '0.5rem'
                           }}>
                             ✅ Paid
                           </div>
                         ) : (
                           <button
                             onClick={() => {
                               setShowPaymentForm(true);
                               setSelectedPolicyId(policy.id);
                             }}
                             style={{
                               padding: '0.75rem 1rem',
                               background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                               fontSize: '0.875rem',
                               fontWeight: 600,
                               cursor: 'pointer',
                               transition: 'transform 0.2s'
                             }}
                             onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                             onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                           >
                             💳 Pay
                           </button>
                         )}
                         <button
                           onClick={() => {
                             setShowClaimForm(true);
                             setSelectedPolicyId(policy.id);
                           }}
                           style={{
                             padding: '0.75rem 1rem',
                             background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                             color: 'white',
                             border: 'none',
                             borderRadius: '8px',
                             fontSize: '0.875rem',
                             fontWeight: 600,
                             cursor: 'pointer',
                             transition: 'transform 0.2s'
                           }}
                           onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                           onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                         >
                           🔑 Claim
                         </button>
                       </div>
                     ) : (
                       <div style={{
                         padding: '0.75rem 1rem',
                         background: '#6b7280',
                         color: 'white',
                         border: 'none',
                         borderRadius: '8px',
                         fontSize: '0.875rem',
                         fontWeight: 600,
                         textAlign: 'center'
                       }}>
                         {policy.status}
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             )}
           </div>
         );
             case 'claims':
         return (
           <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
             <div style={{ marginBottom: '2rem' }}>
               <h1 style={{
                 fontSize: '2.5rem',
                 fontWeight: 700,
                 color: '#1e293b',
                 marginBottom: '0.5rem'
               }}>
                 My Claims
               </h1>
               <p style={{
                 fontSize: '1.1rem',
                 color: '#64748b',
                 margin: 0
               }}>
                 Track and manage your insurance claims
               </p>
             </div>

             <div style={{ marginBottom: '2rem' }}>
               <button
                 onClick={() => setShowClaimForm(true)}
                 style={{
                   background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                   color: 'white',
                   border: 'none',
                   borderRadius: '12px',
                   padding: '1rem 2rem',
                   fontSize: '1rem',
                   fontWeight: 600,
                   cursor: 'pointer',
                   transition: 'transform 0.2s',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5rem'
                 }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
               >
                 <span>🔑</span>
                 File New Claim
               </button>
             </div>

             {loading ? (
               <div style={{
                 display: 'flex',
                 justifyContent: 'center',
                 alignItems: 'center',
                 padding: '3rem'
               }}>
                 <div style={{
                   width: '3rem',
                   height: '3rem',
                   border: '4px solid #e5e7eb',
                   borderTop: '4px solid #3b82f6',
                   borderRadius: '50%',
                   animation: 'spin 1s linear infinite'
                 }}></div>
               </div>
             ) : claims.length === 0 ? (
               <div style={{
                 textAlign: 'center',
                 padding: '3rem',
                 background: 'white',
                 borderRadius: '16px',
                 boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
               }}>
                 <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔑</div>
                 <h3 style={{
                   fontSize: '1.5rem',
                   fontWeight: 600,
                   color: '#1e293b',
                   marginBottom: '1rem'
                 }}>
                   No Claims Yet
                 </h3>
                 <p style={{
                   color: '#64748b',
                   marginBottom: '2rem'
                 }}>
                   You haven't filed any claims yet. Start by creating your first claim to get the support you need.
                 </p>
                 <button
                   onClick={() => setShowClaimForm(true)}
                   style={{
                     background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                     color: 'white',
                     border: 'none',
                     borderRadius: '12px',
                     padding: '1rem 2rem',
                     fontSize: '1rem',
                     fontWeight: 600,
                     cursor: 'pointer',
                     transition: 'transform 0.2s'
                   }}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                 >
                   <span>🔑</span>
                   File Your First Claim
                 </button>
               </div>
             ) : (
               <div style={{
                 display: 'grid',
                 gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                 gap: '1.5rem'
               }}>
                 {claims.map((claim) => (
                   <div key={claim.id} style={{
                     background: 'white',
                     borderRadius: '16px',
                     padding: '1.5rem',
                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                     border: '1px solid #e5e7eb',
                     transition: 'transform 0.2s, box-shadow 0.2s'
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.transform = 'translateY(-4px)';
                     e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.transform = 'translateY(0)';
                     e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                   }}
                   >
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                       <div style={{
                         width: '3rem',
                         height: '3rem',
                         background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                         borderRadius: '12px',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: 'white',
                         fontSize: '1.5rem'
                       }}>
                         🔑
                       </div>
                       <span style={{
                         padding: '0.25rem 0.75rem',
                         borderRadius: '9999px',
                         fontSize: '0.75rem',
                         fontWeight: 500,
                         background: claim.status === "APPROVED" ? '#dcfce7' : claim.status === "PENDING" ? '#fef3c7' : '#fee2e2',
                         color: claim.status === "APPROVED" ? '#166534' : claim.status === "PENDING" ? '#92400e' : '#991b1b'
                       }}>
                         {claim.status}
                       </span>
                     </div>
                     <h3 style={{
                       fontSize: '1.25rem',
                       fontWeight: 700,
                       color: '#1e293b',
                       marginBottom: '1rem'
                     }}>
                       {claim.claimNumber}
                     </h3>
                     <div style={{ marginBottom: '1.5rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Amount:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>€{claim.amount}</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Claim Date:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>
                           {new Date(claim.claimDate).toLocaleDateString('en-US', {
                             year: 'numeric',
                             month: 'long',
                             day: 'numeric'
                           })}
                         </span>
                       </div>
                       <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                         <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Description:</div>
                         <div style={{ color: '#1e293b', fontSize: '0.875rem' }}>{claim.description}</div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
         );
             case 'payments':
         return (
           <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
             <div style={{ marginBottom: '2rem' }}>
               <h1 style={{
                 fontSize: '2.5rem',
                 fontWeight: 700,
                 color: '#1e293b',
                 marginBottom: '0.5rem'
               }}>
                 My Payments
               </h1>
               <p style={{
                 fontSize: '1.1rem',
                 color: '#64748b',
                 margin: 0
               }}>
                 View your payment history and manage transactions
               </p>
             </div>

             {loading ? (
               <div style={{
                 display: 'flex',
                 justifyContent: 'center',
                 alignItems: 'center',
                 padding: '3rem'
               }}>
                 <div style={{
                   width: '3rem',
                   height: '3rem',
                   border: '4px solid #e5e7eb',
                   borderTop: '4px solid #3b82f6',
                   borderRadius: '50%',
                   animation: 'spin 1s linear infinite'
                 }}></div>
               </div>
             ) : payments.length === 0 ? (
               <div style={{
                 textAlign: 'center',
                 padding: '3rem',
                 background: 'white',
                 borderRadius: '16px',
                 boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
               }}>
                 <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💳</div>
                 <h3 style={{
                   fontSize: '1.5rem',
                   fontWeight: 600,
                   color: '#1e293b',
                   marginBottom: '1rem'
                 }}>
                   No Payments Yet
                 </h3>
                 <p style={{
                   color: '#64748b',
                   marginBottom: '2rem'
                 }}>
                   You haven't made any payments yet. Payments will appear here once you start paying for your policies.
                 </p>
               </div>
             ) : (
               <div style={{
                 display: 'grid',
                 gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                 gap: '1.5rem'
               }}>
                 {payments.map((payment) => (
                   <div key={payment.id} style={{
                     background: 'white',
                     borderRadius: '16px',
                     padding: '1.5rem',
                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                     border: '1px solid #e5e7eb',
                     transition: 'transform 0.2s, box-shadow 0.2s'
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.transform = 'translateY(-4px)';
                     e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.transform = 'translateY(0)';
                     e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                   }}
                   >
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                       <div style={{
                         width: '3rem',
                         height: '3rem',
                         background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                         borderRadius: '12px',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: 'white',
                         fontSize: '1.5rem'
                       }}>
                         💳
                       </div>
                       <span style={{
                         padding: '0.25rem 0.75rem',
                         borderRadius: '9999px',
                         fontSize: '0.75rem',
                         fontWeight: 500,
                         background: payment.status === "COMPLETED" ? '#dcfce7' : payment.status === "PENDING" ? '#fef3c7' : '#fee2e2',
                         color: payment.status === "COMPLETED" ? '#166534' : payment.status === "PENDING" ? '#92400e' : '#991b1b'
                       }}>
                         {payment.status}
                       </span>
                     </div>
                     <h3 style={{
                       fontSize: '1.25rem',
                       fontWeight: 700,
                       color: '#1e293b',
                       marginBottom: '1rem'
                     }}>
                       {payment.paymentNumber}
                     </h3>
                     <div style={{ marginBottom: '1.5rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Amount:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>€{payment.amount}</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Payment Date:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>
                           {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                             year: 'numeric',
                             month: 'long',
                             day: 'numeric'
                           })}
                         </span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
         );
       case 'documents':
         return (
           <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
             <div style={{ marginBottom: '2rem' }}>
               <h1 style={{
                 fontSize: '2.5rem',
                 fontWeight: 700,
                 color: '#1e293b',
                 marginBottom: '0.5rem'
               }}>
                 My Documents
               </h1>
               <p style={{
                 fontSize: '1.1rem',
                 color: '#64748b',
                 margin: 0
               }}>
                 Manage and upload your insurance documents
               </p>
             </div>

             <div style={{ marginBottom: '2rem' }}>
               <button
                 onClick={() => setShowDocumentUpload(true)}
                 style={{
                   background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                   color: 'white',
                   border: 'none',
                   borderRadius: '12px',
                   padding: '1rem 2rem',
                   fontSize: '1rem',
                   fontWeight: 600,
                   cursor: 'pointer',
                   transition: 'transform 0.2s',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5rem'
                 }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
               >
                 <span>📁</span>
                 Upload Document
               </button>
             </div>

             {loading ? (
               <div style={{
                 display: 'flex',
                 justifyContent: 'center',
                 alignItems: 'center',
                 padding: '3rem'
               }}>
                 <div style={{
                   width: '3rem',
                   height: '3rem',
                   border: '4px solid #e5e7eb',
                   borderTop: '4px solid #3b82f6',
                   borderRadius: '50%',
                   animation: 'spin 1s linear infinite'
                 }}></div>
               </div>
             ) : documents.length === 0 ? (
               <div style={{
                 textAlign: 'center',
                 padding: '3rem',
                 background: 'white',
                 borderRadius: '16px',
                 boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
               }}>
                 <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📁</div>
                 <h3 style={{
                   fontSize: '1.5rem',
                   fontWeight: 600,
                   color: '#1e293b',
                   marginBottom: '1rem'
                 }}>
                   No Documents Yet
                 </h3>
                 <p style={{
                   color: '#64748b',
                   marginBottom: '2rem'
                 }}>
                   You haven't uploaded any documents yet. Start by uploading your first document.
                 </p>
                 <button
                   onClick={() => setShowDocumentUpload(true)}
                   style={{
                     background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                     color: 'white',
                     border: 'none',
                     borderRadius: '12px',
                     padding: '1rem 2rem',
                     fontSize: '1rem',
                     fontWeight: 600,
                     cursor: 'pointer',
                     transition: 'transform 0.2s'
                   }}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                 >
                   <span>📁</span>
                   Upload Your First Document
                 </button>
               </div>
             ) : (
               <div style={{
                 display: 'grid',
                 gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                 gap: '1.5rem'
               }}>
                 {documents.map((document) => (
                   <div key={document.id} style={{
                     background: 'white',
                     borderRadius: '16px',
                     padding: '1.5rem',
                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                     border: '1px solid #e5e7eb',
                     transition: 'transform 0.2s, box-shadow 0.2s'
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.transform = 'translateY(-4px)';
                     e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.transform = 'translateY(0)';
                     e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                   }}
                   >
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                       <div style={{
                         width: '3rem',
                         height: '3rem',
                         background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                         borderRadius: '12px',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: 'white',
                         fontSize: '1.5rem'
                       }}>
                         📁
                       </div>
                     </div>
                     <h3 style={{
                       fontSize: '1.25rem',
                       fontWeight: 700,
                       color: '#1e293b',
                       marginBottom: '1rem'
                     }}>
                       {document.fileName}
                     </h3>
                     <div style={{ marginBottom: '1.5rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>File Type:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>{document.fileType}</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>File Size:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>{(document.fileSize / 1024).toFixed(2)} KB</span>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                         <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Upload Date:</span>
                         <span style={{ fontWeight: 600, color: '#1e293b' }}>
                           {new Date(document.uploadDate).toLocaleDateString('en-US', {
                             year: 'numeric',
                             month: 'long',
                             day: 'numeric'
                           })}
                         </span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
         );
       case 'profile':
         console.log('🔍 Profile render - customer data:', customer);
         console.log('🔍 Profile render - customerId:', customerId);
         console.log('🔍 Profile render - isReady:', isReady);
         console.log('🔍 Profile render - contextLoading:', contextLoading);
         
         return (
           <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
             <div style={{ maxWidth: '800px', width: '100%' }}>
               <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                 <h1 style={{
                   fontSize: '2.5rem',
                   fontWeight: 700,
                   color: '#1e293b',
                   marginBottom: '0.5rem'
                 }}>
                   My Profile
                 </h1>
                 <p style={{
                   fontSize: '1.1rem',
                   color: '#64748b',
                   margin: 0
                 }}>
                   Manage your personal information and account settings
                 </p>
               </div>

               <div style={{
                 background: 'white',
                 borderRadius: '16px',
                 padding: '2rem',
                 boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                 marginBottom: '2rem'
               }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                   <h2 style={{
                     fontSize: '1.5rem',
                     fontWeight: 600,
                     color: '#1e293b',
                     margin: 0
                   }}>
                     Personal Information
                   </h2>
                   <button
                     onClick={openProfileUpdate}
                     style={{
                       background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                       color: 'white',
                       border: 'none',
                       borderRadius: '8px',
                       padding: '0.75rem 1.5rem',
                       fontSize: '0.875rem',
                       fontWeight: 600,
                       cursor: 'pointer',
                       transition: 'transform 0.2s'
                     }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                   >
                     ✏️ Update Profile
                   </button>
                 </div>
                 <div style={{
                   display: 'grid',
                   gridTemplateColumns: '1fr 1fr',
                   gap: '1rem'
                 }}>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>First Name</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb'
                     }}>
                       {customer?.user?.firstName || 'N/A'}
                     </div>
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Last Name</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb'
                     }}>
                       {customer?.user?.lastName || 'N/A'}
                     </div>
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Email</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb'
                     }}>
                       {customer?.user?.email || 'N/A'}
                     </div>
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Customer Number</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb'
                     }}>
                       {customer?.customerNumber || 'N/A'}
                     </div>
                   </div>
                 </div>
               </div>

               <div style={{ marginBottom: '2rem' }}>
                 <h2 style={{
                   fontSize: '1.5rem',
                   fontWeight: 600,
                   color: '#1e293b',
                   marginBottom: '1rem'
                 }}>
                   Address Information
                 </h2>
                 <div style={{
                   display: 'grid',
                   gridTemplateColumns: '1fr 1fr',
                   gap: '1rem'
                 }}>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Address</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb'
                     }}>
                       {customer?.address || 'N/A'}
                     </div>
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>City</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb'
                     }}>
                       {customer?.city || 'N/A'}
                     </div>
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Country</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb'
                     }}>
                       {customer?.country || 'N/A'}
                     </div>
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Postal Code</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb'
                     }}>
                       {customer?.postalCode || 'N/A'}
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         );
      default:
        return renderDashboard();
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0 }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        background: 'linear-gradient(180deg, #1e40af 0%, #3b82f6 100%)',
        color: 'white',
        padding: '2rem 1rem',
        boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>InsuranceApp</h2>
          <p style={{ fontSize: '0.875rem', opacity: 0.7, margin: '0.5rem 0 0 0' }}>Customer Panel</p>
        </div>

        {/* Navigation */}
        <nav>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7, marginBottom: '0.5rem' }}>
              MAIN MODULES
            </h3>
          </div>
          
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'offers', label: 'My Offers', icon: '📋' },
            { id: 'policies', label: 'My Policies', icon: '📄' },
            { id: 'claims', label: 'My Claims', icon: '🔑' },
            { id: 'payments', label: 'My Payments', icon: '💳' },
            { id: 'documents', label: 'My Documents', icon: '📁' },
            { id: 'profile', label: 'Profile', icon: '👤' }
          ].map((module) => (
            <button
              key={module.id}
              onClick={() => setCurrentModule(module.id as any)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                marginBottom: '0.5rem',
                background: currentModule === module.id ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (currentModule !== module.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentModule !== module.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{module.icon}</span>
              {module.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'rgba(239, 68, 68, 0.2)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </div>

             {/* Main Content */}
       <div style={{ flex: 1, overflow: 'auto' }}>
         {renderModuleContent()}
       </div>

       {/* Offer Form Modal */}
       {showOfferForm && (
         <div style={{
           position: 'fixed',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           background: 'rgba(0, 0, 0, 0.5)',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           zIndex: 1000
         }}>
           <div style={{
             background: 'white',
             borderRadius: '16px',
             padding: '2rem',
             width: '90%',
             maxWidth: '600px',
             maxHeight: '90vh',
             overflow: 'auto',
             boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
           }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h2 style={{
                 fontSize: '1.5rem',
                 fontWeight: 700,
                 color: '#1e293b',
                 margin: 0
               }}>
                 Request New Offer
               </h2>
               <button
                 onClick={() => setShowOfferForm(false)}
                 style={{
                   background: 'none',
                   border: 'none',
                   fontSize: '1.5rem',
                   cursor: 'pointer',
                   color: '#64748b'
                 }}
               >
                 ✕
               </button>
             </div>

             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '0.875rem',
                 fontWeight: 500,
                 color: '#374151',
                 marginBottom: '0.5rem'
               }}>
                 Insurance Type
               </label>
               <select
                 value={insuranceType}
                 onChange={(e) => setInsuranceType(e.target.value as any)}
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   background: 'white'
                 }}
               >
                 <option value="VEHICLE">Vehicle Insurance</option>
                 <option value="HEALTH">Health Insurance</option>
                 <option value="HOME">Home Insurance</option>
               </select>
             </div>

             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '0.875rem',
                 fontWeight: 500,
                 color: '#374151',
                 marginBottom: '0.5rem'
               }}>
                 Select Agent
               </label>
               <select
                 value={selectedAgentId}
                 onChange={(e) => setSelectedAgentId(e.target.value)}
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   background: 'white'
                 }}
               >
                 <option value="">Select an agent...</option>
                 {agents.map((agent) => (
                   <option key={agent.id} value={agent.id}>
                     {agent.firstName} {agent.lastName} - {agent.email}
                   </option>
                 ))}
               </select>
             </div>

             {/* Coverage Selection */}
             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '0.875rem',
                 fontWeight: 500,
                 color: '#374151',
                 marginBottom: '0.5rem'
               }}>
                 Select Coverages
               </label>
               {coveragesLoading ? (
                 <div style={{
                   padding: '1rem',
                   textAlign: 'center',
                   color: '#6b7280',
                   fontSize: '0.875rem'
                 }}>
                   Loading coverages...
                 </div>
               ) : coverages.length === 0 ? (
                 <div style={{
                   padding: '1rem',
                   textAlign: 'center',
                   color: '#6b7280',
                   fontSize: '0.875rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   background: '#f9fafb'
                 }}>
                   No coverages available for this insurance type
                 </div>
               ) : (
                 <div style={{
                   maxHeight: '200px',
                   overflowY: 'auto',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   background: 'white'
                 }}>
                   {coverages.map((coverage) => (
                     <div
                       key={coverage.id}
                       onClick={() => handleCoverageToggle(coverage.id)}
                       style={{
                         padding: '0.75rem',
                         borderBottom: '1px solid #f3f4f6',
                         cursor: 'pointer',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '0.75rem',
                         backgroundColor: selectedCoverages.includes(coverage.id) ? '#f0f9ff' : 'transparent',
                         transition: 'background-color 0.2s'
                       }}
                     >
                       <input
                         type="checkbox"
                         checked={selectedCoverages.includes(coverage.id)}
                         onChange={(e) => {
                           e.stopPropagation(); // Prevent the div's onClick from firing
                           handleCoverageToggle(coverage.id);
                         }}
                         style={{
                           width: '1rem',
                           height: '1rem',
                           cursor: 'pointer'
                         }}
                       />
                       <div style={{ flex: 1 }}>
                         <div style={{
                           fontSize: '0.875rem',
                           fontWeight: 500,
                           color: '#1e293b',
                           marginBottom: '0.25rem'
                         }}>
                           {coverage.name}
                         </div>
                         <div style={{
                           fontSize: '0.75rem',
                           color: '#6b7280',
                           marginBottom: '0.25rem'
                         }}>
                           {coverage.description}
                         </div>
                         <div style={{
                           fontSize: '0.75rem',
                           fontWeight: 500,
                           color: '#059669'
                         }}>
                           €{coverage.basePrice}
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
               {selectedCoverages.length > 0 && (
                 <div style={{
                   marginTop: '0.5rem',
                   fontSize: '0.75rem',
                   color: '#6b7280'
                 }}>
                   Selected: {selectedCoverages.length} coverage(s)
                 </div>
               )}
             </div>

             {/* Dynamic Fields Based on Insurance Type */}
             {insuranceType === 'VEHICLE' && (
               <div style={{ marginBottom: '1.5rem' }}>
                 <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
                   Vehicle Information
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Make
                     </label>
                     <input
                       type="text"
                       value={vehicleData.make}
                       onChange={(e) => setVehicleData({ ...vehicleData, make: e.target.value })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Model
                     </label>
                     <input
                       type="text"
                       value={vehicleData.model}
                       onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Year
                     </label>
                     <input
                       type="text"
                       value={vehicleData.year}
                       onChange={(e) => setVehicleData({ ...vehicleData, year: Number(e.target.value) })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Plate Number
                     </label>
                     <input
                       type="text"
                       value={vehicleData.plateNumber}
                       onChange={(e) => setVehicleData({ ...vehicleData, plateNumber: e.target.value })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       VIN
                     </label>
                     <input
                       type="text"
                       value={vehicleData.vin}
                       onChange={(e) => setVehicleData({ ...vehicleData, vin: e.target.value })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Engine Number
                     </label>
                     <input
                       type="text"
                       value={vehicleData.engineNumber}
                       onChange={(e) => setVehicleData({ ...vehicleData, engineNumber: e.target.value })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Fuel Type
                     </label>
                     <select
                       value={vehicleData.fuelType}
                       onChange={(e) => setVehicleData({ ...vehicleData, fuelType: e.target.value as any })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     >
                       <option value="PETROL">Petrol</option>
                       <option value="DIESEL">Diesel</option>
                       <option value="ELECTRIC">Electric</option>
                       <option value="HYBRID">Hybrid</option>
                       <option value="GAS">Gas</option>
                     </select>
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Gear Type
                     </label>
                     <select
                       value={vehicleData.gearType}
                       onChange={(e) => setVehicleData({ ...vehicleData, gearType: e.target.value as any })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     >
                       <option value="MANUAL">Manual</option>
                       <option value="AUTOMATIC">Automatic</option>
                       <option value="SEMI_AUTOMATIC">Semi Automatic</option>
                     </select>
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Usage Type
                     </label>
                     <select
                       value={vehicleData.usageType}
                       onChange={(e) => setVehicleData({ ...vehicleData, usageType: e.target.value as any })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     >
                       <option value="PERSONAL">Personal</option>
                       <option value="COMMERCIAL">Commercial</option>
                       <option value="BUSINESS">Business</option>
                       <option value="RENTAL">Rental</option>
                     </select>
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Kilometers
                     </label>
                     <input
                       type="text"
                       value={vehicleData.kilometers}
                       onChange={(e) => setVehicleData({ ...vehicleData, kilometers: Number(e.target.value) })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                 </div>
               </div>
             )}

             {insuranceType === 'HEALTH' && (
               <div style={{ marginBottom: '1.5rem' }}>
                 <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
                   Health Information
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Date of Birth
                     </label>
                     <input
                       type="date"
                       value={healthData.dateOfBirth}
                       onChange={(e) => setHealthData({ ...healthData, dateOfBirth: e.target.value })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Gender
                     </label>
                     <select
                       value={healthData.gender}
                       onChange={(e) => setHealthData({ ...healthData, gender: e.target.value })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     >
                       <option value="">Select Gender</option>
                       <option value="MALE">Male</option>
                       <option value="FEMALE">Female</option>
                       <option value="OTHER">Other</option>
                     </select>
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Height (cm)
                     </label>
                     <input
                       type="text"
                       value={healthData.height}
                       onChange={(e) => setHealthData({ ...healthData, height: Number(e.target.value) })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Weight (kg)
                     </label>
                     <input
                       type="text"
                       value={healthData.weight}
                       onChange={(e) => setHealthData({ ...healthData, weight: Number(e.target.value) })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Blood Type
                     </label>
                     <select
                       value={healthData.bloodType}
                       onChange={(e) => setHealthData({ ...healthData, bloodType: e.target.value })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     >
                       <option value="">Select Blood Type</option>
                       <option value="A+">A+</option>
                       <option value="A-">A-</option>
                       <option value="B+">B+</option>
                       <option value="B-">B-</option>
                       <option value="AB+">AB+</option>
                       <option value="AB-">AB-</option>
                       <option value="O+">O+</option>
                       <option value="O-">O-</option>
                     </select>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <input
                       type="checkbox"
                       checked={healthData.smoker}
                       onChange={(e) => setHealthData({ ...healthData, smoker: e.target.checked })}
                       style={{ width: '1rem', height: '1rem' }}
                     />
                     <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                       Smoker
                     </label>
                   </div>
                 </div>
                 <div style={{ marginTop: '1rem' }}>
                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                     Medical History
                   </label>
                   <textarea
                     value={healthData.medicalHistory}
                     onChange={(e) => setHealthData({ ...healthData, medicalHistory: e.target.value })}
                     placeholder="Describe your medical history..."
                     style={{
                       width: '100%',
                       padding: '0.5rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '6px',
                       fontSize: '0.875rem',
                       minHeight: '60px',
                       resize: 'vertical'
                     }}
                   />
                 </div>
               </div>
             )}

             {insuranceType === 'HOME' && (
               <div style={{ marginBottom: '1.5rem' }}>
                 <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
                   Home Information
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Address
                     </label>
                     <input
                       type="text"
                       value={homeData.address}
                       onChange={(e) => setHomeData({ ...homeData, address: e.target.value })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Building Age (years)
                     </label>
                     <input
                       type="text"
                       value={homeData.buildingAge}
                       onChange={(e) => setHomeData({ ...homeData, buildingAge: Number(e.target.value) })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Square Meters
                     </label>
                     <input
                       type="text"
                       value={homeData.squareMeters}
                       onChange={(e) => setHomeData({ ...homeData, squareMeters: Number(e.target.value) })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Floor Number
                     </label>
                     <input
                       type="text"
                       value={homeData.floorNumber}
                       onChange={(e) => setHomeData({ ...homeData, floorNumber: Number(e.target.value) })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}>
                       Total Floors
                     </label>
                     <input
                       type="text"
                       value={homeData.totalFloors}
                       onChange={(e) => setHomeData({ ...homeData, totalFloors: Number(e.target.value) })}
                       style={{
                         width: '100%',
                         padding: '0.5rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '6px',
                         fontSize: '0.875rem'
                       }}
                     />
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <input
                       type="checkbox"
                       checked={homeData.earthquakeResistance}
                       onChange={(e) => setHomeData({ ...homeData, earthquakeResistance: e.target.checked })}
                       style={{ width: '1rem', height: '1rem' }}
                     />
                     <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                       Earthquake Resistant
                     </label>
                   </div>
                 </div>
               </div>
             )}

             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '0.875rem',
                 fontWeight: 500,
                 color: '#374151',
                 marginBottom: '0.5rem'
               }}>
                 Note (Optional)
               </label>
               <textarea
                 value={note}
                 onChange={(e) => setNote(e.target.value)}
                 placeholder="Add any additional information..."
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   minHeight: '100px',
                   resize: 'vertical'
                 }}
               />
             </div>

             <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
               <button
                 onClick={() => setShowOfferForm(false)}
                 style={{
                   padding: '0.75rem 1.5rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   background: 'white',
                   color: '#374151',
                   fontSize: '0.875rem',
                   fontWeight: 500,
                   cursor: 'pointer'
                 }}
               >
                 Cancel
               </button>
               <button
                 onClick={handleCreateOffer}
                 style={{
                   padding: '0.75rem 1.5rem',
                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                   color: 'white',
                   border: 'none',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   fontWeight: 500,
                   cursor: 'pointer'
                 }}
               >
                 Request Offer
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Claim Form Modal */}
       {showClaimForm && (
         <div style={{
           position: 'fixed',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           background: 'rgba(0, 0, 0, 0.5)',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           zIndex: 1000
         }}>
           <div style={{
             background: 'white',
             borderRadius: '16px',
             padding: '2rem',
             width: '90%',
             maxWidth: '500px',
             boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
           }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h2 style={{
                 fontSize: '1.5rem',
                 fontWeight: 700,
                 color: '#1e293b',
                 margin: 0
               }}>
                 File New Claim
               </h2>
               <button
                 onClick={() => setShowClaimForm(false)}
                 style={{
                   background: 'none',
                   border: 'none',
                   fontSize: '1.5rem',
                   cursor: 'pointer',
                   color: '#64748b'
                 }}
               >
                 ✕
               </button>
             </div>

             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '0.875rem',
                 fontWeight: 500,
                 color: '#374151',
                 marginBottom: '0.5rem'
               }}>
                 Select Policy
               </label>
               <select
                 value={selectedPolicyId || ''}
                 onChange={(e) => setSelectedPolicyId(Number(e.target.value))}
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   background: 'white'
                 }}
               >
                 <option value="">Select a policy...</option>
                 {policies.map((policy) => (
                   <option key={policy.id} value={policy.id}>
                     {policy.policyNumber} - {policy.insuranceType}
                   </option>
                 ))}
               </select>
             </div>

             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '0.875rem',
                 fontWeight: 500,
                 color: '#374151',
                 marginBottom: '0.5rem'
               }}>
                 Description
               </label>
               <textarea
                 value={claimFormData.description}
                 onChange={(e) => setClaimFormData({ ...claimFormData, description: e.target.value })}
                 placeholder="Describe your claim..."
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   minHeight: '100px',
                   resize: 'vertical'
                 }}
               />
             </div>

             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '0.875rem',
                 fontWeight: 500,
                 color: '#374151',
                 marginBottom: '0.5rem'
               }}>
                 Amount (€)
               </label>
               <input
                 type="text"
                 value={claimFormData.amount}
                 onChange={(e) => setClaimFormData({ ...claimFormData, amount: Number(e.target.value) })}
                 placeholder="0.00"
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   fontSize: '0.875rem'
                 }}
               />
             </div>

             <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
               <button
                 onClick={() => setShowClaimForm(false)}
                 style={{
                   padding: '0.75rem 1.5rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   background: 'white',
                   color: '#374151',
                   fontSize: '0.875rem',
                   fontWeight: 500,
                   cursor: 'pointer'
                 }}
               >
                 Cancel
               </button>
               <button
                 onClick={handleCreateClaim}
                 style={{
                   padding: '0.75rem 1.5rem',
                   background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                   color: 'white',
                   border: 'none',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   fontWeight: 500,
                   cursor: 'pointer'
                 }}
               >
                 File Claim
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Payment Form Modal */}
       {showPaymentForm && (
         <div style={{
           position: 'fixed',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           background: 'rgba(0, 0, 0, 0.5)',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           zIndex: 1000
         }}>
           <div style={{
             background: 'white',
             borderRadius: '20px',
             padding: '2rem',
             width: '95%',
             maxWidth: '600px',
             boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
             position: 'relative',
             overflow: 'hidden'
           }}>
             {/* Background Pattern */}
             <div style={{
               position: 'absolute',
               top: 0,
               left: 0,
               right: 0,
               height: '120px',
               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
               borderRadius: '20px 20px 0 0'
             }}></div>
             
             {/* Header */}
             <div style={{ position: 'relative', zIndex: 1, marginBottom: '2rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                 <h2 style={{
                   fontSize: '2rem',
                   fontWeight: 700,
                   color: 'white',
                   margin: 0,
                   textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                 }}>
                   💳 Secure Payment
                 </h2>
                 <button
                   onClick={() => setShowPaymentForm(false)}
                   style={{
                     background: 'rgba(255, 255, 255, 0.2)',
                     border: 'none',
                     fontSize: '1.5rem',
                     cursor: 'pointer',
                     color: 'white',
                     width: '40px',
                     height: '40px',
                     borderRadius: '50%',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     transition: 'all 0.2s'
                   }}
                   onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                   onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                 >
                   ✕
                 </button>
               </div>
               <p style={{
                 color: 'rgba(255, 255, 255, 0.9)',
                 fontSize: '1rem',
                 margin: 0
               }}>
                 Complete your insurance payment securely
               </p>
             </div>

             {/* Policy Selection */}
             <div style={{ marginBottom: '2rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '1rem',
                 fontWeight: 600,
                 color: '#374151',
                 marginBottom: '0.75rem'
               }}>
                 📋 Policy Information
               </label>
               {selectedPolicyId ? (
                 <div style={{
                   padding: '1rem',
                   border: '2px solid #e5e7eb',
                   borderRadius: '12px',
                   background: '#f8fafc'
                 }}>
                   <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>
                     {policies.find(p => p.id === selectedPolicyId)?.policyNumber || 'Unknown Policy'}
                   </div>
                   <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                     {policies.find(p => p.id === selectedPolicyId)?.insuranceType || 'Unknown Type'} - €{policies.find(p => p.id === selectedPolicyId)?.premium || '0.00'}
                   </div>
                 </div>
               ) : (
                 <select
                   value={selectedPolicyId || ''}
                   onChange={(e) => setSelectedPolicyId(Number(e.target.value))}
                   style={{
                     width: '100%',
                     padding: '1rem',
                     border: '2px solid #e5e7eb',
                     borderRadius: '12px',
                     fontSize: '1rem',
                     background: 'white',
                     transition: 'all 0.2s',
                     cursor: 'pointer'
                   }}
                   onFocus={(e) => e.target.style.borderColor = '#667eea'}
                   onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                 >
                   <option value="">Choose a policy to pay for...</option>
                   {policies.map((policy) => (
                     <option key={policy.id} value={policy.id}>
                       {policy.policyNumber} - {policy.insuranceType} - €{policy.premium}
                     </option>
                   ))}
                 </select>
               )}
             </div>

             {/* Amount Input - Read Only */}
             <div style={{ marginBottom: '2rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '1rem',
                 fontWeight: 600,
                 color: '#374151',
                 marginBottom: '0.75rem'
               }}>
                 💰 Payment Amount (€)
               </label>
               <input
                 type="text"
                                    value={selectedPolicyId ? `€${policies.find(p => p.id === selectedPolicyId)?.premium || '0.00'}` : '€0.00'}
                 readOnly
                 style={{
                   width: '100%',
                   padding: '1rem',
                   border: '2px solid #e5e7eb',
                   borderRadius: '12px',
                   fontSize: '1rem',
                   background: '#f8fafc',
                   color: '#059669',
                   fontWeight: 600,
                   cursor: 'not-allowed'
                 }}
               />
               <div style={{
                 marginTop: '0.5rem',
                 fontSize: '0.875rem',
                 color: '#64748b'
               }}>
                 This amount is automatically set based on your selected policy
               </div>
             </div>

             {/* Credit Card Form */}
             <div style={{ marginBottom: '2rem' }}>
               <h3 style={{
                 fontSize: '1.25rem',
                 fontWeight: 600,
                 color: '#1e293b',
                 marginBottom: '1.5rem',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '0.5rem'
               }}>
                 🏦 Credit Card Details
               </h3>
               
               {/* Card Number */}
               <div style={{ marginBottom: '1.5rem' }}>
                 <label style={{
                   display: 'block',
                   fontSize: '0.875rem',
                   fontWeight: 500,
                   color: '#374151',
                   marginBottom: '0.5rem'
                 }}>
                   Card Number
                 </label>
                 <div style={{
                   position: 'relative',
                   display: 'flex',
                   alignItems: 'center'
                 }}>
                   <input
                     type="text"
                     value={paymentFormData.cardNumber}
                     onChange={(e) => {
                       const value = e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                       setPaymentFormData({ ...paymentFormData, cardNumber: value });
                     }}
                     placeholder="1234 5678 9012 3456"
                     maxLength={19}
                     style={{
                       width: '100%',
                       padding: '1rem',
                       paddingLeft: '3rem',
                       border: '2px solid #e5e7eb',
                       borderRadius: '12px',
                       fontSize: '1rem',
                       background: 'white',
                       transition: 'all 0.2s'
                     }}
                     onFocus={(e) => e.target.style.borderColor = '#667eea'}
                     onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                   />
                   <div style={{
                     position: 'absolute',
                     left: '1rem',
                     fontSize: '1.25rem'
                   }}>
                     💳
                   </div>
                 </div>
               </div>

               {/* Card Holder & Expiry */}
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                 <div>
                   <label style={{
                     display: 'block',
                     fontSize: '0.875rem',
                     fontWeight: 500,
                     color: '#374151',
                     marginBottom: '0.5rem'
                   }}>
                     Card Holder
                   </label>
                   <input
                     type="text"
                     value={paymentFormData.cardHolder}
                     onChange={(e) => setPaymentFormData({ ...paymentFormData, cardHolder: e.target.value.toUpperCase() })}
                     placeholder="JOHN DOE"
                     style={{
                       width: '100%',
                       padding: '1rem',
                       border: '2px solid #e5e7eb',
                       borderRadius: '12px',
                       fontSize: '1rem',
                       background: 'white',
                       transition: 'all 0.2s'
                     }}
                     onFocus={(e) => e.target.style.borderColor = '#667eea'}
                     onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                   />
                 </div>
                 <div>
                   <label style={{
                     display: 'block',
                     fontSize: '0.875rem',
                     fontWeight: 500,
                     color: '#374151',
                     marginBottom: '0.5rem'
                   }}>
                     Expiry Date
                   </label>
                   <input
                     type="text"
                     value={paymentFormData.expiryDate}
                     onChange={(e) => {
                       const value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
                       setPaymentFormData({ ...paymentFormData, expiryDate: value });
                     }}
                     placeholder="MM/YY"
                     maxLength={5}
                     style={{
                       width: '100%',
                       padding: '1rem',
                       border: '2px solid #e5e7eb',
                       borderRadius: '12px',
                       fontSize: '1rem',
                       background: 'white',
                       transition: 'all 0.2s'
                     }}
                     onFocus={(e) => e.target.style.borderColor = '#667eea'}
                     onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                   />
                 </div>
               </div>

               {/* CVV */}
               <div style={{ marginBottom: '1.5rem' }}>
                 <label style={{
                   display: 'block',
                   fontSize: '0.875rem',
                   fontWeight: 500,
                   color: '#374151',
                   marginBottom: '0.5rem'
                 }}>
                   CVV
                 </label>
                 <input
                   type="text"
                   value={paymentFormData.cvv}
                   onChange={(e) => {
                     const value = e.target.value.replace(/\D/g, '').substring(0, 3);
                     setPaymentFormData({ ...paymentFormData, cvv: value });
                   }}
                   placeholder="123"
                   maxLength={3}
                   style={{
                     width: '100%',
                     padding: '1rem',
                     border: '2px solid #e5e7eb',
                     borderRadius: '12px',
                     fontSize: '1rem',
                     background: 'white',
                     transition: 'all 0.2s'
                   }}
                   onFocus={(e) => e.target.style.borderColor = '#667eea'}
                   onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                 />
               </div>
             </div>

             {/* Security Info */}
             <div style={{
               marginBottom: '2rem',
               padding: '1rem',
               background: '#f0f9ff',
               borderRadius: '12px',
               border: '1px solid #bae6fd'
             }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <span style={{ fontSize: '1.25rem' }}>🔒</span>
                 <span style={{
                   fontSize: '0.875rem',
                   color: '#0369a1',
                   fontWeight: 500
                 }}>
                   Your payment information is encrypted and secure
                 </span>
               </div>
             </div>

             {/* Action Buttons */}
             <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
               <button
                 onClick={() => setShowPaymentForm(false)}
                 style={{
                   padding: '1rem 2rem',
                   border: '2px solid #e5e7eb',
                   borderRadius: '12px',
                   background: 'white',
                   color: '#374151',
                   fontSize: '1rem',
                   fontWeight: 600,
                   cursor: 'pointer',
                   transition: 'all 0.2s'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.borderColor = '#d1d5db';
                   e.currentTarget.style.background = '#f9fafb';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.borderColor = '#e5e7eb';
                   e.currentTarget.style.background = 'white';
                 }}
               >
                 Cancel
               </button>
               <button
                 onClick={handleMakePayment}
                 style={{
                   padding: '1rem 2rem',
                   background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                   color: 'white',
                   border: 'none',
                   borderRadius: '12px',
                   fontSize: '1rem',
                   fontWeight: 600,
                   cursor: 'pointer',
                   transition: 'all 0.2s',
                   boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.transform = 'translateY(-2px)';
                   e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(16, 185, 129, 0.4)';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.transform = 'translateY(0)';
                   e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(16, 185, 129, 0.3)';
                 }}
               >
                 💳 Pay Now
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Document Upload Modal */}
       {showDocumentUpload && (
         <div style={{
           position: 'fixed',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           background: 'rgba(0, 0, 0, 0.5)',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           zIndex: 1000
         }}>
           <div style={{
             background: 'white',
             borderRadius: '16px',
             padding: '2rem',
             width: '90%',
             maxWidth: '500px',
             boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
           }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h2 style={{
                 fontSize: '1.5rem',
                 fontWeight: 700,
                 color: '#1e293b',
                 margin: 0
               }}>
                 Upload Document
               </h2>
               <button
                 onClick={() => setShowDocumentUpload(false)}
                 style={{
                   background: 'none',
                   border: 'none',
                   fontSize: '1.5rem',
                   cursor: 'pointer',
                   color: '#64748b'
                 }}
               >
                 ✕
               </button>
             </div>

             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '0.875rem',
                 fontWeight: 500,
                 color: '#374151',
                 marginBottom: '0.5rem'
               }}>
                 Select Policy
               </label>
               <select
                 value={selectedPolicyId || ''}
                 onChange={(e) => setSelectedPolicyId(Number(e.target.value))}
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   background: 'white'
                 }}
               >
                 <option value="">Select a policy...</option>
                 {policies.map((policy) => (
                   <option key={policy.id} value={policy.id}>
                     {policy.policyNumber} - {policy.insuranceType}
                   </option>
                 ))}
               </select>
             </div>

             <div style={{ marginBottom: '1.5rem' }}>
               <label style={{
                 display: 'block',
                 fontSize: '0.875rem',
                 fontWeight: 500,
                 color: '#374151',
                 marginBottom: '0.5rem'
               }}>
                 Select File
               </label>
               <input
                 type="file"
                 onChange={(e) => setDocumentFormData({ ...documentFormData, file: e.target.files?.[0] || null })}
                 style={{
                   width: '100%',
                   padding: '0.75rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   fontSize: '0.875rem'
                 }}
               />
             </div>

             <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
               <button
                 onClick={() => setShowDocumentUpload(false)}
                 style={{
                   padding: '0.75rem 1.5rem',
                   border: '1px solid #d1d5db',
                   borderRadius: '8px',
                   background: 'white',
                   color: '#374151',
                   fontSize: '0.875rem',
                   fontWeight: 500,
                   cursor: 'pointer'
                 }}
               >
                 Cancel
               </button>
               <button
                 onClick={handleUploadDocument}
                 style={{
                   padding: '0.75rem 1.5rem',
                   background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                   color: 'white',
                   border: 'none',
                   borderRadius: '8px',
                   fontSize: '0.875rem',
                   fontWeight: 500,
                   cursor: 'pointer'
                 }}
               >
                 Upload Document
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Offer Details Modal */}
       {showOfferDetails && selectedOffer && (
         <div style={{
           position: 'fixed',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           background: 'rgba(0, 0, 0, 0.5)',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           zIndex: 1000
         }}>
           <div 
             ref={offerDetailsRef}
             style={{
               background: 'white',
               borderRadius: '20px',
               padding: '2.5rem',
               width: '90%',
               maxWidth: '900px',
               maxHeight: '90vh',
               overflow: 'auto',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
               border: '1px solid #e5e7eb',
               position: 'relative'
             }}
           >
             {/* Header with Close Button */}
             <div style={{ 
               display: 'flex', 
               justifyContent: 'space-between', 
               alignItems: 'center', 
               marginBottom: '2rem',
               paddingBottom: '1rem',
               borderBottom: '2px solid #e5e7eb'
             }}>
               <h2 style={{
                 fontSize: '1.75rem',
                 fontWeight: 700,
                 color: '#1e293b',
                 margin: 0
               }}>
                 📋 Offer Details
               </h2>
               
               {/* Action Buttons */}
               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                 {/* PDF Export Button */}
                 <button
                   data-pdf-export
                   onClick={handleExportToPDF}
                   style={{
                     background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                     color: 'white',
                     border: 'none',
                     borderRadius: '12px',
                     padding: '0.875rem 1.75rem',
                     fontSize: '0.875rem',
                     fontWeight: 700,
                     cursor: 'pointer',
                     transition: 'all 0.3s ease',
                     display: 'flex',
                     alignItems: 'center',
                     gap: '0.75rem',
                     boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.4)',
                     position: 'relative',
                     overflow: 'hidden'
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                     e.currentTarget.style.boxShadow = '0 8px 25px 0 rgba(239, 68, 68, 0.6)';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.transform = 'translateY(0) scale(1)';
                     e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(239, 68, 68, 0.4)';
                   }}
                 >
                   <span style={{ fontSize: '1.1rem' }}>📄</span>
                   Export to PDF
                 </button>
                 
                 {/* Close Button */}
                 <button
                   onClick={() => setShowOfferDetails(false)}
                   style={{
                     background: '#6b7280',
                     color: 'white',
                     border: 'none',
                     borderRadius: '8px',
                     padding: '0.75rem 1.5rem',
                     fontSize: '0.875rem',
                     fontWeight: 600,
                     cursor: 'pointer',
                     transition: 'all 0.2s'
                   }}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                 >
                   ✕ Close
                 </button>
               </div>
             </div>
             
             {/* Offer Summary */}
             <div style={{
               background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
               border: '1px solid #cbd5e1',
               borderRadius: '12px',
               padding: '1.5rem',
               marginBottom: '2rem',
               display: 'grid',
               gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
               gap: '1rem'
             }}>
               <div>
                 <div style={{
                   fontSize: '0.75rem',
                   fontWeight: 600,
                   color: '#64748b',
                   textTransform: 'uppercase',
                   letterSpacing: '0.05em',
                   marginBottom: '0.25rem'
                 }}>
                   Offer Number
                 </div>
                 <div style={{
                   fontSize: '1.125rem',
                   fontWeight: 700,
                   color: '#1e293b',
                   fontFamily: 'monospace'
                 }}>
                   {selectedOffer.offerNumber}
                 </div>
               </div>
               
               <div>
                 <div style={{
                   fontSize: '0.75rem',
                   fontWeight: 600,
                   color: '#64748b',
                   textTransform: 'uppercase',
                   letterSpacing: '0.05em',
                   marginBottom: '0.25rem'
                 }}>
                   Status
                 </div>
                 <div style={{
                   fontSize: '1.125rem',
                   fontWeight: 700,
                   color: selectedOffer.status === 'PENDING' ? '#f59e0b' : 
                          selectedOffer.status === 'APPROVED' ? '#059669' : '#dc2626',
                   background: selectedOffer.status === 'PENDING' ? '#fef3c7' : 
                             selectedOffer.status === 'ACCEPTED' ? '#d1fae5' : '#fee2e2',
                   padding: '0.25rem 0.75rem',
                   borderRadius: '6px',
                   display: 'inline-block'
                 }}>
                   {selectedOffer.status}
                 </div>
               </div>
               
               <div>
                 <div style={{
                   fontSize: '0.75rem',
                   fontWeight: 600,
                   color: '#64748b',
                   textTransform: 'uppercase',
                   letterSpacing: '0.05em',
                   marginBottom: '0.25rem'
                 }}>
                   Total Premium
                 </div>
                 <div style={{
                   fontSize: '1.5rem',
                   fontWeight: 800,
                   color: '#059669',
                   background: '#f0fdf4',
                   padding: '0.5rem 1rem',
                   borderRadius: '8px',
                   border: '2px solid #bbf7d0'
                 }}>
                   €{selectedOffer.totalPremium}
                 </div>
               </div>
               
               <div>
                 <div style={{
                   fontSize: '0.75rem',
                   fontWeight: 600,
                   color: '#64748b',
                   textTransform: 'uppercase',
                   letterSpacing: '0.05em',
                   marginBottom: '0.25rem'
                 }}>
                   Insurance Type
                 </div>
                 <div style={{
                   fontSize: '1.125rem',
                   fontWeight: 700,
                   color: '#1e293b',
                   background: '#f1f5f9',
                   padding: '0.5rem 1rem',
                   borderRadius: '6px',
                   border: '1px solid #e2e8f0'
                 }}>
                   {selectedOffer.insuranceType ? selectedOffer.insuranceType.charAt(0).toUpperCase() + selectedOffer.insuranceType.slice(1).toLowerCase() : 'N/A'}
                 </div>
               </div>
             </div>

                            {/* Offer Details Section */}
               <div style={{ marginBottom: '2rem' }}>
                 <h3 style={{
                   fontSize: '1.25rem',
                   fontWeight: 600,
                   color: '#1e293b',
                   marginBottom: '1rem'
                 }}>
                   📋 Offer Information
                 </h3>
                 <div style={{
                   display: 'grid',
                   gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                   gap: '1.5rem',
                   marginBottom: '1.5rem'
                 }}>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Offer Number</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb',
                       fontWeight: 600,
                       color: '#1e293b',
                       fontFamily: 'monospace',
                       letterSpacing: '0.05em'
                     }}>
                       {selectedOffer.offerNumber}
                     </div>
                     <div style={{
                       marginTop: '0.5rem',
                       fontSize: '0.75rem',
                       color: '#6b7280',
                       textAlign: 'center'
                     }}>
                       Unique Identifier
                     </div>
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Status</label>
                     <div style={{
                       padding: '0.75rem',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       textAlign: 'center',
                       background: selectedOffer.status === "PENDING" ? '#fef3c7' : selectedOffer.status === "APPROVED" ? '#dcfce7' : selectedOffer.status === "REJECTED" ? '#fee2e2' : '#e0e7ff',
                       color: selectedOffer.status === "PENDING" ? '#92400e' : selectedOffer.status === "APPROVED" ? '#166534' : selectedOffer.status === "REJECTED" ? '#991b1b' : '#3730a3'
                     }}>
                       {selectedOffer.status}
                     </div>
                     {selectedOffer.status === "PENDING" && (
                       <div style={{
                         marginTop: '0.5rem',
                         fontSize: '0.75rem',
                         color: '#6b7280',
                         textAlign: 'center'
                       }}>
                         Waiting for agent review
                       </div>
                     )}
                     {selectedOffer.status === "APPROVED" && (
                       <div style={{
                         marginTop: '0.5rem',
                         fontSize: '0.75rem',
                         color: '#059669',
                         textAlign: 'center',
                         fontWeight: 500
                       }}>
                         ✓ Offer approved
                       </div>
                     )}
                     {selectedOffer.status === "REJECTED" && (
                       <div style={{
                         marginTop: '0.5rem',
                         fontSize: '0.75rem',
                         color: '#dc2626',
                         textAlign: 'center',
                         fontWeight: 500
                       }}>
                         ✗ Offer rejected
                       </div>
                     )}
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Insurance Type</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb',
                       fontWeight: 600,
                       color: '#1e293b'
                     }}>
                       {selectedOffer.insuranceType ? selectedOffer.insuranceType.charAt(0).toUpperCase() + selectedOffer.insuranceType.slice(1).toLowerCase() : 'N/A'}
                     </div>
                     {selectedOffer.insuranceType && (
                       <div style={{
                         marginTop: '0.5rem',
                         fontSize: '0.75rem',
                         color: '#6b7280',
                         textAlign: 'center'
                       }}>
                         {selectedOffer.insuranceType === 'VEHICLE' && '🚗 Vehicle Insurance'}
                         {selectedOffer.insuranceType === 'HEALTH' && '🏥 Health Insurance'}
                         {selectedOffer.insuranceType === 'HOME' && '🏠 Home Insurance'}
                       </div>
                     )}
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Total Premium</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb',
                       fontWeight: 600,
                       color: '#059669'
                     }}>
                       €{selectedOffer.totalPremium}
                     </div>
                     <div style={{
                       marginTop: '0.5rem',
                       fontSize: '0.75rem',
                       color: '#059669',
                       textAlign: 'center',
                       fontWeight: 500,
                       background: '#f0fdf4',
                       padding: '0.25rem 0.5rem',
                       borderRadius: '4px',
                       border: '1px solid #bbf7d0'
                     }}>
                       Total Amount
                     </div>
                   </div>
                   {selectedOffer.agent && selectedOffer.agent.user && (
                     <div>
                       <label style={{
                         display: 'block',
                         fontSize: '0.875rem',
                         fontWeight: 500,
                         color: '#374151',
                         marginBottom: '0.25rem'
                       }}>Agent</label>
                       <div style={{
                         padding: '0.75rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '8px',
                         fontSize: '0.875rem',
                         background: '#f9fafb',
                         fontWeight: 600,
                         color: '#1e293b'
                       }}>
                         {selectedOffer.agent.user.firstName} {selectedOffer.agent.user.lastName}
                       </div>
                       <div style={{
                         marginTop: '0.5rem',
                         fontSize: '0.75rem',
                         color: '#6b7280',
                         textAlign: 'center'
                       }}>
                         Assigned Agent
                       </div>
                     </div>
                   )}
                   {selectedOffer.policyId && (
                     <div>
                       <label style={{
                         display: 'block',
                         fontSize: '0.875rem',
                         fontWeight: 500,
                         color: '#374151',
                         marginBottom: '0.25rem'
                       }}>Policy ID</label>
                       <div style={{
                         padding: '0.75rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '8px',
                         fontSize: '0.875rem',
                         background: '#f9fafb',
                         fontWeight: 600,
                         color: '#1e293b',
                         fontFamily: 'monospace'
                       }}>
                         {selectedOffer.policyId}
                       </div>
                       <div style={{
                         marginTop: '0.5rem',
                         fontSize: '0.75rem',
                         color: '#059669',
                         textAlign: 'center',
                         fontWeight: 500,
                         background: '#f0fdf4',
                         padding: '0.25rem 0.5rem',
                         borderRadius: '4px',
                         border: '1px solid #bbf7d0'
                       }}>
                         ✓ Converted to Policy
                       </div>
                     </div>
                   )}
                 </div>

               {/* Customer Information */}
               {selectedOffer.customer && (
                 <div style={{ marginBottom: '1.5rem' }}>
                   <h3 style={{
                     fontSize: '1.25rem',
                     fontWeight: 600,
                     color: '#1e293b',
                     marginBottom: '1rem'
                   }}>
                     Customer Information
                   </h3>
                   <div style={{
                     display: 'grid',
                     gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                     gap: '1.5rem'
                   }}>
                     <div>
                   <label style={{
                     display: 'block',
                     fontSize: '0.875rem',
                     fontWeight: 500,
                     color: '#374151',
                     marginBottom: '0.25rem'
                       }}>Customer Name</label>
                   <div style={{
                     padding: '0.75rem',
                     border: '1px solid #d1d5db',
                     borderRadius: '8px',
                     fontSize: '0.875rem',
                     background: '#f9fafb'
                   }}>
                         {selectedOffer.customer.user?.firstName} {selectedOffer.customer.user?.lastName}
                       </div>
                     </div>
                     <div>
                       <label style={{
                         display: 'block',
                         fontSize: '0.875rem',
                         fontWeight: 500,
                         color: '#374151',
                         marginBottom: '0.25rem'
                       }}>Customer Type</label>
                       <div style={{
                         padding: '0.75rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '8px',
                         fontSize: '0.875rem',
                         background: '#f9fafb'
                       }}>
                         {selectedOffer.customer.customerType ? selectedOffer.customer.customerType.charAt(0).toUpperCase() + selectedOffer.customer.customerType.slice(1).toLowerCase() : 'N/A'}
                       </div>
                     </div>
                     <div>
                       <label style={{
                         display: 'block',
                         fontSize: '0.875rem',
                         fontWeight: 500,
                         color: '#374151',
                         marginBottom: '0.25rem'
                       }}>Email</label>
                       <div style={{
                         padding: '0.75rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '8px',
                         fontSize: '0.875rem',
                         background: '#f9fafb'
                       }}>
                         {selectedOffer.customer.user?.email || 'N/A'}
                       </div>
                     </div>
                     <div>
                       <label style={{
                         display: 'block',
                         fontSize: '0.875rem',
                         fontWeight: 500,
                         color: '#374151',
                         marginBottom: '0.25rem'
                       }}>Address</label>
                       <div style={{
                         padding: '0.75rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '8px',
                         fontSize: '0.875rem',
                         background: '#f9fafb'
                       }}>
                         {selectedOffer.customer.address || 'N/A'}
                       </div>
                     </div>
                   </div>
                 </div>
               )}

               {selectedOffer.note && (
               <div style={{ marginBottom: '1.5rem' }}>
                 <h3 style={{
                   fontSize: '1.25rem',
                   fontWeight: 600,
                   color: '#1e293b',
                   marginBottom: '1rem'
                   }}>
                     Additional Notes
                   </h3>
                   <div style={{
                     padding: '1.5rem',
                     border: '1px solid #d1d5db',
                     borderRadius: '8px',
                     fontSize: '0.875rem',
                     background: '#f9fafb',
                     lineHeight: '1.6',
                     color: '#374151',
                     boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                   }}>
                     {selectedOffer.note}
                   </div>
                 </div>
               )}

               <div style={{ marginBottom: '1.5rem' }}>
                 <div style={{
                   display: 'flex',
                   justifyContent: 'space-between',
                   alignItems: 'center',
                   marginBottom: '1rem'
                 }}>
                   <h3 style={{
                     fontSize: '1.25rem',
                     fontWeight: 600,
                     color: '#1e293b',
                     margin: 0
                 }}>
                   Selected Coverages
                 </h3>
                   <div style={{
                     display: 'flex',
                     gap: '1rem',
                     alignItems: 'center'
                   }}>
                     <span style={{
                       fontSize: '0.875rem',
                       color: '#6b7280',
                       fontWeight: 500,
                       background: '#f8fafc',
                       padding: '0.25rem 0.75rem',
                       borderRadius: '6px',
                       border: '1px solid #e2e8f0'
                     }}>
                       Total: {selectedOffer.coverages ? selectedOffer.coverages.length : 0} coverage(s)
                     </span>
                     <span style={{
                       fontSize: '0.875rem',
                       color: '#059669',
                       fontWeight: 600,
                       background: '#f0fdf4',
                       padding: '0.25rem 0.75rem',
                       borderRadius: '6px',
                       border: '1px solid #bbf7d0'
                     }}>
                       Total Premium: €{selectedOffer.totalPremium}
                     </span>
                   </div>
                 </div>
                 {selectedOffer.coverages && selectedOffer.coverages.length > 0 ? (
                   <div style={{
                     display: 'grid',
                     gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                     gap: '1.5rem'
                   }}>
                     {selectedOffer.coverages.map((coverage: any) => (
                       <div key={coverage.id} style={{
                         background: '#f8fafc',
                         border: '1px solid #e2e8f0',
                         borderRadius: '8px',
                         padding: '1rem',
                         boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                         transition: 'all 0.2s ease-in-out'
                       }}>
                         <div style={{
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'center',
                           marginBottom: '0.5rem'
                         }}>
                           <h4 style={{
                             fontSize: '1rem',
                             fontWeight: 600,
                             color: '#1e293b',
                             margin: 0,
                             background: '#f8fafc',
                             padding: '0.25rem 0.5rem',
                             borderRadius: '4px',
                             border: '1px solid #e2e8f0'
                           }}>
                             {coverage.name}
                           </h4>
                           <span style={{
                             fontSize: '0.875rem',
                             fontWeight: 500,
                             color: '#059669',
                             background: '#f0fdf4',
                             padding: '0.25rem 0.5rem',
                             borderRadius: '4px',
                             border: '1px solid #bbf7d0'
                           }}>
                             €{coverage.basePrice}
                           </span>
                         </div>
                         <div style={{ marginBottom: '0.5rem' }}>
                           <span style={{
                             fontSize: '0.75rem',
                             fontWeight: 500,
                             color: '#6b7280',
                             background: '#e5e7eb',
                             padding: '0.25rem 0.5rem',
                             borderRadius: '4px',
                             fontFamily: 'monospace',
                             letterSpacing: '0.05em'
                           }}>
                             {coverage.code}
                           </span>
                         </div>
                         <p style={{
                           fontSize: '0.875rem',
                           color: '#64748b',
                           margin: 0,
                           lineHeight: '1.4',
                           background: '#f8fafc',
                           padding: '0.5rem',
                           borderRadius: '4px',
                           border: '1px solid #e2e8f0'
                         }}>
                           {coverage.description}
                         </p>
                         <div style={{
                           marginTop: '0.75rem',
                           paddingTop: '0.75rem',
                           borderTop: '1px solid #e5e7eb',
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'center'
                         }}>
                           <span style={{
                             fontSize: '0.75rem',
                             color: '#6b7280',
                             background: '#f8fafc',
                             padding: '0.25rem 0.5rem',
                             borderRadius: '4px',
                             border: '1px solid #e2e8f0'
                           }}>
                             Type: {coverage.insuranceType ? coverage.insuranceType.charAt(0).toUpperCase() + coverage.insuranceType.slice(1).toLowerCase() : 'N/A'}
                           </span>
                           <span style={{
                             fontSize: '0.75rem',
                             color: coverage.active ? '#059669' : '#dc2626',
                             fontWeight: 500,
                             background: coverage.active ? '#f0fdf4' : '#fef2f2',
                             padding: '0.25rem 0.5rem',
                             borderRadius: '4px',
                             border: `1px solid ${coverage.active ? '#bbf7d0' : '#fecaca'}`
                           }}>
                             {coverage.active ? '✓ Active' : '✗ Inactive'}
                           </span>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div style={{
                     textAlign: 'center',
                     padding: '2rem',
                     background: '#f8fafc',
                     borderRadius: '8px',
                     border: '1px dashed #cbd5e1'
                   }}>
                     <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                     <p style={{
                       color: '#64748b',
                       margin: 0,
                       fontSize: '1rem',
                       fontWeight: 500
                     }}>
                                               No coverages selected
                     </p>
                     <p style={{
                       color: '#94a3b8',
                       margin: '0.5rem 0 0 0',
                       fontSize: '0.875rem'
                     }}>
                                               Please select coverages when creating your offer
                     </p>
                   </div>
                 )}
               </div>

               {/* Additional Offer Information */}
               <div style={{ marginBottom: '1.5rem' }}>
                 <h3 style={{
                   fontSize: '1.25rem',
                   fontWeight: 600,
                   color: '#1e293b',
                   marginBottom: '1rem'
                 }}>
                   Offer Timeline
                 </h3>
                                    <div style={{
                     display: 'grid',
                     gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                     gap: '1.5rem'
                   }}>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Created Date</label>
                     <div style={{
                       padding: '0.75rem',
                       border: '1px solid #d1d5db',
                       borderRadius: '8px',
                       fontSize: '0.875rem',
                       background: '#f9fafb'
                     }}>
                                               {selectedOffer.createdAt ? new Date(selectedOffer.createdAt).toLocaleDateString('en-US', {
                         year: 'numeric',
                         month: 'long',
                         day: 'numeric',
                         hour: '2-digit',
                         minute: '2-digit'
                       }) : 'N/A'}
                     </div>
                   </div>
                   {selectedOffer.updatedAt && selectedOffer.updatedAt !== selectedOffer.createdAt && (
                     <div>
                       <label style={{
                         display: 'block',
                         fontSize: '0.875rem',
                         fontWeight: 500,
                         color: '#374151',
                         marginBottom: '0.25rem'
                       }}>Last Updated</label>
                       <div style={{
                         padding: '0.75rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '8px',
                         fontSize: '0.875rem',
                         background: '#f9fafb'
                       }}>
                                                   {new Date(selectedOffer.updatedAt).toLocaleDateString('en-US', {
                           year: 'numeric',
                           month: 'long',
                           day: 'numeric',
                           hour: '2-digit',
                           minute: '2-digit'
                         })}
                       </div>
                     </div>
                   )}
                   {selectedOffer.acceptedAt && (
                     <div>
                       <label style={{
                         display: 'block',
                         fontSize: '0.875rem',
                         fontWeight: 500,
                         color: '#374151',
                         marginBottom: '0.25rem'
                       }}>Accepted Date</label>
                       <div style={{
                         padding: '0.75rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '8px',
                         fontSize: '0.875rem',
                         background: '#f9fafb',
                         color: '#059669',
                         fontWeight: 600
                       }}>
                         {new Date(selectedOffer.acceptedAt).toLocaleDateString('tr-TR', {
                           year: 'numeric',
                           month: 'long',
                           day: 'numeric',
                           hour: '2-digit',
                           minute: '2-digit'
                         })}
                       </div>
                     </div>
                   )}
                   {selectedOffer.convertedAt && (
                     <div>
                       <label style={{
                         display: 'block',
                         fontSize: '0.875rem',
                         fontWeight: 500,
                         color: '#374151',
                         marginBottom: '0.25rem'
                       }}>Converted to Policy</label>
                       <div style={{
                         padding: '0.75rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '8px',
                         fontSize: '0.875rem',
                         background: '#f9fafb',
                         color: '#059669',
                         fontWeight: 600
                       }}>
                         {new Date(selectedOffer.convertedAt).toLocaleDateString('tr-TR', {
                           year: 'numeric',
                           month: 'long',
                           day: 'numeric',
                           hour: '2-digit',
                           minute: '2-digit'
                         })}
                       </div>
                     </div>
                   )}
                 </div>
               </div>

               <div style={{
                 display: 'flex',
                 justifyContent: 'space-between',
                 alignItems: 'center',
                 paddingTop: '1.5rem',
                 borderTop: '1px solid #e5e7eb'
               }}>
                 <div style={{
                   fontSize: '0.875rem',
                   color: '#64748b'
                 }}>
                   Offer ID: {selectedOffer.id}
                 </div>
                 <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                   {/* Success Display */}
                   {offerActionSuccess && (
                     <div style={{
                       width: '100%',
                       background: '#f0fdf4',
                       border: '1px solid #bbf7d0',
                       borderRadius: '8px',
                       padding: '1rem',
                       marginBottom: '1rem',
                       color: '#059669',
                       fontSize: '0.875rem',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '0.5rem'
                     }}>
                       <span style={{ fontSize: '1.25rem' }}>✅</span>
                       {offerActionSuccess}
                     </div>
                   )}
                   
                   {/* Error Display */}
                   {offerActionError && (
                     <div style={{
                       width: '100%',
                       background: '#fef2f2',
                       border: '1px solid #fecaca',
                       borderRadius: '8px',
                       padding: '1rem',
                       marginBottom: '1rem',
                       color: '#dc2626',
                       fontSize: '0.875rem',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '0.5rem'
                     }}>
                       <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                       {offerActionError}
                     </div>
                   )}
                   
                   {selectedOffer.status === "PENDING" && (
                     <div style={{
                       width: '100%',
                       background: '#fef3c7',
                       border: '1px solid #f59e0b',
                       borderRadius: '8px',
                       padding: '1rem',
                       marginBottom: '1rem',
                       color: '#92400e',
                       fontSize: '0.875rem',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '0.5rem'
                     }}>
                       <span style={{ fontSize: '1.25rem' }}>⏳</span>
                       <div>
                         <strong>Offer Pending Agent Review</strong><br/>
                         This offer is currently being reviewed by our agent. You will be notified once it's approved or rejected.
                       </div>
                     </div>
                   )}
                   
                   {selectedOffer.status === "APPROVED" && (
                                            <button
                         onClick={() => handleConvertOfferToPolicy(selectedOffer.id)}
                         style={{
                           background: '#059669',
                           color: 'white',
                           border: 'none',
                           borderRadius: '8px',
                           padding: '0.75rem 1.5rem',
                           fontSize: '0.875rem',
                           fontWeight: 600,
                           cursor: 'pointer',
                           transition: 'all 0.2s ease-in-out',
                           boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                         }}
                         onMouseEnter={(e) => {
                           e.currentTarget.style.background = '#047857';
                           e.currentTarget.style.transform = 'translateY(-1px)';
                           e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                         }}
                         onMouseLeave={(e) => {
                           e.currentTarget.style.background = '#059669';
                           e.currentTarget.style.transform = 'translateY(0)';
                           e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                         }}
                       >
                         📋 Convert to Policy
                       </button>
                   )}
                   {selectedOffer.status === "APPROVED" && (
                     <>
                       <div style={{
                         width: '100%',
                         background: '#d1fae5',
                         border: '1px solid #10b981',
                         borderRadius: '8px',
                         padding: '1rem',
                         marginBottom: '1rem',
                         color: '#065f46',
                         fontSize: '0.875rem',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '0.5rem'
                       }}>
                         <span style={{ fontSize: '1.25rem' }}>✅</span>
                         <div>
                           <strong>Policy Created Successfully!</strong><br/>
                           Your offer has been converted to a policy. You can now view policy details and make payments.
                         </div>
                       </div>
                       
                       <div style={{
                         display: 'flex',
                         gap: '1rem',
                         flexWrap: 'wrap'
                       }}>
                         <button
                           onClick={() => handleViewPolicy(0)}
                           disabled={viewingPolicy}
                           style={{
                             background: viewingPolicy ? '#6b7280' : '#3b82f6',
                             color: 'white',
                             border: 'none',
                             borderRadius: '8px',
                             padding: '0.75rem 1.5rem',
                             fontSize: '0.875rem',
                             fontWeight: 600,
                             cursor: viewingPolicy ? 'not-allowed' : 'pointer',
                             transition: 'all 0.2s ease-in-out',
                             boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                             opacity: viewingPolicy ? 0.6 : 1
                           }}
                           onMouseEnter={(e) => {
                             if (!viewingPolicy) {
                               e.currentTarget.style.background = '#2563eb';
                               e.currentTarget.style.transform = 'translateY(-1px)';
                               e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                             }
                           }}
                           onMouseLeave={(e) => {
                             if (!viewingPolicy) {
                               e.currentTarget.style.background = '#3b82f6';
                               e.currentTarget.style.transform = 'translateY(0)';
                               e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                             }
                           }}
                         >
                           {viewingPolicy ? '⏳ Loading...' : '📄 View Policy'}
                         </button>
                         
                         <button
                           onClick={() => {
                             setSelectedPolicyId(0);
                             setShowPaymentForm(true);
                           }}
                           style={{
                             background: '#10b981',
                             color: 'white',
                             border: 'none',
                             borderRadius: '8px',
                             padding: '0.75rem 1.5rem',
                             fontSize: '0.875rem',
                             fontWeight: 600,
                             cursor: 'pointer',
                             transition: 'all 0.2s ease-in-out',
                             boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                           }}
                           onMouseEnter={(e) => {
                             e.currentTarget.style.background = '#059669';
                             e.currentTarget.style.transform = 'translateY(-1px)';
                             e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                           }}
                           onMouseLeave={(e) => {
                             e.currentTarget.style.background = '#10b981';
                             e.currentTarget.style.transform = 'translateY(0)';
                             e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                           }}
                         >
                           💳 Make Payment
                         </button>
                       </div>
                     </>
                   )}
                   <button
                     onClick={() => setShowOfferDetails(false)}
                     style={{
                       background: '#6b7280',
                       color: 'white',
                       border: 'none',
                       borderRadius: '8px',
                       padding: '0.75rem 1.5rem',
                       fontSize: '0.875rem',
                       fontWeight: 600,
                       cursor: 'pointer',
                       transition: 'all 0.2s ease-in-out',
                       boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.background = '#4b5563';
                       e.currentTarget.style.transform = 'translateY(-1px)';
                       e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.background = '#6b7280';
                       e.currentTarget.style.transform = 'translateY(0)';
                       e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                     }}
                   >
                     ✕ Close
                   </button>
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Profile Update Modal */}
       {showProfileUpdate && (
         <div style={{
           position: 'fixed',
           top: 0,
           left: 0,
           right: 0,
           bottom: 0,
           background: 'rgba(0, 0, 0, 0.5)',
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           zIndex: 1000
         }}>
           <div style={{
             background: 'white',
             borderRadius: '16px',
             padding: '2rem',
             width: '90%',
             maxWidth: '600px',
             maxHeight: '90vh',
             overflow: 'auto',
             boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
           }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h2 style={{
                 fontSize: '1.5rem',
                 fontWeight: 700,
                 color: '#1e293b',
                 margin: 0
               }}>
                 Update Profile
               </h2>
               <button
                 onClick={() => setShowProfileUpdate(false)}
                 style={{
                   background: 'none',
                   border: 'none',
                   fontSize: '1.5rem',
                   cursor: 'pointer',
                   color: '#64748b'
                 }}
               >
                 ✕
               </button>
             </div>

             <form onSubmit={(e) => { e.preventDefault(); handleProfileUpdate(); }}>
               <div style={{ marginBottom: '1.5rem' }}>
                 <h3 style={{
                   fontSize: '1.25rem',
                   fontWeight: 600,
                   color: '#1e293b',
                   marginBottom: '1rem'
                 }}>
                   Personal Information
                 </h3>
                 <div style={{
                   display: 'grid',
                   gridTemplateColumns: '1fr 1fr',
                   gap: '1rem'
                 }}>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>First Name *</label>
                     <input
                       type="text"
                       value={profileFormData.firstName}
                       onChange={(e) => setProfileFormData({...profileFormData, firstName: e.target.value})}
                       style={{
                         width: '100%',
                         padding: '0.75rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '8px',
                         fontSize: '0.875rem',
                         background: 'white'
                       }}
                       required
                     />
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Last Name *</label>
                     <input
                       type="text"
                       value={profileFormData.lastName}
                       onChange={(e) => setProfileFormData({...profileFormData, lastName: e.target.value})}
                       style={{
                         width: '100%',
                         padding: '0.75rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '8px',
                         fontSize: '0.875rem',
                         background: 'white'
                       }}
                       required
                     />
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Email *</label>
                     <input
                       type="email"
                       value={profileFormData.email}
                       onChange={(e) => setProfileFormData({...profileFormData, email: e.target.value})}
                       style={{
                         width: '100%',
                         padding: '0.75rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '8px',
                         fontSize: '0.875rem',
                         background: 'white'
                       }}
                       required
                     />
                   </div>
                 </div>
               </div>

               <div style={{ marginBottom: '2rem' }}>
                 <h3 style={{
                   fontSize: '1.25rem',
                   fontWeight: 600,
                   color: '#1e293b',
                   marginBottom: '1rem'
                 }}>
                   Address Information
                 </h3>
                 <div style={{
                   display: 'grid',
                   gridTemplateColumns: '1fr 1fr',
                   gap: '1rem'
                 }}>
                   <div style={{ gridColumn: '1 / -1' }}>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Address</label>
                     <input
                       type="text"
                       value={profileFormData.address}
                       onChange={(e) => setProfileFormData({...profileFormData, address: e.target.value})}
                       style={{
                         width: '100%',
                         padding: '0.75rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '8px',
                         fontSize: '0.875rem',
                         background: 'white'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>City</label>
                     <input
                       type="text"
                       value={profileFormData.city}
                       onChange={(e) => setProfileFormData({...profileFormData, city: e.target.value})}
                       style={{
                         width: '100%',
                         padding: '0.75rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '8px',
                         fontSize: '0.875rem',
                         background: 'white'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Country</label>
                     <input
                       type="text"
                       value={profileFormData.country}
                       onChange={(e) => setProfileFormData({...profileFormData, country: e.target.value})}
                       style={{
                         width: '100%',
                         padding: '0.75rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '8px',
                         fontSize: '0.875rem',
                         background: 'white'
                       }}
                     />
                   </div>
                   <div>
                     <label style={{
                       display: 'block',
                       fontSize: '0.875rem',
                       fontWeight: 500,
                       color: '#374151',
                       marginBottom: '0.25rem'
                     }}>Postal Code</label>
                     <input
                       type="text"
                       value={profileFormData.postalCode}
                       onChange={(e) => setProfileFormData({...profileFormData, postalCode: e.target.value})}
                       style={{
                         width: '100%',
                         padding: '0.75rem',
                         border: '1px solid #d1d5db',
                         borderRadius: '8px',
                         fontSize: '0.875rem',
                         background: 'white'
                       }}
                     />
                   </div>
                 </div>
               </div>

               <div style={{
                 display: 'flex',
                 justifyContent: 'flex-end',
                 gap: '1rem'
               }}>
                 <button
                   type="button"
                   onClick={() => setShowProfileUpdate(false)}
                   style={{
                     background: '#6b7280',
                     color: 'white',
                     border: 'none',
                     borderRadius: '8px',
                     padding: '0.75rem 1.5rem',
                     fontSize: '0.875rem',
                     fontWeight: 600,
                     cursor: 'pointer',
                     transition: 'background 0.2s'
                   }}
                   onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
                   onMouseLeave={(e) => e.currentTarget.style.background = '#6b7280'}
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   style={{
                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                     color: 'white',
                     border: 'none',
                     borderRadius: '8px',
                     padding: '0.75rem 1.5rem',
                     fontSize: '0.875rem',
                     fontWeight: 600,
                     cursor: 'pointer',
                     transition: 'transform 0.2s'
                   }}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                 >
                   Update Profile
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}
     </div>
   );
 } 