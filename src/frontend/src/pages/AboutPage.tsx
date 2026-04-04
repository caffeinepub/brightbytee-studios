import { Globe, Shield, Star, Target, Users, Zap } from "lucide-react";
import { motion } from "motion/react";

const values = [
  {
    icon: Target,
    title: "Pixel-Perfect Design",
    desc: "Every template is crafted with obsessive attention to detail — clean code, modern aesthetics.",
  },
  {
    icon: Zap,
    title: "Instant Delivery",
    desc: "Download templates instantly after purchase. No waiting, no hassle, just pure productivity.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    desc: "All payments processed securely via UPI. Your transaction data is safe and verified.",
  },
  {
    icon: Users,
    title: "Built for Everyone",
    desc: "From freelancers to enterprises, our templates scale with your ambitions and budget.",
  },
  {
    icon: Star,
    title: "Premium Quality",
    desc: "Each template undergoes rigorous quality checks. We ship nothing short of excellence.",
  },
  {
    icon: Globe,
    title: "Fully Responsive",
    desc: "All templates are mobile-first and work seamlessly on every device and screen size.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="flex justify-center mb-6">
            <img
              src="/assets/generated/brightbytee-logo-transparent.dim_120x120.png"
              alt="BrightBytee Studios"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-5xl lg:text-6xl font-black mb-6">
            About{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #8B5CFF, #28D7FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              BrightBytee Studios
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We&apos;re a creative digital studio founded with a singular
            mission: make premium-quality website templates accessible to
            everyone in India — from solo entrepreneurs to growing businesses.
          </p>
        </motion.div>

        {/* Story */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold mb-5">Our Story</h2>
            <h3
              className="text-lg font-black mb-4"
              style={{
                background: "linear-gradient(90deg, #8B5CFF, #28D7FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              🌟 The Story of BryteBytee Studios
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              BryteBytee Studios was born out of a spark of curiosity and
              creativity. One ordinary afternoon, two 16-year-old friends—armed
              with nothing more than laptops, imagination, and a shared love for
              design—decided to turn a random idea into something real. What
              started as playful experimentation with websites quickly grew into
              a vision: to build a studio that makes digital experiences feel
              bright, bold, and unforgettable.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The name BryteBytee reflects exactly that spirit: bright ideas
              powered by digital bytes. It&apos;s about blending youthful energy
              with technical skill, proving that innovation doesn&apos;t wait
              for age—it thrives on passion.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              From day one, the founders set out to create websites that
              aren&apos;t just functional, but also carry personality,
              storytelling, and design flair. Their mission is simple: to help
              brands—big or small—shine online with clarity, creativity, and
              confidence.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To democratize beautiful web design. We specialize in modern,
              responsive HTML templates that help businesses establish a strong
              online presence quickly. Whether you&apos;re launching a startup,
              showcasing a portfolio, or running an e-commerce store — we have
              the right template for you.
            </p>
          </motion.div>
        </div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-black text-center mb-10">
            What We Stand For
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(139,92,255,0.15)" }}
                >
                  <val.icon className="w-5 h-5" style={{ color: "#8B5CFF" }} />
                </div>
                <h3 className="font-bold mb-2">{val.title}</h3>
                <p className="text-sm text-muted-foreground">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Founders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-black text-center mb-10">
            Meet the Founders
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-8"
            >
              <div className="mb-5">
                <h3
                  className="text-2xl font-black mb-1"
                  style={{
                    background: "linear-gradient(90deg, #8B5CFF, #28D7FF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Vihaan Shrivastava
                </h3>
                <p className="text-sm font-semibold text-muted-foreground">
                  Founder &amp; Creative Strategist
                </p>
              </div>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">
                    Strengths:{" "}
                  </span>
                  Visionary thinker, brand storyteller, and design
                  perfectionist. Vihaan thrives on shaping brand identity,
                  messaging, and customer experience. He loves experimenting
                  with elegant layouts, premium color palettes, and refined
                  typography.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">
                    Personality:{" "}
                  </span>
                  Warm, collaborative, and imaginative. He brings playful
                  creativity to projects but balances it with structured,
                  solution-oriented execution.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">
                    Passion:{" "}
                  </span>
                  Turning emotional experiences into personalized digital
                  keepsakes, and blending authenticity with modern design.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-2xl p-8"
            >
              <div className="mb-5">
                <h3
                  className="text-2xl font-black mb-1"
                  style={{
                    background: "linear-gradient(90deg, #8B5CFF, #28D7FF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Co-Founder
                </h3>
                <p className="text-sm font-semibold text-muted-foreground">
                  Co-Founder &amp; Technical Architect
                </p>
                <p className="text-xs text-muted-foreground mt-1 italic">
                  (Details not publicly disclosed due to privacy reasons)
                </p>
              </div>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">
                    Strengths:{" "}
                  </span>
                  Skilled in coding, web/app development, and problem-solving.
                  They focus on building smooth, secure, and scalable websites
                  that match Vihaan&apos;s creative vision.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">
                    Personality:{" "}
                  </span>
                  Analytical, detail-oriented, and innovative. They love finding
                  clever solutions to technical challenges and ensuring every
                  project runs seamlessly.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">
                    Passion:{" "}
                  </span>
                  Exploring new technologies, experimenting with interactive
                  features, and making websites not just look good—but perform
                  brilliantly.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
            {[
              { label: "Happy Customers", value: "500+" },
              { label: "Starting Price", value: "₹500" },
              { label: "Industries Covered", value: "15+" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="text-3xl font-black mb-1"
                  style={{
                    background: "linear-gradient(90deg, #8B5CFF, #28D7FF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
