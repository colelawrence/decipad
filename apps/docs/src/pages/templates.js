import React from 'react';
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
    <>
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
            marginBottom: '120px',
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
                icon="✨"
                title="Performance summary letter. Template"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/-Template-Performance-summary-letter-%3AjuzNZDn4zNSqn2Rz14pKn"
                description="A template for communicating performance-based compensation adjustments"
              />
              <Card
                author="Kelly McEttrick"
                cardColor="--card-yellow"
                icon="📝"
                title="Offer letter. Template"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/You-re-hired-Offer-Letter%3Am5plUls5fkWflsneZcJNQ"
                description="A template to send an offer letter, explain stock base compensation and next steps"
              />
              <Card
                author="Nuno Job"
                cardColor="--card-purple"
                icon="💵"
                title="Adjusting employee compensation when moving countries"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/Emily-in-Paris%3AmCTaRvBPOskMxCEKeKKxt?secret=Zhm1ToqvarE6ZzXHJU2Cn"
                description="Understand how salary changes between London and Paris"
              />
              <Card
                author="Kelly McEttrick"
                cardColor="--card-blue"
                icon="📈"
                title="Understanding stock options"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Understanding-stock-options-at-an-early-stage-startup%3ArSztWxWyHRz3wp-1sm13M"
                description="How Equity Compensation works? How much will your stock options be worth in the future?"
              />
            </GridContainer>

            <br></br>
            <h2>Software Engineering</h2>
            <GridContainer>
              <Card
                author="Fabio Santos"
                cardColor="--card-green"
                icon="⚙️"
                title="Picking the right GitHub plan for your team"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Should-I-upgrade-to-Github-s-Enterprise-plan-%3AFlwvRkd6oiuePyH7MNzan"
                description="Explores different plan scenarios depending on your team's GitHub usage"
              />
            </GridContainer>

            <br></br>
            <h2>Starting your first business</h2>
            <GridContainer>
              <Card
                author="Simão Dias"
                cardColor="--card-yellow"
                icon="🕯"
                title="Start a candle business"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/-Starting-a-Candle-Business%3AJTYAmhcwfINZobogKoEbU"
                description="Finance is a key component of starting a business. Yet, many entrepreneurs struggle to understand how to create a basic business model"
              />
              <Card
                author="João Pena"
                cardColor="--card-green"
                icon="📈"
                title="Pricing a consulting project"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/-Consulting-Projects-Fee-Estimation%3A8Kx9X0612rXUElUSVFl0S?secret=qdQBEsgCdMvnh-D6_JGxp"
                description="Landed a new project? Use this model to understand how to calculate staff allocation, project expenses, and target rates"
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
              <Card
                author="Kelly McEttrick"
                cardColor="--card-blue"
                icon="🧾"
                title="Invoice Template"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/Invoice-for-Professional-Services%3AbvG3oSIDSMoZxx5oFHQ4r"
                description="This notebook showcases how you can create an invoice on Decipad"
              ></Card>
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
                icon="👩‍🍳"
                title="Restaurant Pricing"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Is-my-restaurant-profitable-%3AJ0dGd6P-2FCtBN-RaULz4"
                description="Use this model to understand how you should price the meals at your restaurant in order to be profitable"
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
                cardColor="--card-green"
                icon="🤔"
                title="A founders guide to pricing your first round"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/A-founders-guide-to-pricing-your-first-round%3AEIfsPUrmoNZDMtGHYuxMW"
                description="Before you negotiate your first VC round, you might have a simple cap. This Notebook goes over the math and breaks it down"
      />
              <Card
                author="Nuno Job"
                cardColor="--card-yellow"
                icon="👩‍💻"
                title="A founder's guide to liquidation preference"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/A-founder-s-guide-to-liquidation-preference-startup-demo%3A789aAn-CwBN1JoxDCZxjn"
                description="When negotiating your term sheet, you will likely find liquidation preference as one of the terms. So, what does it mean?"
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
                icon="📈"
                title="$AAPL, interest rates and the stock market"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/Rising-interest-rates-and-AAPL-share-price%3AGwKX8lzGM5tDFJ3aV6eTJ"
                description="You’ve probably been hearing a lot about interest rates lately. Check out this model that shows why they have been making the markets go wild"
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
                author="Peyton Swift"
                cardColor="--card-green"
                icon="🔥"
                title="When can I retire?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/-Decode-F-I-R-E-%3AD8PUgXa8VQxoCIWi7Tq4A?secret=JTq7qfP3q_qbNGsYAm_Uu"
                description="Use the F.I.R.E model (Financial Independence, Retire Early) to understand how you can become work optional"
              />
              <Card
                author="PeytonSwift"
                cardColor="--card-yellow"
                icon="💰"
                title="Can I afford all these subscriptions?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/-Subscription-Tracker%3Awy0DuDrADXjoUOsW59iTc?secret=DpImmwlNWuLdw4XYUhldd"
                description="Everything is using a subscription model nowadays. Use this model to understand your expenses"
              />
              <Card
                author="Kelly McEttrick"
                cardColor="--card-blue"
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
               <Card
                author="Nuno Job"
                cardColor="--card-green"
                icon="🏦"
                title="How much money do I get on a savings account? Template"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/How-much-money-do-I-get-on-a-savings-account-Template%3AynrEw3tTP1a6MVrUYbM_3"
                description="Some institutions pay interest when you open a savings account. Use this template to check how much money you will get after taxes"
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
                icon="🚙"
                title="Should I buy an electric car?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://alpha.decipad.com/n/-Should-I-buy-an-electric-car-%3AX94KlVvqJDUvIqt-9mv93"
                description="Want to make the switch to electric? Use this model to understand how to calculate your savings potential"
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
                cardColor="--card-green"
                icon="🌡"
                title="How much can I save if I stop using my air conditioning?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Copy-of-How-much-can-I-save-if-I-stop-using-my-air-conditioning-Yen-%3AuzEyS4KVhhLGRq8RWO0Ua"
                description="As Europe copes with rising energy prices, the Spanish government has asked citizens to turn down the A/C"
              />
              <Card
                author="Giulia Camargo"
                cardColor="--card-green"
                icon="🍃"
                title="Earth Overshoot Day"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Earth-Overshoot-Day%3AafAklYs-D00_535FlF4qJ"
                description="Each year's #EarthOvershootDay
                marks when humanity’s demand for ecological resources exceeds what the earth can regenerate in a year. Have you ever wondered how it is calculated?"
              />
            </GridContainer>

            <br></br>
            <h2>Sports</h2>
            <GridContainer>
              <Card
                author="Kelly McEttrick"
                cardColor="--card-green"
                icon="🏃‍♀️"
                title="How to build up your runs this summer"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/How-to-build-up-your-runs-this-summer-consumer-demo%3ApBMgmhZf4YbMZhvkm1bBM"
                description="Make a plan to increase the distance you can run"
              />
              <Card
                author="Nuno Job"
                cardColor="--card-white"
                icon="🏅"
                title="Comparing your triathlon times to Olympic gold winners"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Triathlon-times-demo-consumer%3ABiAU1Doi3hknMbRVJ7wj0"
                description="Ever wonder how your triathlon time can compare to elite athletes? Explore the calculations"
              />
              <Card
                author="Peyton Swift"
                cardColor="--card-blue"
                icon="💪"
                title="Improving your 5k time"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Improving-your-5k-time-demo-consumer%3Aauj_wnWdSnuTw2XjNn_nP"
                description="Simple calculations on how to improve running times"
              />
              <Card
                author="Giulia Camargo"
                cardColor="--card-yellow"
                icon="⛷"
                title="What size should my skis be?"
                img="https://user-images.githubusercontent.com/12210180/174139877-d558a1ac-b995-4848-a7a7-f42cd53e3401.png"
                notebook="https://alpha.decipad.com/n/-What-size-skis-do-I-need-%3AHAxnPfO0e4H9MHoig3zFG?secret=VDoYnnowEi8imsPqvUyWT"
                description="Going to the mountains? Use this model to learn how to calculate your perfect ski size"
              />
            </GridContainer>

            <br></br>
            <h2>Current affairs</h2>
            <GridContainer>
              <Card
                author="Simão Dias"
                cardColor="--card-green"
                icon="🐦"
                title="Revenue from Twitter Verification"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Let-s-do-the-Math-Revenue-from-Twitter-Verification:pFbOpkpXR_5O-hJGIjTSy"
                description="How much revenue could Twitter bring by charging for verification?"
              />
            </GridContainer>

            <br></br>
            <h2>Health</h2>
            <GridContainer>
              <Card
                author="Anna"
                cardColor="--card-purple"
                icon="😴"
                title="Sleep cycle calculator"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Sleep-Cycle-Calculator%3AAbwnpuSIBDV4Kx6gl1kAw"
                description="Wondering why you’re waking up tired? Maybe it’s because you’re not respecting your sleep cycle!"
              />
              <Card
                author="John Costa"
                cardColor="--card-yellow"
                icon="💰"
                title="What's the real price of social media"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Copy-of-What-s-the-real-price-of-social-media-%3AERjndAreui5OGaP_lqZRM"
                description="What would happen if you reallocated a portion of your social media time into productive work hours?"
              />
            </GridContainer>

            <br></br>
            <h2>Fun</h2>
            <GridContainer>
              <Card
                author="Nuno Job"
                cardColor="--card-white"
                icon="☕"
                title="How to make the perfect cup of coffee?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/How-to-make-the-perfect-cup-of-coffee-%3AhSp6SmazqhsvafYO9QRsZ"
                description="Brewing coffee is a science. This Notebook will help you understand the math behind it and help you with some instructions to make drip coffee"
              />
              <Card
                author="Simão Dias"
                cardColor="--card-green"
                icon="🍔"
                title="Bitcoins, or Burgers?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Bitcoins-or-Burgers-%3AuMSqYhchnox64XIQm4iwe"
                description="Notebooks that compares Bitcoin market price and how many hamburgers you can buy"
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
    </>
  );
}
