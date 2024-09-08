import React, { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import './App.css';
import './TransactionHistory.css'

const TransactionHistory = ({ currWallet, setMode }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const connection = new Connection(
      'https://solana-devnet.g.alchemy.com/v2/vKuHEPznw2q3zP6O2FEEoF5OfTMQ7Jpt', // DEVNET
      'confirmed'
    );

    const fetchTransactionHistory = async () => {
      try {
        setLoading(true);
        const publicKey = new PublicKey(currWallet.publicKey);
        const transactionSignatures = await connection.getSignaturesForAddress(publicKey, { limit: 15 });

        const transactionPromises = transactionSignatures.map(async (signatureInfo) => {
          const transaction = await connection.getTransaction(signatureInfo.signature);
          return transaction;
        });

        const transactionDetails = await Promise.all(transactionPromises);

        setTransactions(transactionDetails);
        // console.log(transactionDetails);
      } catch (error) {
        console.error('Error fetching transaction history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionHistory();

    const interval = setInterval(fetchTransactionHistory, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval); // Clear interval on unmount
  }, [currWallet]);

  const formatAmount = (amount) => {
    // Convert lamports to SOL and format with 5 decimal places
    return (amount / 1e9).toFixed(5);
  };

  return (
    <div className='transaction-history-div'>
      <div className='transactions-heading'>
        <h1>Transaction History</h1>
        <button
          className='select-wallet-heading-btns'
          id="close-btn-2"
          onClick={() => setMode('normal-mode')}
          disabled={loading} // Disable close button while loading
        >
          X
        </button>
      </div>
      {loading ? (
        <p>Loading transactions...</p>
      ) : (
        <div className='transaction-display'>
          {transactions.length > 0 ? (
            <div className='transactions'>
              {transactions.map((transaction, index) => {
                const preBalances = transaction.meta?.preBalances || [];
                const postBalances = transaction.meta?.postBalances || [];
                const walletIndex = transaction.transaction.message.accountKeys.findIndex(
                  (key) => key.toBase58() === currWallet.publicKey
                );

                let amount = 0;
                if (walletIndex !== -1) {
                  amount = postBalances[walletIndex] - preBalances[walletIndex];
                }

                const formattedAmount = formatAmount(Math.abs(amount));
                const sign = amount > 0 ? '+' : '-';

                return (
                  <div className='each-transaction' key={index}>
                    <div><div className='grey'>Signature:</div> {transaction.transaction.signatures[0]}</div>
                    <div><div className='grey'>Block Time:</div> {new Date(transaction.blockTime * 1000).toLocaleString()}</div>
                    <div><div className='grey'>Status:</div> {transaction.meta.err ? 'Failed' : 'Success'}</div>
                    <div><div className='grey'>Amount:</div> {sign}{formattedAmount} SOL</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No transactions to display</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
