import { useEffect, useState } from "react";
import { generateMnemonic, mnemonicToSeed } from "bip39";
import './Signup.css';
import Back from './assets/back.png';
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl"
import { useNavigate } from "react-router-dom";
import bs58 from 'bs58';


export default function SignupPage(){
    const [mnemonic, setMnemonic] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [publicKeys, setPublicKeys] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        let res = localStorage.getItem('wallet')
        if (res){
            console.log('Wallet alreay-exists')
            navigate('/')
        }
    }, [])

    return (
        <div className="SignupPage">
            <div className="welcome-text">
                <h1 className="welcome-heading">
                    Welcome to Cosmic Vault
                </h1>
                <p className="welcome-para" >Let's get you started.</p>
            </div>
            {
                wallet === null ? <ButtonsChoice setMnemonic={setMnemonic} setWallet={setWallet} /> :
                wallet === "new"? <NewPhrase mnemonic={mnemonic} setWallet={setWallet} publicKeys={publicKeys} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} setPublicKeys={setPublicKeys} />
                : <OldPhrase setWallet={setWallet} />
            }
        </div>
    )
}

function NewPhrase({mnemonic, setWallet, setCurrentIndex, setPublicKeys, currentIndex}){
    let counter = 0;
    const navigate = useNavigate()
    return (
        <>
            <div className="phrase-outer-div" id="new-phrase" onClick={() => {
                navigator.clipboard.writeText(mnemonic.join(' '));
                document.querySelector('.copy-msg').innerHTML = "Copied"
                setTimeout(() => {
                    document.querySelector('.copy-msg').innerHTML = "Click here to copy the Phrase"
                }, 3000)}} >
                    
                {mnemonic.map((word) => {
                    counter = counter+1
                    return(
                        <div className="inner-div" key={word}>
                            <div className="phrase-word" ><div className="counter" >{counter}</div> {word}</div>
                        </div>
                    )
                })}
                <div className="copy-msg">Click here to copy the Phrase</div>
            </div>
            <div className="bottom-btns" >
                <button className="create-btn" onClick={async () => {
                    let mn = mnemonic.join(' ')
                    const seed = await mnemonicToSeed(mn);
                    const path = `m/44'/501'/${currentIndex}'/0'`;
                    const derivedSeed = derivePath(path, seed.toString("hex")).key;
                    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
                    const keypair = Keypair.fromSecretKey(secret);
                    const secretStr = bs58.encode(Buffer.from(keypair._keypair.secretKey))
                    const publicSrt = bs58.encode(Buffer.from(keypair._keypair.publicKey))
                    localStorage.setItem('wallet', JSON.stringify({
                        "seed": seed,
                        "sol": [
                            {
                                publicKey: publicSrt,
                                privateKey: secretStr,
                            }
                        ]
                    }))
                    // console.log(localStorage.hasOwnProperty('wallet'))
                    navigate('/')
                }}>
                    Create New Wallet!
                </button>
                <img src={Back} className="back-icon" onClick={() => {
                    setWallet(null)
                }} />
            </div>
        </>
    )
}

function OldPhrase({setWallet}){
    const [phrase, setPhrase] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    const navigate = useNavigate();

    return(
        <>
            <div id="old-phrase" className="old-phrase-outer-div">
            {
                phrase.map((obj, index) => {
                    return(
                        <div key={obj} className="old-phrase-inner" >
                            <div className="input-box-num" > {index + 1} </div>
                            <input type="text" className="word-input" id={`word-input-${obj}`} required />
                        </div>
                    )
                }) 
            }
            </div>
            <div className="bottom-btns">
                <button className="create-btn" onClick={ async () => {
                    let inputs = document.querySelectorAll('.word-input');
                    var inputsArr = Array.prototype.slice.call(inputs);
                    let numOfWords = 0;
                    let phrase = ''
                    inputsArr.forEach((inp) => {
                        if (inp.value !== ''){
                            numOfWords += 1
                            phrase += inp.value + ' '
                        }
                    }) 
                    if (numOfWords === 12){
                        const seed = await mnemonicToSeed(phrase.trim());
                        const path = `m/44'/501'/0'/0'`;
                        const derivedSeed = derivePath(path, seed.toString("hex")).key;
                        const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
                        const keypair = Keypair.fromSecretKey(secret);
                        const secretStr = bs58.encode(Buffer.from(keypair._keypair.secretKey))
                        const publicSrt = bs58.encode(Buffer.from(keypair._keypair.publicKey))
                        localStorage.setItem('wallet', JSON.stringify({
                            "seed": seed,
                            "sol": [
                                {
                                    publicKey: publicSrt,
                                    privateKey: secretStr,
                                }
                            ]
                        }))
                        // console.log(localStorage.hasOwnProperty('wallet'))
                        navigate('/')
                    }else{
                        alert('Please fill all the input boxes')
                    }
                }} >
                    Import Wallet
                </button>
                <img src={Back} className="back-icon" onClick={() => {
                    setWallet(null)
                }} />
            </div>
        </>
    )
}

function ButtonsChoice({ setMnemonic, setWallet}){
    return (
        <div className="welcome-btns" >
                <button className="create-btn" onClick={async function(event) {
                    const mn = await generateMnemonic();
                    setMnemonic(mn.split(' '))
                    event.target.disabled = true
                    setWallet('new')
                    }}>
                    Create Seed Phrase
                </button>
                <button className="import-btn" onClick={() => {
                    setWallet('old');
                }}>Import an existing Wallet.</button>
            </div>
    )
}