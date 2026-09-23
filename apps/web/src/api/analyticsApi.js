import api from './authApi';

export const getInstitutionOverview = async () => {
  const response = await api.get('/analytics/overview');
  return response.data;
};

export const getIndustryDemand = async () => {
  const response = await api.get('/analytics/industry-demand');
  return response.data;
};

export const getStudentGaps = async () => {
  const response = await api.get('/analytics/student-gaps');
  return response.data;
};

export const getPlacementFunnel = async () => {
  const response = await api.get('/analytics/funnel');
  return response.data;
};

export const getRecruiterAnalytics = async () => {
  const response = await api.get('/analytics/recruiter');
  return response.data;
};

export default api;
