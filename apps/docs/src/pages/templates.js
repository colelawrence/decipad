import React from 'react';
import Layout from '@theme/Layout';
import '../css/custom.css';

export const Card = ({
  children,
  title,
  description,
  img,
  notebook,
  icon,
  author,
  cardColor,
}) => (
  <a
    href={notebook}
    class="card-gallery"
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
      <div
        style={{
          height: '100%',
        }}
      >
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
                color: '#777E89',
                fontSize: '13px',
              }}
            >
              by {author}
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
            {icon}
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
          marginBottom: '120px',
        }}
      >
        <div
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
                  fontSize: '80px',
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
                }}
              >
                A new way to explore numbers
              </p>
            </center>
          </div>

          <h2>Personal Finances</h2>

          <GridContainer>
            <Card
              author="Simão Dias"
              cardColor="--card-green"
              icon="🔥"
              title="When can I retire?"
              img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
              notebook="https://alpha.decipad.com/n/-Decode-F-I-R-E-%3AD8PUgXa8VQxoCIWi7Tq4A?secret=JTq7qfP3q_qbNGsYAm_Uu"
              description="Use the F.I.R.E model (Financial Independence, Retire Early) to understand how you can become work optional"
            />
            <Card
              author="Simão Dias"
              cardColor="--card-yellow"
              icon="💰"
              title="Can I afford all these subcriptions?"
              img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
              notebook="https://alpha.decipad.com/n/-Subscription-Tracker%3Awy0DuDrADXjoUOsW59iTc?secret=DpImmwlNWuLdw4XYUhldd"
              description="Everything is using a subscription model nowadays. Use this model to understand your expenses"
            />
            <Card
              author="Nuno Job"
              cardColor="--card-blue"
              icon="🚙"
              title="Should I buy an electric car?"
              img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
              notebook="https://alpha.decipad.com/n/-Should-I-buy-an-electric-car-%3AX94KlVvqJDUvIqt-9mv93"
              description="Want to make the switch to electric? Use this model to understand how to calculate your savings potential"
            />
            <Card
              author="Kelly McEttrick"
              cardColor="--card-green"
              icon="📈"
              title="$AAPL, interest rates and the stock market"
              img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
              notebook="https://alpha.decipad.com/n/Rising-interest-rates-and-AAPL-share-price%3AGwKX8lzGM5tDFJ3aV6eTJ"
              description="You’ve probably been hearing a lot about interest rates lately. Check out this model that shows why they have been making the markets go wild"
            />
            <Card
              author="Simão Dias"
              cardColor="--card-green"
              icon="💸"
              title="Should you negotiate your salary?"
              img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
              notebook="https://alpha.decipad.com/n/How-much-are-you-losing-during-your-lifetime-if-you-don-t-negotiate-your-salary-%3Ah65Y4c99Swzn9smvVNyMC"
              description="Your salary is much like investing: where you start impacts your total return. Explore the numbers on this notebook to see how much you would be losing"
            />
            <Card
              author="Simão Dias"
              cardColor="--card-white"
              icon="🏦"
              title="Interest Rates? How much are they costing me?"
              img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
              notebook="https://alpha.decipad.com/n/Interest-Rates-How-much-are-they-costing-me-%3AKQ6BCwfuv1ijdQcSmiki7"
              description="It's important to understand how much of your monthly payment is going to the principal (ie. to repay your owed money) and how much is going to fees and interest"
            />
          </GridContainer>

          <p></p>
          <p></p>

          <h2>Bussiness</h2>

          <GridContainer>
            <Card
              author="Simão Dias"
              cardColor="--card-green"
              icon="🕯"
              title="Start a candle business"
              img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
              notebook="https://alpha.decipad.com/n/-Starting-a-Candle-Business%3AJTYAmhcwfINZobogKoEbU"
              description="Finance is a key component of starting a business. Yet, many entrepreneurs struggle to understand how to create a basic business model"
            />
            <Card
              author="João Pena"
              cardColor="--card-blue"
              icon="📈"
              title="How much should I price this project?"
              img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
              notebook="https://alpha.decipad.com/n/-Consulting-Projects-Fee-Estimation%3A8Kx9X0612rXUElUSVFl0S?secret=qdQBEsgCdMvnh-D6_JGxp"
              description="Landed a new project? Use this model to understand how to calculate staff allocation, project expenses, and target rates"
            />
            <Card
              author="Nuno Job"
              cardColor="--card-purple"
              icon="💵"
              title="What is fair international employee compensation?"
              img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
              notebook="https://alpha.decipad.com/n/Emily-in-Paris%3AmCTaRvBPOskMxCEKeKKxt?secret=Zhm1ToqvarE6ZzXHJU2Cn"
              description="Use this model to understand how salary changes between London and Paris"
            />
            <Card
              author="Nuno Job"
              cardColor="--card-green"
              icon="🤔"
              title="How much money do I need to start my business?"
              img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
              notebook="https://alpha.decipad.com/n/Simple-Cashflow%3Ak1Zw0l2QmvbU5DIJ_XWxu?secret=vgzyDwDdJhTNN1SccetIe"
              description="Use this notebook to understand your cashflow and project the initial investment you need"
            ></Card>
            <Card
              author="Kelly McEttrick"
              cardColor="--card-yellow"
              icon="🧾"
              title="Invoice Template"
              img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
              notebook="https://alpha.decipad.com/n/Invoice-for-Professional-Services%3AbvG3oSIDSMoZxx5oFHQ4r"
              description="This notebook showcases how you can create an invoice on Decipad"
            ></Card>
          </GridContainer>

          <p></p>
          <p></p>

          <h2>Hobbies</h2>

          <GridContainer>
            <Card
              author="Giulia Camargo"
              cardColor="--card-blue"
              icon="⛷"
              title="What size should my skis be?"
              img="https://user-images.githubusercontent.com/12210180/174139877-d558a1ac-b995-4848-a7a7-f42cd53e3401.png"
              notebook="https://alpha.decipad.com/n/-What-size-skis-do-I-need-%3AHAxnPfO0e4H9MHoig3zFG?secret=VDoYnnowEi8imsPqvUyWT"
              description="Going to the mountains? Use this model to learn how to calculate your perfect ski size"
            />
          </GridContainer>

          <p></p>
          <p></p>

          <h2>Other Themes</h2>

          <GridContainer>
            <Card
              author="Nuno Job"
              cardColor="--card-green"
              icon="🤒"
              title="What is the right medicine dosage for a child?"
              img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
              notebook="https://alpha.decipad.com/n/VlKVyJVuK1rKveg7YLzpK?secret=JkHVzPOQKxmsSga-BObkK"
              description="How does the NHS calculate the right paracetamol dosage for a child under 6? Use this model to find out"
            />
            <Card
              author="João Pena"
              cardColor="--card-yellow"
              icon="🪨"
              title="How does gravity work?"
              img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
              notebook="https://alpha.decipad.com/n/Q5sDRcpQ4lYSg84Hrs3gf?secret=Bf2nWPe5ZAuDJL9MEWP1L"
              description="How much force do you exert on earth? Use this model to learn some physics fundamentals!"
            />
            <Card
              author="Nuno Job"
              cardColor="--card-white"
              icon="☕"
              title="How to make the perfect cup of coffee?"
              img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
              notebook="https://alpha.decipad.com/n/The-Perfect-Coffee-Drip-Brew-%3Aqi0EWqpCXpIq5b95aP1uj"
              description="Brewing coffee is a science. This Notebook will help you understand the math behind it and help you with some instructions to make drip coffee"
            />
          </GridContainer>

          <br></br>

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
  );
}
