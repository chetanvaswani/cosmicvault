import solLogo from './assets/sol.png';
import { Connection, PublicKey, LAMPORTS_PER_SOL }  from '@solana/web3.js';
import axios from 'axios';
import { useEffect, useState } from 'react';
import './App.css';
import { TokenListProvider } from '@solana/spl-token-registry';
import { programs } from '@metaplex/js';

const { metadata: { Metadata } } = programs;

export default function WalletDisplay({currWallet}){
    const [balance, setBalance] = useState(null)
    const [rate, setRate] = useState(0.00)
    const [tokenMap, setTokenMap] = useState(null)
    const [fungibleTokens, setFungibleTokens] = useState(null)
    const [nfts, setNfts] = useState(null)

    useEffect(() => {
      async function getBalance() {
        // const connection = new Connection(
        //   'https://solana-mainnet.g.alchemy.com/v2/vKuHEPznw2q3zP6O2FEEoF5OfTMQ7Jpt', // MAINNET
        //   'confirmed' 
        // );
        const connection = new Connection(
          'https://solana-devnet.g.alchemy.com/v2/vKuHEPznw2q3zP6O2FEEoF5OfTMQ7Jpt', // DEVNET
          'confirmed' 
        );
        // Replace with your public key (wallet address)
        const publicKey = new PublicKey(currWallet.publicKey);
        // Function to get the balance
  
          try {
              // Get the balance in lamports (smallest unit of SOL)
              const balance = await connection.getBalance(publicKey);
              //(1 SOL = 1,000,000,000 lamports) 
              const balanceInSol = balance / LAMPORTS_PER_SOL;
              setBalance(balanceInSol)
              console.log(`Balance: ${balanceInSol} SOL`);
          } catch (error) {
              console.error('Error fetching balance:', error);
          }
      }
  
      if(currWallet !== null){
        getBalance()
      }
    }, [currWallet])
  
    useEffect(() => {
        if (rate == 0.00){
            try {
                axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
                  .then((res) => {
                    setRate(res.data.solana.usd)
                  })
            } catch (error) {
                console.error('Error fetching SOL price:', error);
                return null;
            }
        }
    })

    useEffect(() => {
      new TokenListProvider().resolve().then((tokens) => {
        const tokenList = tokens.filterByChainId(101).getList(); // Mainnet chain ID
        // console.log( "TokenList:" ,tokenList)

        const map = {};
        tokenList.forEach((token) => {
          map[token.address] = token; // Token address as key, token details as value
        });

        // Store the hash map in state
        setTokenMap(map);
      });
    }, []);

    useEffect(() => {
      // console.log('started')
      async function fetchTokens(){
        const response = await axios({
          url: `https://solana-devnet.g.alchemy.com/v2/vKuHEPznw2q3zP6O2FEEoF5OfTMQ7Jpt`,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          data: {                                                                                
            "jsonrpc":"2.0",
            "method":"getTokenAccountsByOwner",
            "params": [
               "1BWutmTvYPwDtmw9abTkS4Ssr8no61spGAvW1X6NDix",
              {
                "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
              }, 
              {
                "encoding": "jsonParsed"
              }
            ],
            "id":4
          } 
      });
      // console.log('ended')
      // console.log(response.data.result.value[0].account.data)
      let a = response.data.result.value

      const nfts = [];
      const fungibleTokens = [];

      // Filter the tokens and NFTs
      a.forEach((account) => {
        const { decimals, amount } = account.account.data.parsed.info.tokenAmount;

        if (tokenMap){
          let key = account.account.data.parsed.info.mint
          if(tokenMap[key]){
            account = {
              ...account,
              ...tokenMap[key]
            }

            // console.log(account)
            fungibleTokens.push(account)
          }

        }

        // Check if it's an NFT
        if (decimals === 0 && amount === "1") {
          nfts.push(account);
        } 
        // else {
        //   fungibleTokens.push(account);
        // }
      });
      // console.log( "nft:",nfts)
      setFungibleTokens(fungibleTokens)
      // console.log("tokens:",fungibleTokens)
      setNfts(nfts)
      }
      
      if(tokenMap){
        fetchTokens()
      }
      
    }, [tokenMap])

  
    return(
      <>
      <div className='display-div' >
      <div className='wallet-display'>
      <TranscationComponent />
        <div className='sol-balance'>
          <div className='balance-left'>
            <div className='sol-bal-img' >
                <img src={solLogo} className='sol-bal-logo' />
            </div>
            <div className='bal-text' >
                <div className='bal-heading' >Solana</div>
                <div className='bal-main' >{balance} SOL</div>
            </div>
          </div>
          <div className='bal-right' >${(balance * rate).toFixed(2)}</div>
        </div>
        {

          fungibleTokens ? 
          fungibleTokens?.map((token) => {
            return(
              <div className='sol-balance' key={token.pubkey} >
              <div className='balance-left'>
                <div className='sol-bal-img' >
                    <img src={token.logoURI} className='sol-bal-logo' />
                </div>
                <div className='bal-text' >
                    <div className='bal-heading' >{token.name}</div>
                    <div className='bal-main' >{token.account.data.parsed.info.tokenAmount.uiAmount}</div>
                </div>
              </div>
              <div className='bal-right' ></div>
            </div>
            )
          }) :  false
        }
      </div>
      <NftDisplay nfts={nfts} />
      </div>
      </>
    )
  }
  
  function NftDisplay({ nfts }) {
    const [nftsToDisplay, setNftsToDisplay] = useState([]);
  
    useEffect(() => {
      if (nfts && nfts.length > 0) {
        const NFT_PER_PAGE = 20;
        const connection = new Connection(
          'https://solana-devnet.g.alchemy.com/v2/vKuHEPznw2q3zP6O2FEEoF5OfTMQ7Jpt',
          'confirmed'
        );
        const toMint = nfts.slice(40, 80);
  
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
            console.error('Error fetching NFT metadata:', error);
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
            console.error('Error fetching all metadata:', error);
          }
        };
  
        fetchAllMetadata();
      }
    }, [nfts]);
  
    return (
      <div className="nft-display">
        {
          nftsToDisplay.length > 0
          ? nftsToDisplay.map((nft) => {
            console.log(nft)
            return(
              <div className='nft-div' key={nft.image} >
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
  

  function TranscationComponent(){
    return (
      <div>
        <div className='balance-total-div'>
          <div className='balance-total-display'>$0.00</div>
          <div className='wallet-total'>Wallet Balance</div>
        </div>
        <div className='transaction-div' >
          <div className='receive-icon transaction-icon-div'>
            <div className='transaction-icon'>
            <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-arrow-down transaction-icon-img" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
            </svg>
            </div>
            <p>Receive</p>
          </div>
          <div className='send-icon transaction-icon-div'>
            <div className='transaction-icon' >
            <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-arrow-up transaction-icon-img" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"/>
            </svg>
            </div>
            <p>Send</p>
          </div>
          <div className='swap-icon transaction-icon-div'>
            <div className='transaction-icon' >
            <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-arrow-left-right transaction-icon-img" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5m14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5"/>
            </svg>
            </div>
            <p>Swap</p>
          </div>
        </div>  
      </div>
    )
  }
  