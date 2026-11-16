import axiosClient from './axiosClient';

export const donorService = {
  searchDonors: async (params = {}) => {
    const response = await axiosClient.get('/donors', { params });
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axiosClient.put('/donors/profile', data);
    return response.data;
  },

  toggleAvailability: async (isAvailable) => {
    const response = await axiosClient.patch('/donors/availability', { isAvailable });
    return response.data;
  },

  getDonationHistory: async () => {
    const response = await axiosClient.get('/donors/history');
    return response.data;
  }
};
