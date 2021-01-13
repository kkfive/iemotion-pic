const fse = require('fs-extra')
const fs = require('fs')
const path = require('path')

const prefix = 'https://cdn.jsdelivr.net/gh/Dreamy-TZK/iemotion-pic/'
const filePrefix = 'https://cdn.jsdelivr.net/npm/iemotion-pic@latest/dist/data/'
const picDataDir = 'data'

// 获取目录下文件夹
async function getDirFiles(filePath) {
  const fileList = await fse.readdir(path.join(__dirname, filePath))
  return fileList
}

// 获取目录内文件
async function getCategoryFiles(filePath) {
  const categoryList = await getDirFiles(picDataDir)
  const picItem = {}
  for (let i = 0; i < categoryList.length; i++) {
    const fileList = await fse.readdir(
      path.join(__dirname, filePath, categoryList[i])
    )
    picItem[categoryList[i]] = fileList.map((item) => {
      return `${prefix}${categoryList[i]}/${item}`
    })
  }
  return picItem
}
// 生成文件
async function generateFiles(filePath) {
  const picItem = await getCategoryFiles(filePath)
  const nameJson = {
    notice: '',
    cdn: '',
    data: []
  }
  for (var item in picItem) {
    // item 为每一个 键 名
    const fileContent = {
      common: [],
      all: picItem[item]
    }
    nameJson.data.push({
      name: item,
      url: `${filePrefix}${item}.json`
    })
    await fse.mkdirs(`dist/data`)
    await fse.writeFile(`dist/data/${item}.json`, JSON.stringify(fileContent))
  }
  await fse.writeFile('dist/name.json', JSON.stringify(nameJson))
  console.log('生成完毕')
}

// 删除dist目录
function delDir(path) {
  let files = []
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path)
    files.forEach((file, index) => {
      let curPath = path + '/' + file
      if (fs.statSync(curPath).isDirectory()) {
        delDir(curPath) //递归删除文件夹
      } else {
        fs.unlinkSync(curPath) //删除文件
      }
    })
    fs.rmdirSync(path)
  }
}
// const categoryList = getDirFiles(picDataDir)
delDir('dist')
generateFiles(picDataDir)
