import React from 'react';
import '../css/custom.css';

/* Avatars */

const avatarFabio = '/docs/img/avatars/fabio.jpeg';
const avatarGiulia = '/docs/img/avatars/giulia.jpeg';
const avatarSimao = '/docs/img/avatars/simao.jpeg';
const avatarPeyton = '/docs/img/avatars/peyton.jpeg';
const avatarKelly = '/docs/img/avatars/kelly.png';
const avatarJohn = '/docs/img/avatars/john.jpeg';
const avatarNuno = '/docs/img/avatars/nuno.jpeg';
const avatarAnna = '/docs/img/avatars/anna.jpeg';

const iconColor = "#000000"

/* Badges */

const newNotebookBadge = (
  <div
    style={{
      display: 'flex',
      marginTop: '15px',
      height: '24px',
      background: '#F5F7FA',
      borderRadius: '4px',
      textAlign: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '12px',
      padding: '0px 6px',
      fontWeight: '500',
      fontSize: '12px',
      marginLeft: '8px',
      color: '#4D5664',
    }}
  >
    New
  </div>
);

const templateBadge = (
  <div
    style={{
      display: 'flex',
      marginTop: '15px',
      height: '24px',
      background: '#F5F7FA',
      borderRadius: '4px',
      textAlign: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '12px',
      padding: '0px 6px',
      fontWeight: '500',
      fontSize: '12px',
      marginLeft: '8px',
      fontStyle: 'normal',
      color: '#4D5664',
    }}
  >
    Template
  </div>
);

const educationBadge = (
  <div
    style={{
      display: 'flex',
      marginTop: '15px',
      height: '24px',
      background: '#F5F7FA',
      borderRadius: '4px',
      textAlign: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '12px',
      padding: '0px 6px',
      fontWeight: '500',
      fontSize: '12px',
      marginLeft: '8px',
      fontStyle: 'normal',
      color: '#4D5664',
    }}
  >
    Education
  </div>
);

/* Icons */

const IconAnnouncement = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <title>Announcement</title>
    <path
      d="M18.6458 10.5833C18.6458 13.1985 17.3625 15.6146 16.125 15.6146C14.8875 15.6146 13.6042 13.1985 13.6042 10.5833C13.6042 7.96809 14.8875 5.55208 16.125 5.55208C17.3625 5.55208 18.6458 7.96809 18.6458 10.5833Z"
      stroke={iconColor}
      strokeWidth="1.5"
    />
    <path
      d="M16.125 15.6146C16.125 15.6146 8.33332 13.9375 7.41666 13.6979C6.49999 13.4583 5.35416 12.2022 5.35416 10.5833C5.35416 8.96438 6.49999 7.70833 7.41666 7.46874C8.33332 7.22916 16.125 5.55208 16.125 5.55208"
      stroke={iconColor}
      strokeWidth="1.5"
    />
    <path
      d="M7.1875 13.9375V17.5312C7.1875 18.5898 8.00831 19.4479 9.02083 19.4479H9.47917C10.4917 19.4479 11.3125 18.5898 11.3125 17.5312V14.8958"
      stroke={iconColor}
      strokeWidth="1.5"
    />
  </svg>
);


const IconHeart = (    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Heart</title>
<path
  fillRule="evenodd"
  clipRule="evenodd"
  d="M11.995 7.23319C10.5455 5.60999 8.12832 5.17335 6.31215 6.65972C4.49599 8.14609 4.2403 10.6312 5.66654 12.3892L11.995 18.25L18.3235 12.3892C19.7498 10.6312 19.5253 8.13046 17.6779 6.65972C15.8305 5.18899 13.4446 5.60999 11.995 7.23319Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconPin = (  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Pin</title>
<path
  d="M18.25 11C18.25 15 12 19.25 12 19.25C12 19.25 5.75 15 5.75 11C5.75 7.5 8.68629 4.75 12 4.75C15.3137 4.75 18.25 7.5 18.25 11Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M12 13.25C13.2426 13.25 14.25 12.2426 14.25 11C14.25 9.75736 13.2426 8.75 12 8.75C10.7574 8.75 9.75 9.75736 9.75 11C9.75 12.2426 10.7574 13.25 12 13.25Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconShoppingCart = (  <svg viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Shopping Cart</title>
<path
  d="M7.75 7.75L7 4.75H4.75M7.75 7.75H19.25L17.6128 14.7081C17.4002 15.6115 16.5941 16.25 15.666 16.25H11.5395C10.632 16.25 9.83827 15.639 9.60606 14.7618L7.75 7.75Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M10 20C10.5523 20 11 19.5523 11 19C11 18.4477 10.5523 18 10 18C9.44772 18 9 18.4477 9 19C9 19.5523 9.44772 20 10 20Z"
  fill={iconColor}
/>
<path
  d="M17 20C17.5523 20 18 19.5523 18 19C18 18.4477 17.5523 18 17 18C16.4477 18 16 18.4477 16 19C16 19.5523 16.4477 20 17 20Z"
  fill={iconColor}
/>
</svg>)
const IconCoffee = (  <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<title>Coffee</title>
<path
  d="M7.25 8.75H6.75C5.64543 8.75 4.75 9.64543 4.75 10.75V13.25C4.75 14.3546 5.64543 15.25 6.75 15.25H7.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M19.25 5.75H7.75V16.25C7.75 17.3546 8.64543 18.25 9.75 18.25H17.25C18.3546 18.25 19.25 17.3546 19.25 16.25V5.75Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconWorld = (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>World</title>
<path
  d="M12 19.25C16.0041 19.25 19.25 16.0041 19.25 12C19.25 7.99594 16.0041 4.75 12 4.75C7.99594 4.75 4.75 7.99594 4.75 12C4.75 16.0041 7.99594 19.25 12 19.25Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M15.25 12C15.25 16.5 13.2426 19.25 12 19.25C10.7574 19.25 8.75 16.5 8.75 12C8.75 7.5 10.7574 4.75 12 4.75C13.2426 4.75 15.25 7.5 15.25 12Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M5 12H12H19"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconTable = (  <svg
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <title>Table</title>
  <rect
    x="5"
    y="5"
    width="14"
    height="14"
    rx="2.4"
    fill={iconColor}
  />
  <rect
    x="12"
    y="12"
    width="7"
    height="7"
    rx="2.4"
    fill={iconColor}
  />
  <path
    fillRule="evenodd"
    clipRule="evenodd"
    d="M7.58623 4.07617H7.61141H16.3886H16.4138C16.9043 4.07616 17.3094 4.07615 17.6392 4.10311C17.9818 4.1311 18.2968 4.19118 18.5926 4.34191C19.0513 4.57565 19.4243 4.94864 19.658 5.4074C19.8088 5.70322 19.8688 6.01816 19.8969 6.36078C19.9237 6.69063 19.9238 7.09558 19.9238 7.58622V7.61141V16.3886V16.4138C19.9238 16.9043 19.9237 17.3094 19.8969 17.6392C19.8688 17.9818 19.8088 18.2968 19.658 18.5926C19.4243 19.0513 19.0513 19.4243 18.5926 19.658C18.2968 19.8088 17.9818 19.8688 17.6392 19.8969C17.3094 19.9237 16.9043 19.9238 16.4138 19.9238H16.3886H7.61141H7.58622C7.09558 19.9238 6.69063 19.9237 6.36078 19.8969C6.01816 19.8688 5.70322 19.8088 5.4074 19.658C4.94864 19.4243 4.57565 19.0513 4.34191 18.5926C4.19118 18.2968 4.1311 17.9818 4.10311 17.6392C4.07615 17.3094 4.07616 16.9043 4.07617 16.4138V16.3886V7.61141V7.58623V7.58622C4.07616 7.09558 4.07615 6.69063 4.10311 6.36078C4.1311 6.01816 4.19118 5.70322 4.34191 5.4074C4.57565 4.94864 4.94864 4.57565 5.4074 4.34191C5.70322 4.19118 6.01816 4.1311 6.36078 4.10311C6.69065 4.07615 7.09559 4.07616 7.58623 4.07617ZM6.46004 5.3181C6.19281 5.33994 6.05616 5.37951 5.96082 5.42808C5.73145 5.54496 5.54496 5.73145 5.42808 5.96082C5.37951 6.05616 5.33994 6.19281 5.3181 6.46004C5.29569 6.73438 5.29521 7.0893 5.29521 7.61141V11.3905H11.3905V5.29521H7.61141C7.0893 5.29521 6.73438 5.29569 6.46004 5.3181ZM11.3905 12.6095H5.29521V16.3886C5.29521 16.9107 5.29569 17.2656 5.3181 17.54C5.33994 17.8072 5.37951 17.9439 5.42808 18.0392C5.54496 18.2686 5.73145 18.4549 5.96082 18.5719C6.05616 18.6205 6.19281 18.66 6.46004 18.6818C6.73438 18.7042 7.0893 18.7048 7.61141 18.7048H11.3905V12.6095ZM12.6095 12.6095H18.7048V16.3886C18.7048 16.9107 18.7042 17.2656 18.6818 17.54C18.66 17.8072 18.6205 17.9439 18.5719 18.0392C18.4549 18.2686 18.2686 18.4549 18.0392 18.5719C17.9439 18.6205 17.8072 18.66 17.54 18.6818C17.2656 18.7042 16.9107 18.7048 16.3886 18.7048H12.6095V12.6095ZM18.7048 11.3905H12.6095V5.29521H16.3886C16.9107 5.29521 17.2656 5.29569 17.54 5.3181C17.8072 5.33994 17.9439 5.37951 18.0392 5.42808C18.2686 5.54496 18.4549 5.73145 18.5719 5.96082C18.6205 6.05616 18.66 6.19281 18.6818 6.46004C18.7042 6.73438 18.7048 7.0893 18.7048 7.61141V11.3905Z"
    fill={iconColor}
  />
</svg>)
const IconAnnotationWarning = (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Annotation Warning</title>
<path
  d="M4.75 6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H17.25C18.3546 4.75 19.25 5.64543 19.25 6.75V14.25C19.25 15.3546 18.3546 16.25 17.25 16.25H14.625L12 19.25L9.375 16.25H6.75C5.64543 16.25 4.75 15.3546 4.75 14.25V6.75Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M12 8V10"
  stroke={iconColor}
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M12.5 13C12.5 13.2761 12.2761 13.5 12 13.5C11.7239 13.5 11.5 13.2761 11.5 13C11.5 12.7239 11.7239 12.5 12 12.5C12.2761 12.5 12.5 12.7239 12.5 13Z"
  stroke={iconColor}
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconFrame = (  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Frame</title>
<path
  d="M4.75 19.25L9 18.25L18.9491 8.30083C19.3397 7.9103 19.3397 7.27714 18.9491 6.88661L17.1134 5.05083C16.7228 4.6603 16.0897 4.6603 15.6991 5.05083L5.75 15L4.75 19.25Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M14.0234 7.03906L17.0234 10.0391"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconPaperclip = (  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Paperclip</title>
<path
  d="M19.4496 11.9511L13.3335 17.8601C11.4156 19.7131 8.30597 19.7131 6.38804 17.8601C4.46306 16.0003 4.47116 12.9826 6.4061 11.1325L12.0503 5.70077C13.3626 4.43292 15.4902 4.43291 16.8025 5.70075C18.1196 6.97323 18.114 9.038 16.7901 10.3039L11.0824 15.7858C10.374 16.4702 9.22538 16.4702 8.51694 15.7858C7.80849 15.1013 7.80849 13.9916 8.51695 13.3071L13.2435 8.74068"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconWallet = (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Wallet</title>
<path
  d="M19.25 8.25V17.25C19.25 18.3546 18.3546 19.25 17.25 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V6.75"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M16.5 13C16.5 13.2761 16.2761 13.5 16 13.5C15.7239 13.5 15.5 13.2761 15.5 13C15.5 12.7239 15.7239 12.5 16 12.5C16.2761 12.5 16.5 12.7239 16.5 13Z"
  stroke={iconColor}
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M17.25 8.25H19.25M17.25 8.25H6.5C5.5335 8.25 4.75 7.4665 4.75 6.5C4.75 5.5335 5.5335 4.75 6.5 4.75H15.25C16.3546 4.75 17.25 5.64543 17.25 6.75V8.25Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconStar = (  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Star</title>
<path
  d="M12 4.75L13.75 10.25H19.25L14.75 13.75L16.25 19.25L12 15.75L7.75 19.25L9.25 13.75L4.75 10.25H10.25L12 4.75Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconCrown = (  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Crown</title>
<path
  d="M4.75 16.25V5.75L9 11.25L12 5.75L15 11.25L19.25 5.75V16.25C19.25 16.25 18 18.25 12 18.25C6 18.25 4.75 16.25 4.75 16.25Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconBattery = (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Battery</title>
<path
  d="M4.75 8.75C4.75 7.64543 5.64543 6.75 6.75 6.75H15.25C16.3546 6.75 17.25 7.64543 17.25 8.75V15.25C17.25 16.3546 16.3546 17.25 15.25 17.25H6.75C5.64543 17.25 4.75 16.3546 4.75 15.25V8.75Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M7.75 9.75V14.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M11 9.75V14.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M14.25 9.75V14.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M17.75 10.75H18C18.6904 10.75 19.25 11.3096 19.25 12C19.25 12.6904 18.6904 13.25 18 13.25H17.75"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconHappy = (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Happy</title>
<path
  d="M8.75 4.75H15.25C17.4591 4.75 19.25 6.54086 19.25 8.75V15.25C19.25 17.4591 17.4591 19.25 15.25 19.25H8.75C6.54086 19.25 4.75 17.4591 4.75 15.25V8.75C4.75 6.54086 6.54086 4.75 8.75 4.75Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M7.75 12.75C7.75 12.75 9 15.25 12 15.25C15 15.25 16.25 12.75 16.25 12.75"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M14 11C14.5523 11 15 10.5523 15 10C15 9.44772 14.5523 9 14 9C13.4477 9 13 9.44772 13 10C13 10.5523 13.4477 11 14 11Z"
  fill={iconColor}
/>
<path
  d="M10 11C10.5523 11 11 10.5523 11 10C11 9.44772 10.5523 9 10 9C9.44772 9 9 9.44772 9 10C9 10.5523 9.44772 11 10 11Z"
  fill={iconColor}
/>
</svg>)
const IconKey = (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Key</title>
<path
  d="M15 13.25C17.3472 13.25 19.25 11.3472 19.25 9C19.25 6.65279 17.3472 4.75 15 4.75C12.6528 4.75 10.75 6.65279 10.75 9C10.75 9.31012 10.7832 9.61248 10.8463 9.90372L4.75 16V19.25H8L8.75 18.5V16.75H10.5L11.75 15.5V13.75H13.5L14.0963 13.1537C14.3875 13.2168 14.6899 13.25 15 13.25Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M16.5 8C16.5 8.27614 16.2761 8.5 16 8.5C15.7239 8.5 15.5 8.27614 15.5 8C15.5 7.72386 15.7239 7.5 16 7.5C16.2761 7.5 16.5 7.72386 16.5 8Z"
  stroke={iconColor}
/>
</svg>)
const IconMoon = (  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Moon</title>
<path
  d="M18.25 15.7499C17.2352 16.2904 16.23 16.25 15 16.25C10.9959 16.25 7.75 13.0041 7.75 9.00001C7.75 7.77001 7.70951 6.76474 8.25 5.74994C5.96125 6.96891 4.75 9.2259 4.75 12C4.75 16.004 7.99594 19.25 12 19.25C14.7741 19.25 17.031 18.0387 18.25 15.7499Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M16 4.75C16 6.95914 14.9591 9 12.75 9C14.9591 9 16 11.0409 16 13.25C16 11.0409 17.0409 9 19.25 9C17.0409 9 16 6.95914 16 4.75Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)

const IconLightBulb = (  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>LightBulb</title>
<path
  d="M10.2 16.75H14.2M6.94995 10C6.94995 7.5 8.69995 4.75 12.2 4.75C15.7 4.75 17.45 7.5 17.45 10C17.45 14 14.45 14.5 14.45 16V18.2505C14.45 18.8028 14.0022 19.25 13.45 19.25H10.95C10.3977 19.25 9.94995 18.8028 9.94995 18.2505V16C9.94995 14.5 6.94995 14 6.94995 10Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconHealth = (  <svg fill="none" viewBox="0 0 24 24">
<title>Health</title>
<path
  stroke={iconColor}
  strokeLinecap="round"
  strokeLinejoin="round"
  strokeWidth="1.5"
  d="M18.0061 12L12 5.9939C10.3415 4.33537 7.65244 4.33537 5.9939 5.9939C4.33537 7.65244 4.33537 10.3415 5.9939 12L12 18.0061C13.6585 19.6646 16.3476 19.6646 18.0061 18.0061C19.6646 16.3476 19.6646 13.6585 18.0061 12Z"
/>
<path
  stroke={iconColor}
  strokeLinecap="round"
  strokeLinejoin="round"
  strokeWidth="1.5"
  d="M9 15L15 9"
/>
</svg>)
const IconCard = (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Card</title>
<path
  d="M4.75 7.75C4.75 6.64543 5.64543 5.75 6.75 5.75H17.25C18.3546 5.75 19.25 6.64543 19.25 7.75V16.25C19.25 17.3546 18.3546 18.25 17.25 18.25H6.75C5.64543 18.25 4.75 17.3546 4.75 16.25V7.75Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M5 10.25H19"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M7.75 14.25H10.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M15.75 14.25H16.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconMusic = (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Music</title>
<path
  d="M7 19.25C8.24264 19.25 9.25 18.2426 9.25 17C9.25 15.7574 8.24264 14.75 7 14.75C5.75736 14.75 4.75 15.7574 4.75 17C4.75 18.2426 5.75736 19.25 7 19.25Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M9.25 17V6.75C9.25 5.64543 10.1454 4.75 11.25 4.75H17.25C18.3546 4.75 19.25 5.64543 19.25 6.75V14"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M17 16.25C18.2426 16.25 19.25 15.2426 19.25 14C19.25 12.7574 18.2426 11.75 17 11.75C15.7574 11.75 14.75 12.7574 14.75 14C14.75 15.2426 15.7574 16.25 17 16.25Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconMovie = (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Movie</title>
<path
  d="M4.75 6.75C4.75 5.64543 5.64543 4.75 6.75 4.75H17.25C18.3546 4.75 19.25 5.64543 19.25 6.75V17.25C19.25 18.3546 18.3546 19.25 17.25 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V6.75Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M7.75 5V19"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M16.25 5V19"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M5 8.75H7.5"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M17 8.75H19"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M5 12H19"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M5 15.25H7.5"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M17 15.25H19"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconPeople = (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>People</title>
<path
  d="M11.25 7C11.25 8.24264 10.2426 9.25 9 9.25C7.75736 9.25 6.75 8.24264 6.75 7C6.75 5.75736 7.75736 4.75 9 4.75C10.2426 4.75 11.25 5.75736 11.25 7Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M14.75 9.25C15.9926 9.25 17.25 8.24264 17.25 7C17.25 5.75736 15.9926 4.75 14.75 4.75"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M9 9.75C5.6 9.75 4.75 11.5 4.75 14.25H6.75V17.25C6.75 18.3546 7.64543 19.25 8.75 19.25H9.25C10.3546 19.25 11.25 18.3546 11.25 17.25V14.25H13.25C13.25 11.5 12.4 9.75 9 9.75Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M14.75 9.25C18.15 9.25 19.25 11.5 19.25 14.25H17.25V17.25C17.25 18.3546 16.3546 19.25 15.25 19.25H14.75"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconServer = (  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Server</title>
<path
  d="M4.75 5.75C4.75 5.19772 5.19772 4.75 5.75 4.75H18.25C18.8023 4.75 19.25 5.19772 19.25 5.75V9.25C19.25 9.80228 18.8023 10.25 18.25 10.25H5.75C5.19771 10.25 4.75 9.80228 4.75 9.25V5.75Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M4.75 14.75C4.75 14.1977 5.19772 13.75 5.75 13.75H18.25C18.8023 13.75 19.25 14.1977 19.25 14.75V18.25C19.25 18.8023 18.8023 19.25 18.25 19.25H5.75C5.19771 19.25 4.75 18.8023 4.75 18.25V14.75Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M16.25 5V10"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M16.25 14V19"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconLeaf = (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Leaf</title>
<path
  d="M4.75 13C4.75 7.4 19.25 4.75 19.25 4.75C19.25 4.75 18.25 19.25 12 19.25C8 19.25 4.75 17 4.75 13Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M4.75 19.25C4.75 19.25 8 14 12.25 11.75"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconClock = (  <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<title>Clock</title>
<circle
  cx="12"
  cy="12"
  r="7.25"
  stroke={iconColor}
  strokeWidth="1.5"
/>
<path
  stroke={iconColor}
  strokeWidth="1.5"
  d="M12 8V12L14 14"
/>
</svg>)
const IconPercentage =  (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Percentage</title>
<path
  d="M17.25 6.75L6.75 17.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M16 17.25C16.6904 17.25 17.25 16.6904 17.25 16C17.25 15.3096 16.6904 14.75 16 14.75C15.3096 14.75 14.75 15.3096 14.75 16C14.75 16.6904 15.3096 17.25 16 17.25Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M8 9.25C8.69036 9.25 9.25 8.69036 9.25 8C9.25 7.30964 8.69036 6.75 8 6.75C7.30964 6.75 6.75 7.30964 6.75 8C6.75 8.69036 7.30964 9.25 8 9.25Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconBolt = (  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Bolt</title>
<path
  d="M10.75 13.25H6.75L13.25 4.75V10.75H17.25L10.75 19.25V13.25Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconCar = ( <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Car</title>
<path
  d="M18.2502 17.25H5.75C5.19772 17.25 4.75 16.8023 4.75 16.25V12.75C4.75 11.6454 5.64543 10.75 6.75 10.75H17.2502C18.3548 10.75 19.2502 11.6454 19.2502 12.75V16.25C19.2502 16.8023 18.8025 17.25 18.2502 17.25Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M8.5 14C8.5 14.2761 8.27614 14.5 8 14.5C7.72386 14.5 7.5 14.2761 7.5 14C7.5 13.7239 7.72386 13.5 8 13.5C8.27614 13.5 8.5 13.7239 8.5 14Z"
  stroke={iconColor}
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M16.5 14C16.5 14.2761 16.2761 14.5 16 14.5C15.7239 14.5 15.5 14.2761 15.5 14C15.5 13.7239 15.7239 13.5 16 13.5C16.2761 13.5 16.5 13.7239 16.5 14Z"
  stroke={iconColor}
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M18.2502 10.75H5.75L6.47147 6.4212C6.6322 5.45683 7.46657 4.75 8.44425 4.75H15.556C16.5337 4.75 17.368 5.45683 17.5288 6.4212L18.2502 10.75Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M6.75 17.75V19.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M17.25 17.75V19.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconMessage = (  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Message</title>
<path
  d="M12 18.25C15.866 18.25 19.25 16.1552 19.25 11.5C19.25 6.84483 15.866 4.75 12 4.75C8.13401 4.75 4.75 6.84483 4.75 11.5C4.75 13.2675 5.23783 14.6659 6.05464 15.7206C6.29358 16.0292 6.38851 16.4392 6.2231 16.7926C6.12235 17.0079 6.01633 17.2134 5.90792 17.4082C5.45369 18.2242 6.07951 19.4131 6.99526 19.2297C8.0113 19.0263 9.14752 18.722 10.0954 18.2738C10.2933 18.1803 10.5134 18.1439 10.7305 18.1714C11.145 18.224 11.5695 18.25 12 18.25Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconSunrise = (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Sunrise</title>
<path
  d="M9.25 16.25L8.5627 15.5C8.05157 14.7984 7.75 13.9344 7.75 13C7.75 10.6528 9.65279 8.75 12 8.75C14.3472 8.75 16.25 10.6528 16.25 13C16.25 13.9344 15.9484 14.7984 15.4373 15.5L14.75 16.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M4.74023 16.25H19.2502"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M6.74023 19.25H17.2502"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M12 4.75V5.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M15.625 5.72132L15.375 6.15433"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M18.2787 8.375L17.8457 8.625"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M19.25 12.0001H18.75"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M5.25 12H4.75"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M6.15445 8.62501L5.72144 8.37501"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M8.625 6.15435L8.375 5.72133"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconCompass = (  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Compass</title>
<path
  d="M19.25 12C19.25 16.0041 16.0041 19.25 12 19.25C7.99594 19.25 4.75 16.0041 4.75 12C4.75 7.99594 7.99594 4.75 12 4.75C16.0041 4.75 19.25 7.99594 19.25 12Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M10.409 10.409L15.2499 8.74997L13.591 13.591L8.75012 15.25L10.409 10.409Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconTrophy = (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Trophy</title>
<path
  d="M7.75 4.75H16.25V11C16.25 13.3472 14.3472 15.25 12 15.25C9.65279 15.25 7.75 13.3472 7.75 11V4.75Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M16.5 6.75H16.6036C18.0652 6.75 19.25 7.93483 19.25 9.39639C19.25 10.5092 18.5538 11.5032 17.508 11.8835L16.5 12.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M7.5 6.75H7.39639C5.93483 6.75 4.75 7.93483 4.75 9.39639C4.75 10.5092 5.44618 11.5032 6.49201 11.8835L7.5 12.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M12 15.5V19"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M8.75 19.25H15.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconVirus = (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Virus</title>
<path
  d="M16.25 12C16.25 14.3472 14.3472 16.25 12 16.25C9.65279 16.25 7.75 14.3472 7.75 12C7.75 9.65279 9.65279 7.75 12 7.75C14.3472 7.75 16.25 9.65279 16.25 12Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M10.75 4.75H13.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M10.75 19.25H13.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M12 5V7.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M12 16.75V19"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M16.2427 5.98959L18.0104 7.75736"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M5.98962 16.2426L7.75739 18.0104"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M16.9498 7.05025L15.3588 8.64124"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M8.64128 15.3588L7.05029 16.9498"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M19.25 10.7499V13.2499"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M4.75 10.7499V13.2499"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M19 11.9999H16.75"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M7.25 11.9999H5"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M18.0104 16.2426L16.2427 18.0104"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M7.75739 5.98959L5.98962 7.75736"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M16.9498 16.9498L15.3588 15.3588"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M8.64128 8.64124L7.05029 7.05025"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconPlane = (  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Plane</title>
<path
  d="M10 8.40685C10 7.34599 10.4214 6.32857 11.1716 5.57843L12 4.75L12.8284 5.57843C13.5786 6.32857 14 7.34599 14 8.40685V10.23L19.25 12.75V14.0773C19.25 14.6926 18.6996 15.1619 18.092 15.0647L14 14.41V17.5556L15.25 18.25V19.25H8.75V18.25L10 17.625V14.41L5.90799 15.0647C5.30041 15.1619 4.75 14.6926 4.75 14.0773V12.75L10 10.23V8.40685Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconEducation = (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Education</title>
<path
  d="M4.75 10L12 5.75L19.2501 10L12 14.25L4.75 10Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M12.5 10C12.5 10.2761 12.2761 10.5 12 10.5C11.7239 10.5 11.5 10.2761 11.5 10C11.5 9.72386 11.7239 9.5 12 9.5C12.2761 9.5 12.5 9.72386 12.5 10Z"
  stroke={iconColor}
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M6.75 11.5V16.25C6.75 16.25 8 18.25 12 18.25C16 18.25 17.25 16.25 17.25 16.25V11.5"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconSpider = (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Spider</title>
<path
  d="M7.75 13C7.75 10.6528 9.65279 8.75 12 8.75C14.3472 8.75 16.25 10.6528 16.25 13V15C16.25 17.3472 14.3472 19.25 12 19.25C9.65279 19.25 7.75 17.3472 7.75 15V13Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M12 9V19"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M8.75 6.38333C8.75 5.48127 9.48127 4.75 10.3833 4.75H13.6167C14.5187 4.75 15.25 5.48127 15.25 6.38333C15.25 7.41426 14.4143 8.25 13.3833 8.25H10.6167C9.58574 8.25 8.75 7.41426 8.75 6.38333Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M7.5 14.75L6.06651 15.2713C5.27613 15.5587 4.75 16.3098 4.75 17.1509V19.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M8 11L5.8018 9.81635C5.15398 9.46753 4.75 8.79118 4.75 8.05541V5.75"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M16.5 14.75L17.9335 15.2713C18.7239 15.5587 19.25 16.3098 19.25 17.1509V19.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M16 11L18.1982 9.81635C18.846 9.46753 19.25 8.79118 19.25 8.05541V5.75"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconRocket = (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Rocket</title>
<path
  d="M13.4556 6.85504C14.9314 5.50111 16.8613 4.74994 18.864 4.74994H19.2501V5.13607C19.2501 7.1388 18.4989 9.0687 17.145 10.5444L10.9948 17.2478L6.7522 13.0052L13.4556 6.85504Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M7.25 16.75L4.75 19.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M9.25 18.75L8.75 19.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M5.25 14.75L4.75 15.25"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M13 19.25L14.24 14L11 17.25L13 19.25Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M6.75 13L10 9.75L4.75 10.75L6.75 13Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconSparkles = (  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Sparkles</title>
<path
  d="M15 4.75C15 7.51142 13.5114 10 10.75 10C13.5114 10 15 12.4886 15 15.25C15 12.4886 16.4886 10 19.25 10C16.4886 10 15 7.51142 15 4.75Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M8 12.75C8 14.4069 6.40685 16 4.75 16C6.40685 16 8 17.5931 8 19.25C8 17.5931 9.59315 16 11.25 16C9.59315 16 8 14.4069 8 12.75Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)
const IconBeach = (<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<title>Beach</title>
<path
  d="M12 14.75C6 14.75 4.75 19.25 4.75 19.25H19.25C19.25 19.25 18 14.75 12 14.75Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M12 16.25V10"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
<path
  d="M12 4.75C9.23858 4.75 6.75 7.23858 6.75 10C6.75 10 7.75 8.75 9.375 8.75C11 8.75 12 10 12 10C12 10 13 8.75 14.625 8.75C16.25 8.75 17.25 10 17.25 10C17.25 7.23858 14.7614 4.75 12 4.75Z"
  stroke={iconColor}
  strokeWidth="1.5"
  strokeLinecap="round"
  strokeLinejoin="round"
/>
</svg>)



export const Card = ({
  children,
  title,
  description,
  img,
  notebook,
  icon,
  author,
  cardColor,
  newNotebook,
  template,
  avatar,
  education,
}) => (
  <a
    href={notebook}
    class="card-gallery zoom"
    style={{
      textDecoration: 'none',
      height: 'auto',
      width: '49%',
      marginBottom: '15px',
    }}
  >
    <div
      class="card shadow"
      style={{
        transition: 'box-shadow .1s',
        height: '100%',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E9F0',
        bordeRadius: '12px',
      }}
    >
      <div style={{
        height: '100%',
      }}>
        {/*
        <div
          style={{
            height: '20px',
            display: 'flex',
            position: 'absolute',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '6px',
              gap: '10px',
              backgroundColor: '#F5F7FA',
              borderRadius: '0px 0px 4px 4px',
              fontWeight: '500',
              fontSize: '12px',
              marginRight: '8px',
            }}
          >
            New
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '6px',
              gap: '10px',
              backgroundColor: '#F5F7FA',
              borderRadius: '0px 0px 4px 4px',
              fontWeight: '500',
              fontSize: '12px',
              marginRight: '12px',
            }}
          >
            Template
          </div>
        </div>
          */}
        <div
          style={{
            padding: '16px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '16px',
                lineHeight: '22px',
                letterSpacing: '-0.004em',
                marginBottom: '0px',
              }}
            >
              {title}
            </h2>
            <span
              style={{
                display: 'flex',
                marginTop: '5px',
              }}
            >
              <img
                style={{
                  width: '24px',
                  height: '24px',
                  marginRight: '5px',
                  borderRadius: '50%',
                }}
                src={avatar}
              ></img>
              <span
                style={{
                  color: '#777E89',
                  fontSize: '13px',
                }}
              >
                by {author}
              </span>
            </span>
            <span
              style={{
                marginTop: '16px',
                display: 'block',
                fontSize: '0.8em',
                lineHeight: '1.5em',
              }}
            >
              {description}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
            }}
          >
            <div
              style={{
                display: 'flex',
                marginTop: '15px',
                width: '24px',
                height: '24px',
                background: `var(${cardColor})`,
                borderRadius: '4px',
                textAlign: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '12px',
              }}
            >
              <div style={{
                width: '16px',
                height: '16px',
              }}
              >{icon}</div>
            </div>
            {newNotebook && newNotebookBadge}

            {template && templateBadge}

            {education && educationBadge}
          </div>
        </div>
      </div>
    </div>
  </a>
);

export const GridContainer = ({ children }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}
    >
      {children}
    </div>
  );
};

export default function Templates() {
  return (
    <div
      class="gallery"
      style={{
        backgroundColor: '#f4f6fa',
      }}
    >
      <div class="navbar-gallery-wrapper">
        <div class="navbar-gallery">
          <div class="header-gallery">
            <a href="https://www.decipad.com">
              <img
                src="https://uploads-ssl.webflow.com/61dda5267f2552f1a1c52b1f/622257a785a56d257a078fa0_Logomark.svg"
                loading="eager"
                alt=""
                className="logo-svg logo-gallery"
                style={{ backgroundColor: 'transparent' }}
              />
            </a>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <div class="login-gallery">
              <div
                style={{
                  marginLeft: '8px',
                  padding: '7px 12px 8px',
                  borderRadius: '10px',
                  backgroundColor: '#fff',
                  color: '#121213',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '500',
                  fontSize: '15px',
                  height: '30.5px',
                  lineHeight: '15px',
                  marginTop: '-0.3px',
                }}
              >
                <a
                  href="https://alpha.decipad.com/"
                  style={{
                    color: '#121213',
                    fontSize: '14px',
                    textDecoration: 'none',
                  }}
                >
                  Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          backgroundImage:
            'radial-gradient(circle farthest-corner at 50% -30%, #fafcff, #f2f5f9 30%, #fff 90%)',
        }}
      >
        <div
          style={{
            maxWidth: '800px',
            margin: 'auto',
            marginTop: '100px',
            paddingBottom: '120px',
          }}
        >
          <div
            class="fadeIn"
            style={{
              margin: '20px',
            }}
          >
            <div
              style={{
                marginBottom: '90px',
              }}
            >
              <center>
                <h1
                  class="title-gallery"
                  style={{
                    fontFamily: 'Alliance, sans-serif',
                    fontSize: '60px',
                    lineHeight: '120%',
                    fontWeight: '500',
                  }}
                >
                  Decipad Templates
                </h1>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '20px',
                    color: '#5f6486',
                    margin: '0px 50px',
                  }}
                >
                  Explore templates and notebooks from the team and community
                </p>
              </center>
            </div>
            {/*
            <h2>Commercial Teams</h2>
            <GridContainer>
              <Card
                author="Nuno Job"
                cardColor="--card-green"
                icon="🤒"
                title="SDR Compensation Package"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com"
                description="Missing"
              />
            </GridContainer>
                */}
            <br></br>
            <h2>Human Resources</h2>
            <GridContainer>
              <Card
                author="Kelly McEttrick"
                cardColor="--card-yellow"
                icon={IconLeaf}
                title="Offer letter template"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/You-re-hired-Offer-Letter%3Am5plUls5fkWflsneZcJNQ"
                description="Offer letters at startups most often include stock base compensation. Use this template to explain how these work and next steps"
                template
                avatar={avatarKelly}
              />
              <Card
                author="Kelly McEttrick"
                cardColor="--card-green"
                icon={IconLeaf}
                title="Understanding stock options"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Understanding-stock-options-at-an-early-stage-startup%3ArSztWxWyHRz3wp-1sm13M"
                description="How equity compensation works? How much will your stock options be worth in the future?"
                avatar={avatarKelly}
              />
              <Card
                author="Kelly McEttrick"
                cardColor="--card-blue"
                icon={IconPercentage}
                title="Performance summary letter template"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/-Template-Performance-summary-letter-%3AjuzNZDn4zNSqn2Rz14pKn"
                description="Compensation adjustments are often based on performance and a formula. Use this template to communicate adjustments"
                template
                avatar={avatarKelly}
              />
              <Card
                author="Nuno Job"
                cardColor="--card-pink"
                icon={IconCoffee}
                title="Adjusting employee compensation when moving countries"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/Emily-in-Paris%3AmCTaRvBPOskMxCEKeKKxt?secret=Zhm1ToqvarE6ZzXHJU2Cn"
                description="A notebook that breaks down the calculations behind salary adjustments when moving cities"
                avatar={avatarNuno}
              />
            </GridContainer>

            <br></br>
            <h2>Software Engineering</h2>
            <GridContainer>
              <Card
                author="Fabio Santos"
                cardColor="--card-blue"
                icon={IconServer}
                title="Picking the right GitHub plan for your team"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Should-I-upgrade-to-Github-s-Enterprise-plan-%3AFlwvRkd6oiuePyH7MNzan"
                description="Explores different plan scenarios depending on your team's GitHub usage"
                avatar={avatarFabio}
              />
            </GridContainer>

            <br></br>
            <h2>Starting your first business</h2>
            <GridContainer>
            <Card
                author="Kelly McEttrick"
                cardColor="--card-green"
                icon={IconCard}
                title="Invoice template"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/Invoice-for-Professional-Services%3AbvG3oSIDSMoZxx5oFHQ4r"
                description="This notebook showcases how you can create an invoice on Decipad"
                template
                avatar={avatarKelly}
              ></Card>
              <Card
                author="Simão Dias"
                cardColor="--card-purple"
                icon={IconSparkles}
                title="Start a business"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/-Starting-a-Candle-Business%3AJTYAmhcwfINZobogKoEbU"
                description="Example on how to break down and forecast financials of a businees before starting"
                avatar={avatarSimao}
              />
              <Card
                author="Giulia Camargo"
                cardColor="--card-yellow"
                icon={IconStar}
                title="Pricing a consulting project"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/-Consulting-Projects-Fee-Estimation%3A8Kx9X0612rXUElUSVFl0S?secret=qdQBEsgCdMvnh-D6_JGxp"
                description="Landed a new project? Use this model to understand how to calculate staff allocation, project expenses, and target rates"
                avatar={avatarGiulia}
              />
              {/* <Card
                author="Nuno Job"
                cardColor="--card-green"
                icon="🤔"
                title="How much money do I need to start my business?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/Simple-Cashflow%3Ak1Zw0l2QmvbU5DIJ_XWxu?secret=vgzyDwDdJhTNN1SccetIe"
                description="Use this notebook to understand your cashflow and project the initial investment you need"
              ></Card> */}
              {/* <Card
                author="Nuno Job"
                cardColor="--card-green"
                icon="🤒"
                title=" Build a new gym"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com"
                description="Missing"
            /> */}
              <Card
                author="Giulia Camargo"
                cardColor="--card-white"
                icon={IconKey}
                title="Restaurant Pricing"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Is-my-restaurant-profitable-%3AJ0dGd6P-2FCtBN-RaULz4"
                description="Use this model to understand how you should price the meals at your restaurant in order to be profitable"
                avatar={avatarGiulia}
              />
              {/* <Card
                author="Nuno Job"
                cardColor="--card-green"
                icon="🤒"
                title=" Trojan Financials"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com"
                description="Missing"
          /> */}
            </GridContainer>

            <br></br>
            <h2>Venture funding</h2>

            <GridContainer>
              {/* <Card
                author="Nuno Job"
                cardColor="--card-green"
                icon="🤒"
                title="Pro-rata calculator for your next round"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com"
                description="Missing"
        /> */}
              <Card
                author="Nuno Job"
                cardColor="--card-blue"
                icon={IconRocket}
                title="A founders guide to pricing your first round"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/A-founders-guide-to-pricing-your-first-round%3AEIfsPUrmoNZDMtGHYuxMW"
                description="Before you negotiate your first VC round, you might have a simple cap. This Notebook goes over the math and breaks it down"
                avatar={avatarNuno}
              />
              <Card
                author="Nuno Job"
                cardColor="--card-yellow"
                icon={IconAnnotationWarning}
                title="A founder's guide to liquidation preference"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/A-founder-s-guide-to-liquidation-preference-startup-demo%3A789aAn-CwBN1JoxDCZxjn"
                description="When negotiating your term sheet, you will likely find liquidation preference as one of the terms. So, what does it mean?"
                avatar={avatarNuno}
              />
              {/* <Card
                author="Nuno Job"
                cardColor="--card-green"
                icon="🤒"
                title="Profit sharing with founders for a VC fund"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com"
                description="Missing"
    /> */}
            </GridContainer>

            <br></br>
            <h2>Corporate Finance</h2>
            <GridContainer>
              <Card
                author="Kelly McEttrick"
                cardColor="--card-green"
                icon={IconWorld}
                title="$AAPL, interest rates and the stock market"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/Rising-interest-rates-and-AAPL-share-price%3AGwKX8lzGM5tDFJ3aV6eTJ"
                description="You’ve probably been hearing a lot about interest rates lately. Check out this model that shows why they have been making the markets go wild"
                avatar={avatarKelly}
              />
              {/*
              <Card
                author="Nuno Job"
                cardColor="--card-green"
                icon="🤒"
                title="Vera Cruz"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com"
                description="Missing"
              />
              */}
            </GridContainer>

            <br></br>
            <h2>Personal Finance</h2>
            <GridContainer>
            <Card
                author="Nuno Job"
                cardColor="--card-green"
                icon={IconRocket}
                title="How much money do I get on a savings account?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/How-much-money-do-I-get-on-a-savings-account-Template%3AynrEw3tTP1a6MVrUYbM_3"
                description="Some institutions pay interest when you open a savings account. Use this template to check how much money you will get after taxes"
                template
                newNotebook
                avatar={avatarNuno}
              />
              <Card
                author="Peyton Swift"
                cardColor="--card-green"
                icon={IconRocket}
                title="When can I retire?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/-Decode-F-I-R-E-%3AD8PUgXa8VQxoCIWi7Tq4A?secret=JTq7qfP3q_qbNGsYAm_Uu"
                description="Use the F.I.R.E model (Financial Independence, Retire Early) to understand how you can become work optional"
                avatar={avatarPeyton}
              />
              <Card
                author="PeytonSwift"
                cardColor="--card-green"
                icon={IconRocket}
                title="Can I afford all these subscriptions?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/-Subscription-Tracker%3Awy0DuDrADXjoUOsW59iTc?secret=DpImmwlNWuLdw4XYUhldd"
                description="Everything is using a subscription model nowadays. Use this model to understand your expenses"
                avatar={avatarPeyton}
              />
              <Card
                author="Kelly McEttrick"
                cardColor="--card-green"
                icon={IconRocket}
                title="Should you negotiate your salary?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/How-much-are-you-losing-during-your-lifetime-if-you-don-t-negotiate-your-salary-%3Ah65Y4c99Swzn9smvVNyMC"
                description="Your salary is much like investing: where you start impacts your total return. Explore the numbers on this notebook to see how much you would be losing"
                avatar={avatarKelly}
              />
              <Card
                author="Simão Dias"
                cardColor="--card-white"
                icon={IconAnnotationWarning}
                title="Interest Rates? How much are they costing me?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/Interest-Rates-How-much-are-they-costing-me-%3AKQ6BCwfuv1ijdQcSmiki7"
                description="It's important to understand how much of your monthly payment is going to the principal (ie. to repay your owed money) and how much is going to fees and interest"
                avatar={avatarSimao}
              />
            </GridContainer>

            <br></br>
            <h2>Climate Change</h2>
            <GridContainer>
              {/* <Card
                author="Nuno Job"
                cardColor="--card-green"
                icon="🤒"
                title="Cost effectiveness of solar panels"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com"
                description="Missing"
            /> */}
              <Card
                author="Nuno Job"
                cardColor="--card-blue"
                icon={IconCar}
                title="Should I buy an electric car?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/-Should-I-buy-an-electric-car-%3AX94KlVvqJDUvIqt-9mv93"
                description="Want to make the switch to electric? Use this model to understand how to calculate your savings potential"
                avatar={avatarNuno}
              />
              {/* <Card
                author="Nuno Job"
                cardColor="--card-green"
                icon="🤒"
                title="Should I change my electric car energy tariff"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com"
                description="Missing"
          /> */}
              <Card
                author="Peyton Swift"
                cardColor="--card-yellow"
                icon={IconAnnouncement}
                title="How much can I save if I stop using my air conditioning?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Copy-of-How-much-can-I-save-if-I-stop-using-my-air-conditioning-Yen-%3AuzEyS4KVhhLGRq8RWO0Ua"
                description="As Europe copes with rising energy prices, the Spanish government has asked citizens to turn down the A/C"
                avatar={avatarPeyton}
              />
              <Card
                author="Giulia Camargo"
                cardColor="--card-green"
                icon={IconRocket}
                title="Earth Overshoot Day"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Earth-Overshoot-Day%3AafAklYs-D00_535FlF4qJ"
                description="Each year's #EarthOvershootDay
                marks when humanity’s demand for ecological resources exceeds what the earth can regenerate in a year. Have you ever wondered how it is calculated?"
                avatar={avatarGiulia}
              />
            </GridContainer>

            <br></br>
            <h2>Sports</h2>
            <GridContainer>
              <Card
                author="Kelly McEttrick"
                cardColor="--card-green"
                icon={IconRocket}
                title="How to build up your runs this summer"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/How-to-build-up-your-runs-this-summer-consumer-demo%3ApBMgmhZf4YbMZhvkm1bBM"
                description="Make a plan to increase the distance you can run"
                avatar={avatarKelly}
              />
              <Card
                author="Nuno Job"
                cardColor="--card-green"
                icon={IconRocket}
                title="Comparing your triathlon times to Olympic gold winners"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Triathlon-times-demo-consumer%3ABiAU1Doi3hknMbRVJ7wj0"
                description="Ever wonder how your triathlon time can compare to elite athletes? Explore the calculations"
                avatar={avatarNuno}
              />
              <Card
                author="Peyton Swift"
                cardColor="--card-green"
                icon={IconRocket}
                title="Improving your 5k time"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Improving-your-5k-time-demo-consumer%3Aauj_wnWdSnuTw2XjNn_nP"
                description="Simple calculations on how to improve running times"
                avatar={avatarPeyton}
              />
              <Card
                author="Giulia Camargo"
                cardColor="--card-blue"
                icon={IconVirus}
                title="What size should my skis be?"
                img="https://user-images.githubusercontent.com/12210180/174139877-d558a1ac-b995-4848-a7a7-f42cd53e3401.png"
                notebook="https://alpha.decipad.com/n/-What-size-skis-do-I-need-%3AHAxnPfO0e4H9MHoig3zFG?secret=VDoYnnowEi8imsPqvUyWT"
                description="Going to the mountains? Use this model to learn how to calculate your perfect ski size"
                avatar={avatarGiulia}
              />
            </GridContainer>

            <br></br>
            <h2>Current affairs</h2>
            <GridContainer>
              <Card
                author="Simão Dias"
                cardColor="--card-green"
                icon={IconRocket}
                title="Revenue from Twitter Verification"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Let-s-do-the-Math-Revenue-from-Twitter-Verification:pFbOpkpXR_5O-hJGIjTSy"
                description="How much revenue could Twitter bring by charging for verification?"
                avatar={avatarSimao}
                newNotebook
              />
            </GridContainer>

            <br></br>
            <h2>Health</h2>
            <GridContainer>
              <Card
                author="Anna"
                cardColor="--card-purple"
                icon={IconMoon}
                title="Sleep cycle calculator"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Sleep-Cycle-Calculator%3AAbwnpuSIBDV4Kx6gl1kAw"
                description="Wondering why you’re waking up tired? Maybe it’s because you’re not respecting your sleep cycle!"
                avatar={avatarAnna}
              />
              <Card
                author="John Costa"
                cardColor="--card-green"
                icon={IconRocket}
                title="What's the real price of social media"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Copy-of-What-s-the-real-price-of-social-media-%3AERjndAreui5OGaP_lqZRM"
                description="What would happen if you reallocated a portion of your social media time into productive work hours?"
                avatar={avatarJohn}
              />
            </GridContainer>

            <br></br>
            <h2>Fun</h2>
            <GridContainer>
              <Card
                author="Nuno Job"
                cardColor="--card-yellow"
                icon={IconCoffee}
                title="How to make the perfect cup of coffee?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/How-to-make-the-perfect-cup-of-coffee-%3AhSp6SmazqhsvafYO9QRsZ"
                description="Brewing coffee is a science. Understand the math behind it and get personalized instructions to make drip coffee with this notebook"
                avatar={avatarNuno}
              />
              <Card
                author="Simão Dias"
                cardColor="--card-green"
                icon={IconRocket}
                title="Bitcoins, or Burgers?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Bitcoins-or-Burgers-%3AuMSqYhchnox64XIQm4iwe"
                description="Find how many hambuergers you can buy with your Bitcoin"
                avatar={avatarSimao}
              />
              {/*
              <Card
                author="Nuno Job"
                cardColor="--card-green"
                icon="🤔"
                title="Rounding, fact checking xkcd "
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://dev.decipad.com/n/Rounding-xkcd-2585-demo-consumer%3AMi0x3omXZH0mJ0C9JEuP0"
                description="Using the Decipad language to fact xkcd"
              />
        */}
            </GridContainer>
            {/*
            <br></br>
            <h2>Science</h2>
            <GridContainer>
              <Card
                author="João Pena"
                cardColor="--card-yellow"
                icon="🪨"
                title="How does gravity work?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/Q5sDRcpQ4lYSg84Hrs3gf?secret=Bf2nWPe5ZAuDJL9MEWP1L"
                description="How much force do you exert on earth? Use this model to learn some physics fundamentals!"
              />
            </GridContainer>
*/}
            {/*
            <br></br>
            <h2>Kids</h2>
            <GridContainer>

              <Card
                author="Simão Dias"
                cardColor="--card-green"
                icon="🐇"
                title="Step to Bunny Hop Converter"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com"
                description="Interactive playground to calculate bunny hops"
              />
              <Card
                author="Nuno Job"
                cardColor="--card-blue"
                icon="🏛"
                title="Roman Numerals"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com"
                description="Roman numerals using the Decipad Language"
              />
              <Card
                author="Nuno Job"
                cardColor="--card-yellow"
                icon="🪶"
                title="Alice in Feathers"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com"
                description="Powerful unit conversion with the Decipad Language"
              />
            </GridContainer>
            */}
            <hr></hr>
            <br></br>
            <center>
              <h1>Didn't find what you need?</h1>
              <br></br>
              <p>
                We can help you build it! Talk to us on{' '}
                <u>
                  <a href="https://discord.com/invite/HwDMqwbGmc">Discord</a>
                </u>
                , or via email{' '}
                <u>
                  <a href="mailto:support@decipad.com">support@decipad.com</a>
                </u>
                .
              </p>
            </center>
          </div>
        </div>
      </div>
    </div>
  );
}
