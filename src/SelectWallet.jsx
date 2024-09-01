import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from 'bs58';
import Show from './assets/show.svg';
import Hide from './assets/hide.svg';
import { useState, useEffect } from 'react';
import { derivePath } from "ed25519-hd-key";
import './App.css';
import { mnemonicToSeed } from "bip39";
import myAlert from "./myAlert";

export default function SelectWallet({setWallet, setMode, wallet, setCurrWallet,}){
  // const [seed, setSeed] = useState(null)

  // useEffect(() => {
  //   async function getData(){
  //     let res = JSON.parse(await localStorage.getItem('wallet'))
  //     if (res){
  //       setSeed(res.seed)
  //     }
  //   }
  
  //   if (seed === null){
  //     getData()
  //   }
  // },[])

    return(
      <div className='select-wallet exit-animation' >
        <div className='select-wallet-heading' >
            <div className='select-wallet-heading-text' >
              Select Wallet
            </div>
            <div className='select-wallet-btns' >
              <button className='select-wallet-heading-btns' id='add-new-wallet' onClick={async() => {
                const seed = await mnemonicToSeed(wallet.mn);
                const path = `m/44'/501'/${wallet.sol[wallet.sol.length - 1].id + 1}'/0'`;
                const derivedSeed = derivePath(path, seed.toString("hex")).key;
                const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
                const keypair = Keypair.fromSecretKey(secret);
                const secretStr = bs58.encode(Buffer.from(keypair._keypair.secretKey))
                const publicSrt = bs58.encode(Buffer.from(keypair._keypair.publicKey))
                setCurrWallet({
                  id: wallet.sol[wallet.sol.length - 1].id + 1,
                  publicKey: publicSrt,
                  privateKey: secretStr,
              })
              setWallet({
                  "mn": wallet.mn,
                  "seed": wallet.seed,
                  "sol": [
                      ...wallet.sol,
                      {
                          id: wallet.sol[wallet.sol.length - 1].id + 1,
                          publicKey: publicSrt,
                          privateKey: secretStr,
                      }
                  ]
              })
              localStorage.setItem('wallet', JSON.stringify({
                  "mn": wallet.mn,
                  "seed": wallet.seed,
                  "sol": [
                      ...wallet.sol,
                      {
                          id: wallet.sol[wallet.sol.length - 1].id + 1,
                          publicKey: publicSrt,
                          privateKey: secretStr,
                      }
                  ]
                }))
                setMode('display wallet')
                myAlert('Switched to new wallet')
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
                  console.log(wal)
                  return(
                    <div className='wallets-list' id={`wallet-numder-${wal.id}`} key={wal.id} >
                      <div className='single-wallet-heading'>
                        <div className='wallet-index'>Wallet{wal.id+1}</div>
                        <div className='select-this-wallet'>
                          <button className='select-wallet-heading-btns' onClick={() => {
                              setCurrWallet({
                                id: wal.id,
                                publicKey: wal.publicKey,
                                privateKey: wal.privateKey
                              })
                              setMode('display wallet')
                          }} >
                            Select
                          </button>
                          <div onClick={() => {
                            let new_wallet;
                            if (index > 0){
                              new_wallet = {
                                "mn": wallet.mn,
                                "seed": wallet.seed,
                                "sol": [
                                    ...wallet.sol.slice(0, index),
                                    ...wallet.sol.slice(index+1, wallet.length)
                                ]
                              }
                            } else{
                              new_wallet = {
                                "mn": wallet.mn,
                                "seed": wallet.seed,
                                "sol": [
                                    ...wallet.sol.slice(1, wallet.length)
                                ]
                              }
                            }
                            setWallet(new_wallet)
                            localStorage.setItem('wallet', JSON.stringify(new_wallet))
                            setCurrWallet({
                              id: new_wallet.sol[0].id,
                              publicKey: new_wallet.sol[0].publicKey,
                              privateKey: new_wallet.sol[0].privateKey
                            })
                            myAlert(`Deleted wallet with public key starting
                            ${wal.publicKey.slice(0,15)}`)
                            setMode('display wallet')
                          }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-trash3 delete-wallet" viewBox="0 0 16 16">
                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                          </svg>
                          </div>
                        </div>
                      </div>
                      <div className='wallet-keys-display'>
                        <div className='public-key-display'>
                          <div>Public Key</div>
                          <div className='key-text' onClick={() => {
                            navigator.clipboard.writeText(wal.publicKey)
                            myAlert('public key copied to the clipboard')
                          }} >{wal.publicKey}</div>
                        </div>
                        <div className='private-key-display'>
                          <div>Private Key</div>
                          <div>
                            {
                              visible ? 
                                <div className='private-key-div' onClick={() => {
                                    navigator.clipboard.writeText(wal.privateKey)
                                    myAlert('Privatekey copied to the clipboard')
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