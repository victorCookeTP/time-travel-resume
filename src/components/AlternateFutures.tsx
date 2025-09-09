import { motion } from "framer-motion";

export type FutureItem = {
  title: string;
  year: string;
  company: string;
  description: string;
};

type AlternateFuturesProps = {
  items: FutureItem[];
};

export default function AlternateFutures({ items }: AlternateFuturesProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="text-2xl font-semibold mb-6 text-slate-900">Alternate Futures</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20, rotateX: -10 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            viewport={{ once: true }}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow hover:shadow-lg"
          >
            <div className="text-sm text-slate-500">{item.year}</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">{item.title}</div>
            <div className="text-sm text-slate-600">{item.company}</div>
            <p className="mt-3 text-slate-700 text-sm leading-relaxed">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


