const test = require('tape')
const app = require('../index')

const TEST_DOMAIN = 'https://test.cdn.com'
const TEST_DIRECTORY = 'test-dir'

test('upload directory with env', (t) => {
  const matchPath = [
    'test_directory/css/subs/a.css',
    'test_directory/css/subs/b.css',
    'test_directory/js/a.js',
    'test_directory/index.html'
  ]
  app(
    {
      d: 'test/test_directory'
    },
    (result) => {
      const {
        VARIABLES: { COS_DOMAIN },
        finalPath
      } = result
      const isSame = matchPath.some(function (path) {
        return (
          `${TEST_DOMAIN}/${TEST_DIRECTORY}/${path}` ===
          `${COS_DOMAIN}/${finalPath}`
        )
      })
      t.equal(isSame, true, 'link is same')
    }
  )
  t.end()
})
