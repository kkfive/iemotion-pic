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
const token = '19798ec5eddb4ba2f5f9b29f1dcc56a7'
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
    for (let i = 0; i < imgObj[item].length; i++) {
      // console.log(path.join(filePath, item, imgObj[item][i]))
      const data = await upload(path.join(filePath, item, imgObj[item][i]))
      // console.log(result)
      /**
       * {
          name: '1.png',
          url: 'https://7.dusays.com/2021/01/14/5503fa5e11810.png',
          size: 9342,
          mime: 'image/png',
          sha1: 'd7461f14d5180a7421969899fdac75a0f20ec712',
          md5: '7a10c5f3c0ec6c42355907984f8a1bdc',
          quota: '1073741824.00',
          use_quota: '3197076.00'
        }
       */
    }
  }
}

// 入口函数
async function init(imgPath) {
  const imgObj = await getFilesList(imgPath)
  await uploadImg(imgPath, imgObj)
}

// init('./user_img')

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
          // console.log('上传成功', res.data)
          // obj = res.data.data
          resolve(res.data.data)
        })
        .catch((res) => {
          console.log(res)
        })
    })
  })
}
