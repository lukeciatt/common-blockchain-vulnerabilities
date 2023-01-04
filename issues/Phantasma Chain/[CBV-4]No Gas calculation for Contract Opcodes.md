# No Gas calculation for Contract Opcodes

There is a out-if-bonds array read in `CheckProofOfStake` which can crash the application.

### ID: CBV-4
### Blockchain: Phantasma
### Component: VM
### Severity: 8.0

## Details

There was no execution fee for running smart contracts on Phantasma node.
It caused the Phantasma node to be highly vulnerable to the DoS attack by running a function of the smart contract which contained an infinite while loop.

To reproduce the bug you have to deploy the below contract and call the test function with very big integer number as an input.
You may see the node gets crashed or freezed.

```cpp
contract while_test {
	public test(a:number):number
	{
		local counter :number := 0;
		while (counter != a){
			counter += 1;
		}
		return counter;
	}
}
```

All the nodes which has the open RPC ports could be affected by this bug.

## Recommendation

You may either deduct the execution fee from the user who is calling the smart contract or define a maximum opcodes or gas inside the VM for running the opcodes.
