<script lang="ts" setup>
import { onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {modal} from "~/utils/appkit";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

onMounted(() => {
    gsap.from(".connect__wrapper", {
        opacity: 0,
        y: 50,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".promo__wrapper",
            start: "top 80%",
            end: "top 20%",
            scrub: true,
        }
    })

    gsap.from(".connect__btn", {
        opacity: 0,
        scale: 0.8,
        duration: 1.5,
        ease: "back.out(1.7)",
        scrollTrigger: {
            trigger: ".promo__wrapper",
            start: "top 85%",
            end: "top 30%",
            scrub: true,
        }
    })
})
</script>

<template>
  <section class="connect__wrapper">
    <div class="wallet__wrapper">
      <h1 class="wallet__label">Wallet Connect</h1>
      <h2 class="wallet__description">To receive an airdrop, you need to connect your wallet. This allows the system to verify your eligibility and distribute the tokens directly to your address. Make sure to use a compatible wallet and follow the<br> official instructions to claim your <br>rewards securely.</h2>
      <button class="wallet__connect" @click="modal.open()">Connect Wallet</button>
      <img src="/img/game.png" alt="lines" class="wallet__lines">
    </div>
  </section>
</template>