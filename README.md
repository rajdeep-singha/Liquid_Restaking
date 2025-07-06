# Liquid Restaking on aptos


Project Overview 
![WhatsApp Image 2025-07-06 at 10 52 02_baa51509](https://github.com/user-attachments/assets/c6f917bd-de36-4a64-bfa6-7e91f5e8ff6f)

```

## Owner details: 
`.aptos/config.yaml`
```yaml
---
profiles:
  default:
    network: Devnet
    private_key: ed25519-priv-0xad27eefaf7*************cfe658ef28d9528f96432237b5ec248ddecea
    public_key: ed25519-pub-0xf86ad53ebccfd5bf590f87d30c7f32fa4bc22cd4a398e2942a77f13069565a68
    account: c7a1e9b157d5facbb3fbc9b890b1ac059d0e5f31c9e31f4dd41c2ae600aab25b
    rest_url: "https://fullnode.devnet.aptoslabs.com"
    faucet_url: "https://faucet.devnet.aptoslabs.com"

```

move.toml

package
name = "liquidRestaking"
version = "1.0.0"
authors = []

addresses
liq_restaking = "0xc7a1e9b157d5facbb3fbc9b890b1ac059d0e5f31c9e31f4dd41c2ae600aab25b"

dev-addresses

dependencies.AptosFramework
git = "https://github.com/aptos-labs/aptos-framework.git"
rev = "mainnet"
subdir = "aptos-framework"

dev-dependencies

