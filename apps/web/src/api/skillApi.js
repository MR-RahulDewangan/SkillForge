import api from './authApi';

export const getAllRoles = async () => {
  const response = await api.get('/skills/roles');
  return response.data;
};

export const getSkillsByRole = async (roleId) => {
  const response = await api.get(`/skills/roles/${roleId}/skills`);
  return response.data;
};

export const getQuestions = async (skillId) => {
  const response = await api.get(`/assessments/questions/${skillId}`);
  return response.data;
};

export const submitAssessment = async (data) => {
  const response = await api.post('/assessments/submit', data);
  return response.data;
};

export const getStudentProfile = async (studentId) => {
  const response = await api.get(`/student/profile/${studentId}`);
  return response.data;
};

export const updateCareerGoal = async (data) => {
  const response = await api.post('/student/career-goal', data);
  return response.data;
};

export const getSkillGaps = async () => {
  const response = await api.get('/gap/analysis');
  return response.data;
};

export const getResumeData = async () => {
  const response = await api.get('/student/resume');
  return response.data;
};
