import { EmailGenerator } from './types';

const authMagiclinkFirst: EmailGenerator<{ url: string }> = ({ url }) => ({
  subject: `Decipad - Verify your email`,
  body: `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "http://www.w3.org/TR/REC-html40/loose.dtd">
  <html>
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <style type="text/css">
        @import url(https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap);
  
        .h2b-button br {
          display: none;
        }
      </style>
      <style type="text/css" data-premailer="ignore">
        /* styles in here will not be inlined. Use for media queries etc */
        /* force Outlook to provide a "view in browser" menu link. */
        #outlook a {
          padding: 0;
        }
  
        /* prevent Webkit and Windows Mobile platforms from changing default font sizes.*/
        body {
          width: 100% !important;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
          margin: 0;
          padding: 0;
        }
  
        /* force Hotmail to display emails at full width */
        .ExternalClass {
          width: 100%;
        }
  
        /* force Hotmail to display normal line spacing. http://www.emailonacid.com/forum/viewthread/43/ */
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
          line-height: 100%;
        }
  
        /* fix a padding issue on Outlook 07, 10 */
        table td {
          border-collapse: collapse;
        }
  
        table {
          table-layout: fixed;
        }
  
        @media only screen and (max-width: 520px) {
          br.hidden {
            display: block !important;
          }
  
          td.padding_cell {
            display: none !important;
          }
  
          table.message_footer_table td {
            font-size: 14px !important;
          }
        }
  
        @media only screen and (max-device-width: 520px) {
          br.hidden {
            display: block !important;
          }
  
          td.padding_cell {
            display: none !important;
          }
  
          table.message_footer_table td {
            font-size: 14px !important;
          }
        }
      </style>
  
      <style type="text/css" data-premailer="ignore">
        /* styles in here will not be inlined. Use for media queries etc */
        /* force Outlook to provide a "view in browser" menu link. */
        #outlook a {
          padding: 0;
        }
  
        /* prevent Webkit and Windows Mobile platforms from changing default font sizes.*/
        body {
          width: 100% !important;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
          margin: 0;
          padding: 0;
        }
  
        /* force Hotmail to display emails at full width */
        .ExternalClass {
          width: 100%;
        }
  
        /* force Hotmail to display normal line spacing. http://www.emailonacid.com/forum/viewthread/43/ */
        .ExternalClass,
        .ExternalClass p,
        .ExternalClass span,
        .ExternalClass font,
        .ExternalClass td,
        .ExternalClass div {
          line-height: 100%;
        }
  
        /* fix a padding issue on Outlook 07, 10 */
        table td {
          border-collapse: collapse;
        }
  
        @media only screen and (max-width: 520px) {
          br.hidden {
            display: block !important;
          }
  
          td.padding_cell {
            display: none !important;
          }
  
          table.message_footer_table td {
            font-size: 14px !important;
          }
        }
  
        @media only screen and (max-device-width: 520px) {
          br.hidden {
            display: block !important;
          }
  
          td.padding_cell {
            display: none !important;
          }
  
          table.message_footer_table td {
            font-size: 14px !important;
          }
        }
      </style>
  
      <style type="text/css">
        body {
          background-color: #ffffff;
        }
  
        .content-td {
          background-color: white;
        }
  
        .admin_name b {
          color: #6f6f6f;
        }
  
        .date_cell a {
          color: #999999;
        }
  
        .comment_wrapper_table {
          margin-bottom: 20px;
        }
  
        .comment_header_td {
          width: 100%;
          background: #cdfb89;
          border: none;
          font-family: Inter, Helvetica, Arial, sans-serif;
        }
  
        .content-td {
          color: #161f2c;
          font-family: Inter, Helvetica, Arial, sans-serif;
        }
  
        table h1 {
          font-family: Inter, Helvetica, Arial, sans-serif;
          font-weight: 600 !important;
          font-size: 32px;
          line-height: 44px;
          color: #161f2c;
          margin-bottom: 24px;
          margin-top: 24px;
          letter-spacing: -0.64px;
        }
  
        .content-td h1 {
          font-family: Inter, Helvetica, Arial, sans-serif;
          font-weight: 600 !important;
          font-size: 32px;
          line-height: 44px;
          color: #161f2c;
          margin-bottom: 24px;
          margin-top: 24px;
          letter-spacing: -0.64px;
        }
  
        .content-td h1 a {
          color: #161f2c;
        }
  
        .content-td h2 {
          font-family: Inter, Helvetica, Arial, sans-serif;
          font-weight: 600 !important;
          font-size: 20px;
          font-weight: 500;
          color: #161f2c;
          margin-bottom: 8px;
          margin-top: 16px;
          line-height: 1.3;
        }
  
        .content-td h2 a {
          color: #161f2c;
        }
  
        .content-td h1 + h2 {
          margin-top: 0 !important;
        }
  
        .content-td h2 + h1 {
          margin-top: 0 !important;
        }
  
        .content-td h3,
        .content-td h4,
        .content-td h5 {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 5px;
        }
  
        .content-td p {
          color: #161f2c;
          font-size: 16px;
          margin: 8px 0 24px 0;
          line-height: 1.7;
          font-weight: 400;
        }
  
        .content-td p img,
        .content-td h1 img,
        .content-td h2 img,
        .content-td li img,
        .content-td .h2b-button img {
          margin: 0;
          padding: 0;
        }
  
        .content-td a {
          color: #3266f5;
          text-decoration: none;
        }
  
        .footer-td-wrapper a {
          color: #999999;
        }
  
        .content-td small {
          font-size: 14px;
          line-height: 20px;
          color: #777e89;
          margin-top: 16px;
          margin-bottom: 16px;
        }
  
        .content-td p.intro {
          font-size: 20px;
          line-height: 30px;
        }
  
        .content-td blockquote {
          margin: 40px 0;
          font-style: italic;
          color: #8c8c8c;
          font-size: 18px;
          text-align: center;
          padding: 0 30px;
          font-family: Georgia, sans-serif;
          quotes: none;
        }
  
        .content-td blockquote a {
          color: #8c8c8c;
        }
  
        .content-td ul {
          list-style: disc;
          margin: 8px 0 24px 20px;
          padding-left: 10px;
          font-size: 16px;
          line-height: 1.7;
        }
  
        .content-td ol {
          list-style: decimal;
          margin: 8px 0 24px 20px;
          padding-left: 10px;
          font-size: 16px;
          line-height: 1.7;
        }
  
        .content-td img {
          margin: 0;
          max-width: 99%;
          margin-bottom: 8px;
        }
  
        .content-td .container {
          margin-bottom: 16px;
        }
  
        .content-td div.container {
          margin-bottom: 17px;
          margin-top: 17px;
          line-height: 0;
        }
  
        .content-td table.responsive-layout-table div.container,
        .content-td
          table.responsive-layout-table
          div.embercom-prosemirror-composer-block-container {
          margin-top: 0;
        }
  
        .content-td hr {
          border: none;
          border-top: 1px solid #ddd;
          border-bottom: 0;
          margin: 50px 30% 50px 30%;
        }
  
        /**/
        .content-td pre {
          margin: 0 0 10px;
          padding: 10px;
          background-color: #f5f5f5;
          overflow: auto;
        }
  
        .content-td pre code {
          font-family: Courier, monospace;
          font-size: 14px;
          line-height: 1.4;
          white-space: nowrap;
        }
  
        table.container {
          margin: 17px 0;
        }
  
        table.container.align-center {
          margin-left: auto;
          margin-right: auto;
        }
  
        table.container td {
          background-color: #cdfb89;
          padding: 10px 26px;
          border-radius: 10px;
          font-family: Inter, Helvetica, Arial, sans-serif;
          margin: 0;
        }
  
        .content-td .h2b-button {
          font-size: 16px;
          color: #161f2c;
          font-weight: 600;
          display: inline-block;
          text-decoration: none;
          background-color: #cdfb89;
          border: none !important;
          padding: 12px 16px;
        }
  
        .content-td table.responsive-layout-table {
          padding: 0;
          width: 100%;
          position: relative;
          display: table;
          table-layout: fixed;
          border-spacing: 0;
          border-collapse: collapse;
          border: none;
        }
  
        .content-td table.responsive-layout-table td {
          word-wrap: break-word;
  
          -moz-hyphens: auto;
          hyphens: auto;
          border-spacing: 0;
          border-collapse: collapse;
          border: none;
          color: #525252;
          font-size: 15px;
          vertical-align: top;
          text-align: left;
        }
  
        .content-td table.responsive-layout-table td.columns {
          margin: 0 auto;
          padding-left: 16px;
          padding-bottom: 16px;
          min-width: none !important;
        }
  
        a.intercom-h2b-button {
          background-color: #0e4595;
          border-radius: 10px;
          color: #fff;
          display: inline-block;
          font-size: 15px;
          font-weight: 500;
          min-height: 20px;
          text-decoration: none;
        }
  
        .content-td .h2b-button:hover {
          background-color: #cdfb89;
        }
  
        .message_footer_table .avatar {
          -ms-interpolation-mode: bicubic;
          -webkit-background-clip: padding-box;
          -webkit-border-radius: 20px;
          background-clip: padding-box;
          border-radius: 20px;
          display: inline-block;
          height: 40px;
          max-width: 100%;
          outline: none;
          text-decoration: none;
          width: 40px;
        }
  
        .powered-by-table .powered-by-text a {
          font-weight: 500;
          text-decoration: none;
          color: #999;
        }
  
        .main_wrapper {
          padding: 0 0px;
        }
  
        .margin-arrow {
          display: none;
  
          visibility: hidden;
          width: 0;
          height: 0;
          max-width: 0;
          max-height: 0;
          overflow: hidden;
          opacity: 0;
        }
  
        .content-td > :first-child {
          margin-top: 0;
          padding-top: 0;
        }
  
        table.container td > a.h2b-button {
          padding: 0px;
        }
      </style>
  
      <!-- Responsive-->
      <style type="text/css" data-premailer="ignore">
        @media screen and (max-width: 635px) {
          h1 {
            font-size: 32px !important;
          }
  
          .main-wrap {
            width: 100% !important;
          }
  
          .main_wrapper {
            padding: 0px !important;
          }
  
          .comment_body_td {
            -webkit-border-radius: 0px !important;
            border-radius: 0px !important;
          }
  
          .spacers {
            height: 0px !important;
            display: none !important;
          }
  
          .comment_wrapper_table {
            margin-bottom: 0px !important;
          }
        }
  
        @media screen and (max-width: 580px) {
          .content-td {
            padding: 50px 15px !important;
          }
  
          .content-td h1 {
            margin-bottom: 5px;
          }
  
          .message_footer_table .space {
            width: 20px !important;
          }
  
          .message_footer_table .arrow-wrap {
            padding-left: 20px !important;
          }
  
          .message_footer_table .admin_name b {
            display: block !important;
          }
  
          .main_wrapper {
            padding: 0;
          }
  
          .image-arrow {
            display: none !important;
          }
  
          .margin-arrow {
            display: table !important;
            visibility: visible !important;
            width: 100% !important;
            height: auto !important;
            max-width: none !important;
            max-height: none !important;
            opacity: 1 !important;
            overflow: visible !important;
          }
  
          .footer-td-wrapper {
            display: block !important;
            width: 100% !important;
            text-align: left !important;
          }
  
          .footer-td-wrapper .date_cell {
            text-align: left !important;
            padding: 15px 0 0 20px !important;
          }
  
          .comment_body_td {
            -webkit-border-radius: 0px !important;
            border-radius: 0px !important;
          }
  
          .spacers {
            height: 0px !important;
            display: none !important;
          }
  
          .comment_wrapper_table {
            margin-bottom: 0px !important;
          }
  
          .footer-td-wrapper {
            padding: 0px !important;
          }
        }
      </style>
    </head>
  
    <body class="template-body">
      <table
        cellpadding="0"
        cellspacing="0"
        border="0"
        class="bgtc personal"
        align="center"
        style="
          border-collapse: collapse;
          line-height: 100% !important;
          margin: 0;
          padding: 0;
          width: 100% !important;
        "
      >
        <tbody>
          <tr>
            <td>
              <!--[if (gte mso 10)]>
          <tr>
          <td>
          <table style="width: 600px">
        <![endif]-->
              <table
                style="
                  border-collapse: collapse;
                  margin: auto;
                  width: 100%;
                  max-width: 520px;
                  min-width: 320px;
                "
                class="main-wrap"
              >
                <tbody>
                  <tr>
                    <td class="spacers" valign="top">
                      <table
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        class="reply_header_table"
                        style="
                          border-collapse: collapse;
                          color: #c0c0c0;
                          font-family: Inter, Helvetica, Arial, sans-serif;
                          font-size: 13px;
                          line-height: 26px;
                          margin: 0 auto 26px;
                          width: 100%;
                        "
                      ></table>
                    </td>
                  </tr>
                  <tr>
                    <td valign="top" class="main_wrapper">
                      <table
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        class="comment_wrapper_table admin_comment"
                        align="center"
                        style="
                          -webkit-background-clip: padding-box;
                          -webkit-border-radius: 3px;
                          background-clip: padding-box;
                          border-collapse: collapse;
                          border-radius: 3px;
                          color: #545454;
                          font-family: Inter, Helvetica, Arial, sans-serif;
                          font-size: 13px;
                          line-height: 20px;
                          width: 100%;
                        "
                      >
                        <tbody>
                          <tr>
                            <td valign="top" class="comment_wrapper_td">
                              <table
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                class="comment_body"
                                style="
                                  -webkit-background-clip: padding-box;
                                  background-clip: padding-box;
                                  border-collapse: collapse;
                                  width: 100%;
                                  border-bottom: none;
                                "
                              >
                                <tbody>
                                  <tr>
                                    <td
                                      class="comment_body_td content-td template-content"
                                      style="
                                        -webkit-background-clip: padding-box;
                                        -webkit-border-radius: 32px;
                                        background-clip: padding-box;
                                        border-radius: 32px;
                                        color: #525252;
                                        font-family: Inter, Helvetica, Arial,
                                          sans-serif;
                                        font-size: 15px;
                                        line-height: 22px;
                                        overflow: hidden;
                                        padding: 70px 20px 30px 20px;
                                      "
                                    >
                                      <table
                                        border="0"
                                        cellpadding="0"
                                        cellspacing="0"
                                        style="border-collapse: collapse"
                                      >
                                        <tbody>
                                          <tr>
                                            <td style="width: 56px">
                                              <img
                                                height="auto"
                                                src="https://user-images.githubusercontent.com/12210180/251700875-656a507b-4b2a-4d03-b947-34f44d71e926.png"
                                                style="
                                                  border-top-width: 0px;
                                                  border-right-width: 0px;
                                                  border-bottom-width: 0px;
                                                  border-left-width: 0px;
                                                  border-top-style: initial;
                                                  border-right-style: initial;
                                                  border-bottom-style: initial;
                                                  border-left-style: initial;
                                                  border-top-color: initial;
                                                  border-right-color: initial;
                                                  border-bottom-color: initial;
                                                  border-left-color: initial;
                                                  border-image-source: initial;
                                                  border-image-slice: initial;
                                                  border-image-width: initial;
                                                  border-image-outset: initial;
                                                  border-image-repeat: initial;
                                                  display: block;
                                                  outline-color: initial;
                                                  outline-style: none;
                                                  outline-width: initial;
                                                  text-decoration-line: none;
                                                  height: auto;
                                                  width: 100%;
                                                  font-size: 13px;
                                                "
                                                width="56"
                                              />
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
  
                                      <!-- ### BEGIN CONTENT ### -->
                                      <!--{{ content }}-->
  
                                      <h1>Verify your Email</h1>
                                      <p>
                                        Welcome to Decipad! We're excited to have
                                        you experience a new world of data
                                        storytelling. It's going to be epic.
                                      </p>
                                      <p>
                                        To complete your account setup, simply
                                        click the link below to verify your email:
                                      </p>
  
                                      <table
                                        class="container"
                                        style="margin: 16px 0 32px"
                                      >
                                        <tbody>
                                          <tr>
                                            <td
                                              style="
                                                background-color: #cdfb89;
                                                border-radius: 10px;
                                                font-family: Inter, Helvetica,
                                                  Arial, sans-serif;
                                                margin: 0;
                                                padding: 10px 26px;
                                              "
                                              bgcolor="#CDFB89"
                                            >
                                              <a
                                                class="h2b-button"
                                                target="_blank"
                                                href="${url}"
                                                style="
                                                  color: #161f2c;
                                                  text-decoration: none;
                                                  font-size: 16px;
                                                  font-weight: 600;
                                                  display: inline-block;
                                                  background-color: #cdfb89;
                                                  border-radius: 10px;
                                                  min-height: 20px;
                                                  padding: 0px;
                                                  border-style: none;
                                                "
                                                >Log in to Decipad</a
                                              >
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
  
                                      <p style="margin-bottom: 5px">
                                      Alternatively, you can use this link:
                                    </p>
                                    <p style="padding: 12px 16px; background-color: #F5F7FA; border-radius:10px; font-size: 14px;">
                                      <code
                                        ><a
                                          href="${url}"
                                          target="_blank"
                                          class="content-link"
                                          >${url}
                                        </a></code
                                      >
                                    </p>
  
                                      <p>
                                        If you didn't try to log in, you can
                                        safely ignore this email.
                                      </p>
  
                                      <!-- ### END CONTENT ### -->
  
                                      <table
                                        cellspacing="0"
                                        cellpadding="0"
                                        border="0"
                                        width="100%"
                                        style="
                                          width: 100% !important;
                                          margin-top: 32px;
                                          margin-bottom: 32px;
                                        "
                                      >
                                        <tr>
                                          <td
                                            align="left"
                                            valign="top"
                                            width="100%"
                                            height="1"
                                            style="
                                              background-color: #e5e9f0;
                                              border-collapse: collapse;
                                              mso-table-lspace: 0pt;
                                              mso-table-rspace: 0pt;
                                              mso-line-height-rule: exactly;
                                              line-height: 1px;
                                            "
                                          >
                                            <!--[if gte mso 15]>&nbsp;<![endif]-->
                                          </td>
                                        </tr>
                                      </table>
                                      <h2>Decipad</h2>
                                      <p style="font-size: 14px">
                                        Interactive notebook that helps everyone
                                        tell stories using data.
                                      </p>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <!--[if (gte mso 10)]>
                </td>
                </tr>
                </table>
              <![endif]-->
    </body>
  </html>`,
});
export default authMagiclinkFirst;
