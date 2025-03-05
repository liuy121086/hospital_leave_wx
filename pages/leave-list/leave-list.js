// pages/leave-list/leave-list.js
const util = require('../../utils/util.js'); // 注意路径
Page({
    data: {
      searchParams: {
        leaveNo: '',
        empName: '',
        status: '',
        holidayType: '',
        current: 1,
        size: 10
      },
      listData: [],
      total: 0,
      statusOptions: [
        {value: '', name: '全部'},
        {value: '0', name: '待审批'},
        {value: '1', name: '已通过'},
        {value: '2', name: '已拒绝'}
      ],
      typeOptions: [
        {value: '', name: '全部'},
        {value: '1', name: '年假'},
        {value: '2', name: '病假'},
        {value: '3', name: '事假'}
      ],
      showFilter: false,
      user: {}
    },
  
    onLoad() {
      this.loadListData()
      this.updateDisplayName()
      this.user = wx.getStorageSync('user')

   
    },
  
    async loadListData() {
      const {searchParams, listData} = this.data
      wx.showLoading({title: '加载中...'})
      
      try {
        const res = await util.request({
          url: 'https://added-mellisa-daliandhc-4db76000.koyeb.app/api/leaves/query',
          method: 'GET',
          data: searchParams,
          header: {'Content-Type': 'application/json','Authorization':'Bearer '+this.user.token}
        })
        
        if(res.statusCode === 200 && res.data.code ===200) {
        
          this.setData({
            listData: searchParams.current === 1 ? res.data.data.records : [...listData, ...res.data.data.records],
            total: res.data.data.total
          })
          
        }
      } catch (error) {
        wx.showToast({title: '加载失败', icon: 'error'})
      } finally {
        wx.hideLoading()
      }
    },

    // 统一更新显示名称的逻辑
  updateDisplayName() {
    const { searchParams, statusOptions, typeOptions } = this.data;
    
    const currentStatus = statusOptions.find(item => item.value === searchParams.status);
    const currentType = typeOptions.find(item => item.value === searchParams.holidayType);
    
    this.setData({
      currentStatusName: currentStatus ? currentStatus.name : '全部',
      currentTypeName: currentType ? currentType.name : '全部'
    });
  },
  
    handleInput(e) {
      const {field} = e.currentTarget.dataset
      this.setData({
        [`searchParams.${field}`]: e.detail.value
      }, () => {
        // 数据更新后重新计算显示名称
        this.updateDisplayName();
      })
    },
  
    toggleFilter() {
      this.setData({showFilter: !this.data.showFilter})
    },
  
    handleSearch() {
      this.setData({'searchParams.current': 1}, () => {
        this.loadListData()
      })
    },
  
    resetSearch() {
      this.setData({
        searchParams: {
          ...this.data.searchParams,
          leaveNo: '',
          empName: '',
          status: '',
          holidayType: '',
          current: 1
        }
      }, () => {
        this.loadListData()
      })
    },
  
    onReachBottom() {
      const {total, listData, searchParams} = this.data
      if (listData.length < total) {
        this.setData({'searchParams.current': searchParams.current + 1}, () => {
          this.loadListData()
        })
      }
    },
  
    navigateToEdit(e) {
      const {id, status} = e.currentTarget.dataset
      if(status === '1') return
      wx.navigateTo({url: `/pages/leave-edit/leave-edit?id=${id}`})
    },
  
    handleDelete(e) {
      const {id, status} = e.currentTarget.dataset
      if(status === '1') return
      
      wx.showModal({
        title: '确认删除',
        content: '确定要删除该请假记录吗？',
        success: (res) => {
          if (res.confirm) {
            wx.request({
              url: `https://aaa.bbb.cc/${id}`,
              method: 'DELETE',
              success: () => this.loadListData()
            })
          }
        }
      })
    },
  
    // 新增方法
    navigateToAdd() {
      wx.navigateTo({url: '/pages/leave-add/leave-add'})
    },
  
    // 状态筛选器
    statusFilter(status) {
      const map = {0: '待审批', 1: '已通过', 2: '已拒绝'}
      return map[status] || '未知状态'
    },
  
    // 类型筛选器
    typeFilter(type) {
      const map = {1: '年假', 2: '病假', 3: '事假'}
      return map[type] || '其他类型'
    }
  })