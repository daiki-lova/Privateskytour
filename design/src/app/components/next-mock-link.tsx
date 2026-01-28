import React from 'react';

// Mock for next/link
export const Link = ({ href, children, className, ...props }: any) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // In a real Next.js app, this would change the URL.
    // For our preview, we can either use hash routing or just ignore it
    // if we are using the main App.tsx to handle state.
    // But since the user wants a "perfect Next.js implementation", 
    // we'll keep the href as is and let the App.tsx handle the "real" transition if needed.
    window.location.hash = href;
  };

  return (
    <a href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};

export default Link;
