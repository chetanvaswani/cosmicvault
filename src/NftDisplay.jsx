import { useEffect, useState } from 'react';
import { Connection }  from '@solana/web3.js';
import './App.css';
import { programs } from '@metaplex/js';

const { metadata: { Metadata } } = programs;

export default function NftDisplay({ nfts }) {
    const [nftsToDisplay, setNftsToDisplay] = useState([]);
  
    useEffect(() => {
      if (nfts && nfts.length > 0) {
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
            console.log('Error fetching NFT metadata:');
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
          } catch (error) {
            console.error('Error fetching all metadata:');
          }
        };
  
        fetchAllMetadata();
      }

    }, [nfts]);
  
    return (
      <div className="nft-display">
        {
          nftsToDisplay.length > 0
          ? nftsToDisplay.map((nft,index) => {
            return(
              <div className='nft-div' key={nft.image + index} >
                <img src={nft.image} className='nft-img' />
                <p>{nft.name}</p>
              </div>
            )
          })
          : false
        }
      </div>
    );
  }  