---
sidebar_position: 300
---

# Gallery

We've created a collection of example notebooks to inspire your imagination. 

Make a copy any of these notebooks with the `Duplicate` button to quick-start your own model.

export const Card =({children,title,description,img,notebook}) => (
  <a href={notebook} style={{textDecoration: "none", height: "auto", width: "49%"}}> 
<div class="card" style={{
  borderRadius: "3px",
  backgroundColor: "var(--ifm-code-background)"}
  }>
  <img src={img}/>
</div>
</a>
);

## Subjects

<gridContainer style= {{  
display: "flex",
flex: "0 1 calc(25% - 1em)",
   justifyContent: "space-between",
   flexWrap: "wrap",
  }}>
  
<Card title="" img="https://user-images.githubusercontent.com/12210180/174136531-54a17857-24f0-4c6a-a201-2e0ea2747602.png" notebook="business" description=""></Card>

<Card title="" img="https://user-images.githubusercontent.com/12210180/174136601-68750d37-b023-4e47-ad4a-f7643ce81e8f.png" notebook="personal" description=""></Card>

</gridContainer>

