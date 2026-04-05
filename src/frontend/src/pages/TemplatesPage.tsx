import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import MyOrdersModal from "../components/MyOrdersModal";
import TemplateCard from "../components/TemplateCard";
import { useTemplates } from "../hooks/useQueries";

export default function TemplatesPage() {
  const { data: templates, isLoading } = useTemplates();
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p
            className="text-sm font-semibold mb-2"
            style={{ color: "#8B5CFF" }}
          >
            Premium Collection
          </p>
          <h1 className="text-5xl font-black mb-4">All Premium Templates</h1>
          <p className="text-muted-foreground max-w-xl">
            Hand-crafted, pixel-perfect website templates ready to deploy.
            Prices range from ₹500 to ₹1,00,000.
          </p>
          <Button
            variant="outline"
            className="mt-4 border-white/15 hover:border-white/30 rounded-full"
            onClick={() => setShowOrdersModal(true)}
            data-ocid="templates.check_download.button"
          >
            <Download className="w-4 h-4 mr-2" style={{ color: "#2FF6FF" }} />
            Check My Download Status
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_v, i) => (
              <Skeleton
                key={i.toString()}
                className="h-96 rounded-2xl"
                data-ocid="templates.loading_state"
              />
            ))}
          </div>
        ) : !templates || templates.length === 0 ? (
          <div className="text-center py-24" data-ocid="templates.empty_state">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-2">
              No Templates Available Yet
            </h3>
            <p className="text-muted-foreground">
              Check back soon — premium templates are being added.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((t, i) => (
              <motion.div
                key={t.id.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <TemplateCard template={t} index={i} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <MyOrdersModal
        open={showOrdersModal}
        onClose={() => setShowOrdersModal(false)}
      />
    </div>
  );
}
