export const FeedbackRelease = (
  <div
    style={{
      marginTop: '55px',
    }}
  >
    <h3>How would you rate this?</h3>
    <form
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        height: '45px',
        position: 'relative',
        maxWidth: '407px',
        height: '45px',
      }}
    >
      <span
        style={{
          margin: 'auto',
          cursor: 'pointer',
          fontSize: '32px',
        }}
      >
        <input
          class="zoomRating"
          value="💚"
          style={{
            width: '60px',
          }}
        ></input>
        <input
          class="zoomRating"
          value="👏"
          style={{
            width: '60px',
          }}
        ></input>
        <input
          class="zoomRating"
          value="😍"
          style={{
            width: '60px',
          }}
        ></input>
        <input
          class="zoomRating"
          value="🎉"
          style={{
            width: '60px',
          }}
        ></input>
      </span>
    </form>
  </div>
);
