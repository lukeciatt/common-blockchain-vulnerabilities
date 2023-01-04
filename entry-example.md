# Coinstake DoS

There is a out-if-bonds array read in `CheckProofOfStake` which can crash the application.

### ID: CBV-108
### Blockchain: Bitcoin
### Version affected: 0.14.3
### Component: Block validation
### Severity: 9.0
### Vulnerability Type: Out-of-bounds read (denial of service)

## Details

In `pos/kernel.cpp`, in function `CheckProofOfStake`, the following code can be found:
```cpp
const CTxOut& prevOut = txPrev->vout[tx->vin[nIn].prevout.n];
```
in the `CheckProofOfStake` function:
```cpp
bool CheckProofOfStake(CChainState* active_chainstate, BlockValidationState& state,  const CTransactionRef& tx, unsigned int nBits, uint256& hashProofOfStake)
{
    ...
    {
        int nIn = 0;
        const CTxOut& prevOut = txPrev->vout[tx->vin[nIn].prevout.n];
        TransactionSignatureChecker checker(&(*tx), nIn, prevOut.nValue, PrecomputedTransactionData(*tx), MissingDataBehavior::FAIL);

        if (!VerifyScript(tx->vin[nIn].scriptSig, prevOut.scriptPubKey, &(tx->vin[nIn].scriptWitness), SCRIPT_VERIFY_P2SH, checker, nullptr))
            return state.Invalid(BlockValidationResult::BLOCK_CONSENSUS, "invalid-pos-script", "VerifyScript failed on coinstake");
    }
    ...
}
```

When the code is accessing the output of the previous transaction in `txPrev->vout[tx->vin[nIn].prevout.n]`, the value of `tx->vin[nIn].prevout.n` is not validated and can be any value.
It can easily crash the node when this value is out of bounds, for example, 1000000000.

## Recommendation

Add the missing validation for preventing wrong format inputs or large numbers in `tx->vin[nIn].prevout.n`

## References

## Aditional Comments
