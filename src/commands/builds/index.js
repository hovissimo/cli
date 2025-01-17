let names = { en: [ 'builds' ] }
let help = require('./help')
let appAction = require('../app/list')

let warningStatus = [ 'pending', 'in_progress' ]
let errorStatus = [ 'failed' | 'fault' | 'timed_out' | 'stopped' ]

function colorizeBuildStatus (buildStatus, c) {
  let status = buildStatus.toLowerCase()
  if (warningStatus.includes(status)) {
    return c.bold(c.yellow(status))
  }
  else if (errorStatus.includes(status)) {
    return c.bold(c.red(status))
  }
  return c.bold(c.green(status))
}

async function action (params) {
  let { Select } = require('enquirer')
  let c = require('picocolors')
  let error = require('./errors')(params)
  let client = require('@begin/api')
  let _inventory = require('@architect/inventory')
  params.inventory = await _inventory()
  let lib = require('../../lib')
  let { checkManifest, getCreds, promptOptions } = lib
  let { args } = params

  let token = getCreds(params)
  if (!token) {
    let msg = 'You must be logged in to interact with builds, please run: begin login'
    return Error(msg)
  }

  let manifestErr = checkManifest(params.inventory)
  if (manifestErr && !appAction.manifestNotNeeded) return manifestErr

  // See if the project manifest contains an app ID
  let { begin } = params.inventory.inv._project.arc
  let appID = begin?.find(i => i[0] === 'appID' && typeof i[1] === 'string')?.[1]

  // Make sure the appID is valid
  let app = null
  try {
    app = await client.find({ token, appID })
  }
  catch (err) {
    return error([ 'no_appid_found' ])
  }
  let { environments, name } = app
  let last = '  └──'

  // Environment (required)
  let envID = args.e || args.env
  if (!envID || envID === true) {
    return error([ 'no_env' ])
  }

  let env = environments.find(item => item.envID === envID)
  if (!env) {
    return error([ 'invalid_env' ])
  }

  console.log(`'${name}' (app ID: ${appID})`)
  console.log(`${last} '${env.name}' (env ID: ${env.envID}): ${env.url}`)

  let builds = await client.env.builds({ token, appID, envID })
  let choices = []
  if (!builds.length) {
    return `  ${last} (no builds)`
  }
  builds.forEach(({ deployHash, created, buildID, buildStatus }) => {
    let status = colorizeBuildStatus(buildStatus, c)
    let shortHash = deployHash.substring(0, 7)
    let buildTime = new Date(created)
    choices.push({ name: `${buildStatus} - ${shortHash} - ${buildTime.toLocaleDateString()} ${buildTime.toLocaleTimeString()}`, message: `${status} - ${shortHash} - ${buildTime.toLocaleDateString()} ${buildTime.toLocaleTimeString()}`, value: buildID })
  })

  let prompt = new Select({
    name: 'build',
    message: 'View detailed build logs? (Ctrl-C to skip)',
    choices
  }, promptOptions)

  let answer = await prompt.run()
  let selectedBuildID = choices.find(item => item.name === answer).value
  let selectedBuild = builds.find(item => item.buildID === selectedBuildID)

  let output = []
  selectedBuild.updates.forEach(item => output.push(`${c.cyan(item.ts)}: ${Buffer.from(item.msg, 'base64').toString()}`))
  return output.join('\n')
}

module.exports = {
  names,
  action,
  help,
}
