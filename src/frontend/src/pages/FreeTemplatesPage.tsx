import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import FreeTemplateCard from "../components/FreeTemplateCard";
import { useFreeTemplates } from "../hooks/useQueries";

export default function FreeTemplatesPage() {
  const { data: freeTemplates, isLoading } = useFreeTemplates();

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
            style={{ color: "#28D7FF" }}
          >
            No Cost, Full Value
          </p>
          <h1 className="text-5xl font-black mb-4">Free Templates</h1>
          <p className="text-muted-foreground max-w-xl">
            Completely free website templates to help you get started. No
            payment required — download and deploy instantly.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_v, i) => (
              <Skeleton
                key={i.toString()}
                className="h-80 rounded-2xl"
                data-ocid="free.loading_state"
              />
            ))}
          </div>
        ) : !freeTemplates || freeTemplates.length === 0 ? (
          <div className="text-center py-24" data-ocid="free.empty_state">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-bold mb-2">No Free Templates Yet</h3>
            <p className="text-muted-foreground">
              We&apos;re working on adding free templates. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeTemplates.map((t, i) => (
              <motion.div
                key={t.id.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <FreeTemplateCard template={t} index={i} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
