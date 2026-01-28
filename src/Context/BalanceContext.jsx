import React, { createContext, useContext, useEffect, useState } from 'react';

const BalanceContext = createContext();

const STORAGE_KEY = 'casino_balance';
const DEFAULT_BALANCE = 100;

export function BalanceProvider({ children }) {
  const [balance, setBalance] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? Number(stored) : DEFAULT_BALANCE;
  });

  // Persist balance
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, balance.toString());
  }, [balance]);

  const add = (amount) => {
    setBalance((prev) => prev + amount);
  };

  const subtract = (amount) => {
    setBalance((prev) => Math.max(0, prev - amount));
  };

  const reset = () => {
    setBalance(DEFAULT_BALANCE);
  };

  return (
    <BalanceContext.Provider
      value={{
        balance,
        setBalance,
        add,
        subtract,
        reset,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
}

// Custom Hook
export function useBalance() {
  return useContext(BalanceContext);
}
