import { EmailGenerator } from './types';

const emailValidation: EmailGenerator<{
  name: string;
  validationLink: string;
}> = ({ validationLink }) => ({
  subject: `Decipad: Confirm your email`,
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
    <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700" rel="stylesheet" type="text/css">
    <style type="text/css">
      @import url(https://fonts.googleapis.com/css?family=Roboto:300,400,500,700);
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
    </style>
  </head>

  <body style="word-spacing:normal;background-color:#f6f6f6;">
    <div style="background-color:#f6f6f6;">
      <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#f6f6f6" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
      <div style="background:#f6f6f6;background-color:#f6f6f6;margin:0px auto;border-radius:8px;max-width:600px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#f6f6f6;background-color:#f6f6f6;width:100%;border-radius:8px;">
          <tbody>
            <tr>
              <td style="border:none;direction:ltr;font-size:0px;padding:20px 20px 20px 20px;text-align:center;">
                <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" width="600px" ><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:560px;" width="560" bgcolor="#f6f6f6" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
                <div style="background:#f6f6f6;background-color:#f6f6f6;margin:0px auto;max-width:560px;">
                  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#f6f6f6;background-color:#f6f6f6;width:100%;">
                    <tbody>
                      <tr>
                        <td style="border:none;direction:ltr;font-size:0px;padding:0px 0px 5px 0px;text-align:center;">
                          <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:560px;" ><![endif]-->
                          <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                              <tbody>
                                <tr>
                                  <td style="border:none;vertical-align:top;padding:0px 0px 0px 0px;">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                                      <tbody>
                                        <tr>
                                          <td align="center" style="font-size:0px;padding:10px 25px 10px 25px;word-break:break-word;">
                                            <div style="font-family:Arial;font-size:15px;line-height:1.8;text-align:center;color:#727272;">
                                              <div><img src="https://user-images.githubusercontent.com/12210180/162798827-fd60eab3-907c-4ca1-a0dc-12ef34acb518.png" width="50" style="word-spacing: normal; caret-color: rgb(0, 0, 0); color: rgb(0, 0, 0); max-width: 100%;"><br></div>
                                            </div>
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
                <!--[if mso | IE]></td></tr></table></td></tr><tr><td class="" width="600px" ><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:560px;" width="560" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
                <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;border-radius:5px;max-width:560px;">
                  <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;border-radius:5px;">
                    <tbody>
                      <tr>
                        <td style="border:none;direction:ltr;font-size:0px;padding:20px 0px 20px 0px;text-align:center;">
                          <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:560px;" ><![endif]-->
                          <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                              <tbody>
                                <tr>
                                  <td style="border:none;vertical-align:top;padding:0px 0px 0px 0px;">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="" width="100%">
                                      <tbody>
                                        <tr>
                                          <td align="left" style="font-size:0px;padding:20px 25px 0px 25px;word-break:break-word;">
                                            <div style="font-family:Arial;font-size:15px;line-height:1.8;text-align:left;color:#5f5c5c;">
                                              <div>
                                                <h1 class="css-1tdyela" style="border: 0px; box-sizing: border-box; font-size: 1.5rem; margin: 0px; padding: 0px 0px 6px; font-family: Inter, sans-serif; font-stretch: inherit; line-height: 1; vertical-align: baseline; color: var(--deci-currentTextColor, var(--deci-normalTextColor, rgb(77, 86, 100))); font-feature-settings: unset; --deci-currentTextColor: var(--deci-strongTextColor, rgb(22, 31, 44));">Confirm Email</h1>
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td align="left" style="font-size:0px;padding:10px 25px 0px 25px;word-break:break-word;">
                                            <div style="font-family:Arial;font-size:15px;line-height:1.8;text-align:left;color:#757575;">
                                              <div><span style="caret-color: rgb(34, 34, 34); color: rgb(34, 34, 34); font-family: Roboto, sans-serif; font-size: small; text-align: -webkit-center; word-spacing: normal;">Click the link below to confirm your email</span><br></div>
                                            </div>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td align="left" vertical-align="middle" style="font-size:0px;padding:10px 25px 10px 25px;word-break:break-word;">
                                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%;">
                                              <tbody>
                                                <tr>
                                                  <td align="center" bgcolor="#C1FA6B" role="presentation" style="border:none;border-radius:3px;cursor:auto;font-style:normal;mso-padding-alt:10px 25px 10px 25px;text-align:center;background:#C1FA6B;" valign="middle">
                                                    <a href="${validationLink}" style="display:inline-block;background:#C1FA6B;color:#000000;font-family:Arial;font-size:14px;font-style:normal;font-weight:bold;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px 10px 25px;mso-padding-alt:0px;border-radius:3px;" target="_blank">Validate email</a>
                                                  </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td align="left" style="font-size:0px;padding:10px 25px 5px 25px;word-break:break-word;">
                                            <div style="font-family:&#x27;Inter&#x27;, sans-serif;font-size:12px;font-style:italic;font-weight:normal;line-height:1.8;text-align:left;color:#c9c9c9;">
                                              <div><span style="caret-color: rgb(34, 34, 34); color: rgb(34, 34, 34); font-family: Roboto, sans-serif; font-size: small; font-style: normal; text-align: -webkit-center;">Or copy and paste this link to your browser</span></div>
                                            </div>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td align="left" style="font-size:0px;padding:0px 25px 5px 25px;word-break:break-word;">
                                            <div style="font-family:&#x27;Inter&#x27;, sans-serif;font-size:12px;font-weight:normal;line-height:1.8;text-align:left;text-decoration:underline;color:#9b9b9b;"><a href="${validationLink}">${validationLink}</a><br></div>
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
      <!--[if mso | IE]></td></tr></table><![endif]-->
    </div>
  </body>

  </html>
`,
});
export default emailValidation;
