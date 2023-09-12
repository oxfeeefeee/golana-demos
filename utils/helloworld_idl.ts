export type Helloworld = {
  "version": "0.0.0",
  "name": "helloworld",
  "instructions": [
    {
      "name": "IxGreet",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "names",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "arrayTest",
          "type": {
            "array": [
              "i64",
              3
            ]
          }
        },
        {
          "name": "buffer",
          "type": "bytes"
        },
        {
          "name": "pk",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "IxInit",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "initialCount",
          "type": "u64"
        }
      ]
    }
  ]
};

export const IDL: Helloworld = {
  "version": "0.0.0",
  "name": "helloworld",
  "instructions": [
    {
      "name": "IxGreet",
      "accounts": [
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "names",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "arrayTest",
          "type": {
            "array": [
              "i64",
              3
            ]
          }
        },
        {
          "name": "buffer",
          "type": "bytes"
        },
        {
          "name": "pk",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "IxInit",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "initialCount",
          "type": "u64"
        }
      ]
    }
  ]
};
