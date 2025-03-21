
const util = require('../../utils/util.js'); // 注意路径
Page({
  data: {
    list: [],
    current: 1,
    size: 3,
    total: 0,
    isLoading: false,
    hasMore: true,
    statusMap: {
      0: '待提交',
      1: '已提交'
    },
    statusOptions: [
        {value: '', name: '全部 '},
        {value: '0', name: '待提交'},
        {value: '1', name: '已提交'}
      ],
    searchParams: {
      leaveNo: '',
      empName: '',
      status: '' ,
      reason: '',
      hours: 0,
      employeeId: '',
      holidayType: '',
      applyTimeBegin: '',
      applyTimeEnd: ''
    },
    user: {},

    // 新增选项列表
    employeeOptions: [], // 需要从接口获取
    holidayTypeOptions: [
      { value: '', name: '全部' },
      { value: 1, name: '年假' },
      { value: 2, name: '串休' }
    ],
    holidayTypeMap: {
        1: '年假',
        2: '串休'
      },


  },


  // 新增事件处理
  inputReason(e) {
    this.setData({ 'searchParams.reason': e.detail.value })
  },

  inputHours(e) {
    this.setData({ 'searchParams.hours': e.detail.value })
  },

  changeEmployee(e) {
    const index = e.detail.value
    const selected = this.data.employeeOptions[index]
    this.setData({
      'searchParams.employeeId': selected?.value || ''
    }, () => {
        // 数据更新后重新计算显示名称
        this.updateDisplayName();
      })
  },

  changeHolidayType(e) {
    const index = e.detail.value
    const selected = this.data.holidayTypeOptions[index]
    this.setData({
      'searchParams.holidayType': selected?.value || ''
    }, () => {
        // 数据更新后重新计算显示名称
        this.updateDisplayName();
      })
  },

  changeTimeBegin(e) {
    this.setData({ 'searchParams.applyTimeBegin': e.detail.value })
  },

  changeTimeEnd(e) {
    this.setData({ 'searchParams.applyTimeEnd': e.detail.value })
  },

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
        options = [{ value: '', name: '全部' },...options]
        this.setData({ employeeOptions: options })
        wx.setStorageSync('userList', options);
      }
    } catch (error) {
      console.error('加载员工列表失败', error)
    }
  },

  onLoad() {
    this.setData({user:wx.getStorageSync('user')});
    this.loadData(true);
    this.updateDisplayName();
    this.loadEmployees();
  },

  // 加载数据
  async loadData(isRefresh = false) {
    // if (this.data.isLoading || !this.data.hasMore) return

    this.setData({ isLoading: true })

    try {
      const res = await util.request({
        url: 'https://added-mellisa-daliandhc-4db76000.koyeb.app/api/leaves/overwork-query',
        method: 'GET',
        data: {
          current: isRefresh ? 1 : this.data.current+1,
          size: this.data.size,
          ...this.data.searchParams
        },
        header: {'Content-Type': 'application/json','Authorization':'Bearer '+this.data.user.token}
      })

      if (res.data.code === 200) {

        const newList = isRefresh ? res.data.data.records : [...this.data.list, ...res.data.data.records]
        const total = res.data.data.total
        const hasMore = newList.length < total

        this.setData({
          list: newList,
          total,
          hasMore,
          current: isRefresh ? 1 : this.data.current + 1
        })
      }
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'error' })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  // 加载更多
  loadMore() {
    if (!this.data.isLoading && this.data.hasMore) {
        this.loadData()
     }
  },

  onPullDownRefresh() {
    this.loadData(true).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 搜索相关
  inputLeaveNo(e) {
    this.setData({ 'searchParams.leaveNo': e.detail.value })
  },


  changeStatus(e) {
    const index = e.detail.value
    const selected = this.data.statusOptions[index]
    this.setData({
      'searchParams.status': selected.value
    }, () => {
     // 数据更新后重新计算显示名称
     this.updateDisplayName();
   })

  },

  search() {
    this.loadData(true)
  },

  addNew() {
    wx.navigateTo({
      url: `/pages/overwork-edit/overwork-edit?id=`
    })
  },

  // 操作相关（保持不变）
  editItem(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/overwork-edit/overwork-edit?id=${id}`
    })
  },

  async deleteItem(e) {
    const id = e.currentTarget.dataset.id
    const { confirm } = await wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？'
    })

    if (confirm) {
      try {
        await util.request({
          url: `https://added-mellisa-daliandhc-4db76000.koyeb.app/api/leaves/delete/${id}`,
          method: 'DELETE',
          header: {'Content-Type': 'application/json','Authorization':'Bearer '+this.data.user.token}
        })
        wx.showToast({ title: '删除成功' })
        this.loadData(true)
      } catch (error) {
        wx.showToast({ title: '删除失败', icon: 'error' })
      }
    }
  },

  async auditItem(e) {
    const id = e.currentTarget.dataset.id
    const { confirm } = await wx.showModal({
      title: '确认提交',
      content: '确定要提交这条记录吗？'
    })

    if (confirm) {

        wx.showLoading({
        title: '提交中...', // 加载动画的提示文字
        mask: true // 是否显示透明蒙层，防止触摸穿透
        });

      try {
        const res = await util.request({
          url: `https://added-mellisa-daliandhc-4db76000.koyeb.app/api/leaves/overwork-audit/${id}`,
          method: 'PUT',
          header: {'Content-Type': 'application/json','Authorization':'Bearer '+this.data.user.token}
        })

        // 隐藏加载动画
        wx.hideLoading();

        if (res.data.code === 200) {
            wx.showToast({ title: '提交成功' })
        } else {
            wx.showToast({ title: res.data.message,icon: 'error' })
        }

        this.loadData(true)
      } catch (error) {
          // 隐藏加载动画
        wx.hideLoading();
        wx.showToast({ title: '提交失败', icon: 'error' })
      }
    }
  },



    updateDisplayName() {
      const { searchParams, statusOptions,employeeOptions,holidayTypeOptions } = this.data;
      const currentStatus = statusOptions.find(item => item.value === searchParams.status);
      const currentEmployee = employeeOptions.find(item => item.value === searchParams.employeeId);
      const currentHolidayType = holidayTypeOptions.find(item => item.value === searchParams.holidayType);
      this.setData({
        currentStatusName: currentStatus ? currentStatus.name : '全部',
        currentEmployeeName: currentEmployee ? currentEmployee.name : '全部',
        currentHolidayTypeName: currentHolidayType ? currentHolidayType.name : '全部'

      });
    },


})