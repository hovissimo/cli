module.exports = function () {
  return `import whoAmI from '../../../models/auth/who-am-i.mjs'

export async function get (req) {
  const authenticated = whoAmI(req)
  if (authenticated) {
    return {
      json: { account: authenticated }
    }
  }
  else {
    return {
      location: '/'
    }
  }
}
`
}
