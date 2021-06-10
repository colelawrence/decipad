var a=Object.defineProperty;var i=t=>a(t,"__esModule",{value:!0}),o=(t,e)=>a(t,"name",{value:e,configurable:!0});var n=(t,e)=>{for(var r in e)a(t,r,{get:e[r],enumerable:!0})};i(exports);n(exports,{handler:()=>m});var m=o(function(e){return{statusCode:200,headers:{"cache-control":"no-cache, no-store, must-revalidate, max-age=0, s-maxage=0","content-type":"text/html; charset=utf8"},body:`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Deci</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .max-width-320 {
      max-width: 20rem;
    }
    .margin-left-8 {
      margin-left: 0.5rem;
    }
    .margin-bottom-16 {
      margin-bottom: 1rem;
    }
    .margin-bottom-8 {
      margin-bottom: 0.5rem;
    }
    .padding-32 {
      padding: 2rem;
    }
    .color-grey {
      color: #333;
    }
    .color-black-link:hover {
      color: black;
    }
  </style>
</head>
<body class="padding-32">
  <div class="margin-left-8">
    <h1>Error while authenticating:</h1>
    <pre>${e.queryStringParameters.error}</pre>
    <p><a href="/">Go back</a></p>
  </div>
</body>
</html>
`}},"http");0&&(module.exports={handler});
//# sourceMappingURL=index.js.map
