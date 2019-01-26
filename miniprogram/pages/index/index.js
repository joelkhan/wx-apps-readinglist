//index.js
const app = getApp()

Page({ // 是一个页面构造器，这个构造器就生成了一个页面

  data: { // 参与页面渲染的数据
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '', 
    count: 0,
    piFlag: 0,
  },

  onLoad: function () { // 页面渲染后执行
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })

    // wx.getLocation({
    //   type: 'wgs84',
    //   success: (res) => {
    //     // const latitude = res.latitude // 纬度
    //     // const longitude = res.longitude // 经度
    //     this.setData({
    //       currLatitude: res.latitude,
    //       currLongitude: res.longitude
    //     })
    //   }
    // })

  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  countClick: function() {
    //var x = count + 1;
    //var app = getApp();
    var countClick = app.globalData.numOneGD + 1;
    app.globalData = { numOneGD: countClick };
    //console.log(app.globalData);
    //this.setData({ count: this.data.count + 1 });
    this.setData({ count: countClick });
  },



  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

  addNewData: function () {
    if (this.data.piFlag == 0) {
      this.setData({
        /* 修改一个已绑定， 但未在data中定义的数据 */
        'newField.newFieldText': '噗~ 我去, 注意素质!',
        'piFlag': 1
      });
    }
    else {
      this.setData({
        /* 修改一个已绑定， 但未在data中定义的数据 */
        'newField.newFieldText': '',
        'piFlag': 0
      });
    }
  }

}) // Page
