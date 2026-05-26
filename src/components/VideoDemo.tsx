import React, { useState } from 'react';
import { Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const VideoDemo: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const arcadeUrl = "https://demo.arcade.software/video/PhAlgDikHvgYdmS0aXpR?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Botón solicitado */}
      <button 
        onClick={() => setShowModal(true)}
        className="w-full sm:w-auto px-6 py-4 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:-translate-y-1 transition-all group hover:bg-indigo-600 hover:text-white"
      >
        <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
        Ver Video Demo
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl aspect-video bg-[#0d111d] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-white/10 rounded-full text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <iframe 
                src={arcadeUrl}
                className="w-full h-full"
                frameBorder="0" loading="lazy" allowFullScreen allow="clipboard-write"
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};