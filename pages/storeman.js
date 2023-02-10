import useWallet from "./hooks/useWallet";

export default function Storeman() {
  const { wallet } = useWallet();
  return (
    <h1>Wanchain Storeman</h1>
  )
}
