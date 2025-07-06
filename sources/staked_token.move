module liq_restaking::staked_token {
    use aptos_framework::coin;
    use std::signer;
    use std::string::utf8;

    const E_NOT_ENOUGH_BALANCE: u64 = 1;
    const E_NOT_ADMIN: u64 = 2;
    const E_NOT_REGISTERED: u64 = 3;

    struct SToken {}

    struct STokenCapabilities<phantom SToken> has key {
        burn_cap: coin::BurnCapability<SToken>,
        freeze_cap: coin::FreezeCapability<SToken>,
        mint_cap: coin::MintCapability<SToken>
    }

    public fun initialize(account: &signer) {
        let (burn_cap, freeze_cap, mint_cap) =
            coin::initialize<SToken>(
                account,
                utf8(b"Staked Token"),
                utf8(b"sTKN"),
                8,
                false
            );

        assert!(signer::address_of(account) == @liq_restaking, E_NOT_ADMIN);
        assert!(
            !exists<STokenCapabilities<SToken>>(signer::address_of(account)),
            E_NOT_ADMIN
        );

        move_to(
            account,
            STokenCapabilities {
                burn_cap: burn_cap,
                freeze_cap: freeze_cap,
                mint_cap: mint_cap
            }
        );
    }

    public entry fun register<SToken>(account: &signer) {
        let account_address = signer::address_of(account);
        assert!(
            !coin::is_account_registered<SToken>(account_address), E_NOT_REGISTERED
        );

        coin::register<SToken>(account);
    }

    public fun mint<SToken>(
        minter: &signer, recipient: address, amount: u64
    ) acquires STokenCapabilities {
        let minter_addr = signer::address_of(minter);

        // Allow both the main account and resource accounts to mint
        assert!(exists<STokenCapabilities<SToken>>(@liq_restaking), E_NOT_ADMIN);

        let mint_capability = borrow_global<STokenCapabilities<SToken>>(@liq_restaking);
        let mint_cap = &mint_capability.mint_cap;

        let coins_minted = coin::mint<SToken>(amount, mint_cap);

        coin::deposit<SToken>(recipient, coins_minted);
    }

    public fun burn(burner: &signer, amount: u64) acquires STokenCapabilities {
        let burner_address = signer::address_of(burner);

        let balance = balance_of(burner_address);
        assert!(balance >= amount, E_NOT_ENOUGH_BALANCE);

        let coin_to_burn = coin::withdraw<SToken>(burner, amount);

        let burn_capability = borrow_global<STokenCapabilities<SToken>>(@liq_restaking);
        let burn_cap = &burn_capability.burn_cap;

        coin::burn<SToken>(coin_to_burn, burn_cap);
    }

    public fun transfer(user: &signer, receiver: address, amount: u64) {
        let user_address = signer::address_of(user);
        let balance = balance_of(user_address);

        assert!(balance >= amount, E_NOT_ENOUGH_BALANCE);

        coin::transfer<SToken>(user, receiver, amount);
    }

    #[view]
    public fun balance_of(account: address): u64 {
        coin::balance<SToken>(account)
    }
}
