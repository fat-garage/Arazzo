export const config = {
  slug: "", // need to match this regular: `^[a-zA-Z][a-zA-Z0-9_]*$`
  name: "", // app name should NOT contain "-"
  logo: "",
  website: "", // you can use localhost:(port) for testing
  defaultFolderName: "Untitled",
  description: "",
  models: [
    {
      isPublicDomain: false, // default
      schemaName: "post.graphql",
    },
    {
      isPublicDomain: true,
      schemaName: "profile.graphql",
    },
  ],
  ceramicUrl: null, // leave null to deploy ComposeDB on our Ceramic node "https://dataverseceramicdaemon.com"
};
