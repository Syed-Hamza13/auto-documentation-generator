// src/db/client.js
import { createClient } from '@supabase/supabase-js';

// Ye tumhare Supabase project ke values
const SUPABASE_URL = 'https://lcaoekhxudyvirqvzxuk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KeouSBkj2Yapufdep5s63g_-Vv6KhR-';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
