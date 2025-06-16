import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther } from "ethers";
import type { TipJar } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

describe("TipJar", function () {
  let tipJar: TipJar;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  const TIP_AMOUNT = parseEther("1.0");

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();
    const TipJarFactory = await ethers.getContractFactory("TipJar");
    tipJar = (await TipJarFactory.deploy()) as TipJar;
  });

  it("1) recibe propinas y emite el evento NewTip", async function () {
    await expect(
      tipJar.connect(alice).tip("¡Buen trabajo!", { value: TIP_AMOUNT })
    )
      .to.emit(tipJar, "NewTip")
      .withArgs(alice.address, TIP_AMOUNT, "¡Buen trabajo!", anyValue);

    expect(await tipJar.getTipCount()).to.equal(1);
  });

  it("2) restringe withdraw() solo al owner", async function () {
    await tipJar.connect(alice).tip("Gracias", { value: TIP_AMOUNT });
    await expect(tipJar.connect(bob).withdraw()).to.be.revertedWith(
      "Solo el owner puede retirar las propinas"
    );

    await expect(tipJar.connect(owner).withdraw()).not.to.be.reverted;
  });

  it("3) actualiza correctamente balances tras withdraw", async function () {
    expect(await ethers.provider.getBalance(tipJar.target)).to.equal(0);

    await tipJar.connect(alice).tip("Tip 1", { value: TIP_AMOUNT });
    await tipJar.connect(bob).tip("Tip 2", { value: TIP_AMOUNT });

    const contractBalance = await ethers.provider.getBalance(tipJar.target);
    expect(contractBalance).to.equal(TIP_AMOUNT * 2n);

    const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

    const tx = await tipJar.connect(owner).withdraw();
    const receipt = await tx.wait();
    const gasUsed = receipt!.gasUsed;
    const gasPrice = (receipt as any).effectiveGasPrice ?? tx.gasPrice ?? 0;
    const gasCost = gasUsed * gasPrice;

    expect(await ethers.provider.getBalance(tipJar.target)).to.equal(0);

    const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
    expect(ownerBalanceAfter).to.equal(
      ownerBalanceBefore + TIP_AMOUNT * 2n - gasCost
    );
  });
});
