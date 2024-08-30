import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from 'bs58';
import Show from './assets/show.svg';
import Hide from './assets/hide.svg';
import { useState } from 'react';
import { derivePath } from "ed25519-hd-key";
import './App.css';

export default function SelectWallet({setWallet, setMode, wallet, setCurrWallet,}){

    return(
      <div className='select-wallet exit-animation' >
        <div className='select-wallet-heading' >
            <div className='select-wallet-heading-text' >
              Select Wallet
            </div>
            <div className='select-wallet-btns' >
              <button className='select-wallet-heading-btns' id='add-new-wallet' onClick={() => {
                const path = `m/44'/501'/${wallet.sol.length}'/0'`;
                const derivedSeed = derivePath(path, wallet.seed.toString("hex")).key;
                const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
                const keypair = Keypair.fromSecretKey(secret);
                const secretStr = bs58.encode(Buffer.from(keypair._keypair.secretKey))
                const publicSrt = bs58.encode(Buffer.from(keypair._keypair.publicKey))
                setCurrWallet({
                  id: wallet.sol.length,
                  publicKey: publicSrt,
                  privateKey: secretStr,
              })
              setWallet({
                  "seed": wallet.seed,
                  "sol": [
                      ...wallet.sol,
                      {
                          publicKey: publicSrt,
                          privateKey: secretStr,
                      }
                  ]
              })
              localStorage.setItem('wallet', JSON.stringify({
                  "seed": wallet.seed,
                  "sol": [
                      ...wallet.sol,
                      {
                          publicKey: publicSrt,
                          privateKey: secretStr,
                      }
                  ]
                }))
                setMode('display wallet')
              }} >
                Add Wallet
              </button>
              <button className='select-wallet-heading-btns' id="close-btn" onClick={() => {
                setMode('display wallet')
              }}>
                X
              </button>
            </div>
        </div>
        <div className='wallets'>
              {
                wallet.sol.map((wal, index) => {
                  const [visible, setVisible] = useState(false)
  
                  return(
                    <div className='wallets-list' id={`wallet-numder-${index}`} key={index} >
                      <div className='single-wallet-heading'>
                        <div className='wallet-index'>Wallet{index+1}</div>
                        <div className='select-this-wallet'>
                          <button className='select-wallet-heading-btns' onClick={() => {
                              setCurrWallet({
                                id: index,
                                publicKey: wal.publicKey,
                                privateKey: wal.privateKey
                              })
                              setMode('display wallet')
                          }} >
                            Select
                          </button>
                        </div>
                      </div>
                      <div className='wallet-keys-display'>
                        <div className='public-key-display'>
                          <div>Public Key</div>
                          <div className='key-text' onClick={() => {
                            navigator.clipboard.writeText(wal.publicKey)
                          }} >{wal.publicKey}</div>
                        </div>
                        <div className='private-key-display'>
                          <div>Private Key</div>
                          <div>
                            {
                              visible ? 
                                <div className='private-key-div' onClick={() => {
                                    navigator.clipboard.writeText(wal.privateKey)
                                  }} >
                                  <div className='key-text private-key-text'>{wal.privateKey}</div> 
                                  <img src={Hide} className='show-hide' onClick={() => {
                                    setVisible(!visible)
                                  }} />
                                </div> : 
                                <div className='private-key-div'>
                                  <div className='key-text private-key-text'>{'*'.repeat(88)}</div>
                                  <img src={Show} className='show-hide' onClick={() => {
                                    setVisible(!visible)
                                  }} />
                                </div>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              }
        </div>
      </div>
    )
  }