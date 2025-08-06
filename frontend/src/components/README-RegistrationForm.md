# RegistrationForm Component

A responsive React registration form component with dynamic fields based on customer type selection.

## Features

- **Dynamic Form Fields**: Shows different fields based on customer type (INDIVIDUAL or CORPORATE)
- **Responsive Design**: Built with Tailwind CSS for mobile-first responsive design
- **Form Validation**: Comprehensive client-side validation with error messages
- **Password Toggle**: Show/hide password functionality with emoji toggles (👁️/🙈)
- **Dark Mode Support**: Fully compatible with dark mode themes
- **TypeScript**: Fully typed with TypeScript interfaces
- **Accessibility**: Proper labels, ARIA attributes, and keyboard navigation

## Customer Types

### INDIVIDUAL Customer
- **Default Selection**: INDIVIDUAL is selected by default
- **Additional Fields**:
  - `nationalId` (text) - National identification number
  - `dateOfBirth` (date) - Date of birth

### CORPORATE Customer
- **Additional Fields**:
  - `companyName` (text) - Company name
  - `taxNumber` (text) - Tax identification number
  - `companyRegistrationNumber` (text) - Company registration number
  - `address` (text) - Company address
  - `city` (text) - City
  - `country` (text) - Country
  - `postalCode` (text) - Postal code

## Shared Fields (Always Visible)

- `username` (text) - Username for login
- `firstName` (text) - First name
- `lastName` (text) - Last name
- `email` (email) - Email address
- `password` (password) - Password with toggle
- `confirmPassword` (password) - Password confirmation with toggle
- `phoneNumber` (tel) - Phone number

## Data Structure

The form submits data in the following JSON structure:

```typescript
{
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  customer: {
    customerType: 'INDIVIDUAL' | 'CORPORATE';
    nationalId?: string;
    dateOfBirth?: string;
    companyName?: string;
    taxNumber?: string;
    companyRegistrationNumber?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  }
}
```

## Usage

### Basic Usage

```tsx
import RegistrationForm from './components/RegistrationForm';

function MyPage() {
  const handleSubmit = (data) => {
    console.log('Form data:', data);
    // Send to API
  };

  return <RegistrationForm onSubmit={handleSubmit} />;
}
```

### With Loading State

```tsx
import { useState } from 'react';
import RegistrationForm from './components/RegistrationForm';

function MyPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await submitToAPI(data);
    } finally {
      setLoading(false);
    }
  };

  return <RegistrationForm onSubmit={handleSubmit} loading={loading} />;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSubmit` | `(data: RegistrationFormData) => void` | `undefined` | Callback function called when form is submitted |
| `loading` | `boolean` | `false` | Shows loading state on submit button |

## Validation Rules

### Shared Fields
- All shared fields are required
- Email must be valid format
- Password must be at least 6 characters
- Confirm password must match password

### INDIVIDUAL Customer
- `nationalId` is required
- `dateOfBirth` is required

### CORPORATE Customer
- `companyName` is required
- `taxNumber` is required
- `companyRegistrationNumber` is required
- `address` is required
- `city` is required
- `country` is required
- `postalCode` is required

## Styling

The component uses Tailwind CSS classes and includes:

- **Responsive Grid**: Fields are arranged in responsive grid layouts
- **Color-coded Sections**: Individual (blue) and Corporate (green) sections
- **Focus States**: Blue focus rings on form inputs
- **Error States**: Red borders and backgrounds for validation errors
- **Hover Effects**: Subtle hover animations on buttons
- **Dark Mode**: Full dark mode support with appropriate color schemes

## Demo

Visit `/register-demo` to see the component in action with a working demo that logs the submitted data to the console.

## Browser Support

- Modern browsers with ES6+ support
- Responsive design works on mobile, tablet, and desktop
- Touch-friendly interface for mobile devices 