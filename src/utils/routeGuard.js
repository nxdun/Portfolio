export const isValidSection = (hash) => {
  const validSections = ['contact', 'projects'];
  return !hash || validSections.includes(hash.replace('#', ''));
};

export const handleInvalidRoute = () => {
  const currentHash = window.location.hash;
  const currentPath = window.location.pathname;
  
  // If it's not the root path, redirect to root
  if (currentPath !== '/') {
    window.location.href = '/';
    return;
  }
  
  // If hash exists but is invalid, remove it
  if (currentHash && !isValidSection(currentHash)) {
    window.location.href = '/';
  }
};
