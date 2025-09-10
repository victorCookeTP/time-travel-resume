// src/components/Timeline.tsx
import { motion } from "framer-motion";
import { useRef, useState } from "react";
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
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

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
        className="relative border-l-2 border-slate-200"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {events.length === 0 && (
          <div className="ml-6 text-slate-600 text-sm">No entries yet.</div>
        )}
        {events.map((event, idx) => {
          const isActive = idx === activeIndex;
          return (
            <motion.div
              key={`${event.year}-${event.title}-${idx}`}
              variants={item}
              data-index={idx}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              onMouseEnter={() => setActiveIndex(idx)}
              onFocus={() => setActiveIndex(idx)}
              whileHover={{ x: 4 }}
              className={
                "group relative mb-10 ml-8 will-change-transform transition-colors" +
                (isActive ? "" : "")
              }
            >
              <span
                aria-hidden
                className={
                  "absolute -left-4 top-1 h-5 w-5 rounded-full ring-4 transition-transform duration-200 " +
                  (isActive
                    ? "bg-blue-600 ring-blue-100 scale-110"
                    : "bg-blue-600 ring-white group-hover:scale-110")
                }
              />
              <div
                className={
                  "ml-3 rounded-lg p-2 transition-all duration-200 " +
                  (isActive
                    ? "bg-white shadow-sm border border-slate-200"
                    : "group-hover:bg-white/60")
                }
              >
                <h3
                  className={
                    "pl-0.5 text-lg font-semibold transition-colors " +
                    (isActive ? "text-slate-900" : "text-slate-900 group-hover:text-slate-900")
                  }
                >
                  {event.title}
                  {event.company ? ` @ ${event.company}` : ""}
                </h3>
                <time className={"text-sm transition-colors " + (isActive ? "text-slate-600" : "text-slate-500")}>{event.year}</time>
                <p className="mt-2 text-slate-700">{event.description}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
