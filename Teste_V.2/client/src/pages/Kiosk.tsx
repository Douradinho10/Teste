import { useState } from "react";
import { useSubmitFeedback } from "@/hooks/use-feedback";
import { KioskButton } from "@/components/KioskButton";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function Kiosk() {
  const [showThankYou, setShowThankYou] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const submitMutation = useSubmitFeedback();

  const handleVote = (rating: 'very_satisfied' | 'satisfied' | 'dissatisfied') => {
    if (cooldown) return;

    submitMutation.mutate({ rating }, {
      onSuccess: () => {
        setShowThankYou(true);
        setCooldown(true);
        
        // Hide thank you after 2s
        setTimeout(() => setShowThankYou(false), 2000);
        
        // Enable buttons after 3s total
        setTimeout(() => setCooldown(false), 3000);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-8 select-none">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto text-center space-y-8 md:space-y-16">
        <header className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 leading-tight">
            Como foi a sua experiência hoje?
          </h1>
          <p className="text-lg md:text-2xl text-slate-600 font-medium">
            A sua opinião ajuda-nos a melhorar o nosso serviço.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 w-full">
          <KioskButton 
            emoji="🤩" 
            label="Excelente" 
            variant="very_satisfied" 
            onClick={() => handleVote('very_satisfied')}
            disabled={cooldown}
          />
          <KioskButton 
            emoji="🙂" 
            label="Satisfeito" 
            variant="satisfied" 
            onClick={() => handleVote('satisfied')}
            disabled={cooldown}
          />
          <KioskButton 
            emoji="🙁" 
            label="Insatisfeito" 
            variant="dissatisfied" 
            onClick={() => handleVote('dissatisfied')}
            disabled={cooldown}
          />
        </div>
      </div>

      {/* Thank You Overlay */}
      <AnimatePresence>
        {showThankYou && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="text-center p-12"
            >
              <div className="mx-auto bg-green-100 p-6 rounded-full w-32 h-32 flex items-center justify-center mb-8">
                <CheckCircle2 className="w-16 h-16 text-green-600" />
              </div>
              <h2 className="text-5xl md:text-7xl font-display font-bold text-slate-900 mb-4">
                Muito Obrigado!
              </h2>
              <p className="text-xl md:text-3xl text-slate-600">
                Agradecemos o seu feedback.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
