module.exports = function () {
  return `/**
 * @type {import('@enhance/types').EnhanceApiFn}
 */
export async function post () {
  return {
    session: {},
    location: '/'
  }
}
`
}
