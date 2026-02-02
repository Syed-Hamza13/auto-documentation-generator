import { supabase } from './client';

export const loginUser = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const signupUser = (email, password) =>
  supabase.auth.signUp({ email, password });

export const logoutUser = () =>
  supabase.auth.signOut();

export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};
