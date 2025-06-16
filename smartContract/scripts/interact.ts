import * as dotenv from "dotenv";
import hre from "hardhat";

async function main() {
  const { ethers } = hre;

  dotenv.config();
  const CONTRACT_ADDRESS =
    process.env.CONTRACT_ADDRESS ??
    "0xE69Cf5b0Bbf075bEb7066d28Fa0272718CF0e651";
  //Esta configurado con el contrato desplegado de javier plata para usar otro contrato cambia la variable en tu archivo .env

  const [wallet] = await ethers.getSigners();

  const tipJar = await ethers.getContractAt("TipJar", CONTRACT_ADDRESS, wallet);

  const mensaje = "Esta es una propina enviada desde el script!!!";
  const monto = ethers.parseEther("0.01");
  console.log(`Parsed monto: ${monto.toString()} wei`);
  console.log(
    `Enviando ${ethers.formatEther(monto)} ETH con mensaje "${mensaje}"…`
  );
  const txTip = await tipJar.connect(wallet).tip(mensaje, { value: monto });
  await txTip.wait();
  console.log("✅ Propina enviada. Tx hash:", txTip.hash);

  const balance1 = await ethers.provider.getBalance(CONTRACT_ADDRESS);
  console.log("Balance del contrato:", ethers.formatEther(balance1), "ETH");

  console.log("Retirando fondos como owner…");
  const txW = await tipJar.withdraw();
  await txW.wait();
  console.log("Withdraw ejecutado. Tx hash:", txW.hash);

  const balance2 = await ethers.provider.getBalance(CONTRACT_ADDRESS);
  console.log(
    "Balance final del contrato:",
    ethers.formatEther(balance2),
    "ETH"
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error en interact.ts:", err);
    process.exit(1);
  });
