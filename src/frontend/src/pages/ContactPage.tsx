import { Clock, Instagram, Mail, MessageCircle } from "lucide-react";
import { motion } from "motion/react";

export default function ContactPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p
            className="text-sm font-semibold mb-2"
            style={{ color: "#28D7FF" }}
          >
            Get In Touch
          </p>
          <h1 className="text-5xl font-black mb-4">Contact Us</h1>
          <p className="text-muted-foreground">
            We'd love to hear from you. Reach out through any of the channels
            below.
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Email */}
          <motion.a
            href="mailto:brightbyteestudios68@gmail.com"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6 flex items-center gap-5 hover:border-white/25 transition-colors group"
            data-ocid="contact.email.link"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(139,92,255,0.15)" }}
            >
              <Mail className="w-6 h-6" style={{ color: "#8B5CFF" }} />
            </div>
            <div>
              <p className="font-bold mb-1">Email</p>
              <p className="text-muted-foreground">
                For contacting us E-mail on
              </p>
              <p className="font-semibold mt-1" style={{ color: "#28D7FF" }}>
                brightbyteestudios68@gmail.com
              </p>
            </div>
          </motion.a>

          {/* Instagram */}
          <motion.a
            href="https://www.instagram.com/brightbyteestudio?igsh=YWtpdjJqbWt0cTc5"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 flex items-center gap-5 hover:border-white/25 transition-colors group"
            data-ocid="contact.instagram.link"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(40,215,255,0.15)" }}
            >
              <Instagram className="w-6 h-6" style={{ color: "#28D7FF" }} />
            </div>
            <div>
              <p className="font-bold mb-1">Instagram</p>
              <p className="text-muted-foreground">
                Follow us for template previews and updates
              </p>
              <p className="font-semibold mt-1" style={{ color: "#28D7FF" }}>
                @brightbyteestudio
              </p>
            </div>
          </motion.a>

          {/* Response time */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6 flex items-center gap-5"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(59,130,246,0.15)" }}
            >
              <Clock className="w-6 h-6" style={{ color: "#3B82F6" }} />
            </div>
            <div>
              <p className="font-bold mb-1">Response Time</p>
              <p className="text-muted-foreground">
                We typically respond within 24 hours on business days.
              </p>
            </div>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-6 flex items-center gap-5"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(139,92,255,0.15)" }}
            >
              <MessageCircle className="w-6 h-6" style={{ color: "#8B5CFF" }} />
            </div>
            <div>
              <p className="font-bold mb-1">Template Support</p>
              <p className="text-muted-foreground">
                Need help with a template? Email us with your order reference
                and we'll assist you promptly.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
