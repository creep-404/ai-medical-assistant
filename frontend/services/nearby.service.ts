import api from './api';

export const nearbyService = {
  async geocodeCity(city: string) {
    const response = await api.post('/api/nearby/geocode', { city });
    return response.data;
  },

  async searchNearby(data: {
    lat: number;
    lng: number;
    radius_km: number;
    place_type?: string;
    specialty?: string;
  }) {
    const response = await api.post('/api/nearby/search', data);
    return response.data;
  },

  async getSpecialist(params: { disease?: string; symptom?: string }) {
    const query = new URLSearchParams();
    if (params.disease) query.set('disease', params.disease);
    if (params.symptom) query.set('symptom', params.symptom);
    const response = await api.get(`/api/specialist?${query.toString()}`);
    return response.data;
  },
};
