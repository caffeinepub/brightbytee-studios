import { HttpAgent } from "@icp-sdk/core/agent";
import { useCallback, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";

let storageClientCache: StorageClient | null = null;

async function getStorageClient(): Promise<StorageClient> {
  if (storageClientCache) return storageClientCache;
  const config = await loadConfig();
  const agent = new HttpAgent({ host: config.backend_host });
  if (config.backend_host?.includes("localhost")) {
    await agent.fetchRootKey().catch(console.warn);
  }
  storageClientCache = new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent,
  );
  return storageClientCache;
}

/**
 * Given a Content-Type header value, return the appropriate file extension.
 * Falls back to the extension already present in the requested filename.
 */
function mimeToExtension(mimeType: string): string {
  const mime = mimeType.split(";")[0].trim().toLowerCase();
  const map: Record<string, string> = {
    "application/zip": ".zip",
    "application/x-zip-compressed": ".zip",
    "application/x-zip": ".zip",
    "application/octet-stream": ".zip",
    "text/html": ".html",
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      ".docx",
    "application/x-rar-compressed": ".rar",
    "application/vnd.rar": ".rar",
    "application/x-7z-compressed": ".7z",
    "application/gzip": ".gz",
    "application/x-tar": ".tar",
  };
  return map[mime] || "";
}

/**
 * Sniff the first few bytes to detect file type when Content-Type is
 * unreliable (e.g. generic "application/octet-stream").
 */
async function sniffExtension(blob: Blob): Promise<string> {
  const header = new Uint8Array(await blob.slice(0, 8).arrayBuffer());
  // ZIP magic bytes: PK\x03\x04
  if (
    header[0] === 0x50 &&
    header[1] === 0x4b &&
    header[2] === 0x03 &&
    header[3] === 0x04
  ) {
    return ".zip";
  }
  // RAR magic: Rar!
  if (
    header[0] === 0x52 &&
    header[1] === 0x61 &&
    header[2] === 0x72 &&
    header[3] === 0x21
  ) {
    return ".rar";
  }
  // PDF magic: %PDF
  if (
    header[0] === 0x25 &&
    header[1] === 0x50 &&
    header[2] === 0x44 &&
    header[3] === 0x46
  ) {
    return ".pdf";
  }
  // HTML: check for <html or <!DOC
  const text = new TextDecoder().decode(header).trimStart().toLowerCase();
  if (text.startsWith("<!doc") || text.startsWith("<html")) {
    return ".html";
  }
  return "";
}

export function useBlobStorage() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadBlob = useCallback(async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const client = await getStorageClient();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await client.putFile(bytes, (pct) =>
        setUploadProgress(pct),
      );
      return hash;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const getBlobUrl = useCallback(async (blobId: string): Promise<string> => {
    if (!blobId) return "";
    const client = await getStorageClient();
    return client.getDirectURL(blobId);
  }, []);

  const downloadBlob = useCallback(
    async (blobId: string, preferredFilename: string): Promise<void> => {
      if (!blobId) throw new Error("No blob ID");
      const client = await getStorageClient();
      const url = await client.getDirectURL(blobId);
      const response = await fetch(url);
      const blob = await response.blob();

      // Determine the best extension:
      // 1. Try Content-Type header
      // 2. Sniff magic bytes
      // 3. Fall back to whatever extension is in preferredFilename
      const contentType = response.headers.get("content-type") || "";
      let ext = mimeToExtension(contentType);

      // If content-type is generic or missing, sniff bytes
      if (!ext || contentType.includes("octet-stream")) {
        ext = await sniffExtension(blob);
      }

      // Build final filename
      let filename = preferredFilename;
      if (ext) {
        // Strip any existing extension from preferredFilename and apply correct one
        const baseName = preferredFilename.replace(/\.[^/.]+$/, "");
        filename = `${baseName}${ext}`;
      }

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    },
    [],
  );

  return { uploadBlob, getBlobUrl, downloadBlob, uploadProgress, isUploading };
}
