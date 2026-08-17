const fs = require('fs');
const path = require('path');

const distSrc = path.resolve(__dirname, '../dist');

function main(){
  const url = path.join(distSrc, 'index.html');
  let htmlStr = fs.readFileSync(url, { encoding: 'utf-8' });
  const reg = /<script.*>/g;

  htmlStr = htmlStr.replace(reg, function(str){
    return str.replace(/\snomodule|\scrossorigin|\stype="module"/g, '')
  })
  fs.writeFileSync(url, htmlStr, { encoding: 'utf-8' });
}

main();
