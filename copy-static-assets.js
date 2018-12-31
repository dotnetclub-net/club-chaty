var shell = require('shelljs');

shell.cp('-R', 'src/web/public/', 'dist/web/');
shell.cp('-R', 'src/web/views/', 'dist/web/');
shell.cp('node_modules/vash/build/vash.js', 'dist/web/public/chat-index/vash.js');