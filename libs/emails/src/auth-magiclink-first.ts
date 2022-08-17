import { format } from 'date-fns';
import { EmailGenerator } from './types';

const date = `${format(Date.now(), "PPPP 'at' H:m")} UTC`;

const authMagiclinkFirst: EmailGenerator<{ url: string; expires: string }> = ({
  url,
  expires,
}) => ({
  subject: `Sign in to Decipad`,
  body: `
  <!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
  <title>
  </title>
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style type="text/css">
    #outlook a {
      padding: 0;
    }

    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }

    p {
      display: block;
      margin: 13px 0;
    }

    a {
      color:#3266F5;
    }
    @media (prefers-color-scheme: light) {
      .darkLogoDefault,
      .lightLogo {
        display: none !important;
      }

      .darkLogoWrapper,
      .darkLogo {
        display: block !important;
      }
    }

    @media (prefers-color-scheme: dark) {
      .darkLogoDefault,
      .darkLogo {
        display: none !important;
      }

      .lightLogoWrapper,
      .lightLogo {
        display: block !important;
      }
    }
  </style>
  <!--[if mso]>
        <noscript>
        <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
        </xml>
        </noscript>
        <![endif]-->
  <!--[if lte mso 11]>
        <style type="text/css">
          .mj-outlook-group-fix { width:100% !important; }
        </style>
        <![endif]-->
  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css?family=Droid+Sans:300,400,500,700" rel="stylesheet" type="text/css">
  <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700" rel="stylesheet" type="text/css">
  <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
  <style type="text/css">
    @import url(https://fonts.googleapis.com/css?family=Droid+Sans:300,400,500,700);
    @import url(https://fonts.googleapis.com/css?family=Roboto:300,400,500,700);
    @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
  </style>
  <!--<![endif]-->
  <style type="text/css">
    @media only screen and (min-width:480px) {
      .mj-column-per-100 {
        width: 100% !important;
        max-width: 100%;
      }
    }
  </style>
  <style media="screen and (min-width:480px)">
    .moz-text-html .mj-column-per-100 {
      width: 100% !important;
      max-width: 100%;
    }
  </style>
  <style type="text/css">
    @media only screen and (max-width:480px) {
      table.mj-full-width-mobile {
        width: 100% !important;
      }

      td.mj-full-width-mobile {
        width: auto !important;
      }
    }
  </style>
</head>

<body style="word-spacing:normal;background-color:#E8E8E8;">
  <div style="background-color:#E8E8E8;">
    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:650px;" width="650" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="margin:0px auto;max-width:650px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tbody>
          <tr>
            <td style="border:none;direction:ltr;font-size:0px;padding:20px 10px 20px 10px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" width="650px" ><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:630px;" width="630" bgcolor="#FFFFFF" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
              <div style="background:#FFFFFF;background-color:#FFFFFF;margin:0px auto;border-radius:32px;max-width:630px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#FFFFFF;background-color:#FFFFFF;width:100%;border-radius:32px;">
                  <tbody>
                    <tr>
                      <td style="border:0px;direction:ltr;font-size:0px;padding:20px 0px 30px 0px;text-align:center;">
                        <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="" ><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:630px;" width="630" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
                        <div style="margin:0px auto;max-width:630px;">
                          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                            <tbody>
                              <tr>
                                <td style="border:none;direction:ltr;font-size:0px;padding:20px 45px 0px 45px;text-align:center;">
                                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:540px;" ><![endif]-->
                                  <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                                      <tbody>
                                        <tr>
                                          <td style="border:none;vertical-align:top;padding:0px 0px 0px 0px;">
                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                                              <tbody>
                                                <tr>
                                                  <td align="left" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                                                      <tbody>
                                                        <tr>
                                                          <td style="width:320px">
                                                              <img height="auto" src="https://user-images.githubusercontent.com/12210180/185091230-39b38bb6-3fe0-4063-aece-0151e0f925ce.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="320" class="darkLogoDefault" />
                                                              <div class="darkLogoWrapper" style="mso-hide: all; display: none">
                                                                <img height="auto" src="https://user-images.githubusercontent.com/12210180/184343483-af937fd7-d4ea-40b9-8ac1-2f8d60d128f1.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;display:none" width="320" class="darkLogo" />
                                                              </div>
                                                              <div class="lightLogoWrapper" style="mso-hide: all; display: none">
                                                                <img height="auto" src="https://user-images.githubusercontent.com/12210180/185091152-8c75f597-f301-415c-8bf6-a4417bed4b24.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;display:none" width="320" class="lightLogo" />
                                                              </div>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td align="center" style="font-size:0px;padding:24px 0px 20px 0px;word-break:break-word;">
                                                    <p style="border-top:solid 1px #E5E9F0;font-size:1px;margin:0px auto;width:100%;">
                                                    </p>
                                                    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #E5E9F0;font-size:1px;margin:0px auto;width:540px;" role="presentation" width="540px" ><tr><td style="height:0;line-height:0;"> &nbsp;
</td></tr></table><![endif]-->
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td align="left" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                                                    <div style="font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;,&#x27;Helvetica Neue&#x27;, sans-serif;font-size:22pt;font-weight:bold;line-height:150%;text-align:left;color:#323B49;">Welcome to Decipad!👋</div>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td align="left" style="font-size:0px;padding:5px 0px 0px 0px;word-break:break-word;">
                                                    <div style="font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;,&#x27;Helvetica Neue&#x27;, sans-serif;font-size:12pt;font-style:normal;font-weight:normal;line-height:1.7;text-align:left;color:#323B49;">Here is your link to securely sign in and get started with Decipad</div>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td style="font-size:0px;padding:   ;word-break:break-word;">
                                                    <div style="height:12px;line-height:12px;">&#8202;</div>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td style="font-size:0px;padding:   ;word-break:break-word;">
                                                    <div style="height:5px;line-height:5px;">&#8202;</div>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td align="left" vertical-align="middle" style="font-size:0px;padding:5px 25px 5px 0px;word-break:break-word;">
                                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%;">
                                                      <tbody>
                                                        <tr>
                                                          <td align="center" bgcolor="#C1FA6B" role="presentation" style="border:none;border-radius:6px;cursor:auto;mso-padding-alt:15px 25pt 15px 23pt;text-align:center;background:#C1FA6B;" valign="middle">
                                                            <a href="${url}" style="display:inline-block;background:#C1FA6B;color:#161F2C;font-family:Arial;font-size:11pt;font-weight:600;line-height:140%;margin:0;text-decoration:none;text-transform:none;padding:15px 25pt 15px 23pt;mso-padding-alt:0px;border-radius:6px;" target="_blank"> Sign in to Decipad </a>
                                                          </td>
                                                        </tr>
                                                      </tbody>
                                                    </table>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td style="font-size:0px;padding:   ;word-break:break-word;">
                                                    <div style="height:8px;line-height:8px;">&#8202;</div>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td align="left" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                                                    <div style="font-family:Arial;font-size:10pt;font-weight:normal;line-height:1.7;text-align:left;color:#777E89;">${date}. The link will expire in ${expires}</div>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td align="left" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                                                    <div style="font-family:Arial;font-size:10pt;font-weight:normal;line-height:1.7;text-align:left;color:#777E89;">Alternatively, you can use this link: </div>
                                                  </td>
                                                </tr>
                                                  <td align="left" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                                                    <div style="font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;,&#x27;Helvetica Neue&#x27;, sans-serif;font-size:8pt;font-weight:400;line-height:1.7;text-align:left;color:#3266F5;"><a href="${url}">${url}</a></div>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td align="center" style="font-size:0px;padding:30px 0px 24px 0px;word-break:break-word;">
                                                    <p style="border-top:solid 1px #E5E9F0;font-size:1px;margin:0px auto;width:100%;">
                                                    </p>
                                                    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #E5E9F0;font-size:1px;margin:0px auto;width:540px;" role="presentation" width="540px" ><tr><td style="height:0;line-height:0;"> &nbsp;
</td></tr></table><![endif]-->
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td align="left" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                                                    <div style="font-family:Arial;font-size:15pt;font-style:normal;font-weight:bold;line-height:1.7;text-align:left;color:#323B49;">Tips to get started</div>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td style="font-size:0px;padding:   ;word-break:break-word;">
                                                    <div style="height:24px;line-height:24px;">&#8202;</div>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td align="left" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                                                    <div style="font-family:Arial;font-size:11pt;font-style:normal;font-weight:bold;line-height:1.7;text-align:left;color:#505969;">Explore our examples</div>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td align="left" style="font-size:0px;padding:5px 0px 0px 0px;word-break:break-word;">
                                                  <div style="font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;,&#x27;Helvetica Neue&#x27;, sans-serif;font-size:11pt;font-style:normal;font-weight:normal;line-height:1.7;text-align:left;color:#777E89;">Get inspired by checking our <a href="https://alpha.decipad.com/docs/examples/">gallery of examples</a></div>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td style="font-size:0px;padding:   ;word-break:break-word;">
                                                    <div style="height:24px;line-height:24px;">&#8202;</div>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td align="left" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                                                    <div style="font-family:Arial;font-size:11pt;font-style:normal;font-weight:bold;line-height:1.7;text-align:left;color:#505969;">Check our docs</div>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td align="left" style="font-size:0px;padding:5px 0px 0px 0px;word-break:break-word;">
                                                  <div style="font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;,&#x27;Helvetica Neue&#x27;, sans-serif;font-size:11pt;font-style:normal;font-weight:normal;line-height:1.7;text-align:left;color:#777E89;">Are you the type of person, who reads the manual before pressing the “ON” button? Take a look at our <a href="https://alpha.decipad.com/docs/">docs</a></div>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td style="font-size:0px;padding:   ;word-break:break-word;">
                                                    <div style="height:24px;line-height:24px;">&#8202;</div>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td align="left" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                                                    <div style="font-family:Arial;font-size:11pt;font-style:normal;font-weight:bold;line-height:1.7;text-align:left;color:#505969;">Join our Discord community</div>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td align="left" style="font-size:0px;padding:5px 0px 0px 0px;word-break:break-word;">
                                                  <div style="font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;,&#x27;Helvetica Neue&#x27;, sans-serif;font-size:11pt;font-style:normal;font-weight:normal;line-height:1.7;text-align:left;color:#777E89;">Follow our progress, tell us about your number challenges and meet like-minded people. <a href="https://discord.gg/HwDMqwbGmc">Join Discord</a></div>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td align="center" style="font-size:0px;padding:35px 0px 15px 0px;word-break:break-word;">
                                                    <p style="border-top:solid 1px #E5E9F0;font-size:1px;margin:0px auto;width:100%;">
                                                    </p>
                                                    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #E5E9F0;font-size:1px;margin:0px auto;width:540px;" role="presentation" width="540px" ><tr><td style="height:0;line-height:0;"> &nbsp;
</td></tr></table><![endif]-->
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td align="left" style="font-size:0px;padding:0px 0px 0px 0px;word-break:break-word;">
                                                    <div style="font-family:-apple-system, BlinkMacSystemFont, &#x27;Segoe UI&#x27;, &#x27;Roboto&#x27;, &#x27;Oxygen&#x27;, &#x27;Ubuntu&#x27;, &#x27;Cantarell&#x27;, &#x27;Fira Sans&#x27;, &#x27;Droid Sans&#x27;,&#x27;Helvetica Neue&#x27;, sans-serif;font-size:9pt;font-weight:400;line-height:1.7;text-align:left;color:#8f97a4;">If you didn&#x27;t try to sign in, you can safely ignore this email</div>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                  <!--[if mso | IE]></td></tr></table><![endif]-->
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <!--[if mso | IE]></td></tr></table></td></tr></table><![endif]-->
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]></td></tr></table></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><![endif]-->
  </div>
</body>

</html>
`,
});
export default authMagiclinkFirst;
