import React, { useState } from 'react';
import bs58 from 'bs58';
import { Connection, PublicKey, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';

const SendSOL = ({ currWallet, setMode, balance }) => {
  const [sender] = useState(currWallet.privateKey);  // Sender's wallet private key (base58)
  const [recipient, setRecipient] = useState('');  // Recipient's public key (base58)
  const [amount, setAmount] = useState('');  // Amount of SOL to send
  const [loading, setLoading] = useState(false);  // Loader state
  const [error, setError] = useState(null);  // Error state

  const connection = new Connection(
    'https://solana-devnet.g.alchemy.com/v2/vKuHEPznw2q3zP6O2FEEoF5OfTMQ7Jpt', // DEVNET
    'confirmed' 
  ); 

  const handleSend = async () => {
    try {
      setLoading(true);  // Start loader
      setError(null);  // Reset error

      const senderKeypair = Keypair.fromSecretKey(bs58.decode(sender));
      const recipientPublicKey = new PublicKey(recipient);

      // Create a transaction to send SOL
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderKeypair.publicKey,
          toPubkey: recipientPublicKey,
          lamports: amount * LAMPORTS_PER_SOL,  // Convert SOL to lamports
        })
      );

      // Send and confirm the transaction
      const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair], {
        skipPreflight: false,
        commitment: 'confirmed',  // Use 'confirmed' to ensure the transaction is processed faster
      });

      console.log(`Transaction successful with signature: ${signature}`);
      alert(`SOL sent successfully! Transaction Signature: ${signature}`);
      setMode('normal-mode');
    } catch (error) {
      console.error('Error sending SOL:', error);

      // Retry confirmation if block height exceeded error is detected
      if (error.message.includes("TransactionExpiredBlockheightExceededError")) {
        try {
          const latestBlockhash = await connection.getLatestBlockhash();
          const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair], {
            skipPreflight: false,
            preflightCommitment: "finalized",
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight + 5,  // Adding buffer to block height
          });
          console.log(`Retried Transaction successful with signature: ${signature}`);
          alert(`SOL sent successfully after retry! Transaction Signature: ${signature}`);
        } catch (retryError) {
          console.error("Retry failed:", retryError);
          setError('Failed to send SOL after retry. Please try again.');
        }
      } else {
        setError('Failed to send SOL. Please try again.');
      }
    } finally {
      setLoading(false);  // Stop loader
      setMode('normal-mode');
    }
  };

  return (
    <div className='send-div'>
      <div className='send-heading'>
        <h2 className='send-sol-heading'>Send SOL</h2>
        <button 
          className='select-wallet-heading-btns' 
          id="close-btn-2" 
          onClick={() => setMode('normal-mode')}
          disabled={loading}  // Disable close button while loading
        >
          X
        </button>
      </div>
      <div className='balance-total-div'>
        <div className='balance-total-display'>{balance}</div>
        <div className='wallet-total'>SOL Balance</div>
      </div>
      <input 
        type="text" 
        placeholder="Recipient's Public Key" 
        className='send-field-input' 
        value={recipient} 
        onChange={(e) => setRecipient(e.target.value)} 
        disabled={loading}  // Disable input while loading
      />
      <input 
        type="number" 
        placeholder="Amount" 
        value={amount} 
        className='send-field-input' 
        onChange={(e) => setAmount(e.target.value)} 
        disabled={loading}  // Disable input while loading
      />
      <button 
        className='send-btn' 
        id='send-btn' 
        onClick={handleSend} 
        disabled={loading || !recipient || !amount}  // Disable button if loading or fields are empty
      >
        {loading ? 'Sending...' : 'Send'}
      </button>
      {loading && <div className="loader">Processing Transaction...</div>} 
      {error && <div className="error-message">{error}</div>} 
    </div>
  );
};

export default SendSOL;
