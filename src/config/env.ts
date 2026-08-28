import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  admin: {
    baseURL: 'https://test-v2-panel.lyxa.ai',
    email: process.env.ADMIN_EMAIL ?? '',
    password: process.env.ADMIN_PASSWORD ?? '',
  },
};
