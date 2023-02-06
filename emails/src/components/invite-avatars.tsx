import { Img } from '@react-email/img';

export const InviteAvatar: React.FC = () => {
  const baseUrl = 'https://react-email-demo-anci3ob47-resend.vercel.app';

  return (
    <table
      style={spacing}
      border={0}
      cellPadding="0"
      cellSpacing="10"
      align="center"
    >
      <tr>
        <td style={center} align="left" valign="middle">
          <Img
            style={avatar}
            src={`${baseUrl}/static/vercel-user.png`}
            width="64"
            height="64"
          />
        </td>
        <td style={center} align="left" valign="middle">
          <Img
            src={`${baseUrl}/static/vercel-arrow.png`}
            width="12"
            height="9"
            alt="invited you to"
          />
        </td>
        <td style={center} align="left" valign="middle">
          <Img
            style={avatar}
            src={`${baseUrl}/static/vercel-team.png`}
            width="64"
            height="64"
          />
        </td>
      </tr>
    </table>
  );
};

const center = {
  verticalAlign: 'middle',
};

const spacing = {
  marginBottom: '26px',
};

const avatar = {
  borderRadius: '100%',
};
