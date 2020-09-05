#!/usr/bin/env node

var opn = require('opn');


  var cmd=require('node-cmd')
  cmd.get('pwd',
      function(err, data, stderr){
          console.log('the current working dir is : ',data)
      }
    );
  cmd.get('http-server ./ -p 8081 -c-1 --cors',
      function(err, data, stderr){
          console.log('res: ',data)
      }
    );
  opn('http://localhost:8081/app.html')