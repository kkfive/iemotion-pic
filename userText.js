/**
 * @description: 根据用户的txt文本生成json文件，生成的name字段为文件名
 * @author: 小康
 * @url: https://xiaokang.me
 * @Date: 2021-01-14 20:26:31
 * @LastEditTime: 2021-01-14 20:26:31
 * @LastEditors: 小康
 */
const fse = require('fs-extra')

async function generateJsonByText(fileBasePath, fileName) {
  const content = await fse.readFile(fileBasePath + fileName, 'utf-8')
  const contentList = content.split('\n')
  const obj = {
    name: fileName.split('.')[0],
    common: [],
    all: []
  }
  contentList.forEach((item) => {
    const imageObj = item.split('|')
    obj.all.push({
      name: imageObj[0],
      url: imageObj[1].replace('/r', '')
    })
  })
  const flag = await fse.pathExists('./user_text_temp/')
  if (!flag) {
    await fse.mkdir('./user_text_temp/')
  }
  await fse.writeJSON(`./user_text_temp/${fileName.split('.')[0]}.json`, obj)
}

async function init() {
  const fileList = await fse.readdir('./user_text/')
  fileList.forEach((file) => {
    generateJsonByText('./user_text/', file)
  })
}
init()
