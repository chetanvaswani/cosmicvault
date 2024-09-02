import { useEffect, useState } from 'react';
import { Connection } from '@solana/web3.js';
import './App.css';
import { programs } from '@metaplex/js';
import './Loader.css';
import myAlert from './myAlert';

const { metadata: { Metadata } } = programs;

export default function NftDisplay({ nfts }) {
  const [loading, setLoading] = useState(true);
  const [nftsToDisplay, setNftsToDisplay] = useState([]);

  useEffect(() => {
    myAlert("NFT's being displayed are from some random wallet, and are just for the visual appeal.", 6000)
  }, [loading])

  useEffect(() => {
    if (nfts) {
      const NFT_PER_PAGE = 20;
      const connection = new Connection(
        'https://solana-devnet.g.alchemy.com/v2/vKuHEPznw2q3zP6O2FEEoF5OfTMQ7Jpt',
        'confirmed'
      );
      const toMint = nfts.slice(0, 40);

      async function fetchNFTMetadata(mintAddress) {
        try {
          const metadataPDA = await Metadata.getPDA(mintAddress);
          const metadata = await Metadata.load(connection, metadataPDA);
  
          // Fetch the actual metadata JSON (usually hosted on IPFS or Arweave)
          const response = await fetch(metadata.data.data.uri);
          const metadataJson = await response.json();
          
          // Check if metadata contains an image URL
          const hasImage = metadataJson.image && (typeof metadataJson.image === 'string') && metadataJson.image.length > 0;
          if (hasImage) {
            return {
              ...metadataJson,
              mintAddress: mintAddress.toString() // Include mintAddress for uniqueness check
            };
          }
          return null;
        } catch (error) {
          // console.log('Error fetching NFT metadata:');
          return null;
        }
      }

      const fetchAllMetadata = async () => {
        try {
          const metadataPromises = toMint.map((nft) =>
            fetchNFTMetadata(nft.account.data.parsed.info.mint)
          );

          const metadataArray = await Promise.all(metadataPromises);
          const validMetadata = metadataArray.filter((data) => data !== null);

          setNftsToDisplay((prevNfts) => {
            // Ensure no duplicates
            const uniqueNfts = validMetadata.filter(
              (newNft) => !prevNfts.some((prevNft) => prevNft.mintAddress === newNft.mintAddress)
            );
            return [...prevNfts, ...uniqueNfts];
          });

          // Set loading to false after all NFTs are ready to be rendered
          setLoading(false);
        } catch (error) {
          // console.error('Error fetching all metadata:');
          setLoading(false); // Handle error by stopping loading as well
        }
      };

      fetchAllMetadata();
    }
  }, [nfts]);

  return (
    <div className="nft-display">
      {loading ? (
        <Loader />
      ) : (
        nftsToDisplay.length > 0
          ? nftsToDisplay.map((nft, index) => {
              return (
                <div className='nft-div' key={nft.image + index}>
                  <img src={nft.image} className='nft-img' alt={nft.name} />
                  <p>{nft.name}</p>
                </div>
              );
            })
          : <NotFound />
      )}
    </div>
  );
}

const Loader = () => {
  return (
    <div className="loader">
      <div>
        <ul>
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <svg viewBox="0 0 90 120" fill="currentColor">
                <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z" />
              </svg>
            </li>
          ))}
        </ul>
      </div>
      <span>Loading...</span>
    </div>
  );
};

const NotFound = () => {
  return (
    <div>
      <svg fill="#ffffff" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
          <title>no-image</title>
          <path d="M30,3.4141,28.5859,2,2,28.5859,3.4141,30l2-2H26a2.0027,2.0027,0,0,0,2-2V5.4141ZM26,26H7.4141l7.7929-7.793,2.3788,2.3787a2,2,0,0,0,2.8284,0L22,19l4,3.9973Zm0-5.8318-2.5858-2.5859a2,2,0,0,0-2.8284,0L19,19.1682l-2.377-2.3771L26,7.4141Z"></path>
          <path d="M6,22V19l5-4.9966,1.3733,1.3733,1.4159-1.416-1.375-1.375a2,2,0,0,0-2.8284,0L6,16.1716V6H22V4H6A2.002,2.002,0,0,0,4,6V22Z"></path>
      </svg>
      <h1>No NFT's Found!</h1>
    </div>
  )
}