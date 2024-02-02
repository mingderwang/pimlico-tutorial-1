import "dotenv/config"
import { getAccountNonce, createSmartAccountClient } from "permissionless"
import { UserOperation, bundlerActions, getSenderAddress, getUserOperationHash, waitForUserOperationReceipt, GetUserOperationReceiptReturnType, signUserOperationHashWithECDSA } from "permissionless"
import { pimlicoBundlerActions, pimlicoPaymasterActions } from "permissionless/actions/pimlico"
import { Address, Hash, concat, createClient, createPublicClient, encodeFunctionData, http, Hex } from "viem"
import { generatePrivateKey, privateKeyToAccount, signMessage } from "viem/accounts"
import { lineaTestnet, polygonMumbai, sepolia } from "viem/chains"
import { createPimlicoBundlerClient, createPimlicoPaymasterClient } from "permissionless/clients/pimlico";
import { privateKeyToSimpleSmartAccount, privateKeyToSafeSmartAccount } from "permissionless/accounts";
import { writeFileSync } from 'fs'

const apiKey = "0b58e9b6-c1ee-4f7e-954b-53b5f04cdde5"
const paymasterUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${apiKey}`
 
const privateKey =
	(process.env.PRIVATE_KEY as Hex) ??
	(() => {
		const pk = generatePrivateKey()
		writeFileSync(".env", `PRIVATE_KEY=${pk}`)
		return pk
	})()

console.log(paymasterUrl)
 
export const publicClient = createPublicClient({
	transport: http("https://rpc.ankr.com/eth_sepolia"),
})
 
export const paymasterClient = createPimlicoPaymasterClient({
	transport: http(paymasterUrl),
})


const account = await privateKeyToSafeSmartAccount(publicClient, {
	privateKey,
	safeVersion: "1.4.1", // simple version
	entryPoint: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789", // global entrypoint
})
 
console.log(`Smart account address: https://sepolia.etherscan.io/address/${account.address}`)

const bundlerUrl = `https://api.pimlico.io/v1/sepolia/rpc?apikey=${apiKey}`
 
console.log(bundlerUrl)

const smartAccountClient = createSmartAccountClient({
	account,
	chain: sepolia,
	transport: http(bundlerUrl),
	sponsorUserOperation: paymasterClient.sponsorUserOperation,
})
	.extend(bundlerActions)
	.extend(pimlicoBundlerActions)
 
const gasPrices = await smartAccountClient.getUserOperationGasPrice()
 
console.log(gasPrices)
