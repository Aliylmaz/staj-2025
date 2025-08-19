import axios from './axiosConfig';

export interface DocumentDto {
  id: number;
  fileName: string;
  contentType: string;
  documentType: string;
  description?: string;
  uploadDate: string;
  customerId?: string;
  policyId?: number;
  claimId?: string;
  fileSize: number;
}

export const documentApi = {
  getDocumentsByClaim: async (claimId: string) => {
    const response = await axios.get(`/api/v1/documents/claim/${claimId}`);
    return response.data.data;
  },

  getDocumentsByPolicy: async (policyId: number) => {
    const response = await axios.get(`/api/v1/documents/policy/${policyId}`);
    return response.data.data;
  },

  downloadDocument: async (documentId: number) => {
    const response = await axios.get(`/api/v1/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  deleteDocument: async (documentId: number) => {
    const response = await axios.delete(`/api/v1/documents/${documentId}`);
    return response.data;
  }
};
