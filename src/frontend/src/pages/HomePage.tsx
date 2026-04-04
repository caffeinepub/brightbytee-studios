import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Star, Zap } from "lucide-react";
import { motion } from "motion/react";
import FreeTemplateCard from "../components/FreeTemplateCard";
import TemplateCard from "../components/TemplateCard";
import {
  useAnnouncements,
  useFreeTemplates,
  useTemplates,
} from "../hooks/useQueries";

const SAMPLE_TEMPLATES = [
  {
    id: BigInt(1),
    name: "NexaLaunch Pro",
    description:
      "A stunning SaaS landing page with glassmorphism cards and animated hero section.",
    price: BigInt(2999),
    isFree: false,
    previewImageBlobId: "",
    templateFileBlobId: "sample",
    features: [
      "Responsive Design",
      "Dark/Light Mode",
      "Animated Hero",
      "SEO Optimized",
    ],
    createdAt: BigInt(0),
  },
  {
    id: BigInt(2),
    name: "ShopNova E-Commerce",
    description:
      "Complete online store template with product grids, cart, and checkout pages.",
    price: BigInt(4999),
    isFree: false,
    previewImageBlobId: "",
    templateFileBlobId: "sample",
    features: [
      "Product Grid",
      "Cart System",
      "Filter & Search",
      "Mobile First",
    ],
    createdAt: BigInt(0),
  },
  {
    id: BigInt(3),
    name: "PortfolioX Elite",
    description:
      "Professional portfolio template for designers, photographers, and creatives.",
    price: BigInt(1999),
    isFree: false,
    previewImageBlobId: "",
    templateFileBlobId: "sample",
    features: [
      "Project Gallery",
      "Skills Section",
      "Contact Form",
      "Smooth Animations",
    ],
    createdAt: BigInt(0),
  },
  {
    id: BigInt(4),
    name: "DineDeluxe Restaurant",
    description:
      "Premium restaurant website with menu showcase and online reservation integration.",
    price: BigInt(3499),
    isFree: false,
    previewImageBlobId: "",
    templateFileBlobId: "sample",
    features: [
      "Menu Display",
      "Reservation Form",
      "Gallery Section",
      "Map Integration",
    ],
    createdAt: BigInt(0),
  },
];

const SAMPLE_FREE = [
  {
    id: BigInt(10),
    name: "Minimal Blog Starter",
    description:
      "Clean, lightweight blog template with article cards and category filters.",
    price: BigInt(0),
    isFree: true,
    previewImageBlobId: "",
    templateFileBlobId: "sample",
    features: [],
    createdAt: BigInt(0),
  },
  {
    id: BigInt(11),
    name: "Personal Card Site",
    description:
      "One-page personal branding website with contact links and social media.",
    price: BigInt(0),
    isFree: true,
    previewImageBlobId: "",
    templateFileBlobId: "sample",
    features: [],
    createdAt: BigInt(0),
  },
  {
    id: BigInt(12),
    name: "Startup Landing Free",
    description:
      "Simple but effective startup landing page with headline and CTA button.",
    price: BigInt(0),
    isFree: true,
    previewImageBlobId: "",
    templateFileBlobId: "sample",
    features: [],
    createdAt: BigInt(0),
  },
];

const SAMPLE_ANNOUNCEMENTS = [
  {
    id: BigInt(1),
    title: "🎉 10 New Premium Templates Dropping This Month!",
    content:
      "We're releasing a massive batch of 10 brand-new premium templates across different niches.",
    isPublished: true,
    createdAt: BigInt(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: BigInt(2),
    title: "🎁 Launch Sale — 30% OFF All Templates",
    content:
      "Celebrate our launch with an exclusive 30% discount on all premium templates.",
    isPublished: true,
    createdAt: BigInt(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: BigInt(3),
    title: "📦 Instant Download After Payment",
    content:
      "All purchases now support instant automated downloads after UPI payment verification.",
    isPublished: true,
    createdAt: BigInt(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

function formatDate(ts: bigint) {
  const ms = Number(ts);
  if (!ms) return "Recently";
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function HomePage() {
  const { data: templates, isLoading: loadingTemplates } = useTemplates();
  const { data: freeTemplates, isLoading: loadingFree } = useFreeTemplates();
  const { data: announcements, isLoading: loadingAnnouncements } =
    useAnnouncements();

  const displayTemplates =
    templates && templates.length > 0
      ? templates.slice(0, 4)
      : SAMPLE_TEMPLATES;
  const displayFree =
    freeTemplates && freeTemplates.length > 0
      ? freeTemplates.slice(0, 3)
      : SAMPLE_FREE;
  const displayAnnouncements =
    announcements && announcements.filter((a) => a.isPublished).length > 0
      ? announcements.filter((a) => a.isPublished).slice(0, 3)
      : SAMPLE_ANNOUNCEMENTS;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        {/* Logo-matched background orbs: cyan + magenta */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, #FF4AF2, transparent)",
          }}
        />
        <div
          className="absolute top-20 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{
            background: "radial-gradient(circle, #2FF6FF, transparent)",
          }}
        />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold"
                style={{
                  background: "rgba(47,246,255,0.12)",
                  border: "1px solid rgba(47,246,255,0.35)",
                  color: "#2FF6FF",
                }}
              >
                <Sparkles className="w-3 h-3" /> Premium Website Templates
              </div>
              <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] mb-6">
                Build{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, #2FF6FF, #3F7BFF, #8A4CFF, #FF4AF2)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Stunning
                </span>{" "}
                Websites Faster
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg">
                Ready-to-use, modern HTML templates for businesses,
                entrepreneurs, and developers. Start from ₹500.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/templates" data-ocid="hero.browse.button">
                  <Button
                    size="lg"
                    className="btn-gradient text-white border-0 font-bold px-8 h-12 rounded-full"
                  >
                    Browse Templates <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/free" data-ocid="hero.free.button">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/15 hover:border-white/30 rounded-full h-12 px-8"
                  >
                    <Zap
                      className="w-5 h-5 mr-2"
                      style={{ color: "#2FF6FF" }}
                    />{" "}
                    Get Free Templates
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-10">
                <div className="text-center">
                  <p className="text-2xl font-black">₹500+</p>
                  <p className="text-xs text-muted-foreground">
                    Starting Price
                  </p>
                </div>
                <div
                  className="w-px h-10"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                />
                <div className="text-center">
                  <p className="text-2xl font-black">100%</p>
                  <p className="text-xs text-muted-foreground">Responsive</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative h-[500px]">
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="absolute top-0 right-0 w-72 rounded-2xl overflow-hidden shadow-2xl glow-purple"
                  style={{ transform: "rotate(3deg)" }}
                >
                  <img
                    src="/assets/generated/template-preview-1.dim_800x500.jpg"
                    alt="Template preview"
                    className="w-full"
                  />
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{
                    duration: 4.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                  className="absolute top-16 left-0 w-64 rounded-2xl overflow-hidden shadow-2xl glow-cyan"
                  style={{ transform: "rotate(-4deg)" }}
                >
                  <img
                    src="/assets/generated/template-preview-2.dim_800x500.jpg"
                    alt="Template preview"
                    className="w-full"
                  />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute bottom-0 right-8 w-60 rounded-2xl overflow-hidden shadow-2xl"
                  style={{
                    transform: "rotate(2deg)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <img
                    src="/assets/generated/template-preview-3.dim_800x500.jpg"
                    alt="Template preview"
                    className="w-full"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Premium Templates */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "#8A4CFF" }}
              >
                Our Collection
              </p>
              <h2 className="text-4xl font-black">Premium Templates</h2>
            </div>
            <Link to="/templates" data-ocid="home.view_all_templates.link">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          {loadingTemplates ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="h-96 rounded-2xl"
                  data-ocid="templates.loading_state"
                />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayTemplates.map((t, i) => (
                <TemplateCard key={t.id.toString()} template={t} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Free Templates */}
      <section
        className="py-20 px-4"
        style={{ background: "rgba(47,246,255,0.03)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "#2FF6FF" }}
              >
                At No Cost
              </p>
              <h2 className="text-4xl font-black">Free Website Templates</h2>
            </div>
            <Link to="/free" data-ocid="home.view_all_free.link">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          {loadingFree ? (
            <div className="grid sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-80 rounded-2xl"
                  data-ocid="free.loading_state"
                />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-6">
              {displayFree.map((t, i) => (
                <FreeTemplateCard
                  key={t.id.toString()}
                  template={t}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Announcements */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: "#2FF6FF" }}
              >
                Stay Updated
              </p>
              <h2 className="text-4xl font-black">Latest Announcements</h2>
            </div>
            <Link
              to="/announcements"
              data-ocid="home.view_all_announcements.link"
            >
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          {loadingAnnouncements ? (
            <div className="grid sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-52 rounded-2xl"
                  data-ocid="announcements.loading_state"
                />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-6">
              {displayAnnouncements.map((ann, i) => (
                <motion.div
                  key={ann.id.toString()}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  data-ocid={`announcements.item.${i + 1}`}
                  className="glass-card rounded-2xl p-6 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4" style={{ color: "#8A4CFF" }} />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(ann.createdAt)}
                    </span>
                  </div>
                  <h3 className="font-bold mb-2">{ann.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {ann.content}
                  </p>
                  <Link
                    to="/announcements"
                    className="text-sm font-semibold"
                    style={{ color: "#2FF6FF" }}
                  >
                    Read More →
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
