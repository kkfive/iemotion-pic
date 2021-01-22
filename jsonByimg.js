/*
 * @description: 通过图片生成json
 * @author: 小康
 * @url: https://xiaokang.me
 * @Date: 2021-01-16 09:25:29
 * @LastEditTime: 2021-01-16 09:25:34
 * @LastEditors: 小康
 */

const fse = require('fs-extra')
const path = require('path')
// 图片地址前缀修饰
const imgPrefix = 'https://cdn.jsdelivr.net/gh/hanxea/blog@latest/'
// 版权
const power = 'https://github.com/hanxea/blog/'

/**
 * 获取文件列表
 * @author 小康
 * @param {string} 图片目录的父级目录
 * @returns {Object} 所有图片对象
 * {
 *    图片目录名:[’图片名‘]
 * }
 */
async function getFilesList(filePath) {
  const obj = {}
  // 图片目录列表
  const picDirs = await fse.readdir(filePath)
  for (var i = 0; i < picDirs.length; i++) {
    obj[picDirs[i]] = await fse.readdir(path.join(filePath, picDirs[i]))
  }
  return obj
}

// 入口函数
async function init(filePath) {
  const fileObj = await getFilesList(filePath)
  for (let category in fileObj) {
    const obj = {
      name: category,
      power,
      common: [],
      all: []
    }
    for (let i = 0; i < fileObj[category].length; i++) {
      obj.all.push({
        name: fileObj[category][i].split('.')[0],
        url: `${imgPrefix}${category}/${fileObj[category][i]}`
      })
    }

    fse.writeJson('./user_json_temp/' + category + '.json', obj)
  }
  console.log('生成完毕')
}
init('./user_img')
