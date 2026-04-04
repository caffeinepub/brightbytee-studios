import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Star } from "lucide-react";
import { motion } from "motion/react";
import { useAnnouncements } from "../hooks/useQueries";

function formatDate(ts: bigint) {
  const ms = Number(ts);
  if (!ms) return "Recently";
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AnnouncementsPage() {
  const { data: announcements, isLoading } = useAnnouncements();
  const published = announcements?.filter((a) => a.isPublished) ?? [];

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6" style={{ color: "#28D7FF" }} />
            <p className="text-sm font-semibold" style={{ color: "#28D7FF" }}>
              Updates &amp; News
            </p>
          </div>
          <h1 className="text-5xl font-black mb-4">Announcements</h1>
          <p className="text-muted-foreground">
            Stay up to date with the latest news, releases, and offers from
            BrightBytee Studios.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_v, i) => (
              <Skeleton
                key={i.toString()}
                className="h-36 rounded-2xl"
                data-ocid="announcements.loading_state"
              />
            ))}
          </div>
        ) : published.length === 0 ? (
          <div
            className="text-center py-24"
            data-ocid="announcements.empty_state"
          >
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-xl font-bold mb-2">No Announcements Yet</h3>
            <p className="text-muted-foreground">
              Check back soon for updates and news.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {published.map((ann, i) => (
              <motion.div
                key={ann.id.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                data-ocid={`announcements.item.${i + 1}`}
                className="glass-card rounded-2xl p-8"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4" style={{ color: "#8B5CFF" }} />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(ann.createdAt)}
                  </span>
                </div>
                <h2 className="text-xl font-bold mb-3">{ann.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {ann.content}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
