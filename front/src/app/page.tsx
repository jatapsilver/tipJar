"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Swal from "sweetalert2";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request?: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
      on?: (...args: unknown[]) => void;
      removeListener?: (...args: unknown[]) => void;
    };
  }
}

const CONTRACT_ADDRESS = "0xE69Cf5b0Bbf075bEb7066d28Fa0272718CF0e651";
const CONTRACT_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "message",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "NewTip",
    type: "event",
  },
  {
    inputs: [],
    name: "getAllTips",
    outputs: [
      {
        components: [
          { internalType: "address", name: "from", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "string", name: "message", type: "string" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
        ],
        internalType: "struct TipJar.Tip[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTipCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "_message", type: "string" }],
    name: "tip",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "tips",
    outputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "string", name: "message", type: "string" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export default function Home() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("0.01");
  const [tips, setTips] = useState<
    { from: string; amount: bigint; message: string; timestamp: bigint }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (provider) {
      provider.getNetwork().then((network) => {
        console.log("Conectado a la red:", network.name);
      });
    }
  }, [provider]);

  const checkNetwork = async (_provider: ethers.BrowserProvider) => {
    const network = await _provider.getNetwork();
    if (Number(network.chainId) !== 11155111) {
      Swal.fire(
        "Error",
        "Por favor cambia a la red Sepolia en Metamask",
        "error"
      );
      return false;
    }
    return true;
  };

  const connectWallet = async () => {
    if (!window.ethereum)
      return Swal.fire("Error", "Instala Metamask para continuar", "error");
    try {
      const _provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider
      );
      if (!(await checkNetwork(_provider))) return;
      await window.ethereum.request?.({ method: "eth_requestAccounts" });
      const _signer = await _provider.getSigner();
      const _contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        _signer
      );
      setProvider(_provider);
      setSigner(_signer);
      setContract(_contract);
      setAccount(await _signer.getAddress());
      Swal.fire("Conectado", "Wallet conectada exitosamente", "success");
    } catch (err) {
      console.error("Error al conectar wallet:", err);
      Swal.fire("Error", String(err), "error");
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount(null);
    setTips([]);
    Swal.fire("Desconectado", "Wallet desconectada", "info");
  };

  const sendTip = async () => {
    if (!contract || !signer) return;
    try {
      setLoading(true);
      const tx = await contract.tip(message, {
        value: ethers.parseEther(amount),
      });
      await tx.wait();
      Swal.fire("Éxito", "¡Tip enviado!", "success");
      setMessage("");
      setAmount("0.01");
    } catch (err) {
      console.error("Error al enviar tip:", err);
      Swal.fire("Error al enviar tip", String(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchTips = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      const tipsData = await contract.getAllTips();
      setTips(
        (tipsData as typeof tips).map((tip) => ({
          from: tip.from,
          amount: tip.amount,
          message: tip.message,
          timestamp: tip.timestamp,
        }))
      );
      Swal.fire("Tips Cargados", "Tips cargados correctamente", "success");
    } catch (err) {
      console.error("Error al obtener tips:", err);
      Swal.fire("Error", String(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const getOwner = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      const owner = await contract.owner();
      Swal.fire("Owner del contrato", owner, "info");
    } catch (err) {
      console.error("Error al obtener owner:", err);
      Swal.fire("Error", String(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchTipCount = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    if (!contract) return;
    try {
      setLoading(true);
      const count = await contract.getTipCount();
      Swal.fire("Número de tips", count.toString(), "info");
    } catch (err) {
      console.error("Error al obtener el número de tips:", err);
      Swal.fire("Error", String(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const withdrawFunds = async () => {
    if (!contract || !account) return;

    try {
      setLoading(true);
      const contractOwner = await contract.owner();

      if (contractOwner.toLowerCase() !== account.toLowerCase()) {
        Swal.fire("Acceso denegado", "No eres el owner del contrato", "error");
        return;
      }

      const tx = await contract.withdraw();
      await tx.wait();
      Swal.fire("Éxito", "Fondos retirados correctamente", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Hubo un problema al retirar los fondos", "error");
    } finally {
      setLoading(false);
    }
  };

  const verFondosContrato = async () => {
    if (!provider) return;

    try {
      const balance = await provider.getBalance(CONTRACT_ADDRESS);
      const balanceEth = ethers.formatEther(balance);
      Swal.fire("Fondos del Contrato", `${balanceEth} ETH`, "info");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo obtener el balance", "error");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white p-8 font-mono">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold mb-4 text-cyan-400 drop-shadow-[0_0_20px_cyan]">
          TipJar By Javier Plata
        </h1>

        <div className="flex justify-center gap-4 mb-6">
          {!account ? (
            <button
              onClick={connectWallet}
              disabled={loading}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-700 rounded-full shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Conectando..." : "Conectar Wallet"}
            </button>
          ) : (
            <button
              onClick={disconnectWallet}
              disabled={loading}
              className="px-6 py-2 bg-red-500 hover:bg-red-700 rounded-full shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Desconectando..." : "Desconectar"}
            </button>
          )}
        </div>

        {account && (
          <p className="mb-4 text-green-400 text-sm">
            Conectado como: {`${account.slice(0, 8)}...${account.slice(-4)}`}
          </p>
        )}

        <div className="bg-gray-900 rounded-xl p-6 shadow-2xl space-y-4 mb-10 border border-cyan-700">
          <input
            type="text"
            placeholder="Escribe tu mensaje"
            className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <input
            type="number"
            step="0.001"
            min="0"
            placeholder="Monto en ETH (ej. 0.01)"
            className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            onClick={sendTip}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-700 px-6 py-2 rounded-full transition-all disabled:opacity-50"
          >
            {loading
              ? "Esperando respuesta de la blockchain..."
              : `Enviar Tip (${amount} ETH)`}
          </button>
          <button
            onClick={fetchTips}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-700 px-6 py-2 rounded-full disabled:opacity-50"
          >
            {loading
              ? "Esperando respuesta de la blockchain..."
              : "Ver todos los tips"}
          </button>
          <button
            onClick={fetchTipCount}
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-700 px-6 py-2 rounded-full disabled:opacity-50"
          >
            {loading
              ? "Esperando respuesta de la blockchain..."
              : "Ver número de tips"}
          </button>
          <button
            onClick={getOwner}
            disabled={loading}
            className="w-full bg-purple-500 hover:bg-purple-700 px-6 py-2 rounded-full disabled:opacity-50"
          >
            {loading ? "Esperando respuesta de la blockchain..." : "Ver Owner"}
          </button>
          <button
            className="w-full bg-red-500 hover:bg-red-700 px-6 py-2 rounded-full disabled:opacity-50"
            disabled={loading}
            onClick={verFondosContrato}
          >
            {loading
              ? "Esperando respuesta de la blockchain..."
              : "Ver Fondos del contrato"}
          </button>
          <button
            className="w-full bg-yellow-500 hover:bg-yellow-700 px-6 py-2 rounded-full disabled:opacity-50"
            onClick={withdrawFunds}
            disabled={loading}
          >
            {loading ? "Procesando..." : "Retirar Fondos"}
          </button>

          {tips.length > 0 && (
            <div className="bg-gray-800 p-4 rounded-lg border border-cyan-600">
              <h2 className="text-xl font-bold mb-3 text-cyan-300">
                Tips Recibidos
              </h2>
              <ul className="space-y-3 text-left">
                {tips.map((tip, idx) => (
                  <li key={idx} className="border-b border-gray-600 pb-2">
                    <p>
                      💸 <strong>{ethers.formatEther(tip.amount)} ETH</strong>
                    </p>
                    <p>🧾 {tip.message}</p>
                    <p>
                      👤 {`${tip.from.slice(0, 8)}...${tip.from.slice(-4)}`}
                    </p>
                    <p>
                      ⏱️{" "}
                      {new Date(Number(tip.timestamp) * 1000).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
