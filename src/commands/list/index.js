let names = { en: [ 'list' ] }
let help = require('./help')
let appAction = require('../app/list')
let { getCreds } = require('../../lib')

async function action (params) {

  let token = getCreds(params)
  if (!token) {
    let msg = 'You must be logged in to list your Begin apps, please run: begin login'
    return Error(msg)
  }

  return appAction.action({
    token
  })
}

module.exports = {
  names,
  action,
  help,
}
