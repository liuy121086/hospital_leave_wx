// pages/leaveEdit/leaveEdit.js

const util = require('../../utils/util.js'); // 注意路径
Page({
    data: {
      formData: {
        id: '',
        status: 0,
        leaveNo: '',
        employeeId: '',
        holidayType: '',
        applyTime: '',
        dayNum: '',
        reason: '',
        startDate: '2025-01-01', // 默认开始日期
        startTime: '00:00',     // 默认开始时间
        endDate: '2025-01-01',   // 默认结束日期
        endTime: '00:00',       // 默认结束时间
        hours: '0'            // 计算结果
      },
      employeeOptions: [],
      holidayTypeOptions: [
        { value: 1, name: '年假' },
        { value: 2, name: '串休' }
      ],
      employeeIndex: 0,
      holidayTypeIndex: 0,
      user:{}
    },
  
    onLoad(options) {
        this.setData({user:wx.getStorageSync('user')});
      if (options.id) {
        this.loadDetail(options.id)
      } else {
        this.generateLeaveNo()
      }
      this.setData({ employeeOptions: wx.getStorageSync('userList') })
      //this.loadEmployees()
    },
  

 // 开始日期变化事件
 onStartDateChange(e) {
    this.setData({
      'formData.startDate': e.detail.value,
    });
    this.calculateHours()
  },

  // 开始时间变化事件
  onStartTimeChange(e) {
    this.setData({
      'formData.startTime': e.detail.value,
    });
    this.calculateHours()
  },

  // 结束日期变化事件
  onEndDateChange(e) {
    this.setData({
      'formData.endDate': e.detail.value,
    });
    this.calculateHours()
  },

  // 结束时间变化事件
  onEndTimeChange(e) {
    this.setData({
      'formData.endTime': e.detail.value,
    });
    this.calculateHours()
  },


   // 计算小时数
   async calculateHours() {
    const { startDate, startTime, endDate, endTime } = this.data.formData

    if(!startDate&startTime&endDate&endTime) return

    // 拼接完整的日期时间字符串
    const startDateTime = `${startDate}T${startTime}`
    const endDateTime = `${endDate}T${endTime}`


    // 显示加载动画
    wx.showLoading({
        title: '加载中...', // 加载动画的提示文字
        mask: true // 是否显示透明蒙层，防止触摸穿透
      });

    // 调用接口
    try {
        const res = await util.request({
          url: 'https://added-mellisa-daliandhc-4db76000.koyeb.app/api/leaves/get-leave-hours',
          method: 'GET',
          data: {
            'a':startDateTime,
            'b':endDateTime
          },
          header: {'Content-Type': 'application/json','Authorization':'Bearer '+this.data.user.token}
        })
        
        // 隐藏加载动画
        wx.hideLoading();
        if (res.data.code === 200) {
          this.setData({ 'formData.hours': res.data.data })
        } else {
            wx.showToast({ title: res.data.message,icon: 'error' })
        }
      } catch (error) {
        console.error('加载员工列表失败', error)
        // 隐藏加载动画
        wx.hideLoading();
      }
  },

    changeEmployee(e) {
        const index = e.detail.value
        const selected = this.data.employeeOptions[index]

        this.setData({
          'formData.employeeId': selected?.value || ''
        }, () => {
            // 数据更新后重新计算显示名称
            this.updateDisplayName();
          })
      },
    
      changeHolidayType(e) {

        const index = e.detail.value
        const selected = this.data.holidayTypeOptions[index]

        this.setData({
          'formData.holidayType': selected?.value || ''
        }, () => {
            // 数据更新后重新计算显示名称
            this.updateDisplayName();
          })
      },

      updateDisplayName() {
        const { formData,employeeOptions,holidayTypeOptions } = this.data;
        const currentEmployee = employeeOptions.find(item => item.value === formData.employeeId);
        const currentHolidayType = holidayTypeOptions.find(item => item.value === formData.holidayType);
        this.setData({
          currentEmployeeName: currentEmployee ? currentEmployee.name : '全部',
          currentHolidayTypeName: currentHolidayType ? currentHolidayType.name : '全部'
        });
      },

    // 加载员工列表
    async loadEmployees() {
        try {
          const res = await util.request({
            url: 'https://added-mellisa-daliandhc-4db76000.koyeb.app/api/employee/list-all',
            method: 'GET',
            header: {'Content-Type': 'application/json','Authorization':'Bearer '+this.data.user.token}
          })
          
          if (res.data.code === 200) {
            let options = res.data.data.map(item => ({
              value: item.id,
              name: item.empName
            }))
        
            this.setData({ employeeOptions: options })
          }
        } catch (error) {
          console.error('加载员工列表失败', error)
        }
      },
  
    // 生成请假编号
    // async generateLeaveNo() {
    //   const res = await wx.request({
    //     url: 'https://api.example.com/generateLeaveNo'
    //   })
    //   this.setData({
    //     'formData.leaveNo': res.data.leaveNo
    //   })
    // },

    generateLeaveNo() {
        // 获取当前时间戳（毫秒级）
        const timestamp = Date.now()
    
        // 将时间戳转换为字符串，并添加前缀
        const leaveNo = `LEAVE-${timestamp}`
    
        this.setData({
          'formData.leaveNo': leaveNo
        })
      },
  
    // 加载详情
    async loadDetail(id) {

        // 显示加载动画
    wx.showLoading({
        title: '加载中...', // 加载动画的提示文字
        mask: true // 是否显示透明蒙层，防止触摸穿透
      });


      const res = await util.request({
        url: `https://added-mellisa-daliandhc-4db76000.koyeb.app/api/leaves/get/${id}`,
        method: 'GET',
        header: {'Content-Type': 'application/json','Authorization':'Bearer '+this.data.user.token}
      })
      
      const detail = res.data.data
      
      // 设置选中项索引
      const employeeIndex = this.data.employeeOptions.findIndex(
        e => e.value === detail.employeeId
      )
      const holidayTypeIndex = this.data.holidayTypeOptions.findIndex(
        t => t.value === detail.holidayType
      )
  
      console.log(detail,employeeIndex,holidayTypeIndex)

      this.setData({
        formData: detail,
        employeeIndex: Math.max(employeeIndex, 0),
        holidayTypeIndex: Math.max(holidayTypeIndex, 0)
      }, () => {
        // 数据更新后重新计算显示名称
        this.updateDisplayName();
      })

      // 隐藏加载动画
      wx.hideLoading();
      
    },
  
    // 表单变更处理
    // changeEmployee(e) {
    //   const index = e.detail.value
    //   this.setData({
    //     employeeIndex: index,
    //     'formData.employeeId': this.data.employeeOptions[index].value
    //   })
    // },
  
    // changeHolidayType(e) {
    //   const index = e.detail.value
    //   this.setData({
    //     holidayTypeIndex: index,
    //     'formData.holidayType': this.data.holidayTypeOptions[index].value
    //   })
    // },
  
    changeApplyTime(e) {
      this.setData({
        'formData.applyTime': e.detail.value
      })
    },
  
    inputDayNum(e) {
      this.setData({
        'formData.dayNum': e.detail.value
      })
    },
  
    inputReason(e) {
      this.setData({
        'formData.reason': e.detail.value
      })
    },
  
    // 保存表单
    async saveForm() {
      // 验证必填项
      if (!this.validateForm()) return
  

      wx.showLoading({
        title: '保存中...', // 加载动画的提示文字
        mask: true // 是否显示透明蒙层，防止触摸穿透
      });

      const url = this.data.formData.id 
        ? `https://added-mellisa-daliandhc-4db76000.koyeb.app/api/leaves/save`
        : 'https://added-mellisa-daliandhc-4db76000.koyeb.app/api/leaves/save'
  
      try {
        await wx.request({
          url,
          method: this.data.formData.id ? 'POST' : 'POST',
          data: this.data.formData,
          header: {'Content-Type': 'application/json','Authorization':'Bearer '+this.data.user.token}
        })

        // 隐藏加载动画
        wx.hideLoading();
        wx.showToast({
          title: '保存成功',
          success: () => {
            wx.navigateBack()
          }
        })
      } catch (error) {
          // 隐藏加载动画
          wx.hideLoading();
        wx.showToast({ title: '保存失败', icon: 'error' })
      }
    },
  
    // 表单验证
    validateForm() {
      const { employeeId, holidayType, applyTime, dayNum, reason,startDate, startTime, endDate, endTime } = this.data.formData
      if (!employeeId) {
        wx.showToast({ title: '请选择员工', icon: 'none' })
        return false
      }
      if (!holidayType) {
        wx.showToast({ title: '请选择请假类型', icon: 'none' })
        return false
      }
      if (!startDate) {
        wx.showToast({ title: '请选择开始日期', icon: 'none' })
        return false
      }
      if (!startTime) {
        wx.showToast({ title: '请选择开始时间', icon: 'none' })
        return false
      }
      if (!endDate) {
        wx.showToast({ title: '请选择结束日期', icon: 'none' })
        return false
      }
      if (!endTime) {
        wx.showToast({ title: '请选择结束时间', icon: 'none' })
        return false
      }
      if (!reason.trim()) {
        wx.showToast({ title: '请输入请假原因', icon: 'none' })
        return false
      }
      return true
    },
  
    cancel() {
      wx.navigateBack()
    }
  })