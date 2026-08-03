import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

type Props = {
  label: string;
  hint: string;
  bucket: "decks" | "videos";
  accept: string;
  maxBytes: number;
  value: string | null;
  onUploaded: (path: string | null) => void;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

function formatBytes(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)}MB`;
}

export function PitchFileUpload({
  label,
  hint,
  bucket,
  accept,
  maxBytes,
  value,
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleFile(file: File) {
    const accepted = accept.split(",").map((a) => a.trim());
    const typeOk = accepted.some((a) =>
      a.endsWith("/*") ? file.type.startsWith(a.slice(0, -1)) : file.type === a,
    );
    if (!typeOk) {
      toast.error(`${label}: unsupported file type`);
      return;
    }
    if (file.size > maxBytes) {
      toast.error(`${label} must be under ${formatBytes(maxBytes)}`);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) {
      toast.error("Your session expired — please sign in again");
      return;
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${session.user.id}/${Date.now()}-${safeName}`;

    setProgress(0);
    setFileName(file.name);

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`);
        xhr.setRequestHeader("apikey", SUPABASE_KEY);
        xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
        xhr.setRequestHeader("x-upsert", "true");
        if (file.type) xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve()
            : reject(new Error(`Upload failed (${xhr.status})`));
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });

      setProgress(100);
      const { data: signed } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 60);
      setPreviewUrl(signed?.signedUrl ?? null);
      onUploaded(path);
      toast.success(`${label} uploaded`);
    } catch (error) {
      setProgress(null);
      setFileName(null);
      onUploaded(null);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    }
  }

  const uploading = progress !== null && progress < 100;
  const done = value !== null && progress === 100;

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleFile(file);
        }}
      />

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {done ? "Replace file" : uploading ? "Uploading…" : "Choose file"}
        </Button>
        {fileName && (
          <span className="truncate text-xs text-muted-foreground">{fileName}</span>
        )}
      </div>

      {progress !== null && (
        <div className="space-y-1">
          <Progress value={progress} />
          <p className="text-xs text-muted-foreground">
            {uploading ? `Uploading… ${progress}%` : "Upload complete"}
          </p>
        </div>
      )}

      {done && previewUrl && (
        <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
          {bucket === "decks" ? (
            <object data={previewUrl} type="application/pdf" className="h-72 w-full">
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="block p-4 text-sm text-primary underline"
              >
                Open your deck preview
              </a>
            </object>
          ) : (
            <video src={previewUrl} controls className="h-72 w-full bg-black" />
          )}
        </div>
      )}
    </div>
  );
}
