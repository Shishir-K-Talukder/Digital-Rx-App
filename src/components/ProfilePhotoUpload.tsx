import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFileUpload } from "@/hooks/useFileUpload";
import FileUploadButton from "./FileUploadButton";
import { Camera } from "lucide-react";

interface Props {
  photoUrl: string;
  doctorName: string;
  onPhotoChange: (url: string) => void;
}

const ProfilePhotoUpload = ({ photoUrl, doctorName, onPhotoChange }: Props) => {
  const { upload, uploading } = useFileUpload("profile-photos");

  const handleUpload = async (file: File) => {
    const url = await upload(file);
    if (url) onPhotoChange(url);
  };

  const initials = doctorName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <Avatar className="w-16 h-16 border-2 border-border">
        <AvatarImage src={photoUrl} alt={doctorName} />
        <AvatarFallback className="bg-primary/10 text-primary text-lg">{initials || <Camera className="w-6 h-6" />}</AvatarFallback>
      </Avatar>
      <FileUploadButton
        onFileSelect={handleUpload}
        uploading={uploading}
        accept="image/*"
        label="Change Photo"
      />
    </div>
  );
};

export default ProfilePhotoUpload;
