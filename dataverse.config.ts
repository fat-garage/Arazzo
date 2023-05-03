export const config = {
  slug: "arazzo", // need to match this regular: `^[a-zA-Z][a-zA-Z0-9_]*$`
  name: "Arazzo", // app name should NOT contain "-"
  logo: "https://venerable-queijadas-290c8d.netlify.app/logo.png",
  website: "", // you can use localhost:(port) for testing
  defaultFolderName: "Arazzo",
  description: "",
  models: [
    {
      isPublicDomain: false, // default
      schemaName: "post.graphql",
      // encryptable: ["text", "images", "videos"], // strings within the schema and within the array represent fields that may be encrypted, while fields within the schema but not within the array represent fields that will definitely not be encrypted
    },
    {
      isPublicDomain: true,
      schemaName: "profile.graphql",
    },
  ],
  ceramicUrl: null, // leave null to deploy ComposeDB on our Ceramic node "https://dataverseceramicdaemon.com"
};
