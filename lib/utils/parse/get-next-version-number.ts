const getNextVersionNumber = (text: string): number | null => {
  const match = text.match(/V(\d+)/);
  if (match && match[1]) {
    const currentVersion = parseInt(match[1], 10);
    if (!isNaN(currentVersion)) {
      return currentVersion + 1;
    }
  }
  return null;
};

export default getNextVersionNumber;
