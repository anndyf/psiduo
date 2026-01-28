
import { supabase } from "./supabaseClient";

export async function uploadImage(file: File, folder: string = "uploads"): Promise<string | null> {
    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
            console.error("Supabase URL not found");
            return null;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        // Upload
        const { data, error } = await supabase.storage
            .from('public-images') // Nome do Bucket que sugeri no manual
            .upload(filePath, file);

        if (error) {
            console.error("Erro no upload Supabase:", error);
            throw error;
        }

        // Get URL
        const { data: urlData } = supabase.storage
            .from('public-images')
            .getPublicUrl(filePath);

        return urlData.publicUrl;

    } catch (e) {
        console.error("Erro ao fazer upload:", e);
        return null; // Retorna null em caso de erro, para fallback
    }
}
