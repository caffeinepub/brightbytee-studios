import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  Ban,
  CheckCircle,
  Download,
  Loader2,
  Smartphone,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Template } from "../backend";
import { useBlobStorage } from "../hooks/useBlobStorage";
import { useIsEmailBlocked, useSubmitOrder } from "../hooks/useQueries";
import MyOrdersModal from "./MyOrdersModal";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  template: Template;
}

type Step =
  | "questionnaire"
  | "instructions"
  | "verify"
  | "order_submitted"
  | "error"
  | "blocked";

interface QuestionnaireForm {
  fullNameAddress: string;
  email: string;
  mobileNumber: string;
  businessDetails: string;
  accountRecovery: "yes" | "no" | "";
  templateUseCase: "Personal" | "Business" | "Client Projects" | "";
}

const INITIAL_FORM: QuestionnaireForm = {
  fullNameAddress: "",
  email: "",
  mobileNumber: "",
  businessDetails: "",
  accountRecovery: "",
  templateUseCase: "",
};

function getTimeBasedMessage(): string {
  const hour = new Date().getHours();
  if (hour >= 0 && hour < 6) {
    return "Your order is confirmed and your download option will be available after 6 AM";
  }
  if (hour >= 6 && hour < 15) {
    return "Your order is confirmed and your download option will be available after 3 PM";
  }
  return "Your order is confirmed and your download option will be available in few hours";
}

export default function PaymentModal({
  open,
  onClose,
  template,
}: PaymentModalProps) {
  const [step, setStep] = useState<Step>("questionnaire");
  const [transactionRef, setTransactionRef] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotBlobId, setScreenshotBlobId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState<QuestionnaireForm>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof QuestionnaireForm, string>>
  >({});
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  const submitOrder = useSubmitOrder();
  const isEmailBlocked = useIsEmailBlocked();
  const { uploadBlob, uploadProgress, isUploading } = useBlobStorage();

  const price = Number(template.price);
  const priceFormatted = `₹${price.toLocaleString("en-IN")}`;
  const upiId = "9821801847@fam";
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("BrightBytee Studios")}&am=${price}&cu=INR&tn=${encodeURIComponent(`Template:${template.name}`)}`;

  const handleReset = () => {
    setStep("questionnaire");
    setTransactionRef("");
    setScreenshotFile(null);
    setScreenshotBlobId("");
    setErrorMsg("");
    setForm(INITIAL_FORM);
    setFormErrors({});
    setConfirmationMessage("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const validateForm = () => {
    const errors: Partial<Record<keyof QuestionnaireForm, string>> = {};
    if (!form.fullNameAddress.trim())
      errors.fullNameAddress = "Full name and address are required.";
    if (!form.email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Please enter a valid email.";
    if (!form.mobileNumber.trim())
      errors.mobileNumber = "Mobile number is required.";
    if (!form.businessDetails.trim())
      errors.businessDetails = "Business details are required.";
    if (!form.accountRecovery)
      errors.accountRecovery = "Please answer this question.";
    if (!form.templateUseCase)
      errors.templateUseCase = "Please select a use case.";
    return errors;
  };

  const handleQuestionnaireNext = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setCheckingEmail(true);
    try {
      const blocked = await isEmailBlocked.mutateAsync(form.email.trim());
      if (blocked) {
        setStep("blocked");
        return;
      }
      setStep("instructions");
    } catch (_err) {
      setStep("instructions");
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleOpenUPI = () => {
    window.location.href = upiLink;
    setTimeout(() => setStep("verify"), 1500);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setScreenshotFile(file);
    setScreenshotBlobId("");
  };

  const handleUploadScreenshot = async () => {
    if (!screenshotFile) {
      toast.error("Please select a screenshot file.");
      return;
    }
    try {
      const blobId = await uploadBlob(screenshotFile);
      setScreenshotBlobId(blobId);
      toast.success("Screenshot uploaded successfully.");
    } catch (_err) {
      toast.error("Failed to upload screenshot. Please try again.");
    }
  };

  const handleSubmitOrder = async () => {
    if (!transactionRef.trim()) {
      toast.error("Please enter your transaction reference.");
      return;
    }
    if (!screenshotBlobId) {
      toast.error("Please upload your payment screenshot first.");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitOrder.mutateAsync({
        templateId: template.id,
        transactionRef: transactionRef.trim(),
        screenshotBlobId,
        buyerName: form.fullNameAddress,
        buyerEmail: form.email,
        buyerMobile: form.mobileNumber,
        buyerAddress: form.fullNameAddress,
        businessDetails: form.businessDetails,
        accountRecovery: form.accountRecovery === "yes",
        templateUseCase: form.templateUseCase,
      });
      setConfirmationMessage(getTimeBasedMessage());
      setStep("order_submitted");
    } catch (_err) {
      setErrorMsg(
        "An error occurred while submitting your order. Please try again.",
      );
      setStep("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    if (step === "order_submitted") return "Order Confirmed! ✅";
    if (step === "error") return "Submission Failed";
    if (step === "blocked") return "Access Restricted";
    if (step === "questionnaire") return "Purchase Information";
    return `Purchase: ${template.name}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        style={{
          background: "oklch(0.14 0.025 250)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
        data-ocid="payment.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{getTitle()}</DialogTitle>
        </DialogHeader>

        {/* ── Questionnaire ───────────────────────────────────────────── */}
        {step === "questionnaire" && (
          <div className="space-y-5">
            <p className="text-muted-foreground text-sm">
              Please answer all questions before proceeding. All fields are
              required.
            </p>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Q1. PLEASE ENTER YOUR FULL NAME AND ADDRESS
              </Label>
              <Input
                placeholder="e.g. John Doe, 123 Main St, Mumbai, MH"
                value={form.fullNameAddress}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    fullNameAddress: e.target.value,
                  }))
                }
                className="bg-white/5 border-white/10"
                data-ocid="payment.full_name_address.input"
              />
              {formErrors.fullNameAddress && (
                <p className="text-xs text-destructive">
                  {formErrors.fullNameAddress}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Q2. PLEASE ENTER YOUR E-MAIL ID AND MOBILE NUMBER
              </Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                className="bg-white/5 border-white/10"
                data-ocid="payment.email.input"
              />
              {formErrors.email && (
                <p className="text-xs text-destructive">{formErrors.email}</p>
              )}
              <Input
                type="tel"
                placeholder="Mobile number (e.g. +91 98765 43210)"
                value={form.mobileNumber}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    mobileNumber: e.target.value,
                  }))
                }
                className="bg-white/5 border-white/10"
                data-ocid="payment.mobile.input"
              />
              {formErrors.mobileNumber && (
                <p className="text-xs text-destructive">
                  {formErrors.mobileNumber}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Q3. Can you confirm your full name and business details
                associated with the purchase?
              </Label>
              <Input
                placeholder="e.g. John Doe — Freelance Web Developer"
                value={form.businessDetails}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    businessDetails: e.target.value,
                  }))
                }
                className="bg-white/5 border-white/10"
                data-ocid="payment.business_details.input"
              />
              {formErrors.businessDetails && (
                <p className="text-xs text-destructive">
                  {formErrors.businessDetails}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Q4. Do you have a verified email address and phone number for
                account recovery?
              </Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accountRecovery"
                    value="yes"
                    checked={form.accountRecovery === "yes"}
                    onChange={() =>
                      setForm((prev) => ({ ...prev, accountRecovery: "yes" }))
                    }
                    className="accent-purple-500"
                    data-ocid="payment.account_recovery_yes.radio"
                  />
                  <span className="text-sm">Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accountRecovery"
                    value="no"
                    checked={form.accountRecovery === "no"}
                    onChange={() =>
                      setForm((prev) => ({ ...prev, accountRecovery: "no" }))
                    }
                    className="accent-purple-500"
                    data-ocid="payment.account_recovery_no.radio"
                  />
                  <span className="text-sm">No</span>
                </label>
              </div>
              {formErrors.accountRecovery && (
                <p className="text-xs text-destructive">
                  {formErrors.accountRecovery}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Q5. Will the template be used for personal, business, or client
                projects?
              </Label>
              <div className="flex flex-wrap gap-3">
                {(["Personal", "Business", "Client Projects"] as const).map(
                  (opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="templateUseCase"
                        value={opt}
                        checked={form.templateUseCase === opt}
                        onChange={() =>
                          setForm((prev) => ({
                            ...prev,
                            templateUseCase: opt,
                          }))
                        }
                        className="accent-purple-500"
                        data-ocid={`payment.use_case_${opt.toLowerCase().replace(" ", "_")}.radio`}
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ),
                )}
              </div>
              {formErrors.templateUseCase && (
                <p className="text-xs text-destructive">
                  {formErrors.templateUseCase}
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-white/10"
                onClick={handleClose}
                data-ocid="payment.cancel.button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 btn-gradient text-white border-0 font-semibold"
                onClick={handleQuestionnaireNext}
                disabled={checkingEmail}
                data-ocid="payment.questionnaire_next.button"
              >
                {checkingEmail ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {checkingEmail ? "Checking..." : "Next"}
              </Button>
            </div>
          </div>
        )}

        {/* ── Blocked ─────────────────────────────────────────────────── */}
        {step === "blocked" && (
          <div
            className="space-y-4 text-center"
            data-ocid="payment.blocked.error_state"
          >
            <div className="flex justify-center">
              <Ban className="w-16 h-16" style={{ color: "#ff4d4d" }} />
            </div>
            <p className="font-semibold text-lg">Your email has been blocked</p>
            <p className="text-muted-foreground text-sm">
              The email address <strong>{form.email}</strong> has been
              restricted from making purchases. If you believe this is an error,
              please contact us at brightbyteestudios68@gmail.com.
            </p>
            <Button
              className="w-full btn-gradient text-white border-0"
              onClick={handleClose}
              data-ocid="payment.blocked.close_button"
            >
              Close
            </Button>
          </div>
        )}

        {/* ── Instructions ────────────────────────────────────────────── */}
        {step === "instructions" && (
          <div className="space-y-5">
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-muted-foreground text-sm mb-1">
                Amount to Pay
              </p>
              <p className="text-3xl font-black" style={{ color: "#28D7FF" }}>
                {priceFormatted}
              </p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-muted-foreground text-xs mb-1">UPI ID</p>
              <p
                className="font-mono font-bold text-sm"
                style={{ color: "#8B5CFF" }}
              >
                {upiId}
              </p>
            </div>
            <p className="text-muted-foreground text-sm text-center">
              Click the button below to open your UPI app with payment details
              pre-filled.
            </p>
            <Button
              className="w-full btn-gradient text-white border-0 font-bold h-12"
              onClick={handleOpenUPI}
              data-ocid="payment.open_upi.button"
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Open UPI App &amp; Pay {priceFormatted}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => setStep("verify")}
            >
              I&apos;ve already paid — Enter transaction ID
            </Button>
          </div>
        )}

        {/* ── Verify ──────────────────────────────────────────────────── */}
        {step === "verify" && (
          <div className="space-y-5">
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-muted-foreground text-sm mb-1">Amount Paid</p>
              <p className="text-2xl font-black" style={{ color: "#28D7FF" }}>
                {priceFormatted}
              </p>
            </div>

            {/* Transaction ID */}
            <div className="space-y-2">
              <Label htmlFor="txn-ref" className="text-sm font-medium">
                UPI Transaction ID / Reference Number
              </Label>
              <Input
                id="txn-ref"
                placeholder="e.g. 407812345678"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="bg-white/5 border-white/10"
                data-ocid="payment.txn_ref.input"
              />
              <p className="text-xs text-muted-foreground">
                Find this in your UPI app under recent transactions.
              </p>
            </div>

            {/* Screenshot upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Upload Payment Screenshot (required)
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleScreenshotChange}
                  className="bg-white/5 border-white/10 flex-1"
                  data-ocid="payment.screenshot.upload_button"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 shrink-0"
                  onClick={handleUploadScreenshot}
                  disabled={!screenshotFile || isUploading}
                  data-ocid="payment.screenshot_upload.button"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {isUploading && (
                <div
                  className="space-y-1"
                  data-ocid="payment.screenshot.loading_state"
                >
                  <Progress value={uploadProgress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
              {screenshotBlobId && (
                <p
                  className="text-xs"
                  style={{ color: "#2FF6FF" }}
                  data-ocid="payment.screenshot.success_state"
                >
                  ✓ Screenshot uploaded successfully
                </p>
              )}
              {!screenshotBlobId && screenshotFile && !isUploading && (
                <p className="text-xs text-yellow-400">
                  ⚠ Click the upload button to upload your screenshot
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-white/10"
                onClick={() => setStep("instructions")}
                data-ocid="payment.back.button"
              >
                Back
              </Button>
              <Button
                className="flex-1 btn-gradient text-white border-0 font-semibold"
                onClick={handleSubmitOrder}
                disabled={
                  isSubmitting || !transactionRef.trim() || !screenshotBlobId
                }
                data-ocid="payment.confirm.button"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {isSubmitting ? "Submitting..." : "Confirm Order"}
              </Button>
            </div>
          </div>
        )}

        {/* ── Order Submitted ──────────────────────────────────────────── */}
        {step === "order_submitted" && (
          <div
            className="space-y-5 text-center"
            data-ocid="payment.success_state"
          >
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16" style={{ color: "#2FF6FF" }} />
            </div>
            <p
              className="font-bold text-base leading-snug"
              style={{ color: "#2FF6FF" }}
            >
              {confirmationMessage}
            </p>
            <div className="glass-card rounded-xl p-4 text-left space-y-3">
              <p className="text-sm text-muted-foreground">
                Your transaction ID:{" "}
                <span className="font-mono text-white">{transactionRef}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Once your payment is verified by our team, your download will be
                unlocked.
              </p>
            </div>
            <Button
              className="w-full btn-gradient text-white border-0"
              onClick={handleClose}
              data-ocid="payment.close.button"
            >
              Close
            </Button>
            <Button
              variant="outline"
              className="w-full border-white/15 hover:border-white/30"
              onClick={() => setShowOrdersModal(true)}
              data-ocid="payment.check_download.button"
            >
              <Download className="w-4 h-4 mr-2" style={{ color: "#2FF6FF" }} />
              Check Download Status
            </Button>
          </div>
        )}

        {/* ── MyOrdersModal ───────────────────────────────────────────── */}
        <MyOrdersModal
          open={showOrdersModal}
          onClose={() => setShowOrdersModal(false)}
          prefillEmail={form.email}
        />

        {/* ── Error ───────────────────────────────────────────────────── */}
        {step === "error" && (
          <div
            className="space-y-4 text-center"
            data-ocid="payment.error_state"
          >
            <div className="flex justify-center">
              <AlertCircle className="w-16 h-16 text-destructive" />
            </div>
            <p className="text-muted-foreground text-sm">{errorMsg}</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-white/10"
                onClick={handleReset}
                data-ocid="payment.retry.button"
              >
                Try Again
              </Button>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={handleClose}
                data-ocid="payment.cancel.button"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
