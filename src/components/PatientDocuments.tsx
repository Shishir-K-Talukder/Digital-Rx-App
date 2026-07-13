import { useState, useEffect } from "react";
import { useFileUpload } from "@/hooks/useFileUpload";
import FileUploadButton from "./FileUploadButton";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Download, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  patientId?: string;
}

interface DocFile {
  name: string;
  created_at: string;
}

const PatientDocuments = ({ patientId }: Props) => {
  const { user } = useAuth();
  const { upload, listFiles, deleteFile, uploading } = useFileUpload("patient-documents");
  const [files, setFiles] = useState<DocFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    if (patientId) loadFiles();
  }, [patientId]);

  const loadFiles = async () => {
    if (!patientId) return;
    setLoadingFiles(true);
    const list = await listFiles(patientId);
    setFiles(list.map((f) => ({ name: f.name, created_at: f.created_at || "" })));
    setLoadingFiles(false);
  };

  const handleUpload = async (file: File) => {
    if (!patientId) return;
    await upload(file, patientId);
    loadFiles();
  };

  const handleDelete = async (fileName: string) => {
    if (!user || !patientId) return;
    const path = `${user.id}/${patientId}/${fileName}`;
    const ok = await deleteFile(path);
    if (ok) setFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const handleDownload = async (fileName: string) => {
    if (!user || !patientId) return;
    const path = `${user.id}/${patientId}/${fileName}`;
    const { data, error } = await supabase.storage.from("patient-documents").createSignedUrl(path, 60);
    if (data) window.open(data.signedUrl, "_blank");
  };

  if (!patientId) {
    return (
      <div className="text-xs text-muted-foreground italic">
        Save the prescription first to attach patient documents.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-foreground flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-primary" /> Patient Documents
        </h4>
        <FileUploadButton
          onFileSelect={handleUpload}
          uploading={uploading}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          label="Upload Doc"
        />
      </div>

      {loadingFiles ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" /> Loading...
        </div>
      ) : files.length === 0 ? (
        <p className="text-xs text-muted-foreground">No documents uploaded yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {files.map((f) => (
            <li key={f.name} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2">
              <span className="text-xs text-foreground truncate flex-1">{f.name}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDownload(f.name)}>
                  <Download className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(f.name)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PatientDocuments;
