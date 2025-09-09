// src/components/Timeline.tsx
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

export type TimelineEvent = {
  year: string;
  title: string;
  company: string;
  description: string;
};

type TimelineProps = {
  events: TimelineEvent[];
  title?: string;
};

export default function Timeline({ events, title = "Career Timeline" }: TimelineProps) {
  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, x: -16 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "tween" as const, ease: "easeOut" as const, duration: 0.25 },
    },
  };

  return (
    <div className="relative mx-auto max-w-2xl py-10">
      <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>
      <motion.div
        className="relative border-l-2 border-gray-300"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {events.length === 0 && (
          <div className="ml-6 text-slate-600 text-sm">No entries yet.</div>
        )}
        {events.map((event, idx) => (
          <motion.div
            key={`${event.year}-${event.title}-${idx}`}
            variants={item}
            className="relative mb-10 ml-8 will-change-transform"
          >
            <span aria-hidden className="absolute -left-4 top-1 h-5 w-5 rounded-full bg-blue-600 ring-4 ring-white" />
            <div className="ml-3">
              <h3 className="pl-0.5 text-lg font-semibold text-slate-900">
                {event.title}{event.company ? ` @ ${event.company}` : ""}
              </h3>
              <time className="text-sm text-slate-500">{event.year}</time>
              <p className="mt-2 text-slate-700">{event.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
