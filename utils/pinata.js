import axios from "axios";
import FormData from "form-data";

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

export const uploadToPinata = async (file, metadata) => {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append("file", file);

    const imageUploadRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageUploadRes.data.IpfsHash}`;

    const metadataJSON = {
      name: metadata.name,
      symbol: metadata.symbol,
      description: metadata.description,
      image: imageUrl,
      attributes: [
        {
          trait_type: "decimals",
          value: metadata.decimals,
        },
      ],
    };

    const metadataRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadataJSON,
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    return {
      metadataUri: `https://gateway.pinata.cloud/ipfs/${metadataRes.data.IpfsHash}`,
      imageUri: imageUrl,
    };
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw new Error("Failed to upload to Pinata");
  }
};
