import api from './axiosConfig';

export const contactService = {
  sendContactForm: async (formData) => {
    const response = await api.post('/contact/send', formData);
    return response.data;
  }
};