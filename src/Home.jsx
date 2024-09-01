import SelectWallet from './SelectWallet.jsx';
import Nav from './Nav.jsx';
import './App.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WalletDisplay from './WalletDisplay.jsx';
// import  { ReactComponent as Send } from './assets/arrow-up.svg';
// import  { ReactComponent as Receive } from './assets/arrow-down.svg'


export default function Home () {
    const navigate = useNavigate()
    const [wallet, setWallet] = useState(null)
    const [currWallet, setCurrWallet] = useState(null)
    const [mode, setMode] = useState(null)
  

    useEffect(() => {
      async function getData(){
        let res = JSON.parse(await localStorage.getItem('wallet'))
        if (res){
          setWallet(res)
          // console.log(JSON.parse(res))
          setCurrWallet({
            id: res.sol[0].id,
            publicKey: res.sol[0].publicKey,
            privateKey: res.sol[0].privateKey
          })
          setMode('display wallet')
        } else {
          navigate('/add-wallet')
        }
      }
    
      if (wallet === null){
        getData()
      }
    }, [mode])
  
    return (
      <div className='home'>
        {
          currWallet !== null ?  <Nav currWallet={currWallet} mode={mode} setMode={setMode} /> : false
        }
        <div className='home-body'>
        {
          mode === 'display wallet' ? <WholeDisplay currWallet={currWallet} />
          : mode === 'select wallet' ? <SelectWallet setMode={setMode} wallet={wallet} setCurrWallet={setCurrWallet} setWallet={setWallet} /> : false
        }
        </div>
        <div className='alert-div hidden'>
            
        </div>
      </div>
    )
  }

  function WholeDisplay({currWallet, nfts}){
    return (
      <div className='whole-display' >
          <WalletDisplay currWallet={currWallet} />
      </div>
    )
  }
  
