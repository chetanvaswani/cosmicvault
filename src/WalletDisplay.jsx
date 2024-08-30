import solLogo from './assets/sol.png';
import { Connection, PublicKey, LAMPORTS_PER_SOL }  from '@solana/web3.js';
import axios from 'axios';
import { useEffect, useState } from 'react';
import './App.css';
import { TokenListProvider } from '@solana/spl-token-registry';
import TranscationComponent from './TransactionComponent';
import NftDisplay from './NftDisplay';
import SendToken from './SendToken';

export default function WalletDisplay({currWallet}){
    const [balance, setBalance] = useState(null)
    const [tokenMap, setTokenMap] = useState(null)
    const [fungibleTokens, setFungibleTokens] = useState(null)
    const [nfts, setNfts] = useState(null)
    const [mode, setMode] = useState('normal-mode')
    const [rate, setRate] = useState(0.00)
  
    useEffect(() => {
      if (rate == 0.00){
          try {
              axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
                .then((res) => {
                  setRate(res.data.solana.usd)
                })
          } catch (error) {
              console.error('Error fetching SOL price:');
              return null;
          }
      }
    })

    useEffect(() => {
      async function getBalance() {
        // const connection = new Connection(
        //   'https://solana-mainnet.g.alchemy.com/v2/vKuHEPznw2q3zP6O2FEEoF5OfTMQ7Jpt', // MAINNET
        //   'confirmed' 
        // );
        // Replace with your public key (wallet address)
        const connection = new Connection(
          'https://solana-devnet.g.alchemy.com/v2/vKuHEPznw2q3zP6O2FEEoF5OfTMQ7Jpt', // DEVNET
          'confirmed' 
        ); 
        const publicKey = new PublicKey(currWallet.publicKey);
        // Function to get the balance
          try {
              // Get the balance in lamports (smallest unit of SOL)
              const balance = await connection.getBalance(publicKey);
              //(1 SOL = 1,000,000,000 lamports) 
              const balanceInSol = balance / LAMPORTS_PER_SOL;
              setBalance(balanceInSol)
              // console.log(`Balance: ${balanceInSol} SOL`);
          } catch (error) {
              console.error('Error fetching balance', error);
          }
      }
  
      if(currWallet !== null){
        getBalance()
      }
    }, [currWallet, mode])

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
      setFungibleTokens(fungibleTokens)
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
        {
          mode === 'normal-mode' ? <NormalMode balance={balance} fungibleTokens={fungibleTokens} setMode={setMode} rate={rate} /> :
          mode === 'send-mode' ? <SendToken currWallet={currWallet} balance={balance} setMode={setMode} /> : false
        }
      </div>
      <NftDisplay nfts={nfts} />
      </div>
      </>
    )
  }

function NormalMode({balance, fungibleTokens, setMode, rate}){
  return(
    <>
      <TranscationComponent setMode={setMode} rate={rate} balance={balance} />
      <TokenDisplay balance={balance} rate={rate} fungibleTokens={fungibleTokens}  />
    </>
  )
}

function TokenDisplay({balance, rate, fungibleTokens}){

  return (
    <>
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
    </>
  )
}
  