// pages/login/login.js
Page({
    data: {
      username: '',
      password: '',
      loading: false,
      canSubmit: false,
      userInfo: {
        avatarUrl: '../../static/hospital.png',
        nickName: '医院考勤系统',
      },
    },
  
    // 输入框事件
    onUsernameInput(e) {
      this.setData({ username: e.detail.value.trim() });
      this.checkForm();
    },
  
    onPasswordInput(e) {
      this.setData({ password: e.detail.value.trim() });
      this.checkForm();
    },
  
    // 表单验证
    checkForm() {
      const { username, password } = this.data;
      this.setData({
        canSubmit: username.length >= 3 
      });
    },
  
    // 提交登录
    formSubmit(e) {
      if (!this.data.canSubmit || this.data.loading) return;
  
      //this.getUserProfile();

      this.setData({ loading: true });
      
      wx.request({
        url: 'https://added-mellisa-daliandhc-4db76000.koyeb.app/api/login',
        method: 'POST',
        data: {
          userId: this.data.username,
          password: this.data.password
        },
        success: (res) => {
            
          if (res.statusCode === 200 && res.data.code === 200) {
            // 登录成功处理
            wx.showToast({
              title: '登录成功',
              icon: 'success'
            });
            // 存储token并跳转
            wx.setStorageSync('user', res.data.data);

            wx.navigateTo({
            //   url: '/pages/leave-list/leave-list'
              url: '/pages/index/index'
            });

          } else {
            // 登录失败处理
            //this.showError(res.data.message || '登录失败');
            wx.showToast({ title: res.data.message|| '登录失败',icon: 'error' })
          }
        },
        fail: (err) => {
          //this.showError('网络请求失败');
          wx.showToast({ title: '网络请求失败',icon: 'error' })
        },
        complete: () => {
          this.setData({ loading: false });
        }
      });
    },
  
    // 错误处理
    showError(msg) {
        
      wx.showToast({
        title: msg,
        icon: 'none',
        duration: 2000
      });
    },
  
    // 跳转注册
    gotoRegister() {
      wx.navigateTo({
        url: '/pages/register/register'
      });
    },


    // 获取用户信息
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明用途
      success: (res) => {
        this.setData({
          userInfo: res.userInfo
        });
        console.log('用户信息', res.userInfo);
      },
      fail(err) {
        console.error('获取用户信息失败', err);
      }
    });
  }

    

  });