var D=Object.create;var r=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var I=Object.getOwnPropertyNames,y=Object.getOwnPropertySymbols,R=Object.getPrototypeOf,p=Object.prototype.hasOwnProperty,_=Object.prototype.propertyIsEnumerable;var f=e=>r(e,"__esModule",{value:!0}),a=(e,t)=>r(e,"name",{value:t,configurable:!0});var h=(e,t)=>{var n={};for(var i in e)p.call(e,i)&&t.indexOf(i)<0&&(n[i]=e[i]);if(e!=null&&y)for(var i of y(e))t.indexOf(i)<0&&_.call(e,i)&&(n[i]=e[i]);return n};var T=(e,t)=>{f(e);for(var n in t)r(e,n,{get:t[n],enumerable:!0})},A=(e,t,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of I(t))!p.call(e,i)&&i!=="default"&&r(e,i,{get:()=>t[i],enumerable:!(n=k(t,i))||n.enumerable});return e},C=e=>A(f(r(e!=null?D(R(e)):{},"default",e&&e.__esModule&&"default"in e?{get:()=>e.default,enumerable:!0}:{value:e,enumerable:!0})),e);T(exports,{handler:()=>Y});var v=a(({from:e,to:t,team:n,inviteAcceptLink:i})=>({subject:`${e.name} invites you to team ${n.name}`,body:`Dear ${t.name},

${e.name} has invited you to join the team ${n.name}.

You can accept it by clicking on the following link:

${i}

If you don't want to accept this invitation you can safely ignore this email.

Sincerely,

The Deci team.
`}),"default");var g=a(({name:e,validationLink:t})=>({subject:"Validate your e-mail address",body:`${e?`Dear ${e}`:"Hi"},

You have recently created an account in Deci.

To activate it you need to validate your email address by clicking in this link:

${t}

If it wasn't you that created the account, you can safely ignore this e-mail.

Sincerely,

The Deci team.
`}),"default");var E=a(({url:e})=>({subject:"Deci: Sign in",body:`Hello,

You have recently asked to sign into Deci.

To be able to do that, you can click on this link:

${e}

If it wasn't you that initiated this, you can safely ignore this e-mail.

Whatever you do, please don't forward this e-mail to anyone.

Sincerely,

The Deci team.
`}),"default");function s(e){return e.name?`Dear ${e.name}`:"Hi,"}a(s,"salutation");var S=a(({from:e,to:t,workspace:n,inviteAcceptLink:i})=>({subject:`${e.name} invites you to workspace "${n.name}"`,body:`${s(t)},

${e.name} has invited you to join the workspace "${n.name}".

You can accept it by clicking on the following link:

${i}

If you don't want to accept this invitation you can safely ignore this email.

Sincerely,

The Deci team.
`}),"default");var $=a(({from:e,to:t,resource:n,resourceName:i,inviteAcceptLink:o})=>({subject:`${e.name} invites you to a ${n.type}`,body:`${s(t)},

${e.name} has shared a ${n.type} named "${i}".

You can accept it by clicking on the following link:

${o}

If you don't want to accept this invitation you can safely ignore this email.

Sincerely,

The Deci team.
`}),"default");var b={"team-invite":v,"email-validation":g,"auth-magiclink":E,"workspace-invite":S,"generic-invite":$};var w=C(require("aws-sdk")),j={apiVersion:"2019-09-27",accessKeyId:process.env.DECI_SES_ACCESS_KEY_ID,secretAccessKey:process.env.DECI_SES_SECRET_ACCESS_KEY,region:"eu-west-2"},x=new w.SESV2(j),d=process.env.DECI_FROM_EMAIL_ADDRESS;if(!d)throw new Error("Environment variable DECI_FROM_EMAIL_ADDRESS is not defined");function m({to:e,body:t,subject:n}){return new Promise((i,o)=>{let l={Content:{Simple:{Body:{Text:{Data:t,Charset:"UTF-8"}},Subject:{Data:n,Charset:"UTF-8"}}},Destination:{ToAddresses:[e]},FromEmailAddress:d,ReplyToAddresses:[d]};x.sendEmail(l,c=>{if(c)return o(c);i()})})}a(m,"sendEmail");function u(e){return async t=>{for(let n of t.Records){let i=JSON.parse(n.body);try{await e(i)}catch(o){console.error("Error processing queue element: %j",i),console.error(o)}}return{}}}a(u,"queueHandler");var Y=u(F),H=!!process.env.JEST_WORKER_ID;async function F(n){var i=n,{template:e}=i,t=h(i,["template"]);if(H)return;let o=b[e];if(!o)throw new Error(`Could not find template with name ${e}`);let{subject:l,body:c}=o(t);await m({to:t.email||t.to.email,body:c,subject:l})}a(F,"handleSendEmail");0&&(module.exports={handler});
//# sourceMappingURL=index.js.map
