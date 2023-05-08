export const config = {
  slug: "", // app id, need to match this regular: `^[a-zA-Z][a-zA-Z0-9_]*$`
  name: "", // app name should NOT contain "-"
  logo: "",
  network: "testnet", // set to "mainnet" for mainnet
  website: "", // you can use localhost:(port) for testing
  defaultFolderName: "Untitled",
  description: "",
  models: [
    {
      isPublicDomain: false, // default
      schemaName: "post.graphql",
      encryptable: ["text", "images", "videos"], // strings within the schema and within the array represent fields that may be encrypted, while fields within the schema but not within the array represent fields that will definitely not be encrypted
    },
    {
      isPublicDomain: true,
      schemaName: "profile.graphql",
    },
  ],
  ceramicUrl: null, // leave null to deploy ComposeDB on dataverse test Ceramic node. Set to {Your Ceramic node Url} for mainnet. This field only works when network is set as "mainnet".
};
