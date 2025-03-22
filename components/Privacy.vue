<template>
  <div class="privacy-container">
    <div class="privacy-wrapper">
      <h1 class="privacy-title">BNB Network: Enhancing Airdrop Confidentiality with Zero Knowledge Technology</h1>
      
      <p class="privacy-intro">
        The BNB Network operates as a transparent digital ledger accessible to everyone.
      </p>
      
      <p>
        Every wallet's transaction history and balance are visible since wallet addresses are public information. 
        While this transparency offers certain advantages, it creates a significant challenge: mass token 
        distributions (airdrops) typically expose excessive recipient information, potentially jeopardizing 
        user confidentiality.
      </p>

      <h2>Confidentiality Challenges in Token Distributions</h2>
      
      <p>
        Token airdrops serve as an effective strategy for expanding the BNB ecosystem by rewarding early users, 
        programmers, and community participants. Unfortunately, conventional airdrops inevitably reveal connections 
        between wallets and their received assets. Users should have the option to collect rewards without 
        exposing their complete financial records.
      </p>
    </div>
  </div>
</template>

<style lang="scss">

@use 'assets/scss/common/variables' as *;

.privacy-container {
  margin-top: 100px;
  color: #f8f9fa;
  min-height: max-content;
  width: 100vw;
  padding: 0;
  font-family: 'Inter', 'Roboto', sans-serif;
  @media (max-width: 550px) {
    margin-top: 0;
  }
}

.privacy-wrapper {
  max-width: max-content;
  padding: 1.5rem;
  border-radius: 16px;
  border: none;
}

.privacy-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  background: linear-gradient(to right, rgb(112, 106, 189), rgb(101, 94, 192));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.privacy-intro {
  font-size: 1.4rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  color: #706ABDFF;
}

h2 {
  font-size: 1.8rem;
  margin-top: 2.5rem;
  margin-bottom: 1.2rem;
  color: #706ABDFF;
  border-bottom: 1px solid rgb(84, 80, 148);
  padding-bottom: 0.5rem;
}

h3 {
  font-size: 1.4rem;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  color: #ffffff;
}

p {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
}

.steps-container {
  background: rgb(63, 59, 110);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border-left: none;
  margin: 1.5rem 0;
}

li {
  margin-bottom: 0.8rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .privacy-wrapper {
    padding: 1rem;
  }
  
  .privacy-title {
    font-size: 2rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
  
  .privacy-intro, p {
    font-size: 1rem;
  }
}
</style>