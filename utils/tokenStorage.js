export const saveToken = (publicKey, tokenData) => {
  try {
    const key = `tokens_${publicKey.toString()}`;
    const existingTokens = JSON.parse(localStorage.getItem(key) || "[]");
    const updatedTokens = [...existingTokens, tokenData];
    localStorage.setItem(key, JSON.stringify(updatedTokens));
  } catch (error) {
    console.error("Error saving token:", error);
  }
};

export const getTokens = (publicKey) => {
  try {
    const key = `tokens_${publicKey.toString()}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (error) {
    console.error("Error getting tokens:", error);
    return [];
  }
};

export const removeToken = (publicKey, mintAddress) => {
  try {
    const key = `tokens_${publicKey.toString()}`;
    const existingTokens = JSON.parse(localStorage.getItem(key) || "[]");
    const updatedTokens = existingTokens.filter(
      (token) => token.mintAddress !== mintAddress
    );
    localStorage.setItem(key, JSON.stringify(updatedTokens));
  } catch (error) {
    console.error("Error removing token:", error);
  }
};

export const updateToken = (publicKey, mintAddress, updatedData) => {
  try {
    const key = `tokens_${publicKey.toString()}`;
    const existingTokens = JSON.parse(localStorage.getItem(key) || "[]");
    const updatedTokens = existingTokens.map((token) =>
      token.mintAddress === mintAddress ? { ...token, ...updatedData } : token
    );
    localStorage.setItem(key, JSON.stringify(updatedTokens));
  } catch (error) {
    console.error("Error updating token:", error);
  }
};
