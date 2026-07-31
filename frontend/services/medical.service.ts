import api from './api';

export const medicalService = {
  async getSymptoms() {
    const response = await api.get('/api/symptoms');
    return response.data;
  },

  async getEmergencySymptoms() {
    const response = await api.get('/api/symptoms/emergency');
    return response.data;
  },

  async predictDisease(symptoms: string[]) {
    const response = await api.post('/api/predict', { symptoms });
    return response.data;
  },

  async getPredictionHistory() {
    const response = await api.get('/api/history');
    return response.data;
  },

  async deletePrediction(id: number) {
    const response = await api.delete(`/api/history/${id}`);
    return response.data;
  },

  async getPredictionStats() {
    const response = await api.get('/api/history/stats');
    return response.data;
  },

  async getDiseases() {
    const response = await api.get('/api/diseases');
    return response.data;
  },

  async getDisease(id: number) {
    const response = await api.get(`/api/diseases/${id}`);
    return response.data;
  },

  async getMedicines() {
    const response = await api.get('/api/medicines');
    return response.data;
  },

  async getMedicine(id: number) {
    const response = await api.get(`/api/medicines/${id}`);
    return response.data;
  },

  async getMedicinesByDisease(diseaseId: number) {
    const response = await api.get(`/api/medicines/disease/${diseaseId}`);
    return response.data;
  },

  async generateReport(predictionId: number) {
    const response = await api.post(`/api/reports/generate/${predictionId}`);
    return response.data;
  },

  async downloadReport(reportId: number) {
    const response = await api.get(`/api/reports/${reportId}`, { responseType: 'blob' });
    return response.data;
  },

  async getReports() {
    const response = await api.get('/api/reports');
    return response.data;
  },

  async getReminders() {
    const response = await api.get('/api/reminders');
    return response.data;
  },

  async addReminder(data: any) {
    const response = await api.post('/api/reminders', data);
    return response.data;
  },

  async updateReminder(id: number, data: any) {
    const response = await api.put(`/api/reminders/${id}`, data);
    return response.data;
  },

  async deleteReminder(id: number) {
    const response = await api.delete(`/api/reminders/${id}`);
    return response.data;
  },
};
