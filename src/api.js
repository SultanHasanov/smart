import axios from 'axios';

const API_URL = 'https://b25a776acd1c337f.mokky.dev/items';

export const getNotes = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createNote = async (data) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const updateNote = async (id, data) => {
  const response = await axios.patch(`${API_URL}/${id}`, data);
  return response.data;
};

export const deleteNote = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};
