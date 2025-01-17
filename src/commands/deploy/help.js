module.exports = {
  en: {
    usage: [ 'deploy' ],
    contents: {
      header: 'Deployment parameters',
      items: [
        {
          name: '-e, --env',
          description: `Environment name to deploy`,
          optional: true,
        },
        {
          name: '--status',
          description: `Get the status of your last build`,
          optional: true,
        },
      ],
    },
    examples: [
      {
        name: `Deploy an app's only environment`,
        example: 'begin deploy',
      },
      {
        name: `Deploy the app environment named 'staging'`,
        example: 'begin deploy --env staging',
      },
    ]
  }
}
