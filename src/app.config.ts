export default defineAppConfig({
  pages: [
    'pages/workspace/index',
    'pages/handover/index',
    'pages/trace/index',
    'pages/mine/index',
    'pages/order-create/index',
    'pages/order-detail/index',
    'pages/batch-detail/index',
    'pages/delivery-detail/index',
    'pages/trace-query/index',
    'pages/reconciliation/index',
    'pages/settings/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '齿科消供通',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#8E99A8',
    selectedColor: '#0EA5A0',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/workspace/index',
        text: '工作台'
      },
      {
        pagePath: 'pages/handover/index',
        text: '交接'
      },
      {
        pagePath: 'pages/trace/index',
        text: '追溯'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
