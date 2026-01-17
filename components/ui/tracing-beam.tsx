import React, { useEffect, useRef, useState } from "react";
import { motion, useTransform, useScroll, useSpring } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const TracingBeam = ({
  children,
  className,
  scrollContainerRef
}: {
  children: React.ReactNode;
  className?: string;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);

  // Use the container's scroll position directly when a custom container is provided
  const { scrollYProgress } = useScroll({
    container: scrollContainerRef as React.RefObject<HTMLElement>,
    layoutEffect: false,
  });

  useEffect(() => {
    if (contentRef.current) {
      setSvgHeight(contentRef.current.offsetHeight);
    }
  }, []);

  // Update height on resize
  useEffect(() => {
    const handleResize = () => {
      if (contentRef.current) {
        setSvgHeight(contentRef.current.offsetHeight);
      }
    };

    // Attach to window resize
    window.addEventListener('resize', handleResize);

    // Also attach to a ResizeObserver for the content itself (handling dynamic content loading)
    const resizeObserver = new ResizeObserver(() => handleResize());
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, []);

  const y1 = useSpring(
    useTransform(scrollYProgress, [0, 1], [50, svgHeight]),
    {
      stiffness: 500,
      damping: 90,
    }
  );
  const y2 = useSpring(
    useTransform(scrollYProgress, [0, 1], [50, svgHeight - 200]),
    {
      stiffness: 500,
      damping: 90,
    }
  );

  // Transform styles based on scroll position instead of direct window access
  const dotBackgroundColor = useTransform(scrollYProgress, [0, 0.05], ["#D4AF37", "#ffffff"]);
  const dotBorderColor = useTransform(scrollYProgress, [0, 0.05], ["#D4AF37", "#ffffff"]);
  const headerBoxShadow = useTransform(
    scrollYProgress,
    [0, 0.05],
    ["rgba(0, 0, 0, 0.24) 0px 3px 8px", "none"]
  );

  return (
    <motion.div
      ref={ref}
      className={twMerge("relative w-full h-full", className)}
    >
      <div className="absolute left-0 top-3 z-10">
        <motion.div
          transition={{
            duration: 0.2,
            delay: 0.5,
          }}
          style={{
            boxShadow: headerBoxShadow,
          }}
          className="ml-[27px] h-4 w-4 rounded-full border border-neutral-800 bg-neutral-900 shadow-sm flex items-center justify-center"
        >
          <motion.div
            transition={{
              duration: 0.2,
              delay: 0.5,
            }}
            style={{
              backgroundColor: dotBackgroundColor,
              borderColor: dotBorderColor,
            }}
            className="h-2 w-2 rounded-full border border-neutral-700 bg-white"
          />
        </motion.div>
        <svg
          viewBox={`0 0 20 ${svgHeight}`}
          width="20"
          height={svgHeight} // Set the SVG height
          className=" ml-4 block"
          aria-hidden="true"
        >
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="#333"
            strokeOpacity="0.16"
            transition={{
              duration: 10,
            }}
          ></motion.path>
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="1.25"
            className="motion-reduce:hidden"
            transition={{
              duration: 10,
            }}
          ></motion.path>
          <defs>
            <motion.linearGradient
              id="gradient"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={y1} // set y1 for gradient
              y2={y2} // set y2 for gradient
            >
              <stop stopColor="#D4AF37" stopOpacity="0"></stop>
              <stop stopColor="#D4AF37"></stop>
              <stop offset="0.325" stopColor="#F59E0B"></stop>
              <stop offset="1" stopColor="#D4AF37" stopOpacity="0"></stop>
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <div ref={contentRef} className="pl-12 md:pl-16 pe-8">{children}</div>
    </motion.div>
  );
};