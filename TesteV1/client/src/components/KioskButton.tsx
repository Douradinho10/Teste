import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface KioskButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  emoji: string;
  label: string;
  variant: "very_satisfied" | "satisfied" | "dissatisfied";
  isLoading?: boolean;
}

const variantStyles = {
  very_satisfied: "bg-green-500 hover:bg-green-600 shadow-green-500/30 text-white",
  satisfied: "bg-yellow-400 hover:bg-yellow-500 shadow-yellow-400/30 text-yellow-950",
  dissatisfied: "bg-red-500 hover:bg-red-600 shadow-red-500/30 text-white",
};

export function KioskButton({ 
  emoji, 
  label, 
  variant, 
  className, 
  isLoading,
  disabled,
  ...props 
}: KioskButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "relative flex flex-col items-center justify-center p-8 md:p-12",
        "rounded-3xl transition-all duration-300 ease-out transform",
        "shadow-2xl hover:-translate-y-2 active:scale-95 active:translate-y-0",
        "w-full h-full min-h-[200px] md:min-h-[300px]",
        variantStyles[variant],
        (disabled || isLoading) && "opacity-50 cursor-not-allowed transform-none hover:transform-none",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-16 h-16 animate-spin mb-4" />
      ) : (
        <span className="text-6xl md:text-8xl lg:text-9xl mb-6 filter drop-shadow-md">
          {emoji}
        </span>
      )}
      <span className="text-xl md:text-3xl font-bold font-display tracking-tight">
        {label}
      </span>
      
      {/* Decorative shine effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
    </button>
  );
}
