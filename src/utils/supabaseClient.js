// Environment Configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('Please create .env.local file with REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions
export const getContactMessages = async () => {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching contact messages:', error);
  return data || [];
};

export const insertContactMessage = async (message) => {
  const { data, error } = await supabase
    .from('contact_messages')
    .insert([message]);

  if (error) console.error('Error inserting contact message:', error);
  return { data, error };
};

export const getBlogPosts = async () => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) console.error('Error fetching blog posts:', error);
  return data || [];
};

// PRIVATE / PORTFOLIO CONTENT HELPERS
export const getPrivateContent = async (id = 1) => {
  const { data, error } = await supabase
    .from('private_content')
    .select('*')
    .eq('id', id)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') console.error('Error fetching private content:', error);
  return data || null;
};

export const upsertPrivateContent = async (content, id = 1) => {
  const payload = { id, ...content };
  const { data, error } = await supabase
    .from('private_content')
    .upsert([payload]);

  if (error) console.error('Error upserting private content:', error);
  return { data, error };
};

// Generic page content helpers so every page can have editable JSON content
export const getPageContent = async (page) => {
  const { data, error } = await supabase
    .from('pages_content')
    .select('content')
    .eq('page', page)
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') console.error('Error fetching page content:', error);
  return data ? data.content : null;
};

export const upsertPageContent = async (page, content) => {
  const payload = { page, content };
  const { data, error } = await supabase
    .from('pages_content')
    .upsert([payload]);

  if (error) console.error('Error upserting page content:', error);
  return { data, error };
};

// Storage + assets helpers
export const uploadFileToStorage = async (file, bucket = 'assets') => {
  if (!file) return { error: 'No file provided' };
  const path = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) return { error };
  // get public URL
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return { url: urlData.publicUrl, path: data.path };
};

export const insertAssetRecord = async (url, type = null, meta = {}) => {
  const { data, error } = await supabase.from('assets').insert([{ url, type, meta }]).select('*').single();
  if (error) {
    console.error('Error inserting asset record:', error);
    return { error };
  }
  return { data };
};

export const insertDocumentRecord = async (title, url, doc_type = 'pdf', page = null) => {
  const payload = { title, url, doc_type, page };
  const { data, error } = await supabase.from('documents').insert([payload]).select('*').single();
  if (error) {
    console.error('Error inserting document record:', error);
    return { error };
  }
  return { data };
};

export const getAssets = async () => {
  const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching assets:', error);
    return [];
  }
  return data || [];
};

export const deleteAsset = async (id) => {
  const { data, error } = await supabase.from('assets').delete().eq('id', id);
  if (error) console.error('Error deleting asset:', error);
  return { data, error };
};

export const getDocuments = async () => {
  const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
  return data || [];
};

export const deleteDocument = async (id) => {
  const { data, error } = await supabase.from('documents').delete().eq('id', id);
  if (error) console.error('Error deleting document:', error);
  return { data, error };
};
