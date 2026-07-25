import axios from 'axios';

const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchClaims = async (params = {}) => {
  try {
    const response = await api.get('/claims', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching claims:', error);
    throw error;
  }
};

export const createClaim = async (formData) => {
  try {
    const response = await api.post('/claims', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting claim:', error);
    throw error;
  }
};

export const reviewClaim = async (id, reviewData) => {
  try {
    const response = await api.patch(`/claims/${id}/review`, reviewData);
    return response.data;
  } catch (error) {
    console.error(`Error reviewing claim ${id}:`, error);
    throw error;
  }
};

export const fetchClaimStats = async () => {
  try {
    const response = await api.get('/claims/stats/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching claim stats:', error);
    return null;
  }
};

export const loginUser = async (email, password, role) => {
  try {
    const response = await api.post('/auth/login', { email, password, role });
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};
