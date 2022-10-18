// have a function to enter the lottery

import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { chainId: chainIdhex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdhex)
    const raffleAddress =
        chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("")
    const [entranceFee_, setEntranceFee_] = useState("") // workaround for Error: invalid BigNumber string (argument="value", value="", code=INVALID_ARGUMENT, version=bignumber/5.7.0)
    const [numPlayers, setNumPlayers] = useState("")
    const [recentWinner, SetRecentWinner] = useState("")

    const dispatch = useNotification()

    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    }) // runContractfunction can read and send transactions

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })
    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUi() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        setEntranceFee(entranceFeeFromCall)
        setEntranceFee_(ethers.utils.formatUnits(entranceFeeFromCall, "ether"))
        const numplayersFromCall = (await getNumberOfPlayers()).toString()
        setNumPlayers(numplayersFromCall)
        const recentWinnerFromCall = (await getRecentWinner()).toString()
        SetRecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUi()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNotification(tx)
        updateUi()
    }

    const handleNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div>
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async () =>
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="flex">
                                <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full "></div>
                                Enter Raffle
                            </div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <div>Lottery Entrance Fee: {entranceFee_} ETH </div>
                    <div>Players: {numPlayers}</div>
                    <div>RecentWinners: {recentWinner}</div>
                </div>
            ) : (
                <div>No address detected </div>
            )}
        </div>
    )
}
