const fse = require('fs-extra')
const fs = require('fs')
const path = require('path')

// json文件修饰前缀
// const prefix = 'http://localhost:3000/data/'
const prefix =
  'https://cdn.jsdelivr.net/gh/Dreamy-TZK/iemotion-pic@latest/dist/data/'
// 图片修饰前缀
const filePrefix =
  'https://cdn.jsdelivr.net/gh/Dreamy-TZK/iemotion-pic@latest/img/'
// 图片存放目录
const picDataDir = 'img'
// 分类名重命名映射
const reName = require('./reName')
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
      return `${filePrefix}${categoryList[i]}/${item}`
    })
  }
  return picItem
}
// 生成图片json映射
function generatePicJson(name, picList) {
  const imgList = []
  picList.forEach((url) => {
    name = url.split('/').pop().split('.')[0]
    imgList.push({
      name,
      url
    })
  })
  return imgList
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
      all: generatePicJson(item, picItem[item])
    }
    nameJson.data.push({
      name: reName[item] || item,
      url: `${prefix}${item}.json`
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
