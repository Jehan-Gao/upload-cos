const test = require('tape')
const { start: app } = require('../index')

const TEST_ENV_DOMAIN = 'https://test.cdn.com'
const TEST_ENV_DIRECTORY = 'test-dir'

const TEST_ENV_OTHER_DOMAIN = 'https://test-other.cdn.com'
const TEST_ENV_OTHER_DIRECTORY = 'test-dir-other'

test('upload-cos -d test/test_directory', (t) => {
  const mockPaths = [
    'test_directory/css/subs/a.css',
    'test_directory/css/subs/b.css',
    'test_directory/js/a.js',
    'test_directory/index.html'
  ]
  app(
    {
      d: 'test/test_directory',
      e: 'test'
    },
    (err, { COS_DOMAIN, finalPath }) => {
      const isSame = mockPaths.some(function (path) {
        return (
          `${TEST_ENV_DOMAIN}/${TEST_ENV_DIRECTORY}/${path}` ===
          `${COS_DOMAIN}/${finalPath}`
        )
      })
      t.equal(isSame, true, 'link is same')
    }
  )
  t.end()
})

test('upload-cos -d test/test_directory/', (t) => {
  const mockPaths = [
    'css/subs/a.css',
    'css/subs/b.css',
    'js/a.js',
    'index.html'
  ]
  app(
    {
      d: 'test/test_directory/',
      e: 'test'
    },
    (err, { COS_DOMAIN, finalPath }) => {
      const isSame = mockPaths.some(function (path) {
        return (
          `${TEST_ENV_DOMAIN}/${TEST_ENV_DIRECTORY}/${path}` ===
          `${COS_DOMAIN}/${finalPath}`
        )
      })
      t.equal(isSame, true, 'link is same')
    }
  )
  t.end()
})

test('upload-cos -f test/test_directory/css/subs/a.css', (t) => {
  const mockFilePath = 'a.css'
  app(
    {
      f: 'test/test_directory/css/subs/a.css',
      e: 'test'
    },
    (err, { COS_DOMAIN, finalPath }) => {
      const isSame =
        `${TEST_ENV_DOMAIN}/${TEST_ENV_DIRECTORY}/${mockFilePath}` ===
        `${COS_DOMAIN}/${finalPath}`
      t.equal(isSame, true, 'link is same')
    }
  )
  t.end()
})

test('upload-cos -f test/test_directory/css/subs/a.css -t test-custom', (t) => {
  const mockFilePath = 'test-custom/a.css'
  app(
    {
      f: 'test/test_directory/css/subs/a.css',
      e: 'test',
      t: 'test-custom'
    },
    (err, { COS_DOMAIN, finalPath }) => {
      const isSame =
        `${TEST_ENV_DOMAIN}/${TEST_ENV_DIRECTORY}/${mockFilePath}` ===
        `${COS_DOMAIN}/${finalPath}`
      t.equal(isSame, true, 'link is same')
    }
  )
  t.end()
})

test('upload-cos -d test/test_directory/ -t test-custom', (t) => {
  const mockPaths = [
    'test-custom/css/subs/a.css',
    'test-custom/css/subs/b.css',
    'test-custom/js/a.js',
    'test-custom/index.html'
  ]
  app(
    {
      d: 'test/test_directory/',
      e: 'test',
      t: 'test-custom'
    },
    (err, { COS_DOMAIN, finalPath }) => {
      const isSame = mockPaths.some(function (path) {
        return (
          `${TEST_ENV_DOMAIN}/${TEST_ENV_DIRECTORY}/${path}` ===
          `${COS_DOMAIN}/${finalPath}`
        )
      })
      t.equal(isSame, true, 'link is same')
    }
  )
  t.end()
})

test('upload-cos -d test/test_directory/ -m other', (t) => {
  const mockPaths = [
    'css/subs/a.css',
    'css/subs/b.css',
    'js/a.js',
    'index.html'
  ]
  app(
    {
      d: 'test/test_directory/',
      e: 'test',
      m: 'other'
    },
    (err, { COS_DOMAIN, finalPath }) => {
      const isSame = mockPaths.some(function (path) {
        return (
          `${TEST_ENV_OTHER_DOMAIN}/${TEST_ENV_OTHER_DIRECTORY}/${path}` ===
          `${COS_DOMAIN}/${finalPath}`
        )
      })
      t.equal(isSame, true, 'link is same')
    }
  )
  t.end()
})

test('upload-cos -f test/test_directory/css/subs/a.css -m other', (t) => {
  const mockFilePath = 'a.css'
  app(
    {
      f: 'test/test_directory/css/subs/a.css',
      e: 'test',
      m: 'other'
    },
    (err, { COS_DOMAIN, finalPath }) => {
      const isSame =
        `${TEST_ENV_OTHER_DOMAIN}/${TEST_ENV_OTHER_DIRECTORY}/${mockFilePath}` ===
        `${COS_DOMAIN}/${finalPath}`
      t.equal(isSame, true, 'link is same')
    }
  )
  t.end()
  process.exit()
})
