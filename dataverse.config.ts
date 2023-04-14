export const config = {
  slug: "",
  name: "",
  logo: "",
  website: "",  // you can use localhost for testing
  defaultFolderName: "Untitled",
  description:
    "",
  models: [
    {
      isPublicDomain: false,      // default
      schemaName: "post.graphql",
    },
    {
      isPublicDomain: true,
      schemaName: "profile.graphql",
    },
  ],
  ceramicUrl: null, // leave null to deploy ComposeDB on our Ceramic node "https://dataverseceramicdaemon.com"
};
