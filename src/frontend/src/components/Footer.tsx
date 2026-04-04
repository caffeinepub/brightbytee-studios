import { Link } from "@tanstack/react-router";
import { Instagram, Mail } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer
      style={{
        background: "rgba(8,14,26,0.9)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
      className="py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/assets/generated/brightbytee-logo-transparent.dim_120x120.png"
                alt="BrightBytee Studios"
                className="w-8 h-8 object-contain"
              />
              <span
                className="font-bold"
                style={{
                  background: "linear-gradient(90deg, #8B5CFF, #28D7FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                BrightBytee Studios
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Affordable premium website templates for businesses,
              entrepreneurs, and developers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Products</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/templates"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Premium Templates
                </Link>
              </li>
              <li>
                <Link
                  to="/free"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Free Templates
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/announcements"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Announcements
                </Link>
              </li>
              <li>
                <Link
                  to="/policies"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  data-ocid="footer.policies.link"
                >
                  Policies
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Connect</h4>
            <div className="flex flex-col gap-3">
              <a
                href="https://www.instagram.com/brightbyteestudio?igsh=YWtpdjJqbWt0cTc5"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
                data-ocid="footer.instagram.link"
              >
                <Instagram className="w-4 h-4" /> Instagram
              </a>
              <a
                href="mailto:brightbyteestudios68@gmail.com"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
                data-ocid="footer.email.link"
              >
                <Mail className="w-4 h-4" /> Email Us
              </a>
            </div>
          </div>
        </div>
        <div
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-muted-foreground text-sm">
            © {year}. Built with ❤️ using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/brightbyteestudio?igsh=YWtpdjJqbWt0cTc5"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="mailto:brightbyteestudios68@gmail.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
