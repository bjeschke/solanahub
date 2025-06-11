export const getNetworkFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("network") || "devnet";
  }
  return "devnet";
};

export const setNetworkToLocalStorage = (network) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("network", network);
  }
};
