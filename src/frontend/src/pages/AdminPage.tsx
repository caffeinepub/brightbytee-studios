import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Ban,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Edit,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  Lock,
  LogOut,
  Package,
  Plus,
  Shield,
  ShoppingCart,
  Star,
  Trash2,
  Upload,
  UserX,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Announcement, Template } from "../backend";
import { useBlobStorage } from "../hooks/useBlobStorage";
import {
  useAddAnnouncement,
  useAddPolicyDocument,
  useAddTemplate,
  useAnnouncements,
  useApproveOrder,
  useBlockBuyer,
  useDeleteAnnouncement,
  useDeletePolicyDocument,
  useDeleteReview,
  useDeleteTemplate,
  useFreeTemplates,
  useGetAllReviews,
  useGetApprovedOrderFileId,
  useGetBlockedBuyers,
  useGetOrders,
  useGetPageVisitCount,
  useGetPaymentSummary,
  useGetPolicyDocuments,
  useGetVisitorCountries,
  useRejectOrder,
  useTemplates,
  useUnblockBuyer,
  useUpdateAnnouncement,
  useUpdateTemplate,
} from "../hooks/useQueries";
import type { Order } from "../types/orderTypes";

const ADMIN_PASSWORD = "Arshia@41010";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");

  const handleLogin = () => {
    if (pwInput.trim() === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError("");
    } else setPwError("Incorrect password. Please try again.");
  };

  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        data-ocid="admin.dialog"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(139,92,255,0.15)" }}
            >
              <Lock className="w-8 h-8" style={{ color: "#8B5CFF" }} />
            </div>
            <h1 className="text-2xl font-black">Admin Access</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Enter your password to continue
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-pw">Password</Label>
              <Input
                id="admin-pw"
                type="password"
                placeholder="Enter admin password"
                value={pwInput}
                onChange={(e) => setPwInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="bg-white/5 border-white/10"
                data-ocid="admin.password.input"
              />
              {pwError && (
                <p
                  className="text-xs text-destructive"
                  data-ocid="admin.password.error_state"
                >
                  {pwError}
                </p>
              )}
            </div>
            <Button
              className="w-full btn-gradient text-white border-0 font-bold"
              onClick={handleLogin}
              data-ocid="admin.login.button"
            >
              Login to Admin
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AdminPanel
      onLogout={() => {
        setAuthed(false);
        setPwInput("");
      }}
    />
  );
}

// ────────────────────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Order["status"] }) {
  if ("pending" in status) {
    return (
      <Badge
        style={{
          background: "rgba(234,179,8,0.15)",
          color: "#eab308",
          border: "1px solid rgba(234,179,8,0.3)",
        }}
      >
        Pending
      </Badge>
    );
  }
  if ("approved" in status) {
    return (
      <Badge
        style={{
          background: "rgba(34,197,94,0.15)",
          color: "#22c55e",
          border: "1px solid rgba(34,197,94,0.3)",
        }}
      >
        Approved
      </Badge>
    );
  }
  return (
    <Badge
      style={{
        background: "rgba(239,68,68,0.15)",
        color: "#ef4444",
        border: "1px solid rgba(239,68,68,0.3)",
      }}
    >
      Rejected
    </Badge>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
function OrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const approveOrder = useApproveOrder();
  const rejectOrder = useRejectOrder();
  const getFileId = useGetApprovedOrderFileId();
  const { getBlobUrl, downloadBlob } = useBlobStorage();
  const isPending = "pending" in order.status;
  const isApproved = "approved" in order.status;

  const handleViewScreenshot = async () => {
    try {
      const url = await getBlobUrl(order.screenshotBlobId);
      window.open(url, "_blank");
    } catch (_err) {
      toast.error("Could not open screenshot.");
    }
  };

  const handleApprove = async () => {
    try {
      await approveOrder.mutateAsync(order.id);
      toast.success("Order approved.");
    } catch (_err) {
      toast.error("Failed to approve order.");
    }
  };

  const handleReject = async () => {
    if (!confirm("Reject this order?")) return;
    try {
      await rejectOrder.mutateAsync(order.id);
      toast.success("Order rejected.");
    } catch (_err) {
      toast.error("Failed to reject order.");
    }
  };

  const handleDownload = async () => {
    try {
      const fileId = await getFileId.mutateAsync(order.id);
      if (fileId) {
        await downloadBlob(fileId, `template-${order.templateId}.html`);
      } else {
        toast.error("No file available for this order.");
      }
    } catch (_err) {
      toast.error("Download failed.");
    }
  };

  const dateStr = new Date(
    Number(order.createdAt) / 1_000_000,
  ).toLocaleDateString("en-IN");

  return (
    <>
      <TableRow className="border-white/5">
        <TableCell className="font-mono text-sm text-muted-foreground">
          #{order.templateId.toString()}
        </TableCell>
        <TableCell>
          <div className="font-medium text-sm">{order.buyerName}</div>
          <div className="text-xs text-muted-foreground">
            {order.buyerEmail}
          </div>
        </TableCell>
        <TableCell className="font-mono text-xs text-muted-foreground max-w-[120px] truncate">
          {order.transactionRef}
        </TableCell>
        <TableCell>
          <StatusBadge status={order.status} />
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">
          {dateStr}
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-xs h-7 px-2 gap-1"
              onClick={handleViewScreenshot}
            >
              <ExternalLink className="w-3 h-3" /> Screenshot
            </Button>
            {isPending && (
              <>
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs"
                  style={{
                    background: "rgba(34,197,94,0.15)",
                    color: "#22c55e",
                    border: "1px solid rgba(34,197,94,0.3)",
                  }}
                  onClick={handleApprove}
                  disabled={approveOrder.isPending}
                >
                  {approveOrder.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : null}
                  Approve
                </Button>
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs"
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    color: "#ef4444",
                    border: "1px solid rgba(239,68,68,0.3)",
                  }}
                  onClick={handleReject}
                  disabled={rejectOrder.isPending}
                >
                  Reject
                </Button>
              </>
            )}
            {isApproved && (
              <Button
                size="sm"
                className="h-7 px-2 text-xs btn-gradient text-white border-0"
                onClick={handleDownload}
                disabled={getFileId.isPending}
              >
                {getFileId.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : null}
                Download
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="border-white/5 bg-white/[0.02]">
          <TableCell colSpan={6} className="py-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Mobile: </span>
                <span>{order.buyerMobile}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Address: </span>
                <span>{order.buyerAddress}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">
                  Business:{" "}
                </span>
                <span>{order.businessDetails}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">
                  Use Case:{" "}
                </span>
                <span>{order.templateUseCase}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">
                  Account Recovery:{" "}
                </span>
                <span>{order.accountRecovery ? "Yes" : "No"}</span>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const { data: paidTemplates, isLoading: loadingPaid } = useTemplates();
  const { data: freeTemplates, isLoading: loadingFree } = useFreeTemplates();
  const { data: announcements, isLoading: loadingAnn } = useAnnouncements();
  const { data: policyDocuments, isLoading: loadingPolicies } =
    useGetPolicyDocuments();
  const { data: blockedBuyers, isLoading: loadingBlocked } =
    useGetBlockedBuyers();
  const { data: allReviews, isLoading: loadingReviews } = useGetAllReviews();
  const { data: orders, isLoading: loadingOrders } = useGetOrders();
  const { data: visitCount, isLoading: loadingVisits } = useGetPageVisitCount();
  const { data: visitorCountries, isLoading: loadingCountries } =
    useGetVisitorCountries();
  const { data: paymentSummary, isLoading: loadingSummary } =
    useGetPaymentSummary();

  const templates = [...(paidTemplates ?? []), ...(freeTemplates ?? [])].sort(
    (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0),
  );
  const loadingTemplates = loadingPaid || loadingFree;

  const addTemplate = useAddTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const addAnnouncement = useAddAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const addPolicyDocument = useAddPolicyDocument();
  const deletePolicyDocument = useDeletePolicyDocument();
  const blockBuyer = useBlockBuyer();
  const unblockBuyer = useUnblockBuyer();
  const deleteReview = useDeleteReview();
  const { uploadBlob, isUploading, uploadProgress } = useBlobStorage();

  // Template state
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    price: "",
    isFree: false,
    features: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Announcement state
  const [annModalOpen, setAnnModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [annForm, setAnnForm] = useState({
    title: "",
    content: "",
    isPublished: true,
  });

  // Block buyers state
  const [blockEmail, setBlockEmail] = useState("");
  const [blockReason, setBlockReason] = useState("");

  // Policy upload refs
  const privacyRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);
  const copyrightRef = useRef<HTMLInputElement>(null);
  const policyRefs = {
    privacy: privacyRef,
    terms: termsRef,
    copyright: copyrightRef,
  };
  const [uploadingPolicy, setUploadingPolicy] = useState<string | null>(null);

  const openAddTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      name: "",
      description: "",
      price: "",
      isFree: false,
      features: "",
    });
    setImageFile(null);
    setTemplateFile(null);
    setTemplateModalOpen(true);
  };

  const openEditTemplate = (t: Template) => {
    setEditingTemplate(t);
    setTemplateForm({
      name: t.name,
      description: t.description,
      price: Number(t.price).toString(),
      isFree: t.isFree,
      features: t.features.join(", "),
    });
    setImageFile(null);
    setTemplateFile(null);
    setTemplateModalOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name) {
      toast.error("Template name is required.");
      return;
    }
    if (!templateForm.isFree && !templateForm.price) {
      toast.error("Price is required for paid templates.");
      return;
    }
    const priceRaw = templateForm.isFree ? 0 : Number(templateForm.price);
    if (Number.isNaN(priceRaw) || priceRaw < 0) {
      toast.error("Invalid price.");
      return;
    }
    const price = Math.round(priceRaw);
    const features = templateForm.features
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({
          id: editingTemplate.id,
          name: templateForm.name,
          description: templateForm.description,
          price: BigInt(price),
          isFree: templateForm.isFree,
          features,
        });
        toast.success("Template updated!");
      } else {
        let previewImageBlobId = "";
        let templateFileBlobId = "";
        if (imageFile) {
          toast.info("Uploading preview image...");
          previewImageBlobId = await uploadBlob(imageFile);
        }
        if (templateFile) {
          toast.info("Uploading template file...");
          templateFileBlobId = await uploadBlob(templateFile);
        }
        await addTemplate.mutateAsync({
          name: templateForm.name,
          description: templateForm.description,
          price: BigInt(price),
          isFree: templateForm.isFree,
          previewImageBlobId,
          templateFileBlobId,
          features,
        });
        toast.success("Template added!");
      }
      setTemplateModalOpen(false);
      setEditingTemplate(null);
      setTemplateForm({
        name: "",
        description: "",
        price: "",
        isFree: false,
        features: "",
      });
      setImageFile(null);
      setTemplateFile(null);
    } catch (_err) {
      toast.error(
        editingTemplate
          ? "Failed to update template."
          : "Failed to add template.",
      );
    }
  };

  const handleDeleteTemplate = async (id: bigint) => {
    if (!confirm("Delete this template?")) return;
    await deleteTemplate.mutateAsync(id);
    toast.success("Template deleted.");
  };

  const openAddAnn = () => {
    setEditingAnn(null);
    setAnnForm({ title: "", content: "", isPublished: true });
    setAnnModalOpen(true);
  };
  const openEditAnn = (ann: Announcement) => {
    setEditingAnn(ann);
    setAnnForm({
      title: ann.title,
      content: ann.content,
      isPublished: ann.isPublished,
    });
    setAnnModalOpen(true);
  };

  const handleSaveAnn = async () => {
    if (!annForm.title || !annForm.content) {
      toast.error("Title and content are required.");
      return;
    }
    try {
      if (editingAnn) {
        await updateAnnouncement.mutateAsync({
          id: editingAnn.id,
          title: annForm.title,
          content: annForm.content,
          isPublished: annForm.isPublished,
          createdAt: editingAnn.createdAt,
        });
        toast.success("Announcement updated!");
      } else {
        await addAnnouncement.mutateAsync(annForm);
        toast.success("Announcement added!");
      }
      setAnnModalOpen(false);
    } catch (_err) {
      toast.error("Failed to save announcement.");
    }
  };

  const handleDeleteAnn = async (id: bigint) => {
    if (!confirm("Delete this announcement?")) return;
    await deleteAnnouncement.mutateAsync(id);
    toast.success("Announcement deleted.");
  };

  const handleUploadPolicy = async (docType: string, file: File) => {
    setUploadingPolicy(docType);
    try {
      const existing = (policyDocuments ?? []).find(
        (d) => d.docType === docType,
      );
      if (existing) await deletePolicyDocument.mutateAsync(existing.id);
      toast.info("Uploading policy document...");
      const blobId = await uploadBlob(file);
      await addPolicyDocument.mutateAsync({
        docType,
        fileName: file.name,
        blobId,
      });
      toast.success("Policy document uploaded!");
    } catch (_err) {
      toast.error("Failed to upload policy document.");
    } finally {
      setUploadingPolicy(null);
    }
  };

  const handleDeletePolicy = async (id: bigint) => {
    if (!confirm("Delete this policy document?")) return;
    try {
      await deletePolicyDocument.mutateAsync(id);
      toast.success("Policy document deleted.");
    } catch (_err) {
      toast.error("Failed to delete policy document.");
    }
  };

  const handleBlockBuyer = async () => {
    if (!blockEmail.trim()) {
      toast.error("Email is required.");
      return;
    }
    try {
      await blockBuyer.mutateAsync({
        email: blockEmail.trim(),
        reason: blockReason.trim(),
      });
      toast.success(`${blockEmail} has been blocked.`);
      setBlockEmail("");
      setBlockReason("");
    } catch (_err) {
      toast.error("Failed to block buyer.");
    }
  };

  const handleUnblockBuyer = async (id: bigint, email: string) => {
    if (!confirm(`Unblock ${email}?`)) return;
    try {
      await unblockBuyer.mutateAsync(id);
      toast.success(`${email} has been unblocked.`);
    } catch (_err) {
      toast.error("Failed to unblock buyer.");
    }
  };

  const handleDeleteReview = async (id: bigint) => {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteReview.mutateAsync(id);
      toast.success("Review deleted.");
    } catch (_err) {
      toast.error("Failed to delete review.");
    }
  };

  const isPending =
    addTemplate.isPending || updateTemplate.isPending || isUploading;

  const policyTypes = [
    { key: "privacy", label: "Privacy Policy", icon: Shield },
    { key: "terms", label: "Terms of Service", icon: FileText },
    { key: "copyright", label: "Copyright Policy", icon: FileText },
  ];

  // Derive order counts
  const pendingCount = (orders ?? []).filter(
    (o) => "pending" in o.status,
  ).length;
  const approvedCount = (orders ?? []).filter(
    (o) => "approved" in o.status,
  ).length;
  const rejectedCount = (orders ?? []).filter(
    (o) => "rejected" in o.status,
  ).length;

  // Derive unique customers from orders
  const customersMap = new Map<
    string,
    {
      name: string;
      email: string;
      mobile: string;
      address: string;
      businessDetails: string;
      templateUseCase: string;
      orderCount: number;
    }
  >();
  for (const order of orders ?? []) {
    const existing = customersMap.get(order.buyerEmail);
    if (existing) {
      existing.orderCount += 1;
    } else {
      customersMap.set(order.buyerEmail, {
        name: order.buyerName,
        email: order.buyerEmail,
        mobile: order.buyerMobile,
        address: order.buyerAddress,
        businessDetails: order.businessDetails,
        templateUseCase: order.templateUseCase,
        orderCount: 1,
      });
    }
  }
  const customers = Array.from(customersMap.values());

  // Sorted countries
  const sortedCountries = [...(visitorCountries ?? [])].sort(
    (a, b) => Number(b.count) - Number(a.count),
  );

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black">Admin Panel</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage templates, announcements, policies, buyers and reviews
            </p>
          </div>
          <Button
            variant="outline"
            className="border-white/10"
            onClick={onLogout}
            data-ocid="admin.logout.button"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="templates">
          <TabsList className="mb-8 bg-white/5 border border-white/10 flex-wrap h-auto gap-1">
            <TabsTrigger
              value="templates"
              className="data-[state=active]:bg-white/10"
              data-ocid="admin.templates.tab"
            >
              <Package className="w-3.5 h-3.5 mr-1" /> Templates
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-white/10"
              data-ocid="admin.orders.tab"
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Orders
              {pendingCount > 0 && (
                <span
                  className="ml-1.5 rounded-full text-[10px] font-bold px-1.5 py-0.5"
                  style={{
                    background: "rgba(234,179,8,0.2)",
                    color: "#eab308",
                  }}
                >
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="customers"
              className="data-[state=active]:bg-white/10"
              data-ocid="admin.customers.tab"
            >
              <Users className="w-3.5 h-3.5 mr-1" /> Customers
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white/10"
              data-ocid="admin.analytics.tab"
            >
              <BarChart3 className="w-3.5 h-3.5 mr-1" /> Analytics
            </TabsTrigger>
            <TabsTrigger
              value="announcements"
              className="data-[state=active]:bg-white/10"
              data-ocid="admin.announcements.tab"
            >
              Announcements
            </TabsTrigger>
            <TabsTrigger
              value="policies"
              className="data-[state=active]:bg-white/10"
              data-ocid="admin.policies.tab"
            >
              <Shield className="w-3.5 h-3.5 mr-1" /> Policies
            </TabsTrigger>
            <TabsTrigger
              value="blocked"
              className="data-[state=active]:bg-white/10"
              data-ocid="admin.blocked.tab"
            >
              <Ban className="w-3.5 h-3.5 mr-1" /> Blocked
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:bg-white/10"
              data-ocid="admin.reviews.tab"
            >
              <Star className="w-3.5 h-3.5 mr-1" /> Reviews
            </TabsTrigger>
          </TabsList>

          {/* ───────────── Templates ─────────────────────────────────────── */}
          <TabsContent value="templates">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                All Templates ({templates.length})
              </h2>
              <Button
                className="btn-gradient text-white border-0"
                onClick={openAddTemplate}
                data-ocid="admin.add_template.button"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Template
              </Button>
            </div>
            {loadingTemplates ? (
              <div
                className="text-center py-12"
                data-ocid="templates.loading_state"
              >
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : templates.length === 0 ? (
              <div
                className="text-center py-16 glass-card rounded-2xl"
                data-ocid="templates.empty_state"
              >
                <p className="text-muted-foreground">
                  No templates yet. Add your first one!
                </p>
              </div>
            ) : (
              <div className="glass-card rounded-2xl overflow-hidden">
                <Table data-ocid="admin.templates.table">
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((t, i) => (
                      <TableRow
                        key={t.id.toString()}
                        className="border-white/5"
                        data-ocid={`admin.template.row.${i + 1}`}
                      >
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell>
                          {t.isFree
                            ? "Free"
                            : `₹${Number(t.price).toLocaleString("en-IN")}`}
                        </TableCell>
                        <TableCell>
                          {t.isFree ? (
                            <Badge
                              style={{
                                background: "rgba(40,215,255,0.15)",
                                color: "#28D7FF",
                                border: "1px solid rgba(40,215,255,0.3)",
                              }}
                            >
                              Free
                            </Badge>
                          ) : (
                            <Badge
                              style={{
                                background: "rgba(139,92,255,0.15)",
                                color: "#8B5CFF",
                                border: "1px solid rgba(139,92,255,0.3)",
                              }}
                            >
                              Premium
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditTemplate(t)}
                              data-ocid={`admin.template.edit_button.${i + 1}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteTemplate(t.id)}
                              data-ocid={`admin.template.delete_button.${i + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* ───────────── Orders ───────────────────────────────────────── */}
          <TabsContent value="orders">
            <div className="mb-6">
              <h2 className="text-xl font-bold">
                Orders ({orders?.length ?? 0})
              </h2>
              <div className="flex gap-3 mt-3">
                <span
                  className="text-xs px-2 py-1 rounded-full font-semibold"
                  style={{
                    background: "rgba(234,179,8,0.15)",
                    color: "#eab308",
                  }}
                >
                  {pendingCount} Pending
                </span>
                <span
                  className="text-xs px-2 py-1 rounded-full font-semibold"
                  style={{
                    background: "rgba(34,197,94,0.15)",
                    color: "#22c55e",
                  }}
                >
                  {approvedCount} Approved
                </span>
                <span
                  className="text-xs px-2 py-1 rounded-full font-semibold"
                  style={{
                    background: "rgba(239,68,68,0.15)",
                    color: "#ef4444",
                  }}
                >
                  {rejectedCount} Rejected
                </span>
              </div>
            </div>
            {loadingOrders ? (
              <div
                className="text-center py-12"
                data-ocid="orders.loading_state"
              >
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : !orders || orders.length === 0 ? (
              <div
                className="text-center py-16 glass-card rounded-2xl"
                data-ocid="orders.empty_state"
              >
                <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No orders yet.</p>
              </div>
            ) : (
              <div
                className="glass-card rounded-2xl overflow-hidden"
                data-ocid="admin.orders.table"
              >
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead>Template</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Txn Ref</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <OrderRow key={order.id.toString()} order={order} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* ───────────── Customers ─────────────────────────────────────── */}
          <TabsContent value="customers">
            <div className="mb-6">
              <h2 className="text-xl font-bold">
                Customers ({customers.length})
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Unique buyers derived from order submissions.
              </p>
            </div>
            {loadingOrders ? (
              <div
                className="text-center py-12"
                data-ocid="customers.loading_state"
              >
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : customers.length === 0 ? (
              <div
                className="text-center py-16 glass-card rounded-2xl"
                data-ocid="customers.empty_state"
              >
                <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No customers yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {customers.map((c, i) => (
                  <div
                    key={c.email}
                    className="glass-card rounded-2xl p-5"
                    data-ocid={`admin.customer.card.${i + 1}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold truncate">{c.name}</p>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full shrink-0"
                            style={{
                              background: "rgba(139,92,255,0.15)",
                              color: "#8B5CFF",
                            }}
                          >
                            {c.orderCount}{" "}
                            {c.orderCount === 1 ? "order" : "orders"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {c.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {c.mobile}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/5 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Address:{" "}
                        </span>
                        <span>{c.address}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">
                          Use Case:{" "}
                        </span>
                        <span>{c.templateUseCase}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-muted-foreground text-xs">
                          Business:{" "}
                        </span>
                        <span>{c.businessDetails}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ───────────── Analytics ─────────────────────────────────────── */}
          <TabsContent value="analytics">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Analytics</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Page visits, payment stats, and visitor countries.
              </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {/* Page visits */}
              <div
                className="glass-card rounded-2xl p-5 col-span-2 lg:col-span-1"
                data-ocid="analytics.visits.card"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4" style={{ color: "#2FF6FF" }} />
                  <p className="text-xs text-muted-foreground">Page Visits</p>
                </div>
                {loadingVisits ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : (
                  <p
                    className="text-2xl font-black"
                    style={{ color: "#2FF6FF" }}
                  >
                    {Number(visitCount ?? 0).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Payment summary */}
              {(
                [
                  {
                    label: "Total Orders",
                    key: "totalOrders" as const,
                    color: "#8B5CFF",
                  },
                  {
                    label: "Pending",
                    key: "pendingOrders" as const,
                    color: "#eab308",
                  },
                  {
                    label: "Approved",
                    key: "approvedOrders" as const,
                    color: "#22c55e",
                  },
                  {
                    label: "Rejected",
                    key: "rejectedOrders" as const,
                    color: "#ef4444",
                  },
                ] as const
              ).map(({ label, key, color }) => (
                <div
                  key={key}
                  className="glass-card rounded-2xl p-5"
                  data-ocid={`analytics.${key}.card`}
                >
                  <p className="text-xs text-muted-foreground mb-2">{label}</p>
                  {loadingSummary ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <p className="text-2xl font-black" style={{ color }}>
                      {Number(paymentSummary?.[key] ?? 0).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Visitor countries */}
            <div>
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4" style={{ color: "#2FF6FF" }} />
                Visitor Countries
              </h3>
              {loadingCountries ? (
                <div
                  className="text-center py-12"
                  data-ocid="analytics.countries.loading_state"
                >
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : sortedCountries.length === 0 ? (
                <div
                  className="text-center py-12 glass-card rounded-2xl"
                  data-ocid="analytics.countries.empty_state"
                >
                  <p className="text-muted-foreground">No visitor data yet.</p>
                </div>
              ) : (
                <div
                  className="glass-card rounded-2xl overflow-hidden"
                  data-ocid="analytics.countries.table"
                >
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10">
                        <TableHead>Timezone Region</TableHead>
                        <TableHead className="text-right">Visits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedCountries.map((c, i) => (
                        <TableRow
                          key={c.country}
                          className="border-white/5"
                          data-ocid={`analytics.country.row.${i + 1}`}
                        >
                          <TableCell className="font-medium">
                            {c.country}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {Number(c.count).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ───────────── Announcements ─────────────────────────────────── */}
          <TabsContent value="announcements">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                Announcements ({announcements?.length ?? 0})
              </h2>
              <Button
                className="btn-gradient text-white border-0"
                onClick={openAddAnn}
                data-ocid="admin.add_announcement.button"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Announcement
              </Button>
            </div>
            {loadingAnn ? (
              <div
                className="text-center py-12"
                data-ocid="announcements.loading_state"
              >
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : !announcements || announcements.length === 0 ? (
              <div
                className="text-center py-16 glass-card rounded-2xl"
                data-ocid="announcements.empty_state"
              >
                <p className="text-muted-foreground">No announcements yet.</p>
              </div>
            ) : (
              <div className="glass-card rounded-2xl overflow-hidden">
                <Table data-ocid="admin.announcements.table">
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map((ann, i) => (
                      <TableRow
                        key={ann.id.toString()}
                        className="border-white/5"
                        data-ocid={`admin.announcement.row.${i + 1}`}
                      >
                        <TableCell className="font-medium max-w-xs truncate">
                          {ann.title}
                        </TableCell>
                        <TableCell>
                          {ann.isPublished ? (
                            <Badge
                              style={{
                                background: "rgba(40,215,255,0.15)",
                                color: "#28D7FF",
                                border: "1px solid rgba(40,215,255,0.3)",
                              }}
                            >
                              Published
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-white/20 text-muted-foreground"
                            >
                              Draft
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditAnn(ann)}
                              data-ocid={`admin.announcement.edit_button.${i + 1}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteAnn(ann.id)}
                              data-ocid={`admin.announcement.delete_button.${i + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* ───────────── Policies ────────────────────────────────────────── */}
          <TabsContent value="policies">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Policy Documents</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Upload PDF or DOC files. Each policy type can have one document
                at a time.
              </p>
            </div>
            {loadingPolicies ? (
              <div
                className="text-center py-12"
                data-ocid="policies.loading_state"
              >
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-6">
                {policyTypes.map(({ key, label, icon: Icon }) => {
                  const doc = (policyDocuments ?? []).find(
                    (d) => d.docType === key,
                  );
                  const isUploadingThis = uploadingPolicy === key;
                  const ref = policyRefs[key as keyof typeof policyRefs];
                  return (
                    <div
                      key={key}
                      className="glass-card rounded-2xl p-6"
                      data-ocid={`admin.policy_${key}.card`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(139,92,255,0.15)" }}
                          >
                            <Icon
                              className="w-5 h-5"
                              style={{ color: "#8B5CFF" }}
                            />
                          </div>
                          <div>
                            <h3 className="font-bold">{label}</h3>
                            {doc ? (
                              <p className="text-sm text-muted-foreground mt-0.5">
                                Current:{" "}
                                <span className="text-foreground">
                                  {doc.fileName}
                                </span>
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground mt-0.5">
                                No document uploaded
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 gap-2"
                            disabled={isUploadingThis}
                            onClick={() => ref.current?.click()}
                            data-ocid={`admin.policy_${key}.upload_button`}
                          >
                            {isUploadingThis ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            {doc ? "Replace" : "Upload"}
                          </Button>
                          {doc && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeletePolicy(doc.id)}
                              data-ocid={`admin.policy_${key}.delete_button`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          <input
                            ref={ref}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleUploadPolicy(key, f);
                              e.target.value = "";
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ───────────── Blocked Buyers ─────────────────────────────────── */}
          <TabsContent value="blocked">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Blocked Buyers</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Block email addresses from making purchases.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6 mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <UserX className="w-4 h-4" style={{ color: "#8B5CFF" }} /> Block
                New Buyer
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor="block-email"
                    className="text-xs text-muted-foreground"
                  >
                    Email Address *
                  </Label>
                  <Input
                    id="block-email"
                    type="email"
                    placeholder="buyer@example.com"
                    value={blockEmail}
                    onChange={(e) => setBlockEmail(e.target.value)}
                    className="bg-white/5 border-white/10"
                    data-ocid="admin.block_email.input"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor="block-reason"
                    className="text-xs text-muted-foreground"
                  >
                    Reason (optional)
                  </Label>
                  <Input
                    id="block-reason"
                    placeholder="Reason for blocking"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="bg-white/5 border-white/10"
                    data-ocid="admin.block_reason.input"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    className="btn-gradient text-white border-0 w-full sm:w-auto"
                    onClick={handleBlockBuyer}
                    disabled={blockBuyer.isPending}
                    data-ocid="admin.block_buyer.button"
                  >
                    {blockBuyer.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Ban className="w-4 h-4 mr-2" />
                    )}
                    Block Buyer
                  </Button>
                </div>
              </div>
            </div>
            {loadingBlocked ? (
              <div
                className="text-center py-12"
                data-ocid="blocked.loading_state"
              >
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : !blockedBuyers || blockedBuyers.length === 0 ? (
              <div
                className="text-center py-16 glass-card rounded-2xl"
                data-ocid="blocked.empty_state"
              >
                <Ban className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No blocked buyers yet.</p>
              </div>
            ) : (
              <div className="glass-card rounded-2xl overflow-hidden">
                <Table data-ocid="admin.blocked.table">
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead>Email</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Blocked On</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blockedBuyers.map((buyer, i) => (
                      <TableRow
                        key={buyer.id.toString()}
                        className="border-white/5"
                        data-ocid={`admin.blocked.row.${i + 1}`}
                      >
                        <TableCell className="font-medium">
                          {buyer.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {buyer.reason || (
                            <span className="italic">No reason provided</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(
                            Number(buyer.blockedAt) / 1_000_000,
                          ).toLocaleDateString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              handleUnblockBuyer(buyer.id, buyer.email)
                            }
                            data-ocid={`admin.blocked.unblock_button.${i + 1}`}
                          >
                            Unblock
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* ───────────── Reviews ──────────────────────────────────────────── */}
          <TabsContent value="reviews">
            <div className="mb-6">
              <h2 className="text-xl font-bold">
                Customer Reviews ({allReviews?.length ?? 0})
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                View and remove customer reviews.
              </p>
            </div>
            {loadingReviews ? (
              <div
                className="text-center py-12"
                data-ocid="reviews.loading_state"
              >
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : !allReviews || allReviews.length === 0 ? (
              <div
                className="text-center py-16 glass-card rounded-2xl"
                data-ocid="reviews.empty_state"
              >
                <Star className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No reviews yet.</p>
              </div>
            ) : (
              <div className="glass-card rounded-2xl overflow-hidden">
                <Table data-ocid="admin.reviews.table">
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead>Template</TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allReviews.map((review, i) => (
                      <TableRow
                        key={review.id.toString()}
                        className="border-white/5"
                        data-ocid={`admin.review.row.${i + 1}`}
                      >
                        <TableCell className="font-mono text-sm">
                          #{review.templateId.toString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {review.reviewerName}
                        </TableCell>
                        <TableCell>
                          <span style={{ color: "#f59e0b" }}>
                            {"\u2605".repeat(Number(review.rating))}
                            {"\u2606".repeat(5 - Number(review.rating))}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm max-w-xs">
                          <span className="line-clamp-2">{review.comment}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteReview(review.id)}
                            data-ocid={`admin.review.delete_button.${i + 1}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Template Modal */}
      <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
        <DialogContent
          className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
          style={{
            background: "oklch(0.14 0.025 250)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          data-ocid="admin.add_template.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Add New Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="t-name">Template Name *</Label>
              <Input
                id="t-name"
                placeholder="e.g. NexaLaunch Pro"
                value={templateForm.name}
                onChange={(e) =>
                  setTemplateForm((p) => ({ ...p, name: e.target.value }))
                }
                className="bg-white/5 border-white/10"
                data-ocid="admin.template_name.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-desc">Description</Label>
              <Textarea
                id="t-desc"
                placeholder="Brief description..."
                value={templateForm.description}
                onChange={(e) =>
                  setTemplateForm((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
                className="bg-white/5 border-white/10 resize-none"
                rows={3}
                data-ocid="admin.template_description.textarea"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-price">Price (₹) *</Label>
              <Input
                id="t-price"
                type="number"
                placeholder="e.g. 2999"
                min="0"
                max="100000"
                value={templateForm.price}
                onChange={(e) =>
                  setTemplateForm((p) => ({ ...p, price: e.target.value }))
                }
                className="bg-white/5 border-white/10"
                data-ocid="admin.template_price.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-features">Features (comma-separated)</Label>
              <Input
                id="t-features"
                placeholder="Responsive, SEO Ready, Dark Mode"
                value={templateForm.features}
                onChange={(e) =>
                  setTemplateForm((p) => ({ ...p, features: e.target.value }))
                }
                className="bg-white/5 border-white/10"
                data-ocid="admin.template_features.input"
              />
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="t-free"
                checked={templateForm.isFree}
                onCheckedChange={(v) =>
                  setTemplateForm((p) => ({ ...p, isFree: !!v }))
                }
                data-ocid="admin.template_free.checkbox"
              />
              <Label htmlFor="t-free">This is a free template</Label>
            </div>
            {!editingTemplate && (
              <>
                <div className="space-y-2">
                  <Label>Preview Image</Label>
                  <button
                    type="button"
                    className="w-full border-2 border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-white/25 transition-colors"
                    onClick={() => imageInputRef.current?.click()}
                    onKeyDown={(e) =>
                      e.key === "Enter" && imageInputRef.current?.click()
                    }
                    data-ocid="admin.template_image.dropzone"
                  >
                    <Upload className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {imageFile
                        ? imageFile.name
                        : "Click to upload preview image"}
                    </p>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setImageFile(e.target.files?.[0] ?? null)
                      }
                      data-ocid="admin.template_image.upload_button"
                    />
                  </button>
                </div>
                <div className="space-y-2">
                  <Label>Template HTML File</Label>
                  <button
                    type="button"
                    className="w-full border-2 border-dashed border-white/10 rounded-xl p-4 text-center cursor-pointer hover:border-white/25 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) =>
                      e.key === "Enter" && fileInputRef.current?.click()
                    }
                    data-ocid="admin.template_file.dropzone"
                  >
                    <Upload className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {templateFile
                        ? templateFile.name
                        : "Click to upload HTML file"}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".html,.zip"
                      className="hidden"
                      onChange={(e) =>
                        setTemplateFile(e.target.files?.[0] ?? null)
                      }
                      data-ocid="admin.template_file.upload_button"
                    />
                  </button>
                  {isUploading && (
                    <p
                      className="text-xs text-muted-foreground"
                      data-ocid="admin.upload.loading_state"
                    >
                      Uploading... {uploadProgress}%
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-white/10"
              onClick={() => setTemplateModalOpen(false)}
              data-ocid="admin.add_template.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="btn-gradient text-white border-0"
              onClick={handleSaveTemplate}
              disabled={isPending}
              data-ocid="admin.add_template.submit_button"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isPending
                ? "Saving..."
                : editingTemplate
                  ? "Save Changes"
                  : "Add Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Announcement Modal */}
      <Dialog open={annModalOpen} onOpenChange={setAnnModalOpen}>
        <DialogContent
          className="sm:max-w-md"
          style={{
            background: "oklch(0.14 0.025 250)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          data-ocid="admin.announcement.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editingAnn ? "Edit Announcement" : "Add Announcement"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ann-title">Title *</Label>
              <Input
                id="ann-title"
                placeholder="Announcement title"
                value={annForm.title}
                onChange={(e) =>
                  setAnnForm((p) => ({ ...p, title: e.target.value }))
                }
                className="bg-white/5 border-white/10"
                data-ocid="admin.announcement_title.input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-content">Content *</Label>
              <Textarea
                id="ann-content"
                placeholder="Announcement content..."
                value={annForm.content}
                onChange={(e) =>
                  setAnnForm((p) => ({ ...p, content: e.target.value }))
                }
                className="bg-white/5 border-white/10 resize-none"
                rows={5}
                data-ocid="admin.announcement_content.textarea"
              />
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="ann-pub"
                checked={annForm.isPublished}
                onCheckedChange={(v) =>
                  setAnnForm((p) => ({ ...p, isPublished: !!v }))
                }
                data-ocid="admin.announcement_published.checkbox"
              />
              <Label htmlFor="ann-pub">Publish immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-white/10"
              onClick={() => setAnnModalOpen(false)}
              data-ocid="admin.announcement.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="btn-gradient text-white border-0"
              onClick={handleSaveAnn}
              disabled={
                addAnnouncement.isPending || updateAnnouncement.isPending
              }
              data-ocid="admin.announcement.save_button"
            >
              {addAnnouncement.isPending || updateAnnouncement.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {editingAnn ? "Save Changes" : "Add Announcement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
