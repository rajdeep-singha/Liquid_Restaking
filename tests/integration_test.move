module liq_restaking::integration_test {
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{Self, AptosCoin};
    use liq_restaking::mock_staking_protocol;
    use liq_restaking::restaking_engine;
    use liq_restaking::staked_token;
    use liq_restaking::restaked_token;
    use std::signer;
    use std::vector;
    use aptos_framework::account;

    const E_INITIALIZATION_FAILED: u64 = 1;
    const E_BALANCE_MISMATCH: u64 = 2;

    #[test(admin = @0x1, user = @0x123)]
    public fun test_full_flow(admin: &signer, user: &signer) {
        account::create_account_for_test(@aptos_framework);
        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(user));
        aptos_coin::ensure_initialized_with_apt_fa_metadata_for_test();
        staked_token::initialize(admin);
        restaked_token::initialize(admin);
        
        // Initialize protocols
        mock_staking_protocol::initialize(admin, b"mock_staking_seed");
        restaking_engine::initialize(admin, b"restaking_engine_seed");
        
        // Register user for both protocols
        mock_staking_protocol::register_user(user);
        restaking_engine::register_user(user);
        
        // Give user some APT for testing
        let user_addr = signer::address_of(user);
        aptos_coin::mint(admin, user_addr, 1000000000); // 10 APT
        
        // Step 1: User stakes APT to get staked tokens
        let apt_stake_amount = 500000000; // 5 APT
        mock_staking_protocol::stake_apt(user, apt_stake_amount);
        
        // Check that user received staked tokens
        let staked_balance = coin::balance<staked_token::SToken>(user_addr);
        assert!(staked_balance == apt_stake_amount, E_BALANCE_MISMATCH);
        
        // Step 2: User stakes staked tokens to get restaked tokens
        let staked_amount_to_restake = 300000000; // 3 staked tokens
        restaking_engine::restake_tokens(user, staked_amount_to_restake);
        
        // Check that user received restaked tokens
        let restaked_balance = coin::balance<restaked_token::RSToken>(user_addr);
        assert!(restaked_balance == staked_amount_to_restake, E_BALANCE_MISMATCH);
        
        // Check that user's staked token balance decreased
        let remaining_staked = coin::balance<staked_token::SToken>(user_addr);
        assert!(remaining_staked == apt_stake_amount - staked_amount_to_restake, E_BALANCE_MISMATCH);
        
        // Step 3: User can unstake restaked tokens to get staked tokens back
        let restaked_amount_to_unstake = 100000000; // 1 restaked token
        restaking_engine::unstake_tokens(user, restaked_amount_to_unstake);
        
        // Check balances after unstaking
        let final_restaked = coin::balance<restaked_token::RSToken>(user_addr);
        let final_staked = coin::balance<staked_token::SToken>(user_addr);
        
        assert!(final_restaked == restaked_balance - restaked_amount_to_unstake, E_BALANCE_MISMATCH);
        assert!(final_staked == remaining_staked + restaked_amount_to_unstake, E_BALANCE_MISMATCH);
        
        // Step 4: User can unstake staked tokens to get APT back
        let staked_amount_to_unstake = 200000000; // 2 staked tokens
        mock_staking_protocol::unstake_apt(user, staked_amount_to_unstake);
        
        // Check final APT balance
        let final_apt = coin::balance<AptosCoin>(user_addr);
        let expected_apt = 1000000000 - apt_stake_amount + staked_amount_to_unstake;
        assert!(final_apt == expected_apt, E_BALANCE_MISMATCH);
    }

    #[test(admin = @0x1)]
    public fun test_exchange_rate_updates(admin: &signer) {
        account::create_account_for_test(@aptos_framework);
        account::create_account_for_test(signer::address_of(admin));
        aptos_coin::ensure_initialized_with_apt_fa_metadata_for_test();
        staked_token::initialize(admin);
        restaked_token::initialize(admin);
        
        // Initialize protocols
        mock_staking_protocol::initialize(admin, b"mock_seed");
        restaking_engine::initialize(admin, b"engine_seed");
        
        // Test initial exchange rates
        assert!(mock_staking_protocol::get_exchange_rate() == 100000000, E_BALANCE_MISMATCH);
        assert!(restaking_engine::get_exchange_rate() == 100000000, E_BALANCE_MISMATCH);
        
        // Update exchange rates
        mock_staking_protocol::update_exchange_rate(admin, 110000000); // 1.1x rate
        restaking_engine::update_exchange_rate(admin, 120000000); // 1.2x rate
        
        // Verify updates
        assert!(mock_staking_protocol::get_exchange_rate() == 110000000, E_BALANCE_MISMATCH);
        assert!(restaking_engine::get_exchange_rate() == 120000000, E_BALANCE_MISMATCH);
    }

    #[test(admin = @0x1, user1 = @0x123, user2 = @0x456)]
    public fun test_multiple_users(admin: &signer, user1: &signer, user2: &signer) {
        account::create_account_for_test(@aptos_framework);
        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(user1));
        account::create_account_for_test(signer::address_of(user2));
        aptos_coin::ensure_initialized_with_apt_fa_metadata_for_test();
        staked_token::initialize(admin);
        restaked_token::initialize(admin);
        
        // Initialize system
        mock_staking_protocol::initialize(admin, b"mock_seed");
        restaking_engine::initialize(admin, b"engine_seed");
        
        // Register users
        mock_staking_protocol::register_user(user1);
        mock_staking_protocol::register_user(user2);
        restaking_engine::register_user(user1);
        restaking_engine::register_user(user2);
        
        // Give users APT
        let user1_addr = signer::address_of(user1);
        let user2_addr = signer::address_of(user2);
        aptos_coin::mint(admin, user1_addr, 1000000000);
        aptos_coin::mint(admin, user2_addr, 2000000000);
        
        // Users stake different amounts
        mock_staking_protocol::stake_apt(user1, 500000000);
        mock_staking_protocol::stake_apt(user2, 1000000000);
        
        // Check individual stakes
        assert!(mock_staking_protocol::get_user_stake(user1_addr) == 500000000, E_BALANCE_MISMATCH);
        assert!(mock_staking_protocol::get_user_stake(user2_addr) == 1000000000, E_BALANCE_MISMATCH);
        
        // Check total staked
        assert!(mock_staking_protocol::get_total_staked() == 1500000000, E_BALANCE_MISMATCH);
        
        // Users restake different amounts
        restaking_engine::restake_tokens(user1, 300000000);
        restaking_engine::restake_tokens(user2, 600000000);
        
        // Check individual restakes
        assert!(restaking_engine::get_user_restake(user1_addr) == 300000000, E_BALANCE_MISMATCH);
        assert!(restaking_engine::get_user_restake(user2_addr) == 600000000, E_BALANCE_MISMATCH);
        
        // Check total restaked
        assert!(restaking_engine::get_total_restaked() == 900000000, E_BALANCE_MISMATCH);
    }
}
