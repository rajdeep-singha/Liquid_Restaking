module liq_restaking::mock_staking_protocol {
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use liq_restaking::staked_token;
    use aptos_framework::table::{Self, Table};
    use aptos_framework::account;
    use std::signer;

    const E_NOT_ADMIN: u64 = 1;
    const E_INSUFFICIENT_BALANCE: u64 = 2;
    const E_ZERO_AMOUNT: u64 = 3;
    const E_NOT_REGISTERED: u64 = 4;

    struct MockStakingProtocol has key {
        total_staked: u64,
        exchange_rate: u64,  // APT to staked token ratio (scaled by 10^8)
        user_stakes: Table<address, u64>,
        resource_signer_cap: account::SignerCapability,
    }

    /// Initialize the mock staking protocol
    public entry fun initialize(admin: &signer, seed: vector<u8>) {
        let admin_addr = signer::address_of(admin);
        assert!(admin_addr == @liq_restaking, E_NOT_ADMIN);
        assert!(!exists<MockStakingProtocol>(admin_addr), E_NOT_ADMIN);
        
        let (resource_signer, resource_signer_cap) = account::create_resource_account(admin, seed);
        
        // Register resource account for APT
        coin::register<AptosCoin>(&resource_signer);
        
        move_to(admin, MockStakingProtocol {
            total_staked: 0,
            exchange_rate: 100000000, // 1:1 ratio initially (scaled by 10^8)
            user_stakes: table::new(),
            resource_signer_cap,
        });
    }

    /// Register user to use the mock staking protocol
    public entry fun register_user(user: &signer) {
        // Register for both APT and staked tokens
        if (!coin::is_account_registered<AptosCoin>(signer::address_of(user))) {
            coin::register<AptosCoin>(user);
        };
        
        if (!coin::is_account_registered<staked_token::SToken>(signer::address_of(user))) {
            coin::register<staked_token::SToken>(user);
        };
    }

    /// Stake APT tokens and receive staked tokens
    public entry fun stake_apt(user: &signer, amount: u64) acquires MockStakingProtocol {
        assert!(amount > 0, E_ZERO_AMOUNT);
        
        let user_address = signer::address_of(user);
        assert!(coin::balance<AptosCoin>(user_address) >= amount, E_INSUFFICIENT_BALANCE);
        
        let protocol = borrow_global_mut<MockStakingProtocol>(@liq_restaking);
        let resource_signer = account::create_signer_with_capability(&protocol.resource_signer_cap);
        let resource_address = signer::address_of(&resource_signer);
        
        // Transfer APT from user to resource account
        coin::transfer<AptosCoin>(user, resource_address, amount);
        
        // Calculate staked tokens to mint based on exchange rate
        let staked_amount = (amount * protocol.exchange_rate) / 100000000;
        
        // Mint staked tokens to user
        staked_token::mint<staked_token::SToken>(&resource_signer, user_address, staked_amount);
        
        // Update user stake tracking
        if (table::contains(&protocol.user_stakes, user_address)) {
            let current_stake = table::borrow_mut(&mut protocol.user_stakes, user_address);
            *current_stake = *current_stake + amount;
        } else {
            table::add(&mut protocol.user_stakes, user_address, amount);
        };
        
        // Update total staked
        protocol.total_staked = protocol.total_staked + amount;
    }

    /// Unstake by burning staked tokens and receiving APT back
    public entry fun unstake_apt(user: &signer, staked_amount: u64) acquires MockStakingProtocol {
        assert!(staked_amount > 0, E_ZERO_AMOUNT);
        
        let user_address = signer::address_of(user);
        assert!(coin::balance<staked_token::SToken>(user_address) >= staked_amount, E_INSUFFICIENT_BALANCE);
        
        let protocol = borrow_global_mut<MockStakingProtocol>(@liq_restaking);
        let resource_signer = account::create_signer_with_capability(&protocol.resource_signer_cap);
        
        // Calculate APT to return based on exchange rate
        let apt_amount = (staked_amount * 100000000) / protocol.exchange_rate;
        
        // Burn staked tokens from user
        staked_token::burn(user, staked_amount);
        
        // Transfer APT back to user from resource account
        coin::transfer<AptosCoin>(&resource_signer, user_address, apt_amount);
        
        // Update user stake tracking
        if (table::contains(&protocol.user_stakes, user_address)) {
            let current_stake = table::borrow_mut(&mut protocol.user_stakes, user_address);
            *current_stake = *current_stake - apt_amount;
        };
        
        // Update total staked
        protocol.total_staked = protocol.total_staked - apt_amount;
    }

    /// Update exchange rate (admin only)
    public entry fun update_exchange_rate(admin: &signer, new_rate: u64) acquires MockStakingProtocol {
        assert!(signer::address_of(admin) == @liq_restaking, E_NOT_ADMIN);
        
        let protocol = borrow_global_mut<MockStakingProtocol>(@liq_restaking);
        protocol.exchange_rate = new_rate;
    }

    // View functions
    #[view]
    public fun get_user_stake(user_address: address): u64 acquires MockStakingProtocol {
        let protocol = borrow_global<MockStakingProtocol>(@liq_restaking);
        if (table::contains(&protocol.user_stakes, user_address)) {
            *table::borrow(&protocol.user_stakes, user_address)
        } else {
            0
        }
    }

    #[view]
    public fun get_total_staked(): u64 acquires MockStakingProtocol {
        let protocol = borrow_global<MockStakingProtocol>(@liq_restaking);
        protocol.total_staked
    }

    #[view]
    public fun get_exchange_rate(): u64 acquires MockStakingProtocol {
        let protocol = borrow_global<MockStakingProtocol>(@liq_restaking);
        protocol.exchange_rate
    }

    // Helper function to get resource account signer
    fun get_resource_signer(): signer acquires MockStakingProtocol {
        let protocol = borrow_global<MockStakingProtocol>(@liq_restaking);
        account::create_signer_with_capability(&protocol.resource_signer_cap)
    }
}
