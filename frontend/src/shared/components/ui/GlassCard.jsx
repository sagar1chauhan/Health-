import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', ...props }) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}
      className={`glass-card p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
