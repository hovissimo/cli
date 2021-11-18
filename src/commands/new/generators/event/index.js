let action = require('./action')
let { backtickify, runtimes } = require('../../../../lib')

module.exports = {
  name: 'event',
  description: 'Create a new async event',
  action,
  help: {
    en: {
      contents: {
        header: 'Event parameters',
        items: [
          {
            name: '-n, --name',
            description: 'Event name, must be: [a-z0-9-_]',
          },
          {
            name: '-r, --runtime',
            description: `Runtime, one of: ${backtickify(runtimes)}`,
            optional: true,
          },
        ],
      },
      examples: [
        {
          name: 'Create a new async event',
          example: 'begin new event --name my-event',
        }
      ]
    }
  }
}
