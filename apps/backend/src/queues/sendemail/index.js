var x=Object.create;var r=Object.defineProperty,N=Object.defineProperties,K=Object.getOwnPropertyDescriptor,j=Object.getOwnPropertyDescriptors,P=Object.getOwnPropertyNames,l=Object.getOwnPropertySymbols,O=Object.getPrototypeOf,u=Object.prototype.hasOwnProperty,E=Object.prototype.propertyIsEnumerable;var f=(e,t,i)=>t in e?r(e,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[t]=i,S=(e,t)=>{for(var i in t||(t={}))u.call(t,i)&&f(e,i,t[i]);if(l)for(var i of l(t))E.call(t,i)&&f(e,i,t[i]);return e},h=(e,t)=>N(e,j(t)),g=e=>r(e,"__esModule",{value:!0}),a=(e,t)=>r(e,"name",{value:t,configurable:!0});var _=(e,t)=>{var i={};for(var n in e)u.call(e,n)&&t.indexOf(n)<0&&(i[n]=e[n]);if(e!=null&&l)for(var n of l(e))t.indexOf(n)<0&&E.call(e,n)&&(i[n]=e[n]);return i};var Y=(e,t)=>{g(e);for(var i in t)r(e,i,{get:t[i],enumerable:!0})},H=(e,t,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of P(t))!u.call(e,n)&&n!=="default"&&r(e,n,{get:()=>t[n],enumerable:!(i=K(t,n))||i.enumerable});return e},I=e=>H(g(r(e!=null?x(O(e)):{},"default",e&&e.__esModule&&"default"in e?{get:()=>e.default,enumerable:!0}:{value:e,enumerable:!0})),e);Y(exports,{handler:()=>G});var v=a(({from:e,to:t,team:i,inviteAcceptLink:n})=>({subject:`${e.name} invites you to team ${i.name}`,body:`Dear ${t.name},

${e.name} has invited you to join the team ${i.name}.

You can accept it by clicking on the following link:

${n}

If you don't want to accept this invitation you can safely ignore this email.

Sincerely,

The Deci team.
`}),"default");var D=a(({name:e,validationLink:t})=>({subject:"Validate your e-mail address",body:`${e?`Dear ${e}`:"Hi"},

You have recently created an account in Deci.

To activate it you need to validate your email address by clicking in this link:

${t}

If it wasn't you that created the account, you can safely ignore this e-mail.

Sincerely,

The Deci team.
`}),"default");var C=a(({url:e})=>({subject:"Deci: Sign in",body:`Hello,

You have recently asked to sign into Deci.

To be able to do that, you can click on this link:

${e}

If it wasn't you that initiated this, you can safely ignore this e-mail.

Whatever you do, please don't forward this e-mail to anyone.

Sincerely,

The Deci team.
`}),"default");function s(e){return e.name?`Dear ${e.name}`:"Hi,"}a(s,"salutation");var T=a(({from:e,to:t,workspace:i,inviteAcceptLink:n})=>({subject:`${e.name} invites you to workspace "${i.name}"`,body:`${s(t)},

${e.name} has invited you to join the workspace "${i.name}".

You can accept it by clicking on the following link:

${n}

If you don't want to accept this invitation you can safely ignore this email.

Sincerely,

The Deci team.
`}),"default");var b=a(({from:e,to:t,resource:i,resourceName:n,inviteAcceptLink:o})=>({subject:`${e.name} invites you to a ${i.type}`,body:`${s(t)},

${e.name} has shared a ${i.type} named "${n}".

You can accept it by clicking on the following link:

${o}

If you don't want to accept this invitation you can safely ignore this email.

Sincerely,

The Deci team.
`}),"default");var A={"team-invite":v,"email-validation":D,"auth-magiclink":C,"workspace-invite":T,"generic-invite":b};var R=I(require("aws-sdk"));var $=I(require("assert"));function w(){return{ses:{accessKeyId:d("DECI_SES_ACCESS_KEY_ID"),secretAccessKey:d("DECI_SES_SECRET_ACCESS_KEY"),region:d("AWS_REGION","eu-west-2")},senderEmailAddress:d("DECI_FROM_EMAIL_ADDRESS")}}a(w,"email");function d(e,t=void 0){let i=process.env[e];return i==null&&(t!==void 0?i=t:$.default.fail(`${e} env var must be defined`)),i}a(d,"env");var{ses:B,senderEmailAddress:k}=w(),U=h(S({},B),{apiVersion:"2019-09-27"}),V=new R.SESV2(U);function y({to:e,body:t,subject:i}){return new Promise((n,o)=>{let m={Content:{Simple:{Body:{Text:{Data:t,Charset:"UTF-8"}},Subject:{Data:i,Charset:"UTF-8"}}},Destination:{ToAddresses:[e]},FromEmailAddress:k,ReplyToAddresses:[k]};V.sendEmail(m,c=>{if(c)return o(c);n()})})}a(y,"sendEmail");function p(e){return async t=>{for(let i of t.Records){let n=JSON.parse(i.body);try{await e(n)}catch(o){console.error("Error processing queue element: %j",n),console.error(o)}}return{statusCode:200}}}a(p,"queueHandler");var G=p(J),W=!!process.env.JEST_WORKER_ID;async function J(i){var n=i,{template:e}=n,t=_(n,["template"]);if(W)return;let o=A[e];if(!o)throw new Error(`Could not find template with name ${e}`);let{subject:m,body:c}=o(t);await y({to:t.email||t.to.email,body:c,subject:m})}a(J,"handleSendEmail");0&&(module.exports={handler});
//# sourceMappingURL=index.js.map
