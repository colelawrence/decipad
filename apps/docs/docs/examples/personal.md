---
sidebar_position: 300
---

# Personal Notebooks

## Hobbies

export const Card =({children,title,description,img,notebook}) => (
  <a href={notebook} style={{textDecoration: "none", height: "auto", width: "49%", marginBottom: "15px"}}> <div class="card" style={{
  borderRadius: "3px",
  height: "100%",
  backgroundColor: "var(--ifm-code-background)"}
  }>
  <div >
<></>
  <div style={{padding: "18px 25px 20px 25px"}}>
    <b>{title}</b>
    <br></br>
      <span style={{marginTop: "5px", display: "block", fontSize: "0.8em", lineHeight: "1.5em"}} >{description}</span>
  </div>
</div>
</div>
</a>
);

<gridContainer style= {{  
display: "flex",
flex: "0 1 calc(25% - 1em)",
   justifyContent: "space-between",
   flexWrap: "wrap",
  }}>

<Card title="What size should my skis be?" img="https://user-images.githubusercontent.com/12210180/174139877-d558a1ac-b995-4848-a7a7-f42cd53e3401.png" notebook="https://alpha.decipad.com/n/-What-size-skis-do-I-need-%3AHAxnPfO0e4H9MHoig3zFG?secret=VDoYnnowEi8imsPqvUyWT" description="Going to the mountains? Use this model to learn how to calculate your perfect ski size"></Card>

</gridContainer>

## Random

<gridContainer style= {{  
display: "flex",
flex: "0 1 calc(25% - 1em)",
   justifyContent: "space-between",
   flexWrap: "wrap",
  }}>

<Card title="What is the right medicine dosage for a child?" img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png" notebook="https://alpha.decipad.com/n/VlKVyJVuK1rKveg7YLzpK?secret=JkHVzPOQKxmsSga-BObkK" description="How does the NHS calculate the right paracetamol dosage for a child under 6? Use this model to find out"></Card>

<Card title="How does gravity work? " img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png" notebook="https://alpha.decipad.com/n/Q5sDRcpQ4lYSg84Hrs3gf?secret=Bf2nWPe5ZAuDJL9MEWP1L" description="How much force do you exert on earth? Use this model to learn some physics fundamentals!"></Card>

</gridContainer>

---

# Didn't find what you need?

Let's build it!

Talk to us on [Discord](https://discord.com/invite/HwDMqwbGmc) or use the feedback button on your notebook.

