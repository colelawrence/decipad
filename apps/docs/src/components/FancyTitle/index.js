export const Stars = (
  <svg
    width="25"
    height="24"
    viewBox="0 0 25 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.6 4.75C17.6 5.89705 16.497 7 15.35 7C16.497 7 17.6 8.10295 17.6 9.25C17.6 8.10295 18.7029 7 19.85 7C18.7029 7 17.6 5.89705 17.6 4.75Z"
      stroke="#777e89"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M17.6 14.75C17.6 15.8971 16.497 17 15.35 17C16.497 17 17.6 18.1029 17.6 19.25C17.6 18.1029 18.7029 17 19.85 17C18.7029 17 17.6 15.8971 17.6 14.75Z"
      stroke="#777e89"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M9.59998 7.75C9.59998 9.91666 7.51663 12 5.34998 12C7.51663 12 9.59998 14.0833 9.59998 16.25C9.59998 14.0833 11.6833 12 13.85 12C11.6833 12 9.59998 9.91666 9.59998 7.75Z"
      stroke="#777e89"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export const Hammer = (
  <svg
    width="25"
    height="24"
    viewBox="0 0 25 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.55 13.25V10.25H9.05005V11.25C9.05005 11.8023 8.60233 12.25 8.05005 12.25H6.55005C5.99776 12.25 5.55005 11.8023 5.55005 11.25V5.75C5.55005 5.19772 5.99776 4.75 6.55005 4.75H8.05005C8.60233 4.75 9.05005 5.19772 9.05005 5.75V6.75H15.8C15.8 6.75 20.05 6.75 20.05 11.25C20.05 11.25 17.8 10.25 15.05 10.25V13.25M11.55 13.25H15.05M11.55 13.25V19.25M15.05 13.25V19.25"
      stroke="#777e89"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export const FancyTitle = ({ children, icon }) => {
  return (
    <span
      style={{
        display: 'flex',
        float: 'left',
      }}
    >
      <div
        style={{
          marginTop: '2px',
          marginRight: '3px',
          color: '#eee',
        }}
      >
        {icon}
      </div>
      {children}
    </span>
  );
};
