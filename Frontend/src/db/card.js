import { supabase } from './client';

export const getCards = async () => {
  const { data, error } = await supabase
    .from('account')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createCard = async (card) => {
  const { data, error } = await supabase
    .from('account')
    .insert(card)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCard = async (id, updates) => {
  const { error } = await supabase
    .from('account')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
};

export const deleteCard = async (id) => {
  const { error } = await supabase
    .from('account')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
