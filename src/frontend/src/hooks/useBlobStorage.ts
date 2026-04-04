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
    async (blobId: string, filename: string): Promise<void> => {
      if (!blobId) throw new Error("No blob ID");
      const client = await getStorageClient();
      const url = await client.getDirectURL(blobId);
      const response = await fetch(url);
      const blob = await response.blob();
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
