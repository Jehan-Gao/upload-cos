const fs = require('fs')
const path = require('path')
const COS = require('cos-nodejs-sdk-v5')
const dotenvFlow = require('dotenv-flow')
const ora = require('ora')
const output = require('./util/output')

const ROOT_PATH = process.cwd()
const FILES = []
const FINISHED = []
let BASE_DIR_NAME = ''
let PATHS = []
let VARIABLES = null
let spinner

function start(argv) {
  if (argv.d && (argv.m || argv.mode)) {
    VARIABLES = dotenvFlow.parse([
      path.resolve(ROOT_PATH, `.env.${argv.m ? argv.m : argv.mode}`)
    ])
  } else if (argv.d){
    VARIABLES = dotenvFlow.parse([
      path.resolve(ROOT_PATH, '.env')
    ])
  }
  if (!VARIABLES) {
    output.error('Error: > not found any variable')
    return
  }
  resolveDirectory(argv.d)
}

function resolvePath(path) {
  if (path) {
    PATHS.push(path)
  }
  return function () {
    if (BASE_DIR_NAME) {
      PATHS.unshift(BASE_DIR_NAME)
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
  parseInputDir(dirName)
  readDirectory(dirPath)
}

function parseInputDir(dirName) {
  const matchRootDir = /.+\/$/
  if (matchRootDir.test(dirName)) {
    BASE_DIR_NAME = ''
  } else {
    BASE_DIR_NAME = path.parse(dirName).base
  }
}

function readDirectory(dirPath) {
  try {
    const dirList = fs.readdirSync(dirPath)
    if (Array.isArray(dirList) && dirList.length) {
      dirList.forEach(content => {
        resolvePath(content)
        let subPath = path.resolve(dirPath, content)
        const stat = fs.statSync(subPath)
        if (stat.isDirectory()) {
          readDirectory(subPath)
        } else if (stat.isFile()) {
          uploadToCos(subPath)
        }
      })
    }
  } catch (error) {
    output.error(error)
  }
}

// function resolveFile() {

// }

// function readFile(filePath) {
//   console.log('readFile:', filePath)
//   console.log(path.parse(filePath))
// }

function uploadToCos(filePath) {
  showLoading(filePath)
  const destDirPath = resolvePath()()
  const { 
    COS_SECRET_ID,
    COS_SECRET_KEY,
    COS_BUCKET, 
    COS_REGION, 
    COS_DIRECTORY,
    COS_DOMAIN } = VARIABLES
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