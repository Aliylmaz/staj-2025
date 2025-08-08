/**
 * UUID validation and customer ID utilities
 */

/**
 * Validates if a string is a valid UUID format
 * @param uuid - The string to validate
 * @returns true if valid UUID, false otherwise
 */
export const isValidUUID = (uuid: string | null | undefined): boolean => {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  
  // UUID v4 regex pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Checks if customer ID is ready for API calls
 * @param customerId - The customer ID to check
 * @returns true if customer ID is valid and ready
 */
export const isCustomerIdReady = (customerId: string | null | undefined): boolean => {
  return isValidUUID(customerId) && customerId !== 'temp-customer-id';
};

/**
 * Gets valid customer ID from localStorage
 * @returns valid customer ID or null
 */
export const getValidCustomerId = (): string | null => {
  const customerId = localStorage.getItem('customerId');
  return isCustomerIdReady(customerId) ? customerId : null;
};

/**
 * Sets customer ID in localStorage with validation
 * @param customerId - The customer ID to set
 * @returns true if successfully set, false if invalid
 */
export const setCustomerId = (customerId: string): boolean => {
  if (isValidUUID(customerId)) {
    localStorage.setItem('customerId', customerId);
    console.log('✅ Customer ID set successfully:', customerId);
    return true;
  } else {
    console.error('❌ Invalid customer ID format:', customerId);
    return false;
  }
};

/**
 * Clears customer ID from localStorage
 */
export const clearCustomerId = (): void => {
  localStorage.removeItem('customerId');
  console.log('🗑️ Customer ID cleared from localStorage');
};

/**
 * Customer ID navigation guard
 * @param customerId - Current customer ID
 * @param onReady - Callback when customer ID is ready
 * @param onNotReady - Callback when customer ID is not ready
 */
export const customerIdGuard = (
  customerId: string | null | undefined,
  onReady: () => void,
  onNotReady?: () => void
): void => {
  if (isCustomerIdReady(customerId)) {
    console.log('✅ Customer ID guard: ID is ready, proceeding');
    onReady();
  } else {
    console.log('⏳ Customer ID guard: ID not ready yet:', customerId);
    onNotReady?.();
  }
};

