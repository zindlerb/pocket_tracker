var menubar = require('menubar')

var mb = menubar()

mb.on('ready', function ready () {
	mb.showWindow()

  console.log('app is ready')
})
