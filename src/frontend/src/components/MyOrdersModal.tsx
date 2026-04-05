import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Loader2,
  Mail,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Order } from "../backend";
import { useBlobStorage } from "../hooks/useBlobStorage";
import {
  useGetApprovedOrderFileId,
  useGetOrdersByEmail,
} from "../hooks/useQueries";

interface MyOrdersModalProps {
  open: boolean;
  onClose: () => void;
  prefillEmail?: string;
}

function getStatusBadge(status: Order["status"]) {
  if ("approved" in status) {
    return (
      <Badge
        className="text-xs font-semibold"
        style={{
          background: "rgba(47,246,255,0.15)",
          color: "#2FF6FF",
          border: "1px solid rgba(47,246,255,0.3)",
        }}
      >
        <CheckCircle className="w-3 h-3 mr-1" />
        Approved
      </Badge>
    );
  }
  if ("rejected" in status) {
    return (
      <Badge
        className="text-xs font-semibold"
        style={{
          background: "rgba(255,80,80,0.15)",
          color: "#ff5050",
          border: "1px solid rgba(255,80,80,0.3)",
        }}
      >
        <XCircle className="w-3 h-3 mr-1" />
        Rejected
      </Badge>
    );
  }
  return (
    <Badge
      className="text-xs font-semibold"
      style={{
        background: "rgba(255,190,50,0.15)",
        color: "#ffbe32",
        border: "1px solid rgba(255,190,50,0.3)",
      }}
    >
      <Clock className="w-3 h-3 mr-1" />
      Pending
    </Badge>
  );
}

export default function MyOrdersModal({
  open,
  onClose,
  prefillEmail = "",
}: MyOrdersModalProps) {
  const [email, setEmail] = useState(prefillEmail);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [downloadingId, setDownloadingId] = useState<bigint | null>(null);

  const getOrdersByEmail = useGetOrdersByEmail();
  const getApprovedOrderFileId = useGetApprovedOrderFileId();
  const { downloadBlob } = useBlobStorage();

  const handleCheckOrders = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }
    try {
      const result = await getOrdersByEmail.mutateAsync(email.trim());
      setOrders(result);
      if (result.length === 0) {
        toast.info("No orders found for this email.");
      }
    } catch {
      toast.error("Failed to fetch orders. Please try again.");
    }
  };

  const handleDownload = async (order: Order) => {
    setDownloadingId(order.id);
    try {
      const fileId = await getApprovedOrderFileId.mutateAsync(order.id);
      if (!fileId) {
        toast.error(
          "File not available yet. Please contact support at brightbyteestudios68@gmail.com",
        );
        return;
      }
      const safeName = order.templateId
        ? `template-${order.templateId}`
        : "template";
      await downloadBlob(fileId, safeName);
      toast.success("Download started!");
    } catch {
      toast.error("Download failed. Please contact support.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleClose = () => {
    setOrders(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="max-w-lg w-full"
        style={{
          background: "oklch(0.14 0.025 250)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#fff",
        }}
        data-ocid="orders.modal"
      >
        <DialogHeader>
          <DialogTitle
            className="text-xl font-black"
            style={{
              background: "linear-gradient(135deg, #2FF6FF 0%, #8B5CFF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Check My Download Status
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Email input */}
          <div className="space-y-2">
            <Label
              htmlFor="order-email"
              className="text-sm text-muted-foreground"
            >
              Enter the email you used when placing your order
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="order-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setOrders(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleCheckOrders()}
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  data-ocid="orders.input"
                />
              </div>
              <Button
                onClick={handleCheckOrders}
                disabled={getOrdersByEmail.isPending}
                className="btn-gradient text-white border-0 font-semibold shrink-0"
                data-ocid="orders.check.button"
              >
                {getOrdersByEmail.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Check"
                )}
              </Button>
            </div>
          </div>

          {/* Orders list */}
          {orders !== null && (
            <div className="space-y-3" data-ocid="orders.list">
              {orders.length === 0 ? (
                <div
                  className="text-center py-8 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                  data-ocid="orders.empty_state"
                >
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">
                    No orders found for this email.
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Make sure you use the exact email entered during checkout.
                  </p>
                </div>
              ) : (
                orders.map((order, i) => (
                  <div
                    key={order.id.toString()}
                    className="rounded-xl p-4 space-y-3"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                    data-ocid={`orders.item.${i + 1}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">
                          Order #{order.id.toString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          Transaction: {order.transactionRef}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    {"approved" in order.status && (
                      <Button
                        size="sm"
                        onClick={() => handleDownload(order)}
                        disabled={downloadingId === order.id}
                        className="w-full font-semibold text-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, #2FF6FF 0%, #8B5CFF 100%)",
                          color: "#000",
                          border: "none",
                        }}
                        data-ocid={`orders.download.button.${i + 1}`}
                      >
                        {downloadingId === order.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Download Template
                          </>
                        )}
                      </Button>
                    )}

                    {"pending" in order.status && (
                      <p className="text-xs text-muted-foreground">
                        Your order is under review. You will be able to download
                        once approved.
                      </p>
                    )}

                    {"rejected" in order.status && (
                      <p className="text-xs" style={{ color: "#ff5050" }}>
                        This order was rejected. Please contact us at
                        brightbyteestudios68@gmail.com for assistance.
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full border border-white/10 hover:bg-white/5"
            onClick={handleClose}
            data-ocid="orders.close.button"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
