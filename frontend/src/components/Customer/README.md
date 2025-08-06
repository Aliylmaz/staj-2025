# Customer Dashboard Frontend

This directory contains the comprehensive customer dashboard frontend components for the insurance application.

## 🎯 Features

### 📊 Main Dashboard (`/customer`)
- **Overview Statistics**: Total policies, claims, payments, and premium amounts
- **Quick Actions**: Request offer, report claim, view policies
- **Recent Offers**: Display top 3 recent offers with status indicators
- **Real-time Data**: Fetches live data from backend APIs

### 📋 Offers Management (`/customer/offers`)
- **Offer List**: View all offers with status (PENDING, ACCEPTED, REJECTED)
- **Create Offer**: Dynamic form based on insurance type:
  - **Vehicle Insurance**: Plate, brand, model, year
  - **Health Insurance**: Age, health condition
  - **Home Insurance**: Address, type, size
- **Accept Offers**: Convert offers to policies
- **Offer Details**: View detailed offer information

### 📄 Policies Management (`/customer/policies`)
- **Policy List**: View all policies (active + past)
- **Policy Details**: Show policy information, payment status, claim history
- **Make Payment**: Direct payment integration
- **Status Tracking**: Active, expired, pending statuses

### 💰 Payments Management (`/customer/payments`)
- **Payment History**: List all payments with status (SUCCESS, FAILED, PENDING)
- **Make Payment**: Form with card details (dummy implementation)
- **Payment Methods**: Credit card, debit card, bank transfer
- **Payment Details**: View detailed payment information

### 🔧 Claims Management (`/customer/claims`)
- **Claim List**: View all claims with status tracking
- **Create Claim**: Form to report new claims with policy selection
- **Claim Details**: View claim information, description, date, amount
- **Status Tracking**: Approved, rejected, pending, in review

### 📁 Documents Management (`/customer/documents`)
- **Document List**: View all uploaded documents
- **Upload Documents**: File upload with multipart/form-data
- **File Preview**: Support for PDF, images, documents
- **Download**: Direct file download functionality
- **File Types**: PDF, DOC, DOCX, JPG, PNG, TXT

### 👤 Profile Management (`/customer/profile`)
- **Individual Customers**: Personal information, national ID, date of birth
- **Corporate Customers**: Company information, tax number, registration
- **Edit Profile**: In-place editing with form validation
- **Address Management**: Full address with city, country, postal code

## 🏗️ Architecture

### Components Structure
```
Customer/
├── CustomerLayout.tsx          # Shared layout with sidebar
├── CustomerDashboard.tsx       # Main dashboard
├── OffersPage.tsx             # Offers management
├── PoliciesPage.tsx           # Policies management
├── PaymentsPage.tsx           # Payments management
├── ClaimsPage.tsx             # Claims management
├── DocumentsPage.tsx          # Documents management
├── ProfilePage.tsx            # Profile management
└── README.md                  # This documentation
```

### Key Technologies
- **React 19**: Modern React with hooks
- **TypeScript**: Type-safe development
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client for API calls
- **Context API**: State management
- **Tailwind CSS**: Utility-first styling

### API Integration
- **Token-based Authentication**: JWT tokens for secure API calls
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Loading spinners and progress indicators
- **Real-time Updates**: Automatic data refresh and state management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- React 19
- Backend API running on `http://localhost:8080`

### Installation
```bash
cd frontend
npm install
npm run dev
```

### Environment Setup
Ensure the backend API is running and accessible at the configured URL in `customerApi.ts`.

## 📱 UI/UX Features

### Design System
- **Modern UI**: Clean, professional design with gradients and shadows
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Color Coding**: Status-based color indicators (green, red, yellow, blue)
- **Icons**: Emoji-based icons for better visual hierarchy
- **Animations**: Smooth transitions and hover effects

### User Experience
- **Intuitive Navigation**: Clear sidebar navigation with icons
- **Quick Actions**: Prominent action buttons for common tasks
- **Modal Dialogs**: In-place editing and form submission
- **Error Handling**: User-friendly error messages and retry options
- **Loading States**: Visual feedback during API calls

## 🔧 Configuration

### API Endpoints
All API endpoints are configured in `services/customerApi.ts`:
- Base URL: `http://localhost:8080/project/customer`
- Authentication: Bearer token in headers
- Error handling: Automatic redirect on 401 errors

### Routing
Routes are configured in `App.tsx`:
- `/customer` - Main dashboard
- `/customer/offers` - Offers management
- `/customer/policies` - Policies management
- `/customer/payments` - Payments management
- `/customer/claims` - Claims management
- `/customer/documents` - Documents management
- `/customer/profile` - Profile management

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login as customer user
- [ ] Navigate through all pages
- [ ] Create new offer with different insurance types
- [ ] Upload and download documents
- [ ] Make payments with different methods
- [ ] Report claims with policy selection
- [ ] Edit profile information
- [ ] Test responsive design on mobile

## 🐛 Known Issues

1. **File Upload**: Document download links may need backend implementation
2. **Payment Processing**: Currently uses dummy card processing
3. **Real-time Updates**: Some data may need manual refresh

## 🔄 Future Enhancements

- **Real-time Notifications**: WebSocket integration for live updates
- **Advanced Filtering**: Search and filter capabilities
- **Export Functionality**: PDF reports and data export
- **Mobile App**: React Native version
- **Offline Support**: Service worker for offline functionality

## 📞 Support

For technical issues or feature requests, please refer to the backend API documentation and ensure all endpoints are properly implemented. 