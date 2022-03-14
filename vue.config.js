module.exports = {
    pluginOptions: {
      electronBuilder: {
        builderOptions: {
            productName:'daftar',
            icon: 'build/icon.png',
            artifactName: '${productName}_${version}_${arch}.${ext}',
            publish: null,
            linux:{
              target: "deb",
            },
        },
        nodeIntegration: true,
        externals:['websql']
      }
    },
  }
