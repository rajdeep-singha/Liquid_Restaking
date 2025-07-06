# Liquid Restaking Protocol

This project implements a liquid restaking protocol on Aptos that allows users to:
1. Stake APT tokens to receive staked tokens
2. Restake staked tokens to receive restaked tokens (liquid restaking)
3. Unstake at any level to get back the underlying tokens

## Architecture

### Core Components

1. **Mock Staking Protocol** (`mock_staking_protocol.move`)
   - Accepts APT tokens and mints staked tokens in return
   - Maintains user stake mappings and total staked amounts
   - Supports exchange rate updates for different APT-to-staked token ratios

2. **Restaking Engine** (`restaking_engine.move`)
   - Accepts staked tokens and mints restaked tokens in return
   - Provides liquid restaking functionality
   - Maintains user restake mappings and total restaked amounts
   - Supports exchange rate updates for different staked-to-restaked token ratios

3. **Token Modules**
   - `staked_token.move`: Defines the SToken (staked token)
   - `restaked_token.move`: Defines the RSToken (restaked token)

### Flow

```
APT → [Mock Staking Protocol] → Staked Tokens → [Restaking Engine] → Restaked Tokens
```

### Key Features

- **Resource Accounts**: Both protocols use resource accounts to securely hold tokens
- **Exchange Rates**: Configurable exchange rates allow for different reward mechanisms
- **User Tracking**: Complete tracking of individual user stakes and restakes
- **Flexible Unstaking**: Users can unstake at any level to retrieve underlying tokens

## Usage

### Initialization

```move
// Initialize token capabilities
staked_token::initialize(admin);
restaked_token::initialize(admin);

// Initialize protocols with unique seeds
mock_staking_protocol::initialize(admin, b"mock_seed");
restaking_engine::initialize(admin, b"restaking_seed");
```

### User Registration

```move
// Register for both protocols
mock_staking_protocol::register_user(user);
restaking_engine::register_user(user);
```

### Staking Flow

1. **Stake APT for Staked Tokens**:
```move
mock_staking_protocol::stake_apt(user, amount);
```

2. **Restake Staked Tokens for Restaked Tokens**:
```move
restaking_engine::restake_tokens(user, amount);
```

### Unstaking Flow

1. **Unstake Restaked Tokens for Staked Tokens**:
```move
restaking_engine::unstake_tokens(user, amount);
```

2. **Unstake Staked Tokens for APT**:
```move
mock_staking_protocol::unstake_apt(user, amount);
```

### View Functions

- `mock_staking_protocol::get_user_stake(address)`: Get user's APT stake amount
- `mock_staking_protocol::get_total_staked()`: Get total APT staked in protocol
- `restaking_engine::get_user_restake(address)`: Get user's staked token restake amount
- `restaking_engine::get_total_restaked()`: Get total staked tokens restaked
- Both protocols support `get_exchange_rate()` to check current rates

## Exchange Rate Mechanism

Exchange rates are scaled by 10^8 for precision:
- Rate of 100000000 = 1:1 ratio
- Rate of 110000000 = 1.1:1 ratio (1.1x rewards)
- Rate of 90000000 = 0.9:1 ratio (0.9x penalty)

## Security Features

1. **Admin Controls**: Only the admin (@liq_restaking) can update exchange rates
2. **Resource Accounts**: Tokens are held in secure resource accounts
3. **Balance Checks**: All operations verify sufficient balances before execution
4. **Zero Amount Protection**: Prevents zero-amount operations

## Testing

The `integration_test.move` file provides comprehensive tests covering:
- Full user flow (APT → Staked → Restaked → back)
- Exchange rate updates
- Multiple user scenarios
- Balance verification at each step

Run tests with:
```bash
aptos move test
```

## Deployment

1. Update `Move.toml` with your account address
2. Deploy with `aptos move publish`
3. Initialize the system by calling initialization functions
4. Register users and start staking!

## Gas Optimization

The protocol is designed to be gas-efficient:
- Minimal storage usage with tables for user mappings
- Efficient coin operations using native Aptos framework
- Batched operations where possible

## Future Enhancements

Potential improvements:
- Automated reward distribution
- Time-locked unstaking periods
- Integration with actual staking validators
- Governance mechanisms for protocol parameters
- Multiple staked token support
