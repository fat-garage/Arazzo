<br/>
<p align="center">
<a href=" " target="_blank">
<img src="./logo.svg" width="180" alt="Dataverse logo">
</a >
</p >
<br/>

# Create Dataverse App

The starter kit for developers to build their own application on top of [Dataverse](https://dataverse-os.com) operating system.

- Read [Developer Documentation](https://gitbook.dataverse-os.com/) to integrate [Runtime-SDK](https://github.com/dataverse-os/runtime-connector)
- Downaload [Data Wallet](https://github.com/dataverse-os/create-dataverse-app/releases/tag/DataWallet-0.5.33) to run OS Kernel and expose system calls to devs (Chrome version will be ready soon)

# Getting Started

## Environment

Install the dependencies:

```bash
git clone https://github.com/dataverse-os/create-dataverse-app
cd create-dataverse-app
pnpm install
```

## Publish Your DAPP

Set your dApp private key in `.env` and open `dataverse.config.js` to check configurable variables:

```typescript
  export const config = {
  slug: ...,
  name: ...,
  logo: ...,
  website: ...,
  defaultFolderName: ...,
  description: ...,
  models: [...],
  ceramicUrl: ...
};
```

You need to set the basic information for your dApp. Note that fields of `slug` and `name` cannot be the same to existing ones. Under `models`, you can define bussiness logic for your dApp. Here is an example:

```typescript
models: [
    {
      isPublicDomain: false,
      schemaName: "post.graphql",
    },
    {
      isPublicDomain: true,
      schemaName: "profile.graphql",
    },
  ],
```

The `schemaName` links to the corresponding `.graphql` file in the `models/` dir, where models of databases are declared. By default, you need to set `isPublicDomain=false` to ensure cross-app data security. Once you set `isPublicDomain=true`, you are enabling Ceramic Indexing — any dApp can build using your data modelss, so the data is public and shared.

You can also select which Ceramic endpoint your dApp is connecting to, to store data models and actual user data. If you are running a production-ready dApp, you are suggested to run your own Ceramic node. Now you can leaving `ceramicUrl` as `null` for testing. Finally you can publish your dApp: 

```bash
pnpm create
```
This will deploy models to ceramic node you specify, and register data resources to DappTable. You can check the dApp resources in `output/app.json`, including `streamIDs` for your specific logic as well as file system. 

# Contributing

Contributions are always welcome! Open a PR or an issue!
