let { resolve } = require('path')
let cronValidator = require('cron-validate')
let cwd = process.cwd()
let units = [ 'minute', 'minutes', 'hour', 'hours', 'day', 'days' ]

function rateValidator (rate) {
  let tokens = rate.split(' ')
  if (tokens.length > 2) return false
  let [ value, unit ] = tokens
  value = parseInt(value, 10)
  if (typeof value !== 'number' || isNaN(value) || value <= 0) return false
  if (unit && !units.includes(unit?.toLowerCase())) return false
  return true
}

module.exports = async function action (params, utils) {
  let { args } = params
  let { create, validate } = utils
  let error = require('./errors')(params, utils)

  let invalid = await validate.project()
  if (invalid) return invalid

  let errors = []

  // Name (required)
  let name = args.n || args.name
  if (!name || name === true) {
    errors.push('no_name')
  }
  if (name && typeof name !== 'string') {
    errors.push('invalid_name')
  }

  // Must have one of rate or cron but not both
  let rate = args.r || args.rate
  let cron = args.c || args.cron
  if (!cron && !rate) {
    errors.push('must_specify_rate_or_cron')
  }
  if (cron && rate) {
    errors.push('must_specify_one_of_rate_or_cron')
  }

  // Cron (one of rate or cron)
  if (cron && !cronValidator(cron, {
    preset: 'aws-cloud-watch',
  }).isValid()) {
    errors.push('invalid_cron_expression')
  }

  // Rate (one of rate or cron)
  if (rate && !rateValidator(rate)) {
    errors.push('invalid_rate_expression')
  }

  // Source dir (optional)
  let src = args.s || args.src
  if (src && !resolve(src).startsWith(cwd)) {
    errors.push('src_must_be_in_project')
  }

  if (errors.length) {
    return error(errors)
  }

  return create.scheduled({ name, rate, cron, src })
}
