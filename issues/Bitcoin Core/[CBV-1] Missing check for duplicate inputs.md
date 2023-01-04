# Missing check for duplicate inputs

A vulnerability was found in Bitcoin Core and Bitcoin Knots up to 0.14.2/0.15.1/0.16.2. It has been rated as problematic. Affected by this issue is some unknown functionality of the component Duplicate Input Handler. The manipulation leads to input validation. This vulnerability is handled as CVE-2018-17144.

### ID: CBV-1
### Blockchain: Bitcoin
### Version affected: Bitcoin Core 0.14.x before 0.14.3, 0.15.x before 0.15.2, and 0.16.x before 0.16.3 and Bitcoin Knots 0.14.x through 0.16.x before 0.16.3
### Component: Consensus Mechanism
### Severity: 6.1
### Vulnerability Type: Denial of service

## Details

In Bitcoin Core 0.14, an optimization was added (Bitcoin Core PR #9049) which avoided a costly check during initial pre-relay block validation that multiple inputs within a single transaction did not spend the same input twice which was added in 2012 (PR #443). While the UTXO-updating logic has sufficient knowledge to check that such a condition is not violated in 0.14 it only did so in a sanity check assertion and not with full error handling (it did, however, fully handle this case twice in prior to 0.8).

Thus, in Bitcoin Core 0.14.X, any attempts to double-spend a transaction output within a single transaction inside of a block will result in an assertion failure and a crash, as was originally reported.

In Bitcoin Core 0.15, as a part of a larger redesign to simplify unspent transaction output tracking and correct a resource exhaustion attack the assertion was changed subtly. Instead of asserting that the output being marked spent was previously unspent, it only asserts that it exists.

Thus, in Bitcoin Core 0.15.X, 0.16.0, 0.16.1, and 0.16.2, any attempts to double-spend a transaction output within a single transaction inside of a block where the output being spent was created in the same block, the same assertion failure will occur (as exists in the test case which was included in the 0.16.3 patch). However, if the output being double-spent was created in a previous block, an entry will still remain in the CCoin map with the DIRTY flag set and having been marked as spent, resulting in no such assertion. This could allow a miner to inflate the supply of Bitcoin as they would be then able to claim the value being spent twice.

## Recommendation

It is recommended to upgrade the affected component.

## References
* [https://bitcoincore.org/en/2018/09/20/notice/](https://bitcoincore.org/en/2018/09/20/notice/)
* [https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2018-17144](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2018-17144)
* [https://github.com/bitcoinknots/bitcoin/blob/v0.16.3.knots20180918/doc/release-notes.md](https://github.com/bitcoinknots/bitcoin/blob/v0.16.3.knots20180918/doc/release-notes.md)

## Aditional Comments (Optional)
The attack may be launched remotely. There is no exploit available.