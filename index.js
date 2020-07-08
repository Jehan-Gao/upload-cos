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
const IGNOER_FILES = [ '.DS_Store']
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

function commonHandle (argv, type, params) {
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

function resolvePath(path) {
  if (path) {
    PATHS.push(path)
  }
  return function () {
    if (BASE_DIR_NAME) {
      PATHS.unshift(BASE_DIR_NAME)
    }
    if (DESIGNATIVE_DIRECTORY) {
      PATHS.unshift(DESIGNATIVE_DIRECTORY)
    }
    let basePath = PATHS.join('/')
    PATHS = []
    return basePath
  }
}

function resolveDirectory(dirName) {
  const dirPath = path.resolve(ROOT_PATH, dirName)
  const stat = fs.statSync(dirPath)
  if (!stat.isDirectory()) {
    output.error('Error: > not a Directory')
    return
  }
  BASE_DIR_NAME = parseInputDir(dirName)
  readDirectory(dirPath)
}

function parseInputDir(dirName) {
  const matchRootDir = /.+\/$/
  return matchRootDir.test(dirName) ? '' : path.parse(dirName).base
}

function readDirectory(dirPath) {
  try {
    const dirList = fs.readdirSync(dirPath)
    if (Array.isArray(dirList) && dirList.length) {
      for (let i = 0, len = dirList.length; i < len; i++) {
        let content = dirList[i]
        if (content in IGNOER_FILES) {
          continue
        }
        resolvePath(content)
        let subPath = path.resolve(dirPath, content)
        const stat = fs.statSync(subPath)
        if (stat.isDirectory()) {
          readDirectory(subPath)
        } else if (stat.isFile()) {
          uploadToCos(subPath)
        }
      }
    }
  } catch (error) {
    output.error(error)
  }
}

function resolveFile(fileName) {
  resolvePath(path.parse(fileName).base)
  const filePath = path.resolve(ROOT_PATH, fileName)
  const stat = fs.statSync(filePath)
  if (!stat.isFile()) {
    output.error('Error: > not a File')
    return
  }
  readFile(filePath)
}

function readFile(filePath) {
  uploadToCos(filePath)
}

function uploadToCos(filePath) {
  showLoading(filePath)
  const destDirPath = resolvePath()()
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
    Key: `${COS_DIRECTORY}${destDirPath}`,
    FilePath: filePath,
    onProgress(progressData) {
    },
  }, function (err, data) {
    if (err) {
      spinner.stop()
      throw err
    }
    stopLoading(`${COS_DOMAIN}/${data.Key}`)
  })
}

function showLoading (filePath) {
  if (!FILES.length) {
    spinner = ora('uploading').start()
  }
  if (filePath) {
    FILES.push(filePath)
  }
}

function stopLoading (link) {
  FINISHED.push(link)
  if (FILES.length === FINISHED.length) {
    spinner.stop()
    FINISHED.forEach(link => {
      output.printLink(link)
    })
  }
}

module.exports = start