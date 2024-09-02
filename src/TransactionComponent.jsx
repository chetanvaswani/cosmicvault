import myAlert from './myAlert'

export default function TranscationComponent({setMode, rate, balance, currWallet}){
  return (
    <div>
      <div className='balance-total-div'>
        <div className='balance-total-display'>${(balance * rate).toFixed(2)}</div>
        <div className='wallet-total'>Wallet Balance</div>
      </div>
      <div className='transaction-div' >
        <div className='receive-icon transaction-icon-div' onClick={() => {
          myAlert('PublicKey Copied to the clipboard. You can forward it to the sender.')
          navigator.clipboard.writeText(currWallet.publicKey)
        }}>
          <div className='transaction-icon'>
          <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-arrow-down transaction-icon-img" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/>
          </svg>
          </div>
          <p>Receive</p>
        </div>
        <div className='send-icon transaction-icon-div' onClick={() => {
          setMode('send-mode')
        }}>
          <div className='transaction-icon' >
          <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-arrow-up transaction-icon-img" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"/>
          </svg>
          </div>
          <p>Send</p>
        </div>
        <div className='swap-icon transaction-icon-div' onClick={() => {
          myAlert('Functionality yet to be added.')
        }}>
          <div className='transaction-icon' >
          <svg xmlns="http://www.w3.org/2000/svg" className="bi bi-arrow-left-right transaction-icon-img" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5m14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5"/>
          </svg>
          </div>
          <p>Swap</p>
        </div>
      </div>  
    </div>
  )
}