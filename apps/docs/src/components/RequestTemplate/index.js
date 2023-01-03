export const RequestTemplate = (
  <>
    <h1>Didn't find the right template?</h1>
    <form
      style={{
        marginTop: '25px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: '0px',

        position: 'relative',
        maxWidth: '407px',
        height: '45px',

        background: '#FFFFFF',
        border: '0.8px solid #DADFF2',
        borderRadius: '8px',
      }}
    >
      <input
        type="text"
        id="fname"
        name="fname"
        placeholder="Template Name"
        style={{
          width: '100%',
          height: '45px',
          paddingLeft: '10px',
          paddingRight: '10px',
          textAlign: 'left',

          fontFamily: 'Inter',
          fontStyle: 'normal',
          fontWeight: '500',
          fontSize: '14px',
          lineHeight: '150%',
          color: '#5F6486',
          borderRadius: '8px',

          opacity: '0.6',
        }}
      ></input>
      <input
        type="submit"
        class="zoom"
        value="Request Template"
        style={{
          alignSelf: 'center',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '0px 20px',
          gap: '6px',
          marginRight: '2px',

          height: '41px',

          background: '#C1FA6B',
          borderRadius: '6px',

          flex: 'none',
          order: '1',
          flexGrow: '0',
          fontFamily: 'Inter',
          fontStyle: 'normal',
          fontWeight: '600',
          fontSize: '14px',
          lineHeight: '150%',
        }}
      ></input>
    </form>
  </>
);
