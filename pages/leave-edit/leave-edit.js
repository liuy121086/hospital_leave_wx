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
        reason: ''
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
      this.loadEmployees()
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
        wx.showToast({
          title: '保存成功',
          success: () => {
            wx.navigateBack()
          }
        })
      } catch (error) {
        wx.showToast({ title: '保存失败', icon: 'error' })
      }
    },
  
    // 表单验证
    validateForm() {
      const { employeeId, holidayType, applyTime, dayNum, reason } = this.data.formData
      if (!employeeId) {
        wx.showToast({ title: '请选择员工', icon: 'none' })
        return false
      }
      if (!holidayType) {
        wx.showToast({ title: '请选择请假类型', icon: 'none' })
        return false
      }
      if (!applyTime) {
        wx.showToast({ title: '请选择请假时间', icon: 'none' })
        return false
      }
      if (!dayNum || dayNum <= 0) {
        wx.showToast({ title: '请输入有效天数', icon: 'none' })
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