/**
 * @description: 将图片上传到图床并生成JSON
 * @author: 小康
 * @url: https://xiaokang.me
 * @Date: 2021-01-14 21:13:20
 * @LastEditTime: 2021-01-14 21:13:20
 * @LastEditors: 小康
 */

const axios = require('axios')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const FormData = require('form-data')
// 图床TOKEN
const token = ''
// 上传后json输出位置
const outpath = 'picBed_json'
// 上传地址
// const url = 'https://pic.alexhchu.com/api/upload'
const url = 'https://7bu.top/api/upload'
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
/**
 * 将图片上传到图床
 * @author 小康
 * @param {object} 图片对象
 * @returns {any}
 */
async function uploadImg(filePath, imgObj) {
  for (let item in imgObj) {
    const obj = {
      name: item,
      power: 'https://emotion.xiaokang.me/',
      common: [],
      all: []
    }
    for (let i = 0; i < imgObj[item].length; i++) {
      const data = await upload(path.join(filePath, item, imgObj[item][i]))
      obj.all.push({
        name: imgObj[item][i].split('.')[0],
        url: data.url
      })
    }
    // 保存json文件
    await fse.writeJson(`./${outpath}/${item}.json`, obj)
  }
}

// 入口函数
async function init(imgPath) {
  const imgObj = await getFilesList(imgPath)
  await uploadImg(imgPath, imgObj)
}

init('./user_img')

async function upload(imgPath) {
  var localFile = fs.createReadStream(imgPath)

  var formData = new FormData()
  formData.append('image', localFile)
  formData.append('path', 'test')

  var headers = formData.getHeaders() //获取headers

  return new Promise((resolve, reject) => {
    //获取form-data长度
    formData.getLength(async function (err, length) {
      if (err) {
        return
      }
      //设置长度，important!!!
      headers['content-length'] = length
      headers['token'] = token

      await axios
        .post(url, formData, { headers })
        .then((res) => {
          console.log(`${imgPath}上传成功=>`, res.data.data.url)
          // obj = res.data.data
          resolve(res.data.data)
        })
        .catch((res) => {
          console.log(res)
        })
    })
  })
}
