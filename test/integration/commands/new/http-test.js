let test = require('tape')
let { existsSync } = require('fs')
let { join } = require('path')
let lib = join(process.cwd(), 'test', 'lib')
let { begin: _begin, getInv, newFolder, run } = require(lib)

test('Run new tests', async t => {
  await run(runTests, t)
  t.end()
})

async function runTests (runType, t) {
  let mode = `[New / ${runType}]`
  let begin = _begin[runType].bind({}, t)

  let methodInvalid = /Invalid HTTP method/
  let pathNotFound = /HTTP path not found/
  let pathNotString = /HTTP path must be a string/
  let pathStartsWithSlash = /HTTP path must begin with `\/`/
  let invalidSrcPath = /Function source path must be within your project/
  let duplicateRoute = /Duplicate @http routes item/
  let newAppDir = 'new-http'
  let oob = join(process.cwd(), '..', 'whatev')

  t.test(`${mode} new http`, async t => {
    t.plan(26)
    let i, lambda, r
    let cwd = newFolder(newAppDir)
    await begin('new project -p .', cwd)
    i = await getInv(t, cwd)
    t.pass('Project is valid')
    t.equal(i.inv._project.manifest, join(cwd, '.arc'), 'Wrote manifest to folder')
    t.equal(i.inv.lambdaSrcDirs.length, 1, 'Project has a single Lambda')

    r = await begin('new http -m get -p /js', cwd, true)
    i = await getInv(t, cwd)
    t.equal(i.inv.lambdaSrcDirs.length, 2, 'Project now has two Lambdas')
    lambda = i.get.http('get /js')
    t.ok(existsSync(lambda.handlerFile), 'Wrote Lambda handler')
    t.ok(!existsSync(lambda.configFile), 'Did not write Lambda config')
    t.ok(lambda.handlerFile.endsWith('.mjs'), 'Lambda handler is JavaScript')
    t.notOk(r.stdout, 'Did not print to stdout')
    t.notOk(r.stderr, 'Did not print to stderr')
    t.equal(r.code, 0, 'Exited 0')

    r = await begin('new http -p /default', cwd, true)
    i = await getInv(t, cwd)
    t.equal(i.inv.lambdaSrcDirs.length, 3, 'Project now has three Lambdas')
    lambda = i.get.http('get /default')
    t.equal(lambda.method, 'get', 'Used default lambda method')
    t.ok(existsSync(lambda.handlerFile), 'Wrote Lambda handler')
    t.ok(!existsSync(lambda.configFile), 'Did not write Lambda config')
    t.ok(lambda.handlerFile.endsWith('.mjs'), 'Lambda handler is JavaScript')
    t.notOk(r.stdout, 'Did not print to stdout')
    t.notOk(r.stderr, 'Did not print to stderr')
    t.equal(r.code, 0, 'Exited 0')

    r = await begin('new http -m PUT -p /default', cwd, true)
    i = await getInv(t, cwd)
    t.equal(i.inv.lambdaSrcDirs.length, 4, 'Project now has four Lambdas')
    lambda = i.get.http('put /default')
    t.equal(lambda.method, 'put', 'Used put for lambda method')
    t.ok(existsSync(lambda.handlerFile), 'Wrote Lambda handler')
    t.ok(!existsSync(lambda.configFile), 'Did not write Lambda config')
    t.ok(lambda.handlerFile.endsWith('.mjs'), 'Lambda handler is JavaScript')
    t.notOk(r.stdout, 'Did not print to stdout')
    t.notOk(r.stderr, 'Did not print to stderr')
    t.equal(r.code, 0, 'Exited 0')
  })

  t.test(`${mode} new http (errors)`, async t => {
    t.plan(24)
    let r
    let cwd = newFolder(newAppDir)
    await begin('new project -p .', cwd)

    r = await begin('new http', cwd, true)
    t.notOk(r.stdout, 'Did not print to stdout')
    t.match(r.stderr, pathNotFound, 'Errored on missing path')
    t.equal(r.code, 1, 'Exited 1')

    r = await begin('new http -m', cwd, true)
    t.notOk(r.stdout, 'Did not print to stdout')
    t.match(r.stderr, pathNotFound, 'Errored on missing path')
    t.equal(r.code, 1, 'Exited 1')

    r = await begin('new http -m foo -p /', cwd, true)
    t.notOk(r.stdout, 'Did not print to stdout')
    t.match(r.stderr, methodInvalid, 'Errored on invalid method')
    t.equal(r.code, 1, 'Exited 1')

    r = await begin('new http -m get', cwd, true)
    t.notOk(r.stdout, 'Did not print to stdout')
    t.match(r.stderr, pathNotFound, 'Errored on missing path')
    t.equal(r.code, 1, 'Exited 1')

    r = await begin('new http -m get -p 1', cwd, true)
    t.notOk(r.stdout, 'Did not print to stdout')
    t.match(r.stderr, pathNotString, 'Errored on invalid path')
    t.equal(r.code, 1, 'Exited 1')

    r = await begin('new http -m get -p foo', cwd, true)
    t.notOk(r.stdout, 'Did not print to stdout')
    t.match(r.stderr, pathStartsWithSlash, 'Errored on path missing slash')
    t.equal(r.code, 1, 'Exited 1')

    r = await begin(`new http -m get -p / --src ${oob}`, cwd, true)
    t.notOk(r.stdout, 'Did not print to stdout')
    t.match(r.stderr, invalidSrcPath, 'Errored on invalid src path')
    t.equal(r.code, 1, 'Exited 1')

    await begin('new project -p .', cwd)
    await begin(`new http -m get -p /foo`, cwd, true)
    r = await begin(`new http -m get -p /foo`, cwd, true)
    t.notOk(r.stdout, 'Did not print to stdout')
    t.match(r.stderr, duplicateRoute, 'Errored on duplicate route')
    t.equal(r.code, 1, 'Exited 1')
  })

  t.test(`${mode} new http (JSON)`, async t => {
    t.plan(26)
    let i, json, lambda, r
    let cwd = newFolder(newAppDir)
    await begin('new project -p .', cwd)
    i = await getInv(t, cwd)
    t.pass('Project is valid')
    t.equal(i.inv._project.manifest, join(cwd, '.arc'), 'Wrote manifest to folder')
    t.equal(i.inv.lambdaSrcDirs.length, 1, 'Project has a single Lambda')

    r = await begin('new http -m get -p /js --json', cwd, true)
    i = await getInv(t, cwd)
    t.equal(i.inv.lambdaSrcDirs.length, 2, 'Project now has two Lambdas')
    lambda = i.get.http('get /js')
    t.ok(existsSync(lambda.handlerFile), 'Wrote Lambda handler')
    t.ok(!existsSync(lambda.configFile), 'Did not write Lambda config')
    t.ok(lambda.handlerFile.endsWith('.mjs'), 'Lambda handler is JavaScript')
    json = JSON.parse(r.stdout)
    t.equal(json.ok, true, 'Got ok: true')
    t.notOk(r.stderr, 'Did not print to stderr')
    t.equal(r.code, 0, 'Exited 0')

    r = await begin('new http -p /default --json', cwd, true)
    i = await getInv(t, cwd)
    t.equal(i.inv.lambdaSrcDirs.length, 3, 'Project now has three Lambdas')
    lambda = i.get.http('get /default')
    t.equal(lambda.method, 'get', 'Used default lambda method')
    t.ok(existsSync(lambda.handlerFile), 'Wrote Lambda handler')
    t.ok(!existsSync(lambda.configFile), 'Did not write Lambda config')
    t.ok(lambda.handlerFile.endsWith('.mjs'), 'Lambda handler is JavaScript')
    json = JSON.parse(r.stdout)
    t.equal(json.ok, true, 'Got ok: true')
    t.notOk(r.stderr, 'Did not print to stderr')
    t.equal(r.code, 0, 'Exited 0')

    r = await begin('new http -m PUT -p /default --json', cwd, true)
    i = await getInv(t, cwd)
    t.equal(i.inv.lambdaSrcDirs.length, 4, 'Project now has four Lambdas')
    lambda = i.get.http('put /default')
    t.equal(lambda.method, 'put', 'Used put for lambda method')
    t.ok(existsSync(lambda.handlerFile), 'Wrote Lambda handler')
    t.ok(!existsSync(lambda.configFile), 'Did not write Lambda config')
    t.ok(lambda.handlerFile.endsWith('.mjs'), 'Lambda handler is JavaScript')
    json = JSON.parse(r.stdout)
    t.equal(json.ok, true, 'Got ok: true')
    t.notOk(r.stderr, 'Did not print to stderr')
    t.equal(r.code, 0, 'Exited 0')
  })

  t.test(`${mode} new http (errors / JSON)`, async t => {
    t.plan(32)
    let json, r
    let cwd = newFolder(newAppDir)
    await begin('new project -p .', cwd)

    r = await begin('new http --json', cwd, true)
    json = JSON.parse(r.stdout)
    t.equal(json.ok, false, 'Got ok: false')
    t.match(json.error, pathNotFound, 'Errored on missing path')
    t.notOk(r.stderr, 'Did not print to stderr')
    t.equal(r.code, 1, 'Exited 1')

    r = await begin('new http -m --json', cwd, true)
    json = JSON.parse(r.stdout)
    t.equal(json.ok, false, 'Got ok: false')
    t.match(json.error, pathNotFound, 'Errored on missing path')
    t.notOk(r.stderr, 'Did not print to stderr')
    t.equal(r.code, 1, 'Exited 1')

    r = await begin('new http -m foo -p / --json', cwd, true)
    json = JSON.parse(r.stdout)
    t.equal(json.ok, false, 'Got ok: false')
    t.match(json.error, methodInvalid, 'Errored on invalid method')
    t.notOk(r.stderr, 'Did not print to stderr')
    t.equal(r.code, 1, 'Exited 1')

    r = await begin('new http -m get --json', cwd, true)
    json = JSON.parse(r.stdout)
    t.equal(json.ok, false, 'Got ok: false')
    t.match(json.error, pathNotFound, 'Errored on missing path')
    t.notOk(r.stderr, 'Did not print to stderr')
    t.equal(r.code, 1, 'Exited 1')

    r = await begin('new http -m get -p 1 --json', cwd, true)
    json = JSON.parse(r.stdout)
    t.equal(json.ok, false, 'Got ok: false')
    t.match(json.error, pathNotString, 'Errored on invalid path')
    t.notOk(r.stderr, 'Did not print to stderr')
    t.equal(r.code, 1, 'Exited 1')

    r = await begin('new http -m get -p foo --json', cwd, true)
    json = JSON.parse(r.stdout)
    t.equal(json.ok, false, 'Got ok: false')
    t.match(json.error, pathStartsWithSlash, 'Errored on path missing slash')
    t.notOk(r.stderr, 'Did not print to stderr')
    t.equal(r.code, 1, 'Exited 1')

    r = await begin(`new http -m get -p / --src ${oob} --json`, cwd, true)
    json = JSON.parse(r.stdout)
    t.equal(json.ok, false, 'Got ok: false')
    t.match(json.error, invalidSrcPath, 'Errored on invalid src path')
    t.notOk(r.stderr, 'Did not print to stderr')
    t.equal(r.code, 1, 'Exited 1')

    await begin('new project -p .', cwd)
    await begin(`new http -m get -p /foo --json`, cwd, true)
    r = await begin(`new http -m get -p /foo --json`, cwd, true)
    json = JSON.parse(r.stdout)
    t.equal(json.ok, false, 'Got ok: false')
    t.match(json.error, duplicateRoute, 'Errored on duplicate route')
    t.notOk(r.stderr, 'Did not print to stderr')
    t.equal(r.code, 1, 'Exited 1')
  })
}
