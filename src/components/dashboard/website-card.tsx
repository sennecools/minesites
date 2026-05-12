"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Server, ArrowUpRight, MoreHorizontal, Layers } from "lucide-react";
import { Badge } from "@/components/ui";

export interface WebsiteCardData {
  id: string;
  name: string;
  subdomain: string;
  description: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { sections: number };
}

interface WebsiteCardProps {
  website: WebsiteCardData;
  index: number;
}

export function WebsiteCard({ website, index }: WebsiteCardProps) {
  const router = useRouter();
  const navigate = () => router.push(`/dashboard/${website.id}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
    >
      {/*
        CR-01 fix: swap the outer <Link> for programmatic navigation so the
        inner <a> ("Visit live site") and the <motion.button> ("More options")
        no longer nest under an interactive <a>. role="link" + tabIndex={0} +
        onKeyDown(Enter/Space) keeps keyboard and AT navigation intact.
      */}
      <motion.div
        role="link"
        tabIndex={0}
        aria-label={`Open ${website.name}`}
        onClick={navigate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate();
          }
        }}
        whileHover={{ y: -4, transition: { duration: 0.15 } }}
        className="group p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-sm hover:shadow-lg hover:border-cyan-200/50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                website.published
                  ? "bg-gradient-to-br from-cyan-500 to-emerald-500"
                  : "bg-zinc-200"
              }`}
            >
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 group-hover:text-cyan-600 transition-colors">
                {website.name}
              </h3>
              <p className="text-xs text-zinc-400">{website.subdomain}.minesites.net</p>
            </div>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
            aria-label={`More options for ${website.name}`}
          >
            <MoreHorizontal className="w-4 h-4 text-zinc-400" />
          </motion.button>
        </div>

        {/* Description */}
        {website.description && (
          <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
            {website.description}
          </p>
        )}

        {/* Info row — section count (D-09) */}
        <div className="flex items-center gap-4 mb-4">
          <Badge
            variant="default"
            aria-label={`${website._count.sections} sections in this website`}
          >
            <Layers className="w-3.5 h-3.5 mr-1 inline" />
            {website._count.sections} sections
          </Badge>
        </div>

        {/* Footer — live-status pill + visit affordance (D-10) */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-normal ${
              website.published
                ? "bg-emerald-50 text-emerald-600"
                : "bg-zinc-100 text-zinc-500"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                website.published ? "bg-emerald-500" : "bg-zinc-400"
              }`}
            />
            {website.published ? "Live" : "Draft"}
          </span>
          <a
            href={`https://${website.subdomain}.minesites.net`}
            target="_blank"
            rel="noreferrer noopener"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Visit live site for ${website.name}`}
            className="flex items-center gap-1 text-xs text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Visit <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
