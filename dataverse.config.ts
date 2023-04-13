export const config = {
  slug: "",
  name: "",
  logo: "",
  website: "",
  defaultFolderName: "Untitled",
  description:
    "",
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
  ceramicUrl: null, // leave null here using dataverse ceramic node "https://dataverseceramicdaemon.com"
};
