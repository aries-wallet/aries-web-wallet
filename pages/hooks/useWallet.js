import { createModel } from "hox";
import { useState } from "react";

function useWallet() {
  const [wallet, setWallet] = useState({});
  return { wallet, setWallet };
}

export default createModel(useWallet);
