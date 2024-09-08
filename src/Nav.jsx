import  Copy from './assets/copy.svg';
import solLogo from './assets/sol.png';
import Account from './assets/account.svg'
import Down from './assets/down.svg';
import Logout from './assets/logout.svg'
import './App.css';
import './Nav.css'
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import myAlert from './myAlert.js';

export default function Nav({currWallet, mode, setMode}){
    const [accActions, setAccActions] = useState(false)
    let publicKeyDisplay = `${(currWallet.publicKey).substring(0,10)}...................${(currWallet.publicKey).substring(25,31)}`
    const boxRef = useRef(null);
    const boxOutsideClick = OutsideClick(boxRef); 

    useEffect(() => {
      if(boxOutsideClick){
        setAccActions(false)
      }
    }, [boxOutsideClick])
  
    return (
      <>
      <div className='nav'>
        <div className='heading' >
          <div className='heading-name' >Cosmic Vault</div>
        </div>
        <div className='wallet-div' >
          <div className='chain' > 
            <img src={solLogo} className='chain-logo' />
          </div>
          <div className='public-key-div' onClick={() => {
            if (mode === 'display wallet'){
              setMode('select wallet')
            } else {
              setMode('display wallet')
            }
          }} >
            <div>
              Wallet-{currWallet.id + 1} {publicKeyDisplay}
            </div>
            <img src={Down} className='down-svg' />
          </div>
          <div className='copy-public-key' onClick={() => {
            navigator.clipboard.writeText(currWallet.publicKey)
            myAlert('PublicKey copied to the clipboard.')
          }} >
            <img src={Copy} className='copy-key-img' />
          </div>
        </div>
        <div className='account' >
          <img src={Account} className='profile-svg' onClick={() => {
            setAccActions(!accActions)
          }} />
        </div>
      </div>
      {
        accActions ? <AccountActions boxRef={boxRef} /> : false
      }
      </>
    )
  }

function AccountActions({boxRef}) {
  const navigate = useNavigate()

  return (
    <div className='account-actions-div' ref={boxRef} >
      <div className='account-action'>
        <img src={Logout} className='account-action-icon' />
        <button className='logout-btn' onClick={() => {
          localStorage.clear()
          navigate('/add-wallet')
        }} >
          Logout
        </button>
      </div>
    </div>
  )
}

function OutsideClick(ref) {
  const [isClicked, setIsClicked] = useState();
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsClicked(true);
      } else {
        setIsClicked(false);
      }
    }
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
    return isClicked;
  }