module.exports = {
    pluginOptions: {
      electronBuilder: {
        builderOptions: {
            productName:'نرم‌افزار وام',
            win: {
                icon: 'public/organPhoto.jpg',
            }
        },
        nodeIntegration: true,
        externals:['websql']
      }
    },
  }
