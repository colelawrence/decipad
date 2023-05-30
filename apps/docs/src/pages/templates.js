/* eslint-disable import/no-unresolved */
import React from 'react';
import '../css/custom.css';

/* Avatars */
import {
  avatarFabio,
  avatarGiulia,
  avatarSimao,
  avatarPeyton,
  avatarKelly,
  avatarJohn,
  avatarNuno,
  avatarAnna,
  IconAnnouncement,
  IconCoffee,
  IconWorld,
  IconAnnotationWarning,
  IconStar,
  IconKey,
  IconMoon,
  IconCard,
  IconServer,
  IconLeaf,
  IconPercentage,
  IconCar,
  IconVirus,
  IconRocket,
  IconSparkles,
  IconWallet,
  GridContainer,
  IconShoppingCart,
  IconMessage,
  IconHappy,
  Card,
  IconHeart,
  IconCompass,
  IconSunrise,
} from '@site/src/components/GalleryCards';

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
                  href="https://app.decipad.com/"
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

            <h2>New Templates</h2>

            <GridContainer>
              <Card
                author="Kelly McEttrick"
                cardColor="--card-orange"
                icon={IconStar}
                title="Pricing Analysis with PetsApp"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/An-offer-letter-for-startup-employees-template-%3ArpkOOZpHjUQHfm2cDDOKR"
                description="Learn how PetsApp uses Decipad to drive meaningful ROI conversations with their customers. "
                newNotebook
                template
                avatar={avatarKelly}
              />
              <Card
                author="Kelly McEttrick"
                cardColor="--card-blue"
                icon={IconHeart}
                title="Dynamic Investor Updates "
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/ROI-from-using-PetsApp%3AQpOd1cV8vmHr4WQ0vGh6D"
                description="Get an inside look at how the Decipad team creates investor updates. "
                avatar={avatarKelly}
                newNotebook
              />
              <Card
                author="Kelly McEttrick"
                cardColor="--card-white"
                icon={IconCompass}
                title="Hourly Rate Proposal - Interior Design"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Interior-Design-Proposal%3AQNvrOjVQMlg5Jhb3DoVSh"
                description="Create an interactive proposal to effectively price your time and services."
                newNotebook
                avatar={avatarKelly}
              />
              <Card
                author="Kelly McEttrick"
                cardColor="--card-yellow"
                icon={IconSunrise}
                title="Solar Energy Panels - Cost Effectiveness"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Cost-Effectiveness-of-Solar-Panels%3AWcwqaoPRbPL7zmp79aeH1"
                description="Use this model to better understand the cost breakdown of an investment in solar panels."
                avatar={avatarKelly}
                newNotebook
              />
            </GridContainer>
            <br></br>

            <h2>Human Resources</h2>
            <GridContainer>
              <Card
                author="Kelly McEttrick"
                cardColor="--card-yellow"
                icon={IconLeaf}
                title="Offer letter template"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/An-offer-letter-for-startup-employees-template-%3ArpkOOZpHjUQHfm2cDDOKR"
                description="Offer letters at startups most often include stock base compensation. Use this template to explain how these work and next steps."
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
                description="Compensation adjustments are often based on performance and a formula. Use this template to communicate adjustments."
                template
                avatar={avatarKelly}
              />
              <Card
                author="Nuno Job"
                cardColor="--card-pink"
                icon={IconCoffee}
                title="Adjusting employee compensation when moving countries"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Emily-in-Paris%3AmCTaRvBPOskMxCEKeKKxt?secret=Zhm1ToqvarE6ZzXHJU2Cn"
                description="A notebook that breaks down the calculations behind salary adjustments when moving cities."
                avatar={avatarNuno}
              />
            </GridContainer>

            <br></br>
            <h2>Sales</h2>
            <GridContainer>
              <Card
                author="Kelly McEttrick"
                cardColor="--card-orange"
                icon={IconShoppingCart}
                title="Sales Pipeline Report"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/-Template-Sales-Report-Monthly-Pipeline-Update%3ABxUws8V5ImNdj3feqCevN"
                description="Bring context to your sales funnel. Use this template to easily track your pipeline, analyze top performers and share insights with your team."
                template
                avatar={avatarKelly}
              />
              <Card
                author="Kelly McEttrick"
                cardColor="--card-purple"
                icon={IconHappy}
                title="SDR Compensation Letter"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/SDR-compensation-for-growing-companies%3AgEo9yC8lhBXeko-5dSxIV"
                description="An interactive commission plan that allows sales to easily explore different scenarios and better understand how their performance impacts their pay."
                template
                avatar={avatarKelly}
              />
              <Card
                author="Kelly McEttrick"
                cardColor="--card-yellow"
                icon={IconMessage}
                title="Building a Commission Plan"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Tips-for-building-a-commission-plan-from-experts%3AyoiYxMLOyZk_GP3QkTl1y"
                description="Best practices and tips for building a commission plan from experts."
                avatar={avatarKelly}
              />
              <Card
                author="Peyton Swift"
                cardColor="--card-yellow"
                icon={IconPercentage}
                title="Tiered Rate Commission Plan"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Sales-commission-letter-tiered-rates-%3AyN_j70uUyLKBVXn-7cmqJ"
                description="Share interactive commission plans with your sales team so they can better understand how their variable compensation will work."
                avatar={avatarPeyton}
                template
              />
              <Card
                author="Peyton Swift"
                cardColor="--card-yellow"
                icon={IconPercentage}
                title="Tiered Rate Commission Plan - Seasonality"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Sales-commission-letter-advanced-tiered-rates-%3A72ZufuX-ShOY0yXg57p60"
                description="Design a sales commission plan that encourages steady performance throughout the year and offers rewards for sales teams who achieve higher sales during peak seasons."
                template
                avatar={avatarPeyton}
              />
              <Card
                author="Kelly McEttrick"
                cardColor="--card-orange"
                icon={IconShoppingCart}
                title="Commission Pipeline Tracking"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/-Template-Commission-Pipeline-Tracking%3AaIaxBwyCvG6h3Arh4ea9H"
                description="A template to monitor your sales pipeline and easily forecast how you are pacing to a sales goal, quota and commission payout."
                template
                avatar={avatarKelly}
              />
              <Card
                author="Simão Dias"
                cardColor="--card-green"
                icon={IconRocket}
                title="Pricing Calculator"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/-Template-Pricing-Calculator%3A8Z1R0ZJhsmj8-8nidd7sF"
                description="Pricing configuration can be complicated at times, use this template to explore pricing options."
                template
                avatar={avatarSimao}
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
                description="Explores different plan scenarios depending on your team's GitHub usage."
                avatar={avatarFabio}
              />
            </GridContainer>

            <br></br>
            <h2>Starting your First Business</h2>
            <GridContainer>
              <Card
                author="Kelly McEttrick"
                cardColor="--card-green"
                icon={IconCard}
                title="Invoice template"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Invoice-for-Professional-Services%3AbvG3oSIDSMoZxx5oFHQ4r"
                description="This notebook showcases how you can create an invoice on Decipad."
                template
                avatar={avatarKelly}
              ></Card>
              <Card
                author="Peyton Swift"
                cardColor="--card-green"
                icon={IconWallet}
                title="Yearly Marketing Budget"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Yearly-Marketing-Budget%3A-DS_cAn252f5GtDHFKI9D"
                description="Use this  template to efficiently plan and track your marketing expenses, enabling you to make informed decisions and easily communicate your investment."
                template
                avatar={avatarPeyton}
              ></Card>
              <Card
                author="Peyton Swift"
                cardColor="--card-green"
                icon={IconRocket}
                title="UX Design Proposal Template"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/UX-Design-Client-Proposal%3AEDoj00ZVGr4-MNIbCCB6L"
                description="Use this template to outline your project goals, establish a clear scope of work, and present your design process and pricing structure to potential clients.
                "
                template
                avatar={avatarPeyton}
              ></Card>
              <Card
                author="Simão Dias"
                cardColor="--card-purple"
                icon={IconSparkles}
                title="Start a business"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/-Starting-a-Candle-Business%3Ax7lAd-B_27F0gCxxhlHDr"
                description="Example on how to break down and forecast financials of a businees before starting."
                avatar={avatarSimao}
              />
              <Card
                author="Giulia Camargo"
                cardColor="--card-yellow"
                icon={IconStar}
                title="Pricing a consulting project"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Pricing-a-consulting-project%3AXvFir3R2H_GvTfsy5bA4Q"
                description="Landed a new project? Use this model to understand how to calculate staff allocation, project expenses, and target rates."
                avatar={avatarGiulia}
              />
              {/* <Card
                author="Nuno Job"
                cardColor="--card-green"
                icon="🤔"
                title="How much money do I need to start my business?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Simple-Cashflow%3Ak1Zw0l2QmvbU5DIJ_XWxu?secret=vgzyDwDdJhTNN1SccetIe"
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
                description="Use this model to understand how you should price the meals at your restaurant in order to be profitable."
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
            <h2>Venture Funding</h2>

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
                description="Before you negotiate your first VC round, you might have a simple cap. This Notebook goes over the math and breaks it down."
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
                notebook="https://app.decipad.com/n/How-much-is-Apple-worth-Breaking-down-a-DFC-model-for-AAPL-%3AhioCODsrbDsTmMHKdukPm"
                description="You’ve probably been hearing a lot about interest rates lately. Check out this model that shows why they have been making the markets go wild."
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
                description="Some institutions pay interest when you open a savings account. Use this template to check how much money you will get after taxes."
                template
                avatar={avatarNuno}
              />
              <Card
                author="Simão Dias"
                cardColor="--card-green"
                icon={IconLeaf}
                title="Finance Tracker"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/-Template-My-Finance-Tracker-2023%3AA5sV922M9Qtn71KoDdHzO"
                description="Input your expenses and income to get a detailed summary of cashflows using data views."
                template
                avatar={avatarSimao}
              />
              <Card
                author="Peyton Swift"
                cardColor="--card-green"
                icon={IconRocket}
                title="When can I retire?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/-Decode-F-I-R-E-%3AD8PUgXa8VQxoCIWi7Tq4A?secret=JTq7qfP3q_qbNGsYAm_Uu"
                description="Use the F.I.R.E model (Financial Independence, Retire Early) to understand how you can become work optional."
                avatar={avatarPeyton}
              />
              <Card
                author="PeytonSwift"
                cardColor="--card-green"
                icon={IconRocket}
                title="Can I afford all these subscriptions?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/-Subscription-Tracker%3Awy0DuDrADXjoUOsW59iTc?secret=DpImmwlNWuLdw4XYUhldd"
                description="Everything is using a subscription model nowadays. Use this model to understand your expenses."
                avatar={avatarPeyton}
              />
              <Card
                author="Kelly McEttrick"
                cardColor="--card-green"
                icon={IconRocket}
                title="Should you negotiate your salary?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/How-much-are-you-losing-during-your-lifetime-if-you-don-t-negotiate-your-salary-%3Ah65Y4c99Swzn9smvVNyMC"
                description="Your salary is much like investing: where you start impacts your total return. Explore the numbers on this notebook to see how much you would be losing."
                avatar={avatarKelly}
              />
              <Card
                author="Simão Dias"
                cardColor="--card-white"
                icon={IconAnnotationWarning}
                title="Interest Rates? How much are they costing me?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Interest-Rates-How-much-are-they-costing-me-%3AKQ6BCwfuv1ijdQcSmiki7"
                description="It's important to understand how much of your monthly payment is going to the principal (ie. to repay your owed money) and how much is going to fees and interest."
                avatar={avatarSimao}
              />
              <Card
                author="Peyton Swift"
                cardColor="--card-green"
                icon={IconRocket}
                title="Saving for a big purchase"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Saving-for-a-big-purchase%3ACHaAlJTk9l8BLiE38HmDx"
                description="Input your expenses and income to find how long it will take you to save for a big purchase."
                avatar={avatarPeyton}
                template
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
                notebook="https://app.decipad.com/n/-Should-I-buy-an-electric-car-%3AX94KlVvqJDUvIqt-9mv93"
                description="Want to make the switch to electric? Use this model to understand how to calculate your savings potential."
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
                description="As Europe copes with rising energy prices, the Spanish government has asked citizens to turn down the A/C."
                avatar={avatarPeyton}
              />
              <Card
                author="Giulia Camargo"
                cardColor="--card-green"
                icon={IconRocket}
                title="Earth overshoot day"
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
                description="Make a plan to increase the distance you can run."
                avatar={avatarKelly}
              />
              <Card
                author="Nuno Job"
                cardColor="--card-green"
                icon={IconRocket}
                title="Comparing your triathlon times to Olympic gold winners"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Triathlon-times-demo-consumer%3ABiAU1Doi3hknMbRVJ7wj0"
                description="Ever wonder how your triathlon time can compare to elite athletes? Explore the calculations."
                avatar={avatarNuno}
              />
              <Card
                author="Peyton Swift"
                cardColor="--card-green"
                icon={IconRocket}
                title="Improving your 5k time"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Improving-your-5k-time-demo-consumer%3Aauj_wnWdSnuTw2XjNn_nP"
                description="Simple calculations on how to improve running times."
                avatar={avatarPeyton}
              />
              <Card
                author="Giulia Camargo"
                cardColor="--card-blue"
                icon={IconVirus}
                title="What size should my skis be?"
                img="https://user-images.githubusercontent.com/12210180/174139877-d558a1ac-b995-4848-a7a7-f42cd53e3401.png"
                notebook="https://app.decipad.com/n/-What-size-skis-do-I-need-%3AHAxnPfO0e4H9MHoig3zFG?secret=VDoYnnowEi8imsPqvUyWT"
                description="Going to the mountains? Use this model to learn how to calculate your perfect ski size."
                avatar={avatarGiulia}
              />
            </GridContainer>

            <br></br>
            <h2>Current Affairs</h2>
            <GridContainer>
              <Card
                author="Simão Dias"
                cardColor="--card-green"
                icon={IconRocket}
                title="Revenue from Twitter verification"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Let-s-do-the-Math-Revenue-from-Twitter-Verification:pFbOpkpXR_5O-hJGIjTSy"
                description="How much revenue could Twitter bring by charging for verification?"
                avatar={avatarSimao}
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
                notebook="https://app.decipad.com/n/Sleep-Cycle-Calculator%3AROAKYSWv17L9rpVww-D7D"
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
                description="Brewing coffee is a science. Understand the math behind it and get personalized instructions to make drip coffee with this notebook."
                avatar={avatarNuno}
              />
              <Card
                author="Simão Dias"
                cardColor="--card-green"
                icon={IconRocket}
                title="Bitcoins, or burgers?"
                img="https://user-images.githubusercontent.com/12210180/162471244-15b6b5ba-5ed3-45ee-a6e0-475d1b018053.png"
                notebook="https://app.decipad.com/n/Bitcoins-or-Burgers-%3AuMSqYhchnox64XIQm4iwe"
                description="Find how many hambuergers you can buy with your Bitcoin."
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
                notebook="https://app.decipad.com/n/Q5sDRcpQ4lYSg84Hrs3gf?secret=Bf2nWPe5ZAuDJL9MEWP1L"
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
                  <a href="https://discord.gg/CUtKEd3rBn">Discord</a>
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
