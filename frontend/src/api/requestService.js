import axiosClient from './axiosClient';

export const requestService = {
  createRequest: async (data) => {
    const response = await axiosClient.post('/requests', data);
    return response.data;
  },

  getRequests: async (params = {}) => {
    const response = await axiosClient.get('/requests', { params });
    return response.data;
  },

  getRequestById: async (id) => {
    const response = await axiosClient.get(`/requests/${id}`);
    return response.data;
  },

  updateRequest: async (id, data) => {
    const response = await axiosClient.put(`/requests/${id}`, data);
    return response.data;
  },

  deleteRequest: async (id) => {
    const response = await axiosClient.delete(`/requests/${id}`);
    return response.data;
  },

  acceptRequest: async (id) => {
    const response = await axiosClient.post(`/requests/${id}/accept`);
    return response.data;
  },

  declineRequest: async (id) => {
    const response = await axiosClient.post(`/requests/${id}/decline`);
    return response.data;
  },

  updateRequestStatus: async (id, status) => {
    const response = await axiosClient.patch(`/requests/${id}/status`, { status });
    return response.data;
  }
};
