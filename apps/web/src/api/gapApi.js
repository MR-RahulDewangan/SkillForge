import api from './authApi';

export const analyzeSkillGap = async () => {
  const response = await api.get('/gap/analyze');
  return response.data;
};

export default api;
