import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Check, Eye, Loader2, ShoppingCart, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Template } from "../backend";
import { useBlobStorage } from "../hooks/useBlobStorage";
import { useAddReview, useReviews } from "../hooks/useQueries";
import PaymentModal from "./PaymentModal";

interface TemplateCardProps {
  template: Template;
  index: number;
}

const STATIC_PREVIEWS = [
  "/assets/generated/template-preview-1.dim_800x500.jpg",
  "/assets/generated/template-preview-2.dim_800x500.jpg",
  "/assets/generated/template-preview-3.dim_800x500.jpg",
  "/assets/generated/template-preview-4.dim_800x500.jpg",
];

function StarRatingDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            color: star <= rating ? "#FFD700" : "rgba(255,255,255,0.2)",
          }}
          className="text-sm leading-none"
        >
          &#9733;
        </span>
      ))}
    </span>
  );
}

function StarRatingSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" data-ocid="review.rating.select">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl leading-none transition-transform hover:scale-110 focus:outline-none"
          style={{
            color:
              star <= (hovered || value) ? "#FFD700" : "rgba(255,255,255,0.25)",
          }}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          &#9733;
        </button>
      ))}
    </div>
  );
}

export default function TemplateCard({ template, index }: TemplateCardProps) {
  const { getBlobUrl } = useBlobStorage();
  const [imageUrl, setImageUrl] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Review form state
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(
    template.id,
  );
  const addReview = useAddReview();

  useEffect(() => {
    if (template.previewImageBlobId) {
      getBlobUrl(template.previewImageBlobId)
        .then(setImageUrl)
        .catch(() => setImageUrl(""));
    }
  }, [template.previewImageBlobId, getBlobUrl]);

  const displayImage =
    imageUrl || STATIC_PREVIEWS[index % STATIC_PREVIEWS.length];

  const handleSubmitReview = async () => {
    if (!reviewName.trim() || !reviewComment.trim() || reviewRating === 0)
      return;
    try {
      await addReview.mutateAsync({
        templateId: template.id,
        reviewerName: reviewName.trim(),
        rating: BigInt(reviewRating),
        comment: reviewComment.trim(),
      });
      setReviewName("");
      setReviewRating(0);
      setReviewComment("");
      toast.success("Review submitted!");
    } catch (_err) {
      toast.error("Failed to submit review. Please try again.");
    }
  };

  return (
    <>
      <div
        data-ocid={`template.item.${index + 1}`}
        className="glass-card rounded-2xl overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-card"
        style={{ border: "1px solid rgba(255,255,255,0.10)" }}
      >
        <div className="relative h-48 overflow-hidden">
          {displayImage ? (
            <img
              src={displayImage}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.18 0.05 290), oklch(0.18 0.05 210))",
              }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(11,18,32,0.8) 0%, transparent 60%)",
            }}
          />
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-base leading-tight">
              {template.name}
            </h3>
            <Badge
              className="shrink-0 text-white border-0"
              style={{ background: "linear-gradient(90deg, #3B82F6, #2563EB)" }}
            >
              {`\u20B9${Number(template.price).toLocaleString("en-IN")}`}
            </Badge>
          </div>

          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {template.description}
          </p>

          {template.features.length > 0 && (
            <ul className="mb-4 space-y-1">
              {template.features.slice(0, 4).map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Check
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: "#28D7FF" }}
                  />
                  {f}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-auto flex gap-2">
            <Button
              className="flex-1 btn-gradient text-white border-0 font-semibold"
              onClick={() => setPaymentOpen(true)}
              data-ocid={`template.buy.button.${index + 1}`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy &amp; Download
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-white/10 hover:border-white/30"
              onClick={() => setDetailsOpen(true)}
              data-ocid={`template.details.button.${index + 1}`}
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent
          className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
          style={{
            background: "oklch(0.14 0.025 250)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          data-ocid={`template.details.dialog.${index + 1}`}
        >
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <DialogTitle className="text-xl font-black leading-tight pr-6">
                {template.name}
              </DialogTitle>
              <Badge
                className="shrink-0 text-white border-0 text-sm px-3 py-1"
                style={{
                  background:
                    "linear-gradient(90deg, #2FF6FF, #3F7BFF, #8A4CFF, #FF4AF2)",
                }}
              >
                {`\u20B9${Number(template.price).toLocaleString("en-IN")}`}
              </Badge>
            </div>
          </DialogHeader>

          {/* Preview image */}
          <div className="rounded-xl overflow-hidden h-48 mt-1">
            <img
              src={displayImage}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Description */}
          <div className="space-y-4">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "#8A4CFF" }}
              >
                Description
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {template.description || "No description provided."}
              </p>
            </div>

            {/* Features */}
            {template.features.length > 0 && (
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "#2FF6FF" }}
                >
                  Features Included
                </p>
                <ul className="space-y-2">
                  {template.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: "#28D7FF" }}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reviews Section */}
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "#FF4AF2" }}
              >
                Customer Reviews
              </p>

              {reviewsLoading ? (
                <div
                  className="flex items-center gap-2 text-sm py-3"
                  style={{ color: "rgba(255,255,255,0.4)" }}
                  data-ocid={`template.reviews.loading_state.${index + 1}`}
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading reviews...
                </div>
              ) : reviews.length === 0 ? (
                <p
                  className="text-sm py-3 italic"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  data-ocid={`template.reviews.empty_state.${index + 1}`}
                >
                  No reviews yet. Be the first to review!
                </p>
              ) : (
                <div
                  className="space-y-3 mb-4"
                  data-ocid={`template.reviews.list.${index + 1}`}
                >
                  {reviews.map((review, i) => (
                    <div key={review.id.toString()}>
                      <div
                        className="rounded-xl p-3 space-y-1.5"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                        data-ocid={`template.review.item.${i + 1}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <StarRatingDisplay rating={Number(review.rating)} />
                          <span
                            className="text-xs"
                            style={{ color: "rgba(255,255,255,0.35)" }}
                          >
                            {new Date(
                              Number(review.createdAt) / 1_000_000,
                            ).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: "rgba(255,255,255,0.7)" }}
                        >
                          {review.reviewerName}
                        </p>
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: "rgba(255,255,255,0.55)" }}
                        >
                          {review.comment}
                        </p>
                      </div>
                      {i < reviews.length - 1 && (
                        <Separator
                          className="mt-3"
                          style={{ background: "rgba(255,255,255,0.07)" }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Leave a review form */}
              <div
                className="rounded-xl p-4 space-y-3 mt-2"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                data-ocid={`template.review.panel.${index + 1}`}
              >
                <p
                  className="text-xs font-semibold"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Leave a Review
                </p>

                <input
                  type="text"
                  placeholder="Your name"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-white/20 placeholder:text-white/25 text-white"
                  style={{
                    background: "oklch(0.18 0.03 250)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                  data-ocid={`template.review.input.${index + 1}`}
                />

                <StarRatingSelector
                  value={reviewRating}
                  onChange={setReviewRating}
                />

                <Textarea
                  placeholder="Share your experience with this template..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  className="w-full text-sm rounded-lg outline-none focus:ring-1 focus:ring-white/20 placeholder:text-white/25 text-white resize-none"
                  style={{
                    background: "oklch(0.18 0.03 250)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                  data-ocid={`template.review.textarea.${index + 1}`}
                />

                <Button
                  className="w-full btn-gradient text-white border-0 font-semibold h-9 text-sm"
                  onClick={handleSubmitReview}
                  disabled={
                    !reviewName.trim() ||
                    !reviewComment.trim() ||
                    reviewRating === 0 ||
                    addReview.isPending
                  }
                  data-ocid={`template.review.submit_button.${index + 1}`}
                >
                  {addReview.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1 btn-gradient text-white border-0 font-bold h-11"
              onClick={() => {
                setDetailsOpen(false);
                setPaymentOpen(true);
              }}
              data-ocid={`template.details.buy.button.${index + 1}`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy &amp; Download &mdash;{" "}
              {`\u20B9${Number(template.price).toLocaleString("en-IN")}`}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-white/10 hover:border-white/30 h-11 w-11"
              onClick={() => setDetailsOpen(false)}
              data-ocid={`template.details.close.button.${index + 1}`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        template={template}
      />
    </>
  );
}
