module liq_restaking::restaking_engine {
    use aptos_framework::coin;
    use aptos_framework::aptos_coin;
    use liq_restaking::restaked_token;
    use liq_restaking::staked_token;
    use aptos_framework::table::{Self, Table};
    use aptos_framework::account;
    use std::signer;

    const E_NOT_ADMIN: u64 = 1;
    const E_INSUFFICIENT_BALANCE: u64 = 2;
    const E_ZERO_AMOUNT: u64 = 3;
    const E_NOT_REGISTERED: u64 = 4;
    const E_ENGINE_NOT_INITIALIZED: u64 = 5;

    struct RestakingEngine has key {
        exchange_rate: u64,  // Staked token to restaked token ratio (scaled by 10^8)
        total_restaked: u64,
        user_restakes: Table<address, u64>,
        resource_signer_cap: account::SignerCapability,
    }

    /// Initialize the restaking engine
    public entry fun initialize(admin: &signer, seed: vector<u8>) {
        let admin_addr = signer::address_of(admin);
        assert!(admin_addr == @liq_restaking, E_NOT_ADMIN);
        assert!(!exists<RestakingEngine>(admin_addr), E_NOT_ADMIN);

        let (resource_signer, resource_signer_cap) = account::create_resource_account(admin, seed);
        
        // Register resource account for staked tokens
        coin::register<staked_token::SToken>(&resource_signer);

        move_to(admin, RestakingEngine {
            exchange_rate: 100000000, // 1:1 ratio initially (scaled by 10^8)
            total_restaked: 0,
            user_restakes: table::new(),
            resource_signer_cap,
        });
    }

    /// Register user for restaking
    public entry fun register_user(user: &signer) {
        let user_address = signer::address_of(user);
        
        // Register for staked tokens if not already registered
        if (!coin::is_account_registered<staked_token::SToken>(user_address)) {
            coin::register<staked_token::SToken>(user);
        };
        
        // Register for restaked tokens if not already registered
        if (!coin::is_account_registered<restaked_token::RSToken>(user_address)) {
            coin::register<restaked_token::RSToken>(user);
        };
    }

    /// Stake staked tokens and receive restaked tokens
    public entry fun restake_tokens(user: &signer, amount: u64) acquires RestakingEngine {
        assert!(amount > 0, E_ZERO_AMOUNT);
        assert!(exists<RestakingEngine>(@liq_restaking), E_ENGINE_NOT_INITIALIZED);
        
        let user_address = signer::address_of(user);
        assert!(coin::balance<staked_token::SToken>(user_address) >= amount, E_INSUFFICIENT_BALANCE);
        
        let engine = borrow_global_mut<RestakingEngine>(@liq_restaking);
        let resource_signer = account::create_signer_with_capability(&engine.resource_signer_cap);
        let resource_address = signer::address_of(&resource_signer);
        
        // Transfer staked tokens from user to resource account
        coin::transfer<staked_token::SToken>(user, resource_address, amount);
        
        // Calculate restaked tokens to mint based on exchange rate
        let restaked_amount = (amount * engine.exchange_rate) / 100000000;
        
        // Mint restaked tokens to user
        restaked_token::mint<restaked_token::RSToken>(&resource_signer, user_address, restaked_amount);
        
        // Update user restake tracking
        if (table::contains(&engine.user_restakes, user_address)) {
            let current_restake = table::borrow_mut(&mut engine.user_restakes, user_address);
            *current_restake = *current_restake + amount;
        } else {
            table::add(&mut engine.user_restakes, user_address, amount);
        };
        
        // Update total restaked
        engine.total_restaked = engine.total_restaked + amount;
    }

    /// Unstake by burning restaked tokens and receiving staked tokens back
    public entry fun unstake_tokens(user: &signer, restaked_amount: u64) acquires RestakingEngine {
        assert!(restaked_amount > 0, E_ZERO_AMOUNT);
        assert!(exists<RestakingEngine>(@liq_restaking), E_ENGINE_NOT_INITIALIZED);
        
        let user_address = signer::address_of(user);
        assert!(coin::balance<restaked_token::RSToken>(user_address) >= restaked_amount, E_INSUFFICIENT_BALANCE);
        
        let engine = borrow_global_mut<RestakingEngine>(@liq_restaking);
        let resource_signer = account::create_signer_with_capability(&engine.resource_signer_cap);
        
        // Calculate staked tokens to return based on exchange rate
        let staked_amount = (restaked_amount * 100000000) / engine.exchange_rate;
        
        // Burn restaked tokens from user
        restaked_token::burn(user, restaked_amount);
        
        // Transfer staked tokens back to user from resource account
        coin::transfer<staked_token::SToken>(&resource_signer, user_address, staked_amount);
        
        // Update user restake tracking
        if (table::contains(&engine.user_restakes, user_address)) {
            let current_restake = table::borrow_mut(&mut engine.user_restakes, user_address);
            *current_restake = *current_restake - staked_amount;
        };
        
        // Update total restaked
        engine.total_restaked = engine.total_restaked - staked_amount;
    }

    /// Update exchange rate (admin only)
    public entry fun update_exchange_rate(admin: &signer, new_rate: u64) acquires RestakingEngine {
        assert!(signer::address_of(admin) == @liq_restaking, E_NOT_ADMIN);
        assert!(exists<RestakingEngine>(@liq_restaking), E_ENGINE_NOT_INITIALIZED);
        
        let engine = borrow_global_mut<RestakingEngine>(@liq_restaking);
        engine.exchange_rate = new_rate;
    }

    // View functions
    #[view]
    public fun get_user_restake(user_address: address): u64 acquires RestakingEngine {
        assert!(exists<RestakingEngine>(@liq_restaking), E_ENGINE_NOT_INITIALIZED);
        let engine = borrow_global<RestakingEngine>(@liq_restaking);
        if (table::contains(&engine.user_restakes, user_address)) {
            *table::borrow(&engine.user_restakes, user_address)
        } else {
            0
        }
    }

    #[view]
    public fun get_total_restaked(): u64 acquires RestakingEngine {
        assert!(exists<RestakingEngine>(@liq_restaking), E_ENGINE_NOT_INITIALIZED);
        let engine = borrow_global<RestakingEngine>(@liq_restaking);
        engine.total_restaked
    }

    #[view]
    public fun get_exchange_rate(): u64 acquires RestakingEngine {
        assert!(exists<RestakingEngine>(@liq_restaking), E_ENGINE_NOT_INITIALIZED);
        let engine = borrow_global<RestakingEngine>(@liq_restaking);
        engine.exchange_rate
    }

    // Helper function to get resource signer
    fun get_resource_signer(): signer acquires RestakingEngine {
        let engine = borrow_global<RestakingEngine>(@liq_restaking);
        account::create_signer_with_capability(&engine.resource_signer_cap)
    }
}
