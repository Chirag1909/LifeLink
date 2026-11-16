import axiosClient from './axiosClient';

export const adminService = {
  getUsers: async (params = {}) => {
    const response = await axiosClient.get('/admin/users', { params });
    return response.data;
  },

  verifyUser: async (id, isVerified) => {
    const response = await axiosClient.patch(`/admin/users/${id}/verify`, { isVerified });
    return response.data;
  },

  blockUser: async (id, isBlocked) => {
    const response = await axiosClient.patch(`/admin/users/${id}/block`, { isBlocked });
    return response.data;
  },

  getStats: async () => {
    const response = await axiosClient.get('/admin/stats');
    return response.data;
  }
};
