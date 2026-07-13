import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useFileUpload = (bucket: string) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File, subfolder?: string): Promise<string | null> => {
    if (!user) return null;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const path = subfolder
      ? `${user.id}/${subfolder}/${fileName}`
      : `${user.id}/${fileName}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });

    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return null;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    setUploading(false);
    toast.success("File uploaded!");
    return urlData.publicUrl;
  };

  const getSignedUrl = async (path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
    if (error) return null;
    return data.signedUrl;
  };

  const listFiles = async (folder?: string) => {
    if (!user) return [];
    const path = folder ? `${user.id}/${folder}` : user.id;
    const { data, error } = await supabase.storage.from(bucket).list(path);
    if (error) return [];
    return data.filter((f) => f.name !== ".emptyFolderPlaceholder");
  };

  const deleteFile = async (path: string) => {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      toast.error("Delete failed");
      return false;
    }
    toast.success("File deleted");
    return true;
  };

  return { upload, getSignedUrl, listFiles, deleteFile, uploading };
};
