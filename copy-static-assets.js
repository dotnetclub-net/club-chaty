var shell = require('shelljs');

shell.cp('-R', 'src/web/public/', 'dist/web/');
shell.cp('-R', 'src/web/views/', 'dist/web/');