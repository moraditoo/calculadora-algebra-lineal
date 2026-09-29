// frontend/src/services/api.ts
const BASE_URL = 'http://127.0.0.1:5000/api';

export const postEcuaciones = async (payload: any) => {
  const res = await fetch(`${BASE_URL}/ecuaciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const postVectores = async (payload: any) => {
  const res = await fetch(`${BASE_URL}/vectores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const postMatrices = async (payload: any) => {
  const res = await fetch(`${BASE_URL}/matrices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const postConversor = async (payload: any) => {
  const res = await fetch(`${BASE_URL}/conversor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const postRomanos = async (payload: any) => {
  const res = await fetch(`${BASE_URL}/romanos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
};