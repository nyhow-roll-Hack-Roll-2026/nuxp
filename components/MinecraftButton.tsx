import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'disabled' | 'green' | 'purple';
}

export const MinecraftButton: React.FC<Props> = ({ children, variant = 'default', className = '', ...props }) => {
  const isDiabled = variant === 'disabled' || props.disabled;

  let bgClass = 'bg-[#7E7E7E] hover:bg-[#8f8f8f]';
  let shadowLight = '#C6C6C6';
  let shadowDark = '#555555';

  if (variant === 'green') {
    bgClass = 'bg-[#5D8D42] hover:bg-[#6CA34E]';
    shadowLight = '#83B566';
    shadowDark = '#2F4721';
  } else if (variant === 'purple') {
    bgClass = 'bg-[#6B46C1] hover:bg-[#805AD5]';
    shadowLight = '#9F7AEA';
    shadowDark = '#44337A';
  }

  return (
    <button
      {...props}
      disabled={isDiabled}
      className={`
        relative font-pixel text-xl px-4 py-2 border-2 border-black
        transition-transform duration-75 active:translate-y-1 active:shadow-none
        ${isDiabled
          ? 'bg-[#373737] text-gray-500 border-black cursor-not-allowed shadow-none'
          : `${bgClass} text-white shadow-[inset_2px_2px_0px_${shadowLight},inset_-2px_-2px_0px_${shadowDark},0px_4px_0px_#000]`}
        ${className}
      `}
    >
      <span className="drop-shadow-md">{children}</span>
    </button>
  );
};
