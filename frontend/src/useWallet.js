import {useState, useCallback, useEffect} from "react";
import {ethers} from "ethers";
const amoy_id = "0x13882";
const amoy_net ={
  chainId: amoy_id,
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: {name: "POL", symbol: "POL", decimals: 18},
  rpcUrls: ["https://rpc-amoy.polygon.technology/"],
  blockExplorerUrls: ["https://amoy.polygonscan.com/"],
};
export function useWallet(){
  const [cur_account, setAccount] = useState(null);
  const [cur_signer, setSigner] = useState(null);
  const [error, setError] = useState(null);
  const updateSigner = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const web3Signer = await provider.getSigner();
    setSigner(web3Signer);
  };
  useEffect(() =>{
    if (!window.ethereum) return;
    window.ethereum.on("accountsChanged", async(accounts) =>{
      if(accounts.length === 0){
      setAccount(null);
      setSigner(null);
      }else{
      setAccount(accounts[0]);
      await updateSigner();
      }
    });
    return () =>{
    window.ethereum.removeAllListeners("accountsChanged");
    };
  },[]);
  const connect = useCallback(async () =>{
    setError(null);
    if (!window.ethereum){
    setError("MetaMask is not installed.");
    return;
    }
    try{
    const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
    try{
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{chainId: amoy_id}],
    });
    } catch (switchError){
      if (switchError.code === 4902){
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [amoy_net] });
      }}
    const provider = new ethers.BrowserProvider(window.ethereum);
    const web3Signer = await provider.getSigner();
    setSigner(web3Signer);
    setAccount(accounts[0]);
  } catch (err){
    setError(err.message|| "Failed to connect wallet");
  }
  }, []);
  const disconnect = useCallback(() =>{
    setAccount(null);
    setSigner(null);
  },[]);
  const address_short = cur_account ? cur_account.slice(0, 6) + "..." + cur_account.slice(-4): null;
  return {account: cur_account, signer: cur_signer, error, connect, disconnect, short_address: address_short};
}
