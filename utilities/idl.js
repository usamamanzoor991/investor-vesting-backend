const idl = {
  address: "2tMM3fG8UtE9UAiZukZuk4TY45DkwkDx7J4Tj69jke33",
  metadata: {
    name: "investor_vesting_distribution",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Created with Anchor",
  },
  instructions: [
    {
      name: "accept_admin",
      docs: ["Admin rotation step 2: new admin signs to accept."],
      discriminator: [112, 42, 45, 90, 116, 181, 13, 170],
      accounts: [
        {
          name: "new_admin",
          signer: true,
        },
        {
          name: "config",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103],
              },
            ],
          },
        },
        {
          name: "event_authority",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111,
                  114, 105, 116, 121,
                ],
              },
            ],
          },
        },
        {
          name: "program",
        },
      ],
      args: [],
    },
    {
      name: "accept_beneficiary",
      docs: ["SC-08 — proposed beneficiary signs to accept (step 2)."],
      discriminator: [85, 91, 40, 96, 188, 166, 162, 38],
      accounts: [
        {
          name: "new_beneficiary",
          docs: ["The pending beneficiary must sign to finalise the transfer."],
          signer: true,
        },
        {
          name: "config",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103],
              },
            ],
          },
          relations: ["investor_vesting"],
        },
        {
          name: "investor_vesting",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [105, 110, 118, 101, 115, 116, 111, 114],
              },
              {
                kind: "account",
                path: "config",
              },
              {
                kind: "account",
                path: "investor_vesting.investor_id",
                account: "InvestorVesting",
              },
            ],
          },
        },
        {
          name: "event_authority",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111,
                  114, 105, 116, 121,
                ],
              },
            ],
          },
        },
        {
          name: "program",
        },
      ],
      args: [],
    },
    {
      name: "add_investor",
      docs: ["SC-04, SC-05 — register an investor with solvency check."],
      discriminator: [63, 93, 233, 93, 140, 208, 152, 146],
      accounts: [
        {
          name: "admin_authority",
          writable: true,
          signer: true,
          relations: ["config"],
        },
        {
          name: "config",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103],
              },
            ],
          },
        },
        {
          name: "escrow_vault",
          docs: [
            "Vault is read to check solvency before committing the new liability.",
          ],
          relations: ["config"],
        },
        {
          name: "investor_vesting",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [105, 110, 118, 101, 115, 116, 111, 114],
              },
              {
                kind: "account",
                path: "config",
              },
              {
                kind: "account",
                path: "config.next_investor_id",
                account: "GlobalConfig",
              },
            ],
          },
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111",
        },
        {
          name: "event_authority",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111,
                  114, 105, 116, 121,
                ],
              },
            ],
          },
        },
        {
          name: "program",
        },
      ],
      args: [
        {
          name: "label",
          type: "string",
        },
        {
          name: "beneficiary",
          type: "pubkey",
        },
        {
          name: "total_allocation",
          type: "u64",
        },
        {
          name: "vest_start_time",
          type: "i64",
        },
      ],
    },
    {
      name: "cancel_admin_proposal",
      docs: ["Admin aborts a pending admin proposal."],
      discriminator: [68, 6, 145, 131, 16, 73, 182, 229],
      accounts: [
        {
          name: "admin_authority",
          signer: true,
          relations: ["config"],
        },
        {
          name: "config",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103],
              },
            ],
          },
        },
        {
          name: "event_authority",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111,
                  114, 105, 116, 121,
                ],
              },
            ],
          },
        },
        {
          name: "program",
        },
      ],
      args: [],
    },
    {
      name: "cancel_beneficiary_proposal",
      docs: ["SC-09 — admin cancels a pending beneficiary proposal."],
      discriminator: [164, 182, 38, 156, 177, 149, 209, 212],
      accounts: [
        {
          name: "admin_authority",
          signer: true,
          relations: ["config"],
        },
        {
          name: "config",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103],
              },
            ],
          },
          relations: ["investor_vesting"],
        },
        {
          name: "investor_vesting",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [105, 110, 118, 101, 115, 116, 111, 114],
              },
              {
                kind: "account",
                path: "config",
              },
              {
                kind: "account",
                path: "investor_vesting.investor_id",
                account: "InvestorVesting",
              },
            ],
          },
        },
        {
          name: "event_authority",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111,
                  114, 105, 116, 121,
                ],
              },
            ],
          },
        },
        {
          name: "program",
        },
      ],
      args: [],
    },
    {
      name: "deposit_escrow",
      docs: ["SC-06 — permissionless top-up of the escrow vault."],
      discriminator: [226, 112, 158, 176, 178, 118, 153, 128],
      accounts: [
        {
          name: "depositor",
          docs: ["Permissionless: any funded wallet may top up the escrow."],
          signer: true,
        },
        {
          name: "config",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103],
              },
            ],
          },
        },
        {
          name: "token_mint",
          relations: ["config"],
        },
        {
          name: "escrow_vault",
          writable: true,
          relations: ["config"],
        },
        {
          name: "depositor_token_account",
          writable: true,
        },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        },
        {
          name: "event_authority",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111,
                  114, 105, 116, 121,
                ],
              },
            ],
          },
        },
        {
          name: "program",
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "distribute",
      docs: [
        "SC-12, SC-13 — permissionless distribute; calculates due periods and transfers tokens.",
      ],
      discriminator: [191, 44, 223, 207, 164, 236, 126, 61],
      accounts: [
        {
          name: "caller",
          docs: [
            "Permissionless — keeper or any caller may trigger a distribution.",
          ],
          signer: true,
        },
        {
          name: "config",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103],
              },
            ],
          },
          relations: ["investor_vesting"],
        },
        {
          name: "investor_vesting",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [105, 110, 118, 101, 115, 116, 111, 114],
              },
              {
                kind: "account",
                path: "config",
              },
              {
                kind: "account",
                path: "investor_vesting.investor_id",
                account: "InvestorVesting",
              },
            ],
          },
        },
        {
          name: "escrow_vault",
          writable: true,
          relations: ["config"],
        },
        {
          name: "beneficiary_token_account",
          docs: [
            "Canonical ATA for the current beneficiary.  Caller must derive this off-chain",
            "as `get_associated_token_address(investor_vesting.beneficiary, config.token_mint)`.",
            "Non-canonical token accounts are rejected to ensure payments land at a",
            "predictable, monitorable address.",
          ],
          writable: true,
        },
        {
          name: "token_program",
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        },
        {
          name: "event_authority",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111,
                  114, 105, 116, 121,
                ],
              },
            ],
          },
        },
        {
          name: "program",
        },
      ],
      args: [],
    },
    {
      name: "emergency_unpause",
      docs: [
        "SC-11 — permissionless emergency unpause after MAX_PAUSE_SECONDS.",
      ],
      discriminator: [83, 249, 195, 57, 206, 189, 31, 85],
      accounts: [
        {
          name: "caller",
          signer: true,
        },
        {
          name: "config",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103],
              },
            ],
          },
        },
        {
          name: "event_authority",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111,
                  114, 105, 116, 121,
                ],
              },
            ],
          },
        },
        {
          name: "program",
        },
      ],
      args: [],
    },
    {
      name: "initialize_config",
      docs: [
        "SC-02, SC-03 — create the singleton GlobalConfig PDA and canonical escrow vault.",
      ],
      discriminator: [208, 127, 21, 1, 194, 190, 196, 70],
      accounts: [
        {
          name: "admin_authority",
          writable: true,
          signer: true,
        },
        {
          name: "token_program",
          docs: [
            "",
            "We keep this **unchecked** so the failure maps to `VestingError::InvalidTokenProgram`",
            "(instead of Anchor's generic `InvalidProgramId`) when callers pass the wrong program.",
            "This preserves a stable, indexable error surface for clients and tests.",
          ],
        },
        {
          name: "associated_token_program",
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
        },
        {
          name: "system_program",
          address: "11111111111111111111111111111111",
        },
        {
          name: "token_mint",
        },
        {
          name: "config",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103],
              },
            ],
          },
        },
        {
          name: "escrow_vault",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "account",
                path: "config",
              },
              {
                kind: "const",
                value: [
                  6, 221, 246, 225, 215, 101, 161, 147, 217, 203, 225, 70, 206,
                  235, 121, 172, 28, 180, 133, 237, 95, 91, 55, 145, 58, 140,
                  245, 133, 126, 255, 0, 169,
                ],
              },
              {
                kind: "account",
                path: "token_mint",
              },
            ],
            program: {
              kind: "const",
              value: [
                140, 151, 37, 143, 78, 36, 137, 241, 187, 61, 16, 41, 20, 142,
                13, 131, 11, 90, 19, 153, 218, 255, 16, 132, 4, 142, 123, 216,
                219, 233, 248, 89,
              ],
            },
          },
        },
        {
          name: "event_authority",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111,
                  114, 105, 116, 121,
                ],
              },
            ],
          },
        },
        {
          name: "program",
        },
      ],
      args: [
        {
          name: "vesting_periods_total",
          type: "u16",
        },
        {
          name: "period_seconds",
          type: "u64",
        },
      ],
    },
    {
      name: "propose_admin",
      docs: ["Admin rotation step 1: propose a new admin."],
      discriminator: [121, 214, 199, 212, 87, 39, 117, 234],
      accounts: [
        {
          name: "admin_authority",
          signer: true,
          relations: ["config"],
        },
        {
          name: "config",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103],
              },
            ],
          },
        },
        {
          name: "event_authority",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111,
                  114, 105, 116, 121,
                ],
              },
            ],
          },
        },
        {
          name: "program",
        },
      ],
      args: [
        {
          name: "new_admin",
          type: "pubkey",
        },
      ],
    },
    {
      name: "propose_beneficiary",
      docs: ["SC-07 — admin proposes a new beneficiary (step 1)."],
      discriminator: [246, 96, 187, 232, 161, 62, 153, 83],
      accounts: [
        {
          name: "admin_authority",
          signer: true,
          relations: ["config"],
        },
        {
          name: "config",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103],
              },
            ],
          },
          relations: ["investor_vesting"],
        },
        {
          name: "investor_vesting",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [105, 110, 118, 101, 115, 116, 111, 114],
              },
              {
                kind: "account",
                path: "config",
              },
              {
                kind: "account",
                path: "investor_vesting.investor_id",
                account: "InvestorVesting",
              },
            ],
          },
        },
        {
          name: "event_authority",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111,
                  114, 105, 116, 121,
                ],
              },
            ],
          },
        },
        {
          name: "program",
        },
      ],
      args: [
        {
          name: "new_beneficiary",
          type: "pubkey",
        },
      ],
    },
    {
      name: "set_paused",
      docs: ["SC-11 — admin pauses or unpauses distributions."],
      discriminator: [91, 60, 125, 192, 176, 225, 166, 218],
      accounts: [
        {
          name: "admin_authority",
          signer: true,
          relations: ["config"],
        },
        {
          name: "config",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103],
              },
            ],
          },
        },
        {
          name: "event_authority",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111,
                  114, 105, 116, 121,
                ],
              },
            ],
          },
        },
        {
          name: "program",
        },
      ],
      args: [
        {
          name: "paused",
          type: "bool",
        },
      ],
    },
    {
      name: "update_investor_label",
      docs: ["SC-10 — update the metadata label for an investor."],
      discriminator: [162, 9, 219, 131, 141, 110, 145, 77],
      accounts: [
        {
          name: "admin_authority",
          signer: true,
          relations: ["config"],
        },
        {
          name: "config",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [99, 111, 110, 102, 105, 103],
              },
            ],
          },
          relations: ["investor_vesting"],
        },
        {
          name: "investor_vesting",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [105, 110, 118, 101, 115, 116, 111, 114],
              },
              {
                kind: "account",
                path: "config",
              },
              {
                kind: "account",
                path: "investor_vesting.investor_id",
                account: "InvestorVesting",
              },
            ],
          },
        },
        {
          name: "event_authority",
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  95, 95, 101, 118, 101, 110, 116, 95, 97, 117, 116, 104, 111,
                  114, 105, 116, 121,
                ],
              },
            ],
          },
        },
        {
          name: "program",
        },
      ],
      args: [
        {
          name: "new_label",
          type: "string",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "GlobalConfig",
      discriminator: [149, 8, 156, 202, 160, 252, 176, 217],
    },
    {
      name: "InvestorVesting",
      discriminator: [59, 52, 121, 84, 249, 125, 65, 190],
    },
  ],
  events: [
    {
      name: "AdminAccepted",
      discriminator: [174, 12, 76, 139, 158, 99, 110, 254],
    },
    {
      name: "AdminProposalCancelled",
      discriminator: [158, 7, 69, 243, 15, 126, 0, 184],
    },
    {
      name: "AdminProposed",
      discriminator: [129, 249, 226, 227, 199, 82, 110, 243],
    },
    {
      name: "BeneficiaryAccepted",
      discriminator: [158, 5, 68, 212, 152, 83, 44, 250],
    },
    {
      name: "BeneficiaryProposalCancelled",
      discriminator: [71, 3, 83, 148, 101, 97, 133, 181],
    },
    {
      name: "BeneficiaryProposed",
      discriminator: [147, 35, 97, 194, 170, 22, 236, 5],
    },
    {
      name: "ConfigInitialized",
      discriminator: [181, 49, 200, 156, 19, 167, 178, 91],
    },
    {
      name: "DistributionProcessed",
      discriminator: [240, 123, 163, 125, 20, 4, 223, 103],
    },
    {
      name: "EmergencyUnpaused",
      discriminator: [94, 218, 55, 35, 64, 239, 172, 36],
    },
    {
      name: "EscrowDeposited",
      discriminator: [28, 193, 105, 27, 40, 101, 65, 211],
    },
    {
      name: "InvestorAdded",
      discriminator: [183, 101, 15, 88, 227, 192, 175, 131],
    },
    {
      name: "InvestorLabelUpdated",
      discriminator: [195, 11, 143, 170, 243, 101, 111, 67],
    },
    {
      name: "PausedSet",
      discriminator: [171, 125, 127, 156, 233, 81, 68, 66],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "Unauthorized",
      msg: "Unauthorized: signer is not the admin authority",
    },
    {
      code: 6001,
      name: "ConfigAlreadyInitialized",
      msg: "Global config already initialized",
    },
    {
      code: 6002,
      name: "ConfigNotInitialized",
      msg: "Global config is not initialized",
    },
    {
      code: 6003,
      name: "InvalidTokenProgram",
      msg: "Only the classic SPL Token program is supported",
    },
    {
      code: 6004,
      name: "TokenMintMismatch",
      msg: "Token mint does not match config",
    },
    {
      code: 6005,
      name: "MintNotOwnedByTokenProgram",
      msg: "Mint account is not owned by the SPL Token program",
    },
    {
      code: 6006,
      name: "InvalidVestingPeriodsTotal",
      msg: "Unsupported vesting periods total; v1 requires 60",
    },
    {
      code: 6007,
      name: "InvalidPeriodSeconds",
      msg: "Unsupported period seconds; v1 requires 2592000",
    },
    {
      code: 6008,
      name: "MintHasFreezeAuthority",
      msg: "Mint has an active freeze authority; vault or beneficiary accounts can be frozen",
    },
    {
      code: 6009,
      name: "InvalidBeneficiary",
      msg: "Beneficiary cannot be the default pubkey",
    },
    {
      code: 6010,
      name: "BeneficiaryProposalSelf",
      msg: "Proposed beneficiary cannot be the current beneficiary",
    },
    {
      code: 6011,
      name: "InvalidTotalAllocation",
      msg: "Total allocation must be greater than zero",
    },
    {
      code: 6012,
      name: "LabelTooLong",
      msg: "Label exceeds 32 bytes",
    },
    {
      code: 6013,
      name: "ConfigMismatch",
      msg: "Investor does not belong to the provided config",
    },
    {
      code: 6014,
      name: "EscrowVaultMismatch",
      msg: "Escrow vault does not match config",
    },
    {
      code: 6015,
      name: "EscrowVaultNotCanonicalAta",
      msg: "Escrow vault is not the canonical ATA for config and mint",
    },
    {
      code: 6016,
      name: "InvalidBeneficiaryAta",
      msg: "Beneficiary token account is not the canonical ATA for beneficiary and mint",
    },
    {
      code: 6017,
      name: "SourceMintMismatch",
      msg: "Source token account mint does not match config token mint",
    },
    {
      code: 6018,
      name: "BeneficiaryMintMismatch",
      msg: "Beneficiary token account mint does not match config token mint",
    },
    {
      code: 6019,
      name: "InvalidDestinationOwner",
      msg: "Destination token account owner does not match beneficiary",
    },
    {
      code: 6020,
      name: "VaultDelegateNotAllowed",
      msg: "Escrow vault delegate is not allowed",
    },
    {
      code: 6021,
      name: "VaultCloseAuthorityNotAllowed",
      msg: "Escrow vault close authority is not allowed",
    },
    {
      code: 6022,
      name: "InvalidDepositAmount",
      msg: "Escrow deposit amount must be greater than zero",
    },
    {
      code: 6023,
      name: "Paused",
      msg: "Campaign is paused",
    },
    {
      code: 6024,
      name: "NotPaused",
      msg: "Config is not currently paused",
    },
    {
      code: 6025,
      name: "PauseTooRecent",
      msg: "Pause is too recent; emergency unpause window has not elapsed",
    },
    {
      code: 6026,
      name: "ArithmeticOverflow",
      msg: "Arithmetic overflow",
    },
    {
      code: 6027,
      name: "InsufficientVaultBalance",
      msg: "Vault has insufficient balance to cover the new liability",
    },
    {
      code: 6028,
      name: "InsufficientVaultForDistribution",
      msg: "Vault has insufficient balance to execute this distribution",
    },
    {
      code: 6029,
      name: "InvariantViolation",
      msg: "State invariant violated",
    },
    {
      code: 6030,
      name: "AccountFrozen",
      msg: "Token account is frozen; transfer not allowed",
    },
    {
      code: 6031,
      name: "NoPendingProposal",
      msg: "No pending proposal exists",
    },
    {
      code: 6032,
      name: "AdminProposalSelf",
      msg: "Proposed admin cannot be the current admin authority",
    },
    {
      code: 6033,
      name: "InvalidPendingBeneficiary",
      msg: "Signer does not match pending beneficiary",
    },
    {
      code: 6034,
      name: "InvalidPendingAdmin",
      msg: "Signer does not match pending admin",
    },
  ],
  types: [
    {
      name: "AdminAccepted",
      type: {
        kind: "struct",
        fields: [
          {
            name: "config",
            type: "pubkey",
          },
          {
            name: "old_admin",
            type: "pubkey",
          },
          {
            name: "new_admin",
            type: "pubkey",
          },
        ],
      },
    },
    {
      name: "AdminProposalCancelled",
      type: {
        kind: "struct",
        fields: [
          {
            name: "config",
            type: "pubkey",
          },
          {
            name: "cancelled_proposal",
            type: "pubkey",
          },
        ],
      },
    },
    {
      name: "AdminProposed",
      type: {
        kind: "struct",
        fields: [
          {
            name: "config",
            type: "pubkey",
          },
          {
            name: "current_admin",
            type: "pubkey",
          },
          {
            name: "proposed_admin",
            type: "pubkey",
          },
        ],
      },
    },
    {
      name: "BeneficiaryAccepted",
      type: {
        kind: "struct",
        fields: [
          {
            name: "investor_vesting",
            type: "pubkey",
          },
          {
            name: "old_beneficiary",
            type: "pubkey",
          },
          {
            name: "new_beneficiary",
            type: "pubkey",
          },
        ],
      },
    },
    {
      name: "BeneficiaryProposalCancelled",
      type: {
        kind: "struct",
        fields: [
          {
            name: "investor_vesting",
            type: "pubkey",
          },
          {
            name: "cancelled_proposal",
            type: "pubkey",
          },
        ],
      },
    },
    {
      name: "BeneficiaryProposed",
      type: {
        kind: "struct",
        fields: [
          {
            name: "investor_vesting",
            type: "pubkey",
          },
          {
            name: "current_beneficiary",
            type: "pubkey",
          },
          {
            name: "proposed_beneficiary",
            type: "pubkey",
          },
        ],
      },
    },
    {
      name: "ConfigInitialized",
      type: {
        kind: "struct",
        fields: [
          {
            name: "config",
            type: "pubkey",
          },
          {
            name: "admin_authority",
            type: "pubkey",
          },
          {
            name: "token_mint",
            type: "pubkey",
          },
          {
            name: "escrow_vault",
            type: "pubkey",
          },
          {
            name: "period_seconds",
            type: "u64",
          },
          {
            name: "vesting_periods_total",
            type: "u16",
          },
        ],
      },
    },
    {
      name: "DistributionProcessed",
      type: {
        kind: "struct",
        fields: [
          {
            name: "investor_vesting",
            type: "pubkey",
          },
          {
            name: "vested_periods",
            type: "u16",
          },
          {
            name: "claimable_amount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "EmergencyUnpaused",
      type: {
        kind: "struct",
        fields: [
          {
            name: "config",
            type: "pubkey",
          },
          {
            name: "caller",
            type: "pubkey",
          },
          {
            name: "timestamp",
            type: "i64",
          },
        ],
      },
    },
    {
      name: "EscrowDeposited",
      type: {
        kind: "struct",
        fields: [
          {
            name: "config",
            type: "pubkey",
          },
          {
            name: "depositor",
            type: "pubkey",
          },
          {
            name: "amount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "GlobalConfig",
      docs: [
        "Singleton campaign configuration PDA.",
        "PDA seeds: [CONFIG_SEED]",
        "One per deployed vesting campaign.",
      ],
      type: {
        kind: "struct",
        fields: [
          {
            name: "admin_authority",
            type: "pubkey",
          },
          {
            name: "token_mint",
            type: "pubkey",
          },
          {
            name: "escrow_vault",
            type: "pubkey",
          },
          {
            name: "vesting_periods_total",
            type: "u16",
          },
          {
            name: "period_seconds",
            type: "u64",
          },
          {
            name: "next_investor_id",
            type: "u64",
          },
          {
            name: "total_committed",
            type: "u64",
          },
          {
            name: "total_distributed",
            type: "u64",
          },
          {
            name: "paused",
            type: "bool",
          },
          {
            name: "paused_at",
            type: "i64",
          },
          {
            name: "pending_admin",
            type: {
              option: "pubkey",
            },
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "InvestorAdded",
      type: {
        kind: "struct",
        fields: [
          {
            name: "investor_vesting",
            type: "pubkey",
          },
          {
            name: "investor_id",
            type: "u64",
          },
          {
            name: "label",
            docs: [
              "UTF-8 label bytes (max `MAX_LABEL_BYTES`); `label_len` is active length.",
            ],
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "label_len",
            type: "u8",
          },
          {
            name: "beneficiary",
            type: "pubkey",
          },
          {
            name: "total_allocation",
            type: "u64",
          },
          {
            name: "vest_start_time",
            type: "i64",
          },
        ],
      },
    },
    {
      name: "InvestorLabelUpdated",
      type: {
        kind: "struct",
        fields: [
          {
            name: "investor_vesting",
            type: "pubkey",
          },
          {
            name: "new_label",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "new_label_len",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "InvestorVesting",
      docs: [
        "Per-investor vesting state PDA.",
        "PDA seeds: [INVESTOR_SEED, config_key, investor_id_le_bytes]",
        "investor_id is immutable after creation; it is the canonical identity.",
      ],
      type: {
        kind: "struct",
        fields: [
          {
            name: "config",
            type: "pubkey",
          },
          {
            name: "investor_id",
            type: "u64",
          },
          {
            name: "label",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "label_len",
            type: "u8",
          },
          {
            name: "beneficiary",
            type: "pubkey",
          },
          {
            name: "pending_beneficiary",
            type: {
              option: "pubkey",
            },
          },
          {
            name: "total_allocation",
            type: "u64",
          },
          {
            name: "vest_start_time",
            type: "i64",
          },
          {
            name: "claimed_amount",
            type: "u64",
          },
          {
            name: "periods_claimed",
            type: "u16",
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "PausedSet",
      type: {
        kind: "struct",
        fields: [
          {
            name: "config",
            type: "pubkey",
          },
          {
            name: "paused",
            type: "bool",
          },
          {
            name: "paused_at",
            type: "i64",
          },
        ],
      },
    },
  ],
};

export default idl;
