# Final alert cancellation

A vulnerability, which was classified as problematic, was found in Bitcoin Core and Bitcoin Knots. This affects an unknown part of the component Final Alert Handler. The manipulation leads to cryptographic issues. This vulnerability is uniquely identified as CVE-2016-10725. It is possible to initiate the attack remotely. There is no exploit available.

### ID: CBV-2
### Blockchain: Bitcoin
### Version affected: Bitcoin Core before v0.13.0 and Bitcoin Knots before v0.13.0
### Component: Criptography
### Severity: 6.1
### Vulnerability Type: [Cryptographic Issues](https://cwe.mitre.org/data/definitions/310.html)

## Details

In Bitcoin Core before v0.13.0, a non-final alert is able to block the special "final alert" (which is supposed to override all other alerts) because operations occur in the wrong order. This behavior occurs in the remote network alert system (deprecated since Q1 2016). This affects other uses of the codebase, such as Bitcoin Knots before v0.13.0 and many altcoins.
<br/>
Although the final alert is supposed to be uncancellable, it unfortunately is cancellable due to the order of actions when processing an alert. Alerts are first processed by checking whether they cancel any existing alert. Then they are checked whether any of the remaining alerts cancels it. Because of this order, it is possible to create an alert which cancels a final alert before the node checks whether that alert is canceled by the final alert. Thus an attacker can cancel a final alert with another alert allowing a node to be vulnerable to all of the aforementioned attacks.

## Recommendation

Fixing these issues is relatively easy. The first and most obvious solution is to simply remove the Alert system entirely. As nodes upgrade to versions without the Alert system, fewer nodes will be vulnerable to attack should the Alert keys become public. This is the option that Bitcoin has taken. However, because Bitcoin has retired the Alert system entirely, the Alert key will also be published to reduce the risk that the Alert Key is mistakenly depended upon in the future.

Should altcoins wish to continue using the Alert system but with a different Alert Key, a few very simple fixes will safeguard nodes from the aforementioned issues. Limiting the number of alerts, the size of setCancel and setSubVer, and only allowing one final alert altogether fix the above issues. This patch, on top of Bitcoin Core 0.11 (a vulnerable version), fixes the aforementioned issues. Altcoins that still use the Alert system are recommended to port this patch to their software. Outdated node software is still vulnerable.

## References (Optional)

* [https://www.cve.org/CVERecord?id=CVE-2016-10725](https://www.cve.org/CVERecord?id=CVE-2016-10725)
* [https://bitcoin.org/en/posts/alert-key-and-vulnerabilities-disclosure](https://bitcoin.org/en/posts/alert-key-and-vulnerabilities-disclosure)

## Aditional Comments (Optional)
