/**
 * Route protection utility to handle invalid routes
 */

export const isValidSection = (hash) => {
  const validSections = ['contact', 'projects'];
  return !hash || validSections.includes(hash.replace('#', ''));
};

export const handleInvalidRoute = () => {
  const validHashPaths = ['#home', '#projects', '#contact'];
  const currentHash = window.location.hash;
  
  // If there's a hash but it's not valid, redirect to home
  if (currentHash && !validHashPaths.includes(currentHash)) {
    window.location.hash = '#home';
    return false;
  }
  
  return true;
};
