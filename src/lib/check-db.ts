import { supabase } from './supabaseClient';

export const validateSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.warn('⚠️ Falha na verificação de conexão:', error.message);
      return false;
    }
    
    console.log('✅ Supabase conectado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro de conexão com Supabase:', error);
    return false;
  }
};
