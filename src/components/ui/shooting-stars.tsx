import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const ShootingStars = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createStar = () => {
      const star = document.createElement("div");
      star.className = "absolute w-1 h-1 rounded-full";
      
      // Random starting position
      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight;
      
      // Random angle for the shooting star
      const angle = Math.random() * Math.PI * 2;
      const length = 100 + Math.random() * 200;
      
      // Get current theme
      const isDark = document.documentElement.classList.contains('dark');
      const starColor = isDark ? '255, 255, 255' : '37, 99, 235'; // white for dark theme, blue-600 for light theme
      
      star.style.left = `${startX}px`;
      star.style.top = `${startY}px`;
      star.style.transform = `rotate(${angle}rad)`;
      star.style.width = `${length}px`;
      star.style.height = "2px";
      star.style.background = `linear-gradient(90deg, rgba(${starColor},0) 0%, rgba(${starColor},1) 50%, rgba(${starColor},0) 100%)`;
      
      container.appendChild(star);
      
      // Animate the star
      star.animate(
        [
          { transform: `rotate(${angle}rad) translateX(0)`, opacity: 1 },
          { transform: `rotate(${angle}rad) translateX(${length}px)`, opacity: 0 }
        ],
        {
          duration: 1000 + Math.random() * 1000,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        }
      ).onfinish = () => {
        star.remove();
      };
    };

    // Create stars periodically
    const interval = setInterval(() => {
      createStar();
    }, 200);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed inset-0 pointer-events-none overflow-hidden",
        className
      )}
      {...props}
    />
  );
}; 