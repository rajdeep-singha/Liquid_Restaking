module liq_restaking::token_test {
    #[test_only]
    use liq_restaking::staked_token;
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::account;
    use liq_restaking::restaked_token;
    use std::debug::print;
    use std::string::utf8;

    #[test(admin = @liq_restaking, user1 = @0x1, user2 = @0x2)]
    fun test_restaked_token_flow(
        admin: &signer, user1: &signer, user2: &signer
    ) {
        account::create_account_for_test(@aptos_framework);
        account::create_account_for_test(signer::address_of(admin));
        account::create_account_for_test(signer::address_of(user1));
        account::create_account_for_test(signer::address_of(user2));

        restaked_token::initialize(admin);

        print(&utf8(b"Restaked Token initialized successfully\n"));

        // coin::register<restaked_token::RSToken>(user1);
        // coin::register<restaked_token::RSToken>(user2);
        restaked_token::register<restaked_token::RSToken>(user1);
        restaked_token::register<restaked_token::RSToken>(user2);

        restaked_token::mint<restaked_token::RSToken>(
            admin, signer::address_of(user1), 100
        );
        assert!(restaked_token::balance_of(signer::address_of(user1)) == 100, 101);

        restaked_token::transfer(user1, signer::address_of(user2), 30);
        assert!(restaked_token::balance_of(signer::address_of(user1)) == 70, 102);
        assert!(restaked_token::balance_of(signer::address_of(user2)) == 30, 103);

        // restaked_token::burn(user1, 20);
        // assert!(restaked_token::balance_of(signer::address_of(user1)) == 50, 104);
    }
}
