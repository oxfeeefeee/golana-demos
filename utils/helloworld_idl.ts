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
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "IxInit",
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
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "IxInit",
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
          "name": "initialCount",
          "type": "u64"
        }
      ]
    }
  ]
};
