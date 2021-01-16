const fse = require('fs-extra')
const fs = require('fs')
const path = require('path')
const config = require('./config')
const { filePrefix, picPrefix, power } = config

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
      return `${picPrefix}${categoryList[i]}/${item}`
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
    power,
    data: [],
    custom: {}
  }
  for (var item in picItem) {
    // item 为每一个 键 名
    const fileContent = {
      // 分类名
      name: item,
      power,
      common: [],
      all: generatePicJson(item, picItem[item])
    }
    nameJson.data.push({
      name: reName[item] || item,
      url: `${filePrefix}data/${item}.json`
    })

    await fse.mkdirs(`dist/data`)
    await fse.writeFile(`dist/data/${item}.json`, JSON.stringify(fileContent))
  }
  // 获取用户自己json文件
  const userJsonDir = await fse.readdir('./user_json')
  // 将用户自定义的json添加到name.json文件中
  for (let i = 0; i < userJsonDir.length; i++) {
    // 遍历user_json目录下的文件夹 userJsonDir[i]
    nameJson.custom[userJsonDir[i]] = []
    // 获取文件夹下的文件
    const userJsonList = await fse.readdir(`./user_json/${userJsonDir[i]}`)
    for (let u = 0; u < userJsonList.length; u++) {
      // 获取到每一个文件名
      const fileName = userJsonList[u]
      nameJson.custom[userJsonDir[i]].push({
        name: fileName.split('.')[0],
        url: `${filePrefix}${userJsonDir[i]}/${fileName}`
      })
    }
  }
  await fse.writeFile('dist/name.json', JSON.stringify(nameJson))
  await moveDir('./user_json/', './dist/')

  console.log('生成完毕')
}
// 拷贝文件
async function moveDir(oldPath, newPath) {
  const err = await fse.copy(
    oldPath,
    newPath,
    {
      overwrite: false,
      errorOnExist: true
    },
    function (err) {
      if (err) {
        console.log(err.message)
        console.log('自定义json的文件名与img目录下的目录名不能重名！')
      } else {
        console.log('移动成功')
      }
    }
  )
}

// 删除目录
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
