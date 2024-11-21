import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BuyCryptoModal.css';
import coinnectCoinIcon from '../media/coinnectCoin-icon.png';

const coinGeckoIds = {
    BTC: 'bitcoin',
    ETH: 'ethereum',
    BNB: 'binancecoin',
    ADA: 'cardano',
    SOL: 'solana',
    XRP: 'ripple',
    DOGE: 'dogecoin',
    DOT: 'polkadot',
    LTC: 'litecoin',
    MATIC: 'polygon',
    SHIB: 'shiba-inu',
    AVAX: 'avalanche-2',
    UNI: 'uniswap',
    LINK: 'chainlink',
    BCH: 'bitcoin-cash',
  };  

const BuyCryptoModal = ({ userData, crypto, onClose }) => {
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState(null);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    const fetchCryptoPrice = async () => {
      try {
        const coinGeckoId = coinGeckoIds[crypto.symbol.toUpperCase()];
        if (!coinGeckoId) {
          console.error('No CoinGecko ID found for this symbol:', crypto.symbol);
          setPrice(0);
          return;
        }

        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd`
        );
        const fetchedPrice = response.data[coinGeckoId]?.usd || 0;
        setPrice(fetchedPrice);
      } catch (error) {
        console.error('Error fetching crypto price:', error);
        setPrice(0);
      }
    };

    fetchCryptoPrice();
  }, [crypto.symbol]);

  useEffect(() => {
    if (amount && price) {
      setTotalCost(Math.round(amount * price));
    } else {
      setTotalCost(0);
    }
  }, [amount, price]);

  const handleBuy = async () => {
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (10 * totalCost > userData.coinnectCoins) {
      alert('Insufficient funds.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/auth/buy-crypto', {
        buyer: userData.username,
        seller: crypto.username,
        symbol: crypto.symbol,
        amount: parseFloat(amount),
        totalCost: 10 * totalCost,
      });

      if (response.data.success) {
        alert('Purchase successful!');
        onClose();
      } else {
        alert('Purchase failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error completing purchase:', error);
      alert('An error occurred while processing the transaction.');
    }
  };

  return (
    <div className="buy-crypto-modal-overlay">
      <div className="buy-crypto-modal-content">
        <h3>Buy {crypto.symbol.toUpperCase()}</h3>
        <img src={crypto.logo} alt={crypto.symbol} className="buy-crypto-logo" />
        <p className="crypto-price">Available: {crypto.amount}</p>
        <div className='crypto-price-coinnectCoins'>
          <img src={coinnectCoinIcon} className="wallet-modal-image" alt="CoinnectCoin" />
          <p className="crypto-total-cost">
            {10 * totalCost} coinnectCoins
          </p>
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          min="0"
          max={crypto.amount}
        />
        <div className="buy-crypto-modal-actions">
          <button onClick={handleBuy} className="change-button">
            Buy
          </button>
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyCryptoModal;