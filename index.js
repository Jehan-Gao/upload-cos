const fs = require('fs')
const path = require('path')
const COS = require('cos-nodejs-sdk-v5')
const dotenvFlow = require('dotenv-flow')
const ora = require('ora')
const output = require('./util/output')
const checkENVParam = require('./util/check')
const IGNOER_FILES = require('./util/constants')

const ROOT_PATH = process.cwd()
const matchSlashReg = /.+\/$/
let BASE_DIR_NAME = ''
let PATHS = []
let VARIABLES = null
let DESIGNATIVE_DIRECTORY = ''
let handleFn

function start(argv, fn) {
  handleFn = fn
  if (!checkArgv(argv)) return
  commonHandle(argv)
}

function checkArgv(argv) {
  let result = true
  for (const key in argv) {
    if (argv[key] === true) {
      output.error(`Not found -${key} value`)
      result = false
      break
    }
  }
  return result
}

function commonHandle(argv) {
  const envPath = argv.e && argv.e !== true ? argv.e : ''
  if (argv.m) {
    VARIABLES = dotenvFlow.parse([
      path.resolve(ROOT_PATH, envPath, `.env.${argv.m}`)
    ])
  } else {
    VARIABLES = dotenvFlow.parse([path.resolve(ROOT_PATH, envPath, '.env')])
  }
  if (!checkENVParam(VARIABLES)) return
  if (argv.t) {
    DESIGNATIVE_DIRECTORY = argv.t
  } else {
    DESIGNATIVE_DIRECTORY = ''
  }
  const target = argv.f || argv.d
  if (Array.isArray(target)) {
    target.forEach((dirName) => {
      target === argv.f ? resolveFile(dirName) : resolveDirectory(dirName)
    })
  } else {
    target === argv.f ? resolveFile(target) : resolveDirectory(target)
  }
}

const Helper = {
  spinner: null,
  files: [],
  finished: [],
  getPath: function () {
    const paths = []
    if (BASE_DIR_NAME) {
      paths.push(BASE_DIR_NAME)
    }
    if (DESIGNATIVE_DIRECTORY) {
      paths.push(DESIGNATIVE_DIRECTORY)
    }
    return paths.concat(PATHS).join('/')
  },
  showLoading: function (filePath) {
    if (!this.files.length) {
      this.spinner = ora('uploading \n').start()
    }
    if (filePath) {
      this.files.push(filePath)
    }
  },
  stopLoading: function () {
    this.spinner.stop()
  },
  print: function (link) {
    this.finished.push(link)
    if (this.files.length === this.finished.length) {
      this.stopLoading()
      this.finished.forEach((link) => {
        output.printLink(link)
      })
      this.finished = []
      this.files = []
      PATHS = []
    }
  },
  isDirectory: function (path) {
    return fs.statSync(path).isDirectory()
  },
  isFile: function (path) {
    return fs.statSync(path).isFile()
  }
}

function resolveDirectory(dirName) {
  const dirPath = path.resolve(ROOT_PATH, dirName)
  if (!Helper.isDirectory(dirPath)) {
    output.error('Not a directory')
    return
  }
  BASE_DIR_NAME = parseInputDir(dirName)
  readDirectory(dirPath)
}

function parseInputDir(dirName) {
  return matchSlashReg.test(dirName) ? '' : path.parse(dirName).base
}

function readDirectory(dirPath) {
  try {
    const dirList = fs.readdirSync(dirPath)
    if (Array.isArray(dirList) && dirList.length) {
      for (let i = 0, len = dirList.length; i < len; i++) {
        const content = dirList[i]
        if (content in IGNOER_FILES) continue
        PATHS.push(content)
        const subPath = path.resolve(dirPath, content)
        if (Helper.isDirectory(subPath)) {
          readDirectory(subPath)
          PATHS.pop()
        } else if (Helper.isFile(subPath)) {
          uploadToCos(subPath)
          PATHS.pop()
        }
      }
    }
  } catch (error) {
    output.error(error)
  }
}

function resolveFile(fileName) {
  PATHS.push(path.parse(fileName).base)
  const filePath = path.resolve(ROOT_PATH, fileName)
  if (!Helper.isFile(filePath)) {
    output.error('Not a file')
    return
  }
  readFile(filePath)
}

function readFile(filePath) {
  uploadToCos(filePath)
  PATHS = []
}

function uploadToCos(filePath) {
  try {
    Helper.showLoading(filePath)
    const destDirPath = Helper.getPath()
    const {
      COS_SECRET_ID,
      COS_SECRET_KEY,
      COS_BUCKET,
      COS_REGION,
      COS_DIRECTORY,
      COS_DOMAIN
    } = VARIABLES
    const cos = new COS({
      SecretId: COS_SECRET_ID,
      SecretKey: COS_SECRET_KEY
    })
    const finalPath = `${
      matchSlashReg.test(COS_DIRECTORY) ? COS_DIRECTORY : COS_DIRECTORY + '/'
    }${destDirPath}`
    cos.sliceUploadFile(
      {
        Bucket: COS_BUCKET,
        Region: COS_REGION,
        Key: finalPath,
        FilePath: filePath,
        onProgress(progressData) {}
      },
      function (err, data) {
        handleFn(err, { data, COS_DOMAIN, finalPath })
      }
    )
  } catch (error) {
    output.error(error)
  }
}

module.exports = {
  start,
  Helper
}
