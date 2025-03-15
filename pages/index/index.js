Page({
    data: {
      // 九宫格数据
      gridItems: [
        {
          icon: '../../static/beach.png', // 替换为实际图标地址
          title: '请假管理',
          url: '/pages/leave-list/leave-list'
        },
        {
          icon: '../../static/overtime.png', // 替换为实际图标地址
          title: '加班管理',
          url: ''
        },
        {
            icon: '../../static/settings.png', // 替换为实际图标地址
            title: '其他功能',
            url: ''
        },
        
      ]
    },
  
    // 点击格子的回调函数
    onGridItemTap: function (event) {
      const index = event.currentTarget.dataset.index;
      const item = this.data.gridItems[index];
      wx.navigateTo({
          url: item.url
        });
   
        !item.url && wx.showToast({
        title: `你点击了：${item.title}`,
        icon: 'none'
      });
    }
  });