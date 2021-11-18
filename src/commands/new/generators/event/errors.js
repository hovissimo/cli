let { backtickify, runtimes } = require('../../../../lib')

let errors = {
  en: {
    no_name: 'Event name not found, please run with -n or --name',
    invalid_name: `Invalid event name`,
    invalid_runtime: `Function runtime must be one of: ${backtickify(runtimes)}`,
    src_must_be_in_project: 'Function source path must be within your project',
  }
}

module.exports = function error (lang, err) {
  process.exitCode = 1
  return errors[lang][err]
}
