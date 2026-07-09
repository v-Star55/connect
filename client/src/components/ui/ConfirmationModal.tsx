import React from "react";
import { createPortal } from "react-dom";
import { ShieldAlert, Trash2, LogOut, LucideIcon } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  type?: "danger" | "warning" | "logout" | "info";
  isPending?: boolean;
  icon?: LucideIcon;
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  type = "info",
  isPending = false,
  icon: CustomIcon,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  // Determine icon and theme coloring based on type
  let Icon = CustomIcon;
  let iconContainerClass = "";
  let confirmBtnClass = "";

  if (!Icon) {
    switch (type) {
      case "danger":
        Icon = ShieldAlert;
        iconContainerClass = "bg-rose-500/10 text-rose-400 border border-rose-500/25";
        confirmBtnClass = "bg-rose-600 hover:bg-rose-550 shadow-md shadow-rose-500/20 active:scale-98";
        break;
      case "warning":
        Icon = Trash2;
        iconContainerClass = "bg-amber-500/10 text-amber-400 border border-amber-500/25";
        confirmBtnClass = "bg-amber-600 hover:bg-amber-550 shadow-md shadow-amber-500/20 active:scale-98";
        break;
      case "logout":
        Icon = LogOut;
        iconContainerClass = "bg-red-500/10 text-red-400 border border-red-500/25";
        confirmBtnClass = "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-500/20 active:scale-98";
        break;
      case "info":
      default:
        Icon = ShieldAlert;
        iconContainerClass = "bg-violet-500/10 text-violet-400 border border-violet-500/25";
        confirmBtnClass = "bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 shadow-md shadow-indigo-500/20 active:scale-98";
        break;
    }
  } else {
    // Custom Icon default styling based on type
    iconContainerClass = type === "danger" 
      ? "bg-rose-500/10 text-rose-400 border border-rose-500/25" 
      : type === "warning"
      ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
      : "bg-violet-500/10 text-violet-400 border border-violet-500/25";
      
    confirmBtnClass = type === "danger" 
      ? "bg-rose-600 hover:bg-rose-550 active:scale-98" 
      : type === "warning"
      ? "bg-amber-600 hover:bg-amber-550 active:scale-98"
      : "bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 active:scale-98";
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-outfit select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/15 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-white flex flex-col items-center text-center">
        
        {/* Decorative background glow */}
        <div className="absolute top-[-20%] left-[-20%] w-[150px] h-[150px] bg-violet-500/15 rounded-full blur-[40px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[150px] h-[150px] bg-indigo-500/15 rounded-full blur-[40px] pointer-events-none" />

        {/* Header Icon */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative z-10 ${iconContainerClass}`}>
          <Icon className="w-8 h-8" />
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-black text-white mb-2 relative z-10 tracking-tight">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-white/60 text-xs font-semibold leading-relaxed mb-8 relative z-10 px-2">
          {description}
        </p>
        
        {/* Actions */}
        <div className="flex gap-3 w-full relative z-10">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/95 text-xs font-bold transition-all duration-200 cursor-pointer active:scale-98"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-1 px-4 py-3 rounded-2xl text-white text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${confirmBtnClass}`}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;
