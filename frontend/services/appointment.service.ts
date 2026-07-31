import api from './api';

export const appointmentService = {
  async bookAppointment(data: {
    doctor_id: number;
    date: string;
    time: string;
    reason: string;
  }) {
    const response = await api.post('/api/appointments', data);
    return response.data;
  },

  async getAppointments() {
    const response = await api.get('/api/appointments');
    return response.data;
  },

  async getAppointment(id: number) {
    const response = await api.get(`/api/appointments/${id}`);
    return response.data;
  },

  async updateAppointment(id: number, data: any) {
    const response = await api.put(`/api/appointments/${id}`, data);
    return response.data;
  },

  async cancelAppointment(id: number) {
    const response = await api.delete(`/api/appointments/${id}`);
    return response.data;
  },

  async rescheduleAppointment(id: number, data: { date: string; time: string }) {
    const response = await api.put(`/api/appointments/${id}`, data);
    return response.data;
  },

  async getDoctorAppointments() {
    const response = await api.get('/api/appointments/doctor');
    return response.data;
  },

  async getDoctors() {
    const response = await api.get('/api/doctors');
    return response.data;
  },

  async getDoctor(id: number) {
    const response = await api.get(`/api/doctors/${id}`);
    return response.data;
  },

  async searchDoctors(query: string) {
    const response = await api.get(`/api/doctors/search?q=${query}`);
    return response.data;
  },
};
