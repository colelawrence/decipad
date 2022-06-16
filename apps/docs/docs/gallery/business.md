---
sidebar_position: 300
---

# Business Notebooks

export const Card =({children,title,description,notebook}) => (
  <a href={notebook} style={{textDecoration: "none", height: "auto", width: "49%", marginBottom: "15px"}}> 
  <div class="card" style={{
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

<Card title="When can I retire?" img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png" notebook="https://alpha.decipad.com/n/-Decode-F-I-R-E-%3AD8PUgXa8VQxoCIWi7Tq4A?secret=JTq7qfP3q_qbNGsYAm_Uu" description="Use the F.I.R.E model (Financial Independence, Retire Early) to understand how you can become work optional"></Card>


<Card title="Can I afford all these subcriptions?" img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png" notebook="https://alpha.decipad.com/n/-Subscription-Tracker%3Awy0DuDrADXjoUOsW59iTc?secret=DpImmwlNWuLdw4XYUhldd" description="Everything is using a subscription model nowadays. Use this model to understand your expenses"></Card>

<Card title="Should I buy an electric car?" img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png" notebook="https://alpha.decipad.com/n/bxTv4RqJC_DCPv3xXLuLX?secret=RFmB4s_xKJQo-K3RMHDnY" description="Want to make the switch to electric? Use this model to understand how to calculate your savings potential"></Card>

<Card title="How much should I price this project?" img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png" notebook="https://alpha.decipad.com/n/-Consulting-Projects-Fee-Estimation%3A8Kx9X0612rXUElUSVFl0S?secret=qdQBEsgCdMvnh-D6_JGxp" description="Landed a new project? Use this model to understand how to calculate staff allocation, project expenses, and target rates"></Card>

<Card title="What is fair international employee compensation?" img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png" notebook="https://alpha.decipad.com/n/Emily-in-Paris%3AmCTaRvBPOskMxCEKeKKxt?secret=Zhm1ToqvarE6ZzXHJU2Cn" description="Use this model to understand how salary changes between London and Paris"></Card>

<Card title="How much money do I need to start my business?" img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png" notebook="https://alpha.decipad.com/n/Simple-Cashflow%3Ak1Zw0l2QmvbU5DIJ_XWxu?secret=vgzyDwDdJhTNN1SccetIe" description="Use this notebook to understand your cashflow and project the initial investment you need."></Card>

</gridContainer>

---

# Didn't find what you need?

Let's build it!

Talk to us on [Discord](https://discord.com/invite/HwDMqwbGmc) or use the feedback button on your notebook.
