module liq_restaking::restaked_token {
    use aptos_framework::coin;
    use std::signer;
    use std::string::utf8;

    const E_NOT_ENOUGH_BALANCE: u64 = 1;
    const E_NOT_ADMIN: u64 = 2;
    const E_NOT_REGISTERED: u64 = 3;

    struct RSToken {}

    struct RSTokenCapabilities<phantom RSToken> has key {
        burn_cap: coin::BurnCapability<RSToken>,
        freeze_cap: coin::FreezeCapability<RSToken>,
        mint_cap: coin::MintCapability<RSToken>
    }

    public fun initialize(account: &signer) {
        // Chore: look into metadata

        let (burn_cap, freeze_cap, mint_cap) =
            coin::initialize<RSToken>(
                account,
                utf8(b"Restaked Token"),
                utf8(b"rsTKN"),
                8,
                false
            );

        assert!(signer::address_of(account) == @liq_restaking, E_NOT_ADMIN);
        assert!(
            !exists<RSTokenCapabilities<RSToken>>(signer::address_of(account)),
            E_NOT_ADMIN
        );

        move_to(
            account,
            RSTokenCapabilities {
                burn_cap: burn_cap,
                freeze_cap: freeze_cap,
                mint_cap: mint_cap
            }
        );
    }

    public entry fun register<RSToken>(account: &signer) {
        let account_address = signer::address_of(account);
        assert!(
            !coin::is_account_registered<RSToken>(account_address), E_NOT_REGISTERED
        );

        coin::register<RSToken>(account);
    }

    public fun mint<RSToken>(
        minter: &signer, recipient: address, amount: u64
    ) acquires RSTokenCapabilities {
        let minter_addr = signer::address_of(minter);

        // Allow both the main account and resource accounts to mint
        assert!(exists<RSTokenCapabilities<RSToken>>(@liq_restaking), E_NOT_ADMIN);

        let mint_capability = borrow_global<RSTokenCapabilities<RSToken>>(@liq_restaking);
        let mint_cap = &mint_capability.mint_cap;

        let coins_minted = coin::mint<RSToken>(amount, mint_cap);

        coin::deposit<RSToken>(recipient, coins_minted);
    }

    public fun burn(burner: &signer, amount: u64) acquires RSTokenCapabilities {
        let burner_address = signer::address_of(burner);

        let balance = balance_of(burner_address);
        assert!(balance >= amount, E_NOT_ENOUGH_BALANCE);

        let coin_to_burn = coin::withdraw<RSToken>(burner, amount);

        let burn_capability = borrow_global<RSTokenCapabilities<RSToken>>(@liq_restaking);
        let burn_cap = &burn_capability.burn_cap;

        coin::burn<RSToken>(coin_to_burn, burn_cap);
    }

    public fun transfer(user: &signer, receiver: address, amount: u64) {
        let user_address = signer::address_of(user);
        let balance = balance_of(user_address);

        assert!(balance >= amount, E_NOT_ENOUGH_BALANCE);

        coin::transfer<RSToken>(user, receiver, amount);
    }

    #[view]
    public fun balance_of(account: address): u64 {
        coin::balance<RSToken>(account)
    }
}
