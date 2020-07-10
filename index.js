const fs = require('fs')
const path = require('path')
const COS = require('cos-nodejs-sdk-v5')
const dotenvFlow = require('dotenv-flow')
const ora = require('ora')
const output = require('./util/output')
const checkENVParam = require('./util/check')

const ROOT_PATH = process.cwd()
const FILES = []
const FINISHED = []
let BASE_DIR_NAME = ''
let PATHS = []
let VARIABLES = null
let DESIGNATIVE_DIRECTORY = ''
const IGNOER_FILES = ['.DS_Store']
const isEndOfSlashReg = /.+\/$/
let spinner

function start(argv) {
  for (key in argv) {
    if (argv[key] === true) {
      output.error(`-${key}: not found param`)
      return
    }
  }
  if (argv.d) {
    VARIABLES = commonHandle(argv, 'directory', argv.d)
  }
  if (argv.f) {
    VARIABLES = commonHandle(argv, 'file', argv.f)
  }
}

function commonHandle(argv, type, params) {
  if (argv.m) {
    VARIABLES = dotenvFlow.parse([
      path.resolve(ROOT_PATH, `.env.${argv.m}`)
    ])
  } else {
    VARIABLES = dotenvFlow.parse([
      path.resolve(ROOT_PATH, '.env')
    ])
  }
  if (!checkENVParam(VARIABLES)) return

  if (argv.t) {
    DESIGNATIVE_DIRECTORY = argv.t
  }
  if (Array.isArray(params)) {
    params.forEach(dirName => {
      type === 'file' ? resolveFile(dirName) : resolveDirectory(dirName)
    })
  } else {
    type === 'file' ? resolveFile(params) : resolveDirectory(params)
  }
}

const Helper = {
  getPath: function () {
    let paths = []
    if (BASE_DIR_NAME) {
      paths.push(BASE_DIR_NAME)
    }
    if (DESIGNATIVE_DIRECTORY) {
      paths.push(DESIGNATIVE_DIRECTORY)
    }
    return paths.concat(PATHS).join('/')
  },
  showLoading: function (filePath) {
    if (!FILES.length) {
      spinner = ora('uploading').start()
    }
    if (filePath) {
      FILES.push(filePath)
    }
  },
  stopLoading: function (link) {
    FINISHED.push(link)
    if (FILES.length === FINISHED.length) {
      spinner.stop()
      FINISHED.forEach(link => {
        output.printLink(link)
      })
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
    output.error('Error: > not a Directory')
    return
  }
  BASE_DIR_NAME = parseInputDir(dirName)
  readDirectory(dirPath)
}

function parseInputDir(dirName) {
  return isEndOfSlashReg.test(dirName) ? '' : path.parse(dirName).base
}

function readDirectory(dirPath) {
  try {
    const dirList = fs.readdirSync(dirPath)
    if (Array.isArray(dirList) && dirList.length) {
      for (let i = 0, len = dirList.length; i < len; i++) {
        let content = dirList[i]
        if (content in IGNOER_FILES) continue
        PATHS.push(content)
        let subPath = path.resolve(dirPath, content)
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
    output.error('Error: > not a File')
    return
  }
  readFile(filePath)
}

function readFile(filePath) {
  uploadToCos(filePath)
}

function uploadToCos(filePath) {
  try {
    Helper.showLoading(filePath)
    const destDirPath = Helper.getPath()
    console.log('----', destDirPath)
    // return
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
      SecretKey: COS_SECRET_KEY,
    })
    cos.sliceUploadFile({
      Bucket: COS_BUCKET,
      Region: COS_REGION,
      Key: `${isEndOfSlashReg.test(COS_DIRECTORY) ?
        COS_DIRECTORY :
        COS_DIRECTORY + '/'}${destDirPath}`,
      FilePath: filePath,
      onProgress(progressData) {
      },
    }, function (err, data) {
      if (err) {
        spinner.stop()
        throw err
      }
      Helper.stopLoading(`${COS_DOMAIN}/${data.Key}`)
    })
  } catch (error) {
    output.error(error)
    Helper.stopLoading()
  }
}

module.exports = start