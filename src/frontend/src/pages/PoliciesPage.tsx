import { Button } from "@/components/ui/button";
import { FileText, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useBlobStorage } from "../hooks/useBlobStorage";
import { useGetPolicyDocuments } from "../hooks/useQueries";

const policyTypes = [
  {
    key: "privacy",
    label: "Privacy Policy",
    icon: Shield,
    description: "How we collect, use, and protect your personal information.",
  },
  {
    key: "terms",
    label: "Terms of Service",
    icon: FileText,
    description:
      "The rules and guidelines for using our services and products.",
  },
  {
    key: "copyright",
    label: "Copyright Policy",
    icon: FileText,
    description:
      "Our intellectual property rights and permitted usage of our templates.",
  },
];

export default function PoliciesPage() {
  const { data: policyDocuments, isLoading } = useGetPolicyDocuments();
  const { getBlobUrl } = useBlobStorage();

  const handleView = async (blobId: string) => {
    try {
      const url = await getBlobUrl(blobId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (_err) {
      // fallback: do nothing
    }
  };

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(139,92,255,0.15)" }}
          >
            <Shield className="w-8 h-8" style={{ color: "#8B5CFF" }} />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black mb-4">
            Our{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #8B5CFF, #28D7FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Policies
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transparency is core to how we operate. Read our policies to
            understand your rights and our commitments to you.
          </p>
        </motion.div>

        <div className="grid gap-6">
          {policyTypes.map((policy, i) => {
            const doc = (policyDocuments ?? []).find(
              (d) => d.docType === policy.key,
            );
            const Icon = policy.icon;
            return (
              <motion.div
                key={policy.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6"
                data-ocid={`policies.${policy.key}.card`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(139,92,255,0.15)" }}
                    >
                      <Icon className="w-6 h-6" style={{ color: "#8B5CFF" }} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold mb-1">{policy.label}</h2>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                        {policy.description}
                      </p>
                      {isLoading ? (
                        <p
                          className="text-sm text-muted-foreground"
                          data-ocid={`policies.${policy.key}.loading_state`}
                        >
                          Loading...
                        </p>
                      ) : doc ? (
                        <p className="text-sm text-muted-foreground">
                          File:{" "}
                          <span className="text-foreground font-medium">
                            {doc.fileName}
                          </span>
                        </p>
                      ) : (
                        <p
                          className="text-sm text-muted-foreground italic"
                          data-ocid={`policies.${policy.key}.empty_state`}
                        >
                          Not yet available
                        </p>
                      )}
                    </div>
                  </div>
                  {doc && (
                    <div className="flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/10 gap-2"
                        onClick={() => handleView(doc.blobId)}
                        data-ocid={`policies.${policy.key}.button`}
                      >
                        <FileText className="w-4 h-4" />
                        View
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-muted-foreground text-sm mt-12"
        >
          Questions about our policies? Contact us at{" "}
          <a
            href="mailto:brightbyteestudios68@gmail.com"
            className="text-foreground hover:underline"
          >
            brightbyteestudios68@gmail.com
          </a>
        </motion.p>
      </div>
    </div>
  );
}
