import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Wait for fade out animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: "#1580b4" }}
    >
      {/* Logo placeholder - will be replaced with actual logo */}
      <div className="flex flex-col items-center gap-4 animate-scale-in">
        <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
          <span className="text-6xl font-bold text-white">CC</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Ciclista Chapín</h1>
      </div>
    </div>
  );
};

export default SplashScreen;
