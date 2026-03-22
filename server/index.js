const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// ── HTML SAYFALAR ──

const HTML_ANASAYFA = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>kobar</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Roboto:wght@400&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #ffffff;
    --surface: #f5f5f5;
    --green: #5a7a2e;
    --green-light: #6d8f38;
    --text: #1a1a1a;
    --muted: #8a8a7a;
    --border: #d4cfc6;
    --card-bg: #f9f9f9;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Poppins', sans-serif;
    background: #ffffff;
    color: var(--text);
    min-height: 100vh;
  }

  /* ── GİRİŞ EKRANI ── */
  #login-screen {
    position: fixed; inset: 0;
    background: #ffffff;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    z-index: 100;
    transition: opacity 0.6s ease, transform 0.6s ease;
  }

  #login-screen.hidden {
    opacity: 0;
    transform: translateY(-20px);
    pointer-events: none;
  }

  .login-logo {
    margin-bottom: 52px;
    animation: fadeUp 0.8s ease both;
  }

  .login-logo svg {
    width: 160px; height: auto;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    animation: fadeUp 0.8s 0.15s ease both;
  }

  .login-input-wrap {
    position: relative;
    width: 280px;
  }

  .login-input-wrap::before {
    content: '⬡';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    font-size: 13px;
    opacity: 0.5;
  }

  #password-input {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1.5px solid var(--border);
    color: var(--text);
    font-family: 'Poppins', sans-serif;
    font-size: 15px;
    padding: 12px 12px 12px 28px;
    outline: none;
    letter-spacing: 0.1em;
    transition: border-color 0.2s;
  }

  #password-input::placeholder { color: var(--muted); letter-spacing: 0; }
  #password-input:focus { border-bottom-color: var(--green); }

  .login-error {
    color: #b85a3a;
    font-size: 12px;
    margin-top: 10px;
    opacity: 0;
    transition: opacity 0.3s;
    height: 16px;
  }
  .login-error.show { opacity: 1; }

  /* ── ANA SAYFA ── */
  #main-screen {
    display: none;
    min-height: 100vh;
  }

  #main-screen.visible { display: block; }

  /* NAVBAR */
  nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 24px 48px;
    border-bottom: 1px solid var(--border);
    animation: fadeDown 0.6s ease both;
  }

  .nav-logo svg { width: 100px; height: auto; }

  .nav-links {
    display: flex; gap: 36px;
  }

  .nav-links a {
    font-family: 'Poppins', sans-serif;
    text-decoration: none;
    color: var(--muted);
    font-size: 14px;
    font-weight: 500;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--text); }

  .nav-logout {
    background: none; border: none;
    color: var(--muted); font-size: 13px;
    cursor: pointer; font-family: inherit;
    transition: color 0.2s;
  }
  .nav-logout:hover { color: var(--text); }

  /* HERO */
  .hero {
    padding: 52px 48px 36px;
    animation: fadeUp 0.6s 0.1s ease both;
  }

  .hero-title {
    font-family: 'Poppins', sans-serif;
    font-size: 52px;
    font-weight: 400;
    line-height: 1;
    color: var(--green);
    display: flex;
    align-items: baseline;
    gap: 20px;
  }

  .hero-count {
    font-family: 'Poppins', sans-serif;
    font-size: 16px;
    font-weight: 300;
    color: var(--muted);
    letter-spacing: 0.1em;
  }

  .hero-divider {
    width: 100%;
    height: 1px;
    background: var(--border);
    margin-top: 28px;
  }

  /* PROJE GRID */
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    border-left: 1px solid var(--border);
    margin: 0 48px;
    animation: fadeUp 0.6s 0.2s ease both;
  }

  .project-card {
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    padding: 40px 36px;
    text-decoration: none;
    color: inherit;
    display: block;
    position: relative;
    transition: background 0.2s;
    cursor: pointer;
  }

  .project-card:hover {
    background: var(--surface);
  }

  .project-card:hover .project-arrow {
    opacity: 1;
    transform: translate(2px, -2px);
  }

  .project-card:hover .project-num {
    color: var(--green);
  }

  .project-num {
    font-family: 'Poppins', sans-serif;
    font-size: 12px;
    font-weight: 300;
    color: var(--muted);
    letter-spacing: 0.2em;
    margin-bottom: 20px;
    transition: color 0.2s;
  }

  .project-name {
    font-family: 'Poppins', sans-serif;
    font-size: 20px;
    font-weight: 500;
    color: #333333;
    margin-bottom: 12px;
    line-height: 1.2;
  }

  .project-card.active .project-name {
    color: var(--green);
  }

  .project-desc {
    font-family: 'Roboto', sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: #555555;
    line-height: 1.6;
    margin-bottom: 24px;
  }

  .project-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid var(--border);
    padding-top: 16px;
  }

  .project-tags {
    display: flex; gap: 8px; flex-wrap: wrap;
  }

  .project-tag {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.1em;
    border: 1px solid var(--border);
    padding: 4px 10px;
    border-radius: 2px;
    color: var(--muted);
  }

  .project-card.active .project-tag {
    border-color: var(--green);
    color: var(--green);
  }

  .project-status {
    font-size: 11px;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .project-status::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--muted);
  }

  .project-card.active .project-status {
    color: var(--green);
  }

  .project-card.active .project-status::before {
    background: var(--green);
  }

  .project-arrow {
    position: absolute;
    bottom: 36px; right: 36px;
    font-size: 18px;
    color: var(--green);
    opacity: 0;
    transition: all 0.2s;
  }

  /* YAKINDA KARTI */
  .project-card.soon {
    opacity: 0.45;
    cursor: default;
    pointer-events: none;
  }

  /* FOOTER */
  footer {
    padding: 32px 48px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
    animation: fadeUp 0.6s 0.3s ease both;
  }

  footer span {
    font-size: 12px;
    color: var(--muted);
  }

  /* ANIMATIONS */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* RESPONSIVE */
  @media (max-width: 640px) {
    nav { padding: 20px 24px; }
    .hero { padding: 36px 24px 24px; }
    .hero-title { font-size: 36px; }
    .projects-grid { grid-template-columns: 1fr; margin: 0 24px; }
    footer { padding: 24px; flex-direction: column; gap: 8px; text-align: center; }
  }
</style>
</head>
<body>

<!-- ── GİRİŞ EKRANI ── -->
<div id="login-screen">
  <div class="login-logo">
    <img src="data:image/png;base64,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" alt="kobar" style="width:180px;height:auto;" />
  </div>

  <div class="login-form">
    <div class="login-input-wrap">
      <input
        type="password"
        id="password-input"
        placeholder="şifre"
        autocomplete="off"
        onkeydown="if(event.key==='Enter') checkPassword()"
      />
    </div>
    <div class="login-error" id="login-error">Yanlış şifre</div>
  </div>
</div>

<!-- ── ANA SAYFA ── -->
<div id="main-screen">
  <nav>
    <div class="nav-logo">
      <img src="data:image/png;base64,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" alt="kobar" style="width:110px;height:auto;" />
    </div>
    <div class="nav-links">
      <a href="#" onclick="showAbout()">Projeler</a>
      <a href="#" onclick="showAbout()">Hakkında</a>
    </div>
    <button class="nav-logout" onclick="logout()">Çıkış ↗</button>
  </nav>

  <div class="hero">
    <div class="hero-title">
      Projeler
      <span class="hero-count" id="project-count">— 01</span>
    </div>
    <div class="hero-divider"></div>
  </div>

  <div class="projects-grid" id="projects-grid">
    <!-- Kartlar JS ile doldurulur -->
  </div>

  <!-- HAKKINDA MODAL -->
<div id="about-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:1000;align-items:center;justify-content:center;padding:24px">
  <div style="background:#fff;border-radius:20px;max-width:480px;width:100%;padding:32px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,0.15)">
    <button onclick="document.getElementById('about-modal').style.display='none'" style="position:absolute;top:16px;right:16px;background:none;border:none;font-size:22px;cursor:pointer;color:#999">✕</button>
    <div style="font-family:Poppins,sans-serif">
      <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjoAAAE5CAYAAACZNIrzAAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAABl10lEQVR4nO39d5BkR57fCX7c/UWkKK21QgmIamhRKGjRmO5Bd5M9nB5BcnaGvOMdbQVtxd2are3Z2dqe3R/3196RR+7OGdeMnLnhLMndHnJ3ZtDd0CgUSkMXSqC01iJ1RsRz9/3Dnz8RmVmVVSgkgOjfpy0bWRGRT/h78fzrP6m89x5BEARBEIQORH/TByAIgiAIgvB1IUJHEARBEISORYSOIAiCIAgdiwgdQRAEQRA6FhE6giAIgiB0LCJ0BEEQBEHoWEToCIIgCILQsYjQEQRBEAShYxGhIwiCIAhCxyJCRxAEQRCEjkWEjiAIgiAIHYsIHUEQBEEQOhYROoIgCIIgdCwidARBEARB6FhE6AiCIAiC0LGI0BEEQRAEoWMRoSMIgiAIQsciQkcQBEEQhI5FhI4gCIIgCB2LCB1BEARBEDoWETqCIAiCIHQsInQEQRAEQehYROgIgiAIgtCxiNARBEEQBKFjEaEjCIIgCELHIkJHEARBEISORYSOIAiCIAgdiwgdQRAEQRA6FhE6giAIgiB0LCJ0BEEQBEHoWEToCIIgCILQsYjQEQRBEAShYxGhIwiCIAhCxyJCRxAEQRCEjkWEjiAIgiAIHYsIHUEQBEEQOhYROoIgCIIgdCwidARBEARB6FhE6AiCIAiC0LGI0BEEQRAEoWMRoSMIgiAIQsciQkcQBEEQhI5FhI4gCIIgCB2LCB1BEARBEDoWETqCIAiCIHQsInQEQRAEQehYROgIgiAIgtCxiNARBEEQBKFjEaEjCIIgCELHIkJHEARBEISORYSOIAiCIAgdiwgdQRAEQRA6FhE6giAIgiB0LCJ0BEEQBEHoWEToCIIgCILQsYjQEQRBEAShYxGhIwiCIAhCxyJCRxAEQRCEjkWEjiAIgiAIHYsIHUEQBEEQOhYROoIgCIIgdCwidARBEARB6FhE6AiCIAiC0LGI0BEEQRAEoWMRoSMIgiAIQsciQkcQBEEQhI5FhI4gCIIgCB2LCB1BEARBEDoWETqCIAiCIHQsInQEQRAEQehYROgIgiAIgtCxiNARBEEQBKFjEaEjCIIgCELHIkJHEARBEISORYSOIAiCIAgdiwgdQRAEQRA6FhE6giAIgiB0LCJ0BEEQBEHoWEToCIIgCILQsYjQEQRBEAShYxGhIwiCIAhCxyJCRxAEQRCEjkWEjiAIgiAIHYsIHUEQBEEQOhYROoIgCIIgdCwidARBEARB6FhE6AiCIAiC0LGI0BEEQRAEoWMRoSMIgiAIQsciQkcQBEEQhI5FhI4gCIIgCB2LCB1BEARBEDoWETqCIAiCIHQsInQEQRAEQehYROgIgiAIgtCxiNARBEEQBKFjEaEjCIIgCELHIkJHEARBEISORYSOIAiCIAgdiwgdQRAEQRA6FhE6giAIgiB0LCJ0BEEQBEHoWEToCIIgCILQsYjQEQRBEAShYxGhIwiCIAhCxyJCRxAEQRCEjkWEjiAIgiAIHYsIHUEQBEEQOhYROoIgCIIgdCwidARBEARB6FiSb/oABGEiTlzYQnO0QX//MDXTywP3vfJNH5LwNXHs3BauX71Gs+HZ9MhPv+nDEQShgxChI3yjnL26nUZjhMGhPhqNEfoHrnLt+mWuXL/C9etXGR1t0mx4Vi+5T4TOd5xj595meGSIodEBBgf76R+4xvX+awwM9DE0OEj/1UFmz1gsQkcQhDuKCB1hyvjswF8xMHiNwcE+hkYGGRjpo9EYpZWOMDo6zGhzmGZjBOtbKO0B0CohqXWja+4bPnphshw7vZVr1y/SP3SdgcEr9A/1MzIywsjIICOjQ4w2h0nTJk3XBCxJklDThqRHkXR5zlzaybIFm77p0xAEoUMQoSNMCa9v+ed8/Ok2Rht9jKZDWNsidS3Ak9Q0tZoBozHGg3JYF4SN0QqFQyn7zZ6AMGneeu+vOHHqAJYmqWthXQOtNeBR2qMSg9YaXQNweOVoeY1zBmtbOORaC4Jw5xChI0wJA4NXuT54AWUa6JpD1x01NE45lPIo7fDe4pTHe4/3Dms9tXoNo0Ep9U2fgjAJTlx4l0vXzjI4eo16D6g61LVCKUAFK51zLdAaUHgcoFAkKKVRiQbEeicIwp1DhI4wJWgNSjuUcaiaw4c5D6Ni4p9Da4VXCqMNPnUYfBA4HpJEbtXvBMqTJJquLkNSdzjlQEWho1BKodHgPGgFGAAMBu/MN3rogiB0JjJ7CFOC0h6twStHWLH7+E74/8xiozz4TAV5wHqP9h6t5Vb9LuCVQhtwZJY6BV55PB6FwntfWOecx6v4dxbvNd5bsd4JgnBHkTo6wpSgMIDORYxRCqNCPA7K5TeiUip6ODIXlsd6l/+d8C1HhZgbpcO1U86jPGg8ygeXlPdB4Lj4mgufq4ggQRCEO4QIHWFKUJnbokwQMhalwn915XVfETdp2pzCoxW+Crl1rk2zxGsa3y/+7XHO4nyK8h6J0REE4U4iQkeYUhw6n+i0Ln73WuGUQ+NQKnNxaDLLgMVLJs53Ax8eKUopnAKngrvSK41XOsQg526tQvTE6+xcinMidARBuHOI0BGmhCheQpqxzrJuJsimyuN4SvE64rr6zqAwxXVTLr/GxhTBxuNZ+OI9ItdaEIQ7iUR4ClOCx5ZcGgrwOAWg0bqI3XFQcmc4rDN4PKms8r8TRCtd+K9DK52JGlDKE4PPI15lWec+CGCtZe0lCMKdRYSOMKVkBY+zyS9Mas656uo+W9nnn0OhjEyA3yW8ziw2ymQCZ6xVLo/X0QrnMmuOMhKQLAjCHUVmD2Fq8NVbTSkDXlcmP6UUziu8V+F9gKx4oPcSo/Ndot015dGQXdPwuq6WDFAKr0XgCIJw5xGhI0wJWmsUBqeyirgli010V7Rn5ZAFLhsUWlb53xnKIme8OJwYbFzxUqmq4BUEQbhTiOtKmBJi7RQPIe9Yg/chYiNOjN57tKoGIed/KwGq3wm892OypqL7MRL7XsXPee9RbWnngiAIdwqx6AhTglPFreazujntxKyscsHA8nvCt58oWgurjhsbg0UpPofiPS2XWBCErwGx6AhTQhAqwQWl8tdskWXjdWgRAFn2uS6Ej9NZZWXh24/K3VPeh9YPUAhVnbktfVY+IK+ZVGoFIq4rQRDuJGLREaaU9ro4cUIEKnEdlQnP6KwBpPBtx3tPmqa5xWZMsLlzIaW8VDMniuBysUFBEIQ7hVh0hCkkc1c4UFmgcYzb8cT4jCK+Q6lg4dGlgGXh201ZoEaxU4m90UWgOVqBdaHGTrTmCYIg3GFE6AhTinOOJJ/4wFON36jGeGRix3mslfTy7wJlceO9I5SGDFIWQhx6DEyP5LWS8usubkpBEO4cInSEKSVOgMXEF2e8UgZO7GDuPMpkgaqIO+O7QXZdXeGa1FpnbT3AOV/+WNbvSleEjjT1FAThTiL+AGFKCA0bXdtrfkwMR3uK8XixHsK3m5hiHq6dyV9rp9rF3IU2IdqLm1IQhDuKWHSEKSGKGOtc5sjwoFylvkp0aSit8lgOrRQSvPEdQgXBknqHiddNVwPNI4XQLbKztG/vhiUIgvDVkKWTMEU4vPahGm7wSwHjW3XaV//at7ULEL61FJaczFozTgHIiNY6/xmbhSUIgnBnkNlDmDKcc6Crk1lZ2ISMrJBh5ZDg4zKXBrcz3BhmZHCI0dYoPvWk3qE9JElCkiT09Eyju3c6S2c99Y0dZ3RDgcuCzX1eD6mdIIqyOJ3491qhbsN1dbZ/KyNDfTQaI4yOjtJsNvP96lpCb1c3vb3TmdY7i4Uzvrnx+To5d/19hkf6GRoaoNFo0Gw2cc5hal30dHXR3Tud6T3T6e7uZcH0Td/04X4ruND/AaOjw7RaLZrNlGbDM2vmQtYs3fxNH5pwBxGhI0wROk8Xj+QVcbPigEHwjI3lKfdHutPsP/bLvEpzXrwuHpdR2OyAtS+1qigHy/oa3mnuWfPSHT2ugyd+yfW+S1y+co6LV89z7doVRhojNBqNYtelWkRGaZKkRr2rh2nT/v8smLeIBfOXsHDeYubMns/y+U/f0eObGJeLmtC9fGJHVFnkxnF3lkll2B069TqXr5zj/OWzXLx8lv6+qzRbozhX1PCJ1iWdFAK6XpvGnNn/lsULljF/3mLmzlnE3at+486c+hRy/Pw7XL12iavXznPxygWuXblE/1A/rXQUh0UTRJ5zoHSS39P1pIt6vYcZ0/9nli1ezuJFK1kwdxHLFtz8/jh4/B2cb6F16Rpn77m260jWjd76FKVq3Lvm5mN8/Nw20rQVYrW8CwHsbfdPOCeHxgDh/DRd3LVycsLk0Nk3w3fq0hkuXjpLf/81Gs0RnHOkLYVtaDbe+xhrfipCp5MQoSNMGT5rbhUmuPBvozS4amBGjNVxPktMrjT6vDOcv76Tnbvf5ePP9uB1Go4DcJVsMI/WJs8CM8aAVjhnwzGj8K6GS7tYs+Ij/uB3/q9f+bje3/1nnDjzJSdPHeHK1fN4GpiawdRrKF2tSwNZ24xEg4emGmV0ZIAr/Wc4cnIvyilmTZ/L0qUrWL3qQ1auWMc9y1/9ysd4I6JohVLaeHZxnas28gyfc3gfcura6+6MxyeH/y1Hjx3k8LEDXLp8DrCYLkVNGzDF/hOtQXu0UjgVJuaGtYyMDnD1zDm+PPoJ+IR5cxawaOHrLFu2kvVr7mXN4le+trG5Exw6/dccOPwFx098ydlzp2g0RkA76rUapqbRNZ27h60ORRiVbuXfo9F0iOEmXLl+mmMnPqOnZwbLFi1nzerPWL3qHlYtfHHc/R458y5/8Zd/RtMOYpIwvkqFWDrvPd5WC4Ha7N/Ogk0199+7l9/5yX8x4Xnt+OTfsGPP+wwNXye1o2itSRKNMtkCyYZrGItN4kKgu001PclsXv0Ny/o1z0y4/SNnf8Gh43s58OU+zl8+jU9TTKLQOgueV6BdDetrjIz2397FEb61iNARpoxgDdF45wjhYa5STyV8JntguqKT+USuj9vlYv9Otu14g90ff4BTDbyJFpqxNX28rwbR5u9bhyKhOWpYsfRunnzyya98XB/vfY2tW7dw5uJReqZrTN2itMKpFIsF5/ImqOUVtNY6L6pocajE011TOOsZtlc5fLKfo8e/ZNq0mSxb/A73rn+AzQ/9B1/5eMcj9rUKcTeeGG7jvceYQgRBHMvwU04v9+Okl2/95F9y8PDnnDx1iJHRfnQdar0u1OpRCksLlxb3U7NkgYvHhc5q9BiP7vIoHP3DF7h2+Dz7v/yUTz7bw4a1H3P3uo3cu/pHX8v43C4f7f/X7D/wGUdPfsngyHWsbeKNpdYDXnvwLVreoaxCORUsIgCZUNcVW6qGBLSBlk85drafY2cOMXfvblav3MM96x4cY+VyusHgyGWafghjg2uy8r7LhKrzWDzKquzaa2wr4fK1Czc8v8HRPi5fO81I4zrN1hBG16j11Mb5PpYsR1bjXY2e2igjzcFxt3vk7Bt8vn8PXx7+lP7BqzjdRNc8JC6r0q1w3mGdA9vC2zpei9u80xChI0wJuWuqImwK8RJXaT5OeN6GVb4Nf3InXVeff7GLz/btQdUaJIkHlR2bBmgLjm4TOuFcFMYk2IZi9sz5PPXEs6xbMfFqciI+OvjvuHzhMuvW3sNdy57l4e+9ykhjiPe2vc6lqyfQXSpLu3Yo50s1abIMpdgF3Fvw2WcVaBNdRx6FR6kUo2C4dZUDx65w8cpJTpw5zP33PsbGu35y2+M4HuVaOD5zVXo8WpWFqkMpM27TVqMUpnSPHDz513y0dweHj3zB4GgfqCamuyg86LAhKy/W51HF9fOuaB3iCRW5tc6shMqDsuHYtAZSLvedpv/TSxw7tZ9j6w7y4H1PsGzerV/XO8mRs7/iw0+3cezkIa5dv4QlRScuWPe0Ctdegcv+p73G+SDiwvcos7DgShazMJF7BdZZkqSO1nBl8DRXvrjAmfPHuHzlHE8/8kf5cdQT6OmtQzqMTjJhg0MrE8Stz0Sry77iToXPODAeTHLjAHOlLF3dGpckqJYBD13dmcs6W3B479BK4b3FexVqbKUepR2oseLk00P/ht0fb+X0uSM03ShJV3jd+yhywraVAZ2V9nLSfqQjEaEjTAnee7QPD2RUmPiKwNXsfaqiwjkHhnzivBN8uP9fsX33e7TcECQp2mi0Vm1b90QRFl1Z0VSgfLAK+LTGzOlzee7JH/D4/T+7pWM4dPoXfLbvI06cOIprKWbPnsldy8J7Tz36O8yYPYP3PvgFx04dIKkbVGKzOCKH0tWYpmg9wfnMtO9K1YWLsTXBkIFG03DXOXz8M86dP8WhQ/t59JGnWLHgzkzoOrfgjK2HFHBjrrv3Lr/2SQLapADs2vunvLf9Da4NXATVIqlbQtPQuC2FVklRYFJlV0uFGA7vPS4XqqbNBVpM/FF/J3WN8i0uXz/LwMfXOXLkME88dpZN3/vdOzI2t8qW3f8jH33+AVeun8NpS73X44hWsaw+EUXzWyATBT6sEAjnHe6HQvyGXzLrpdco5cCDSQAFl/pOsHXndS5eOs1jDz/DioXPg7GYxKKdQxtF2JzGezBaZ0LbB0tRUJK0WhatE7xTwe17A5T26LrGeE+iEpQHrRU6iecbLUTgfdyfQnmFMeGnzLu7/pgPP/2A/uGLqJqlnlkYQyFLjfemMh7eK3xqsL4uvdY6EBE6wpSQBxRnz7vyqjMQjOsqe0YrD0ZpnE/Btu7Iw+fAib9i98dbaaQDkKRhBazAK5098D2OrMidixWZswmZsDr1KLAJtLp45JEnefqRW3MBvfvhH/PxJ9sZGL6KMYa0obh4+VTlM/ev/SHGGHbtmcHBY5+CawQLRinQF8iFDdqjdRZTlFtOXOlzgLcor3EKlAbHEAPNFl8c7ufKwAUevv8ij9z9t251SMchTH7OK3zJfFe+zvHXWFBQqSDAHI56b43htJ93Pvz/sG3HVvqGL5PUFdoEN5hqc2PGmI0gVQsR4NGZtUZhrc3bieR/l1kgXCYew8YtDk+tC6wb5tylQ2zZNkRf/2V+46n/6A6MzeQ4e20rH3+6lc/2fchQqw9Va4V6Ujqcv0LhXeHCjEHf3vvsfSAr1Kizq1BIw3j+Ost4i9fBZW5HQHlGWlf59MAO+gavs+nJC9S6FFaltGwzs7jpPI4t2yKZPTY7nuy+cx6lNTdr61FOTAiXw4d724/9TDj+8h9XXWlv7/7v2f3xVvqHr6BNincWXf575fJ7U5UWV9oYSBRaOpB0HCJ0hCkhXz1n/85tKNHlkAUFqvCYAzTWNtHa5FVzvwqnL73Hu1t+wfmrJ4PIcXaM/z9YC9otRzo7fgcYlKtTU9N48OHN/OC5fzTp/Z+4+A7vb32dA8c+wfkRTOJx1GhZxYXLZ8d8/r7VrzBz2kyU0Rw4/HFWdA+cTdGmFLdUqi48fhyTK00KwSLivcMpg9Kepm1x7PQ+Ll68yOBQP8898vcmfU7j4XWpZ5Uvp4q3t/yo1tZRSuG1x6sWez7exsGDBxhqDpDUPZ4WMRHLqMKCUbYWBRFqSzV5wjattZVxUb4Iio/7DUIpONmUAq9CheakW9E3fIHtu9+ir6+Ppze9xNK5X29a9qHTv2Drjrc4ffYgTo+S1II70rlozYrHr4KwiNe/NKbjjrEna6A7ttFqOUPN2RZgUdrgneX46X0Mb7nKPd9bj1IW61K0N21iVVW2WSaI8ZtbdMJCQ+UxVtFSGWO+xiut5DNR571F6WAF/OCz/5Gde7Yw1LyKV6Ok3qMzURfuG/BOhaKkFEIHsv0paSDciYjQEaaEyio8q4arVeEiwoWHllPZA9c7VB5rkmU6fQV2fvgOl6+fgqQFOPAepTxGmbBC9sFN5TMTfJRkzrkwQziFdwbtaqxdv5Gffn/yGVZ7j/wFW3e+wckzh/GmiaOFcqFQnklqXLl+kU8P/nsevPunlb9bvmATf/Rbm/g3r/2/+Ojz91HG4bXFWosxWYyLD7EaYXhdZQKLxKBqlcU3hPdTvLdYC4qEvuHzvL3lf6Pv6hV+8v3/y22Ps3cKhUHngcWxOGTcfzERl4/VYTGJ5tzlE5w4cyRMcAasa4214GhPmglV78oCygTd7CHGWhmls3+XBWy474LrJpss4wSbTYjOp6TOoVSLFo7P9m1neKSf5zaPsGbJC7c9Pjfi88M/Z8vO17lw8QSmZkl9C2dtcLmYYKEKnhaVBXqXxjKcMahq1hvZ4kL57NyUDp/OQ5pUJoJCUG4+Pt6R2hYWy5kLx7naf45mazQsTFyRyRazuaLlsyJ2VBY/ZsZRKW1UrjE6XwgZYyrxeUUZiujC9HiaeDXM50f/jB173mawESw5WoG10UVZpxD9Ko+9KwLffSaqEvAidDoNETrClBBjN4KrwoMjiBmqK8G8VYS1+crVKfKg0tvhtXf/O/Yf+oSUYZy3aBPM6krpyqSrM7GDUllmGEUsAAmkhqWL72Lz4y9Met+7Pv8zPtj1JpevnSHpsSFAM/XBhWcUHsvA4FWOnzjEg3ePv43fe/W/opU2OHTkE1p+CHQrCLEQmJJ/Ls9aalv+FjEOPhM8UWCGQE6bNrHOMTjaYtenWxhtjbL58ZdYPv/Wa4lEi4oxBoXNJ5LyMcWJa0w7CCyNlguHlk2ScQIsW3BcnrVXFkuFkKtsV4WGsGOyvUrXPQibwiIW096NiQ1oW+guw5Hje8E6zLOalYufu+WxuRGfH/45W3e+wblLJ1BJgzQT4lqFRqixjlMUjjH2pjx+4Vxc5sYMWY2OKHCq90d+n5Ti4SoZTflbKc57BgZHMcZQq9Uq465K+2+3hOSxQuOZY9qwPh339XIcVXm/YVXkcTolqfdwpe88X355gMtXzqDrwQWtVTWezWeCt/q8KbYbCpWK36oTEekqTAntZu2wMk9QpvoQDivG8JDPg5IJronb4b0P/zm7PnmP0dYgLdcEl+JdWrg4VNi+cylh1e/yQM744NcYfDNh+ZJ1fP+FH7F22eSKA27/5E/4xdt/wblLR9FdKd6naA31riRfqXos1jY5dGwfh0+/MeG2/uBv/Dc8+uDzdCcz0b6LJCmCJssTWHnCIjv6YL0w+X+9V3k6MITCiEndYOqOVA2y88O32brzV7c40mTHEl1HIXga4mTlKRdmHE/cht/DRK51WM1X3yvH+USXkws/Pv4U1ov4eZtlozlCfaZwv4X9FNc4BDTH8fNKZ+noIfBW6RAMve/wx7yz7Re3NTYTsf/4X/KLN/+C0+eO4FQD6y0Omx2nIUnCetQTRFzZ0hm+J8E6qrJxC+cVxj8UDqxaz0KNqlDqwbqQQRXvk7hdrwj7yV5O6gnKhH0ro8eImur3O9xnWmdZb6ocQD4+lfu2nI1Xul7e27Bi0tnzQYdsLlOz7Dv4CcdPf4muh0WMRsWvMTGWKZRk0FkQs84D4OO45O/dJJ5I+O4hQkeYEmLgacWsTrF6LlZdRRZEnLzLr98Knx/+d3z02Qc03CBON4O7p22b46U4Q1gJGp2Q6C7wNbprs3nqiRcnXUX3g4/+BW9teS0ERNZdqHuCDT/eY73DxjRXY7l85Rz7D35yw23+jZf+MzY//gr1ZCauZTA6yVf20QBVjpdoX/EXk0m0ZBWBy9qEgF90i67pmi/2fcj/8tr/c1Ln2k772MZJbrwYjvbXcjFS+Xs17n0T3IoxkLywVOTbzGoxudwtMdYC0k61SndxVM5ZvGnRM01z6OheXnvnn9zW2LRz5ur7bN/9LtcHLuJ0Gio7hyPJj9OHAam4VFRJPLSPTTiPwrpWfj9mEZavkR3HNRTjdqKlo0xZeBql82KbtB13+2dvhGqbiWLWXrFPXxFLwWoYYpaGG0Ocu3QalWTlA+L10211lErH5X1wf0ZXNYSK3F9XBXbhm0WEjjAltD9wg3s91MrR2QoyrNwKV0VsBaDRbRPPzTl48i95+/2/5PKVMzjXDK4wFQMyq/FCcZXrM3N4WN07jEpI6GJO7xJefu5HPHzPb09q359++XO27nyLq31ncb5ZFPdzoXt7qLemgvEIAEeqG3y2/yP2H/vlDbf9yuZ/yHObXmXujKUo101iQnGQqnApTVg4yovpMYKSIiNGE6wX3rdo2kE+/nwH7+36F5M650gxsUXXSnniqE6CUBSai4I3WlYKq0yM8QlWirK1RpXum/z8VHQ/Zi0EsvMyOgbAu/xzxd+5yt/rxOTHkY+ZgtSlWNXAJCl79+1k64f/8pbGZjy27niDY6f2g7JY2yLGXeUCJ0OVmtqqzAWTf5+0z8cpH3+vw48y+Y9z4fV471ESx94V4i8KpBuJE0WW4p1/b6O4jpa7LIsri/uejH4If1e+h1Xld6VMELUxtd6HzCzrU1LXwoVqQcGKlLu6wxgkJsSNRcqCz1Hcf0pF667QSYjQEaaE8koxkv/ui1iZcjxJcGWF380tZEKc79vKlu2/4sLlk1jVwPkWXmUWjSzeZzz3Sdx/qFGWYHwXPu3ikQee5pnHJpdGfubyFrbvfJsr189hVZPUjuJxpZVjMdmXJ+taHa5eu8ChY/tuuo8XHv97bHrsRWpqGtgaWnWVLDsx/iW4qrwbO2HlGTZtq9x8DJRD1SypH+bDT7ex/9hrkzp3IKtTAkHNlUVMcd4xAydOLmVulMUTs3DCSQT3AzZBuRrKJSSqC+VqGLrAdaFVF9rXMaqGdwYfgr3GteaVrYfj9VorLAMWxygDI5fZuu0Njp15b9Jj087b2/+Yz/d9SGpHSO1osR9ftToWHeHNWGukillJmdB1CqPqGBKUS8DW0b47jAPF+CifEOvQEN2YPhbmq1Ygbrd0hkHxJStM9VqXv+vxbw0Ti6Zsc+FcU1txUysfhGoUX7SNSyHKCnd3tFy1W68qxx/+lVn7GHPcQmchwcjClFCevIKlARQmCA+lwgIcVaSZlyaXW0n3PHnpXd7b9hqnzh5B1UL9DJ+Vwffeor0OboB2k74L1iSvAKuxqUKrGk8+/BIvbf4Hk97/rg+3cOr8MUJJDg2qhlHxYUye7ZJPHSqrgeM89S7DgYOfcvfaX3L3qh/ecD9PPfAHJCrh/Z2/YmD0MjpRWDcKxD5DRX2VNKYi5RllIRNJ5dk34cC8itfAZy0lDJevnWb3J1u5d82t9cgqGntW4x2qYmxsjIQpXZfwevyMwtpQ78VHF04arhMYEl3DqwST3TdGKdI0pEo3XTOrJBwnuxBs7vF4l03IOlYSjruLbp+wuo+r/CTRKAfGKBp2kE/2bmPNsudvaWwgVDz+6PPttNKRLK4kyY4xG7eSRSLs340b7OvT0FpDofFeY1OPchrv6ySqjjEJOgnXoNlqor3DtVKstaSezF2ZxfloHSw7qmQZis14czdZDPYuCwKVuxtDob9SrScVUvdvEqJT+r6HgqIudVCrjXGlhb0V904hSqvWzDwAXYWSx6nN9kGbRTG3bIZjdC07KeuT8N1ChI4wJeQrZhfzGjShPk58MBUTojEmN6VrdEkV3JyPP9/G5/s+JOn2GONBG0zJQlReqUaiFQlAkeC8wo4m3L1hIz94YfKF4rZ/8id8uv9DWn6UpAZ1ErSuEbOcwjFEl0TInwnBrllNlLriWv8FPvp8+02FDsAT9/8+GHj7vb9ipHUdpWrYzErinCUxNWJLBF9qBD2uZa0UFxPeU3htSXoMx099yc7P/ic2PfC3b3pMMa6jsE5MZuRcEJlt1oMwUcXtBhem1jV8qkhbCmyNnp7pLF+8iiVLljF92ky6unpyS9HQ6AjXrl/i9NmTXLx0BqtamCTrS4DFeYv3YDQVt0bcd3mcfHlCNArnWpjEcOzUAfZ88a95bOPvT+ZEc/Yf+ozzl05iurLCeioUWCyuS9m9FzPAQp2fIt4ocx85g28ZvNOobEyWLVrJ8qWrmDlrDvXuXrz3tFotGs0Rrl69yOkzJzh/6RRDQ/2QOGp1nRXLjKUVSrWKVDY+2qO8Huc75HJ3cMU9rYKQxLYHyI+l7EJ2NrR6cKmNdQ8r2223yOVWnLzmTuGCi5YwhQ2NR5XC+3IGX7y+QeSplkY5CUbuNEToCFNGzH4A8hVgKD5WTCZFjEEWM5JNupOpbfHWrn/GR59tQ9VSTKJx2LxeRtx+fizx13IvJK9CyfrUsH7NRp7ZPLnAY4DTl7bw6Rd7GG72k3QpvG8VvYh8keLsM1FBtPDE49Eal7YggS+P7OXA8V9xz+of3HS/T9z3+4yONNm+801GWlcw2tPMuj9blwYLgQrVXouJIZyxzyxbhCY/4bBCOdvwNyr0HPN+lP0HPmbJ4pWsXPj0DY+nLCarjF/MMExQhYUgFobUpdW3d4pEJ/iWQbkuZvTOZsGc5axetYEVy+9i3fIXbzpO+47+NYeP7+fY8S/pG7zEaDqENi2sa2Vuvyi0osUiTs6x0q8BFZo/eutxzlLTiut9F/hi30csW7yGJfMmV0zw4Mm/Zu8XH9JKhzFdddAGVNR0Pg4kMV4numJiLE2sPo3XeKtRaTezpi1i0cLlrFm5nqVLVrFmyc3T3788+SuOHf+SIye+5PylU4y2hqjVAZ/mZQGMyqpv44m56sGDVI2fya+vjmUZsu+3ipmNN66D5bNttt87hcspya5PYW6JLrtorS1iwjxgCpGTuQOV0jing/UWhSG4d7UOvS+USmhqRWJ6bjp2wncLETrClFB1Q5VcF37iuAzvfWbCV9nDaGJ27/9X7Nj9Hv3D10IzQGh7ALYVUivvI/P9K5Xg0xrzZi9h0+MvsWbZs5M+v30HP+HsuRPUuxOcauRCqohDIk8LbrdahIk0BFbqmqVpR9h/6JNJCR2A5x79Q6b39vLO+69xse8kKjHBJaML0/54MU7RtRVceT4TX1mMlMomFe1RBk6dO8qJk1/eVOjARJlL436S2H28/Ld5TEoW2aFJSBuG7tpM1q3dyL3rH+ShW2xXcd9dP+K+u37E8fPvcPDoZ+zd/xEXrpxGJUluQQiHMU4MGfFeCn2hrHMkxmB9CHA/fvoQp04fnbzQObKX85dOkXSDroWMo6IlQWHdcM5holUlWjFscCdpDN7VSOjhrlX38vD3nuSBDX/zlsZkw8ofsGHlDzh7dTv7vvycL4/s5ey5I3ijMTrNWrT4oBt0ISjCPVvNAPNEi0om6rPim2SBypjJu5+9L6ydsZJzu0Wn2HfJTZuPYCRYafAG4xKcU2ifMKN3JjOnz2HatOl01aeRJAk1XQM0NtUsXbzmlsZR+PYjQkeYEnJXANmDL0v9jVVTVZuPPQYTxr+50aT5+eF/x/sfvM7wyDXqXSE7xhAbGRbND8OqOUtlz/ZnIDQd1AZva8yoz+PpJ17me+t+c9LnduT0G+z58ANabohaZrFROlZ0zczgqpg4yw/rYHDJ0p91JjSM5eiJA3x86Oc8vH5ymV6P3PszGqNN3tn2Gn3DF1GmFfqERYuVyw4i7j8GAZeEYBAoFnQonlis3ls45zhw8FOefezGx6GUyrPlwjiHa9hey6XYX/G34fUYxBS6NCWqRquVMHfaEh579Fmef+LvT2o8JmL14hdZvfhFFs//OR/sfJtT5w6iarFPVlrEdujysQLROpHHoITYFZ14RocHOXR0H088ePP9n7v+PidPHaa7x2CVJa8blPlonM96Q2X/DSFUqojZ9qBVDd+sY+hh8xMv88Pnv1ofrqVzN7P0yc2sW/0eOz/cwpdHP6OVDoBuEvxWVSsKkNUvMqWMpTA++FBVOq+j44oaTjenmv0Wiz2G8LLCLRXupyx2Kd5fucAJhTA1wUpnrYG0Tld9FkuWLGfFyvUsWLCYuTPns2Lhk19p3ITvDiJ0hCmhbK2JsToqBjC2xUeU/yZ+fqLPHDv/Ftt3v8vFK6dJuj0JBjVOHE7x75KbxHvS1KFVjdRqVGp4cvOLbHrw1uItjp44wOXrF+iZroq4GxXaMgSzfqzk6/Ly9jr/d/lcPRiHcpb+wUvs2v0+c2cuYtWiyXUW3/zw3wGj2LLtl1zrO4s3YUJC+0rPp2ApoxTDECbwOMGHoM046Sg8KSoJVp2dn/7rG45P6oOQbFlP3XuqLSULipiK6uvR3YBXGF+n2dDMn72Cl57+EQ/ee2sWixvx4IbfZv78hbzz/mvsP/QxXrsQtOsdSrncxRqPlXImIOBdlgrtQSeak2eOjdvGo52Tpw5zve8S3T0JzeyahOsSq1YXLqvymJDHWdUYGXYsmLmQp594iWcf/8M7NiarFz/P6h89zxvb/wc+/Pg9RlrXoGYzK1uaxwhFCygqa4+S40r3TRZAHU5gUvtXSuWCZbzv+3gWWRWD6stH4UKsnW0q6rUZrF27kXvXP8CjG382uYEQOg5JLxemDOVBuSwDo1LrYmLaM7DKXOjbwZbtv+Dk2QNhVa6CdSLRcQVZuFCySJ9smzEwGlILjVFPa7TGow8/z3OP/71bPq9jJw/T3ZtgVQsyCw3OopXPLTaxcEms5aKUD6EZmctKZZ/VeFAWpxucu3iCw8f339KxbH7gb/PkYy8xvXs+yiYhUNWGSceFQipoUyrGqAgWnGzC1Shwob5REKPh+LyxONXg2KnDN9x/edUdKQI/g+CLbUDKBe+CizFM9mnqcFaRtgxzZ67g+ad+846KnMiyuc/y7JM/4J51j9BqAiQ4QjFH0Hn2TXClVSs9h3P1IVtLW65eu8DZcyduus9jpw6T+lEwqtSKxOc/OlY5juMTWyg4j21BY9gzrT6fzY/dWZFT5pXN/yEPfe9JjJqOdzWcB1VEBWfSVeN8WZSMDTjOe1F5S6yKPRFFppYuMr18qb5V3KZnTAZXeb/WetIGtIY1dT2X5574EX/w0/+HiJxfc0ToCFOOv4m+aY/ZiBkc7WzZ+is+37cbpxuYJJu0S5PRRFVO8zL/PmTutBqG++99gt96efKNOiO7Pv9zLl45S9Ktsx5DWXxJbO5FrC5bZKKEdF2XxcSoPOi66BOlUMbR8iMcOPgph0+/dUvH9Pxjf8T3X/gR07vng62jqOUTVXQrxWPLC/TlLRGKXlGFxSeLg6jB6XPHOXnxgwn3nY+5crmAyRuQ5u9XJ8VCyGZFIq2mpnrpTmbz8nM/5pH7fuuWzv9WWLXoBZ59+gfcteJuXEuHnmboSvZYmTyWTPv8HFu+gWWUU+eO33BfX555ncNHD2BpTVCrpxB/ceKPbTCCdyjBNxOe3fwKz2/6ekRO5IfP/Wfcf99j1ExPqFcUjxMzpi9W/G858yncTnGRMr6Fpoy3MW7PZ0UrC/dUe0xdNWlB55lg3iu0r6NVDwvnreJnf/MPeXHz/+GOjYnw3UWEjjBlZE3AgXHMz87nE2P0xyulcldKLDIX+dW2f8xnB3ZT71KgLForjAK0QZkkFw15obHMiqKUzxpOajQ1XNOwftVGNj9y88yd8Th0bB+tdATn0swSEFbpMdok78WEK1brui3AMvscWaBnbnmpOS5cPsGBw5/e8nE9+eAf8MJzP2LWtIUoXyNJ6phEY5Ikz6wqWxKixSnPdqLqcIr9hoZHrnPp8tkJ91uuoVLUOkkLgaDKbT6ClSRWxI1uK2O6SFQvjz30NA/dc+ctOe2sXvA8mx57nundc0IWk1dh4nWxFEDRL6xIM9egTN73qas74eq1ixw9+96E+7lw8RQDg9dQOlTfrVpEygH7VO7d4EqsQWrYsPYBXnnq//S1jkfksQefZdnC1fg0yWPoQvWhqrU0Xl8gVHD2xXcPwGudN/WdmKp1qL3lQ/5dyXptkVmGQ0+wYIEz1CCtMad3Cc8++UM2rr212k9C5yJCR5gSbFuchsvN/yXrzTgPw1jILJbzh9ARfOeeLTT9EN6UJ8tqLFBcYY7dZqiqm7YUSxet5tnN32fdiudv+ZwOnXiDo8e+JE0btFqtfNuVdNuM8oSJ13gVforPxclDVYRA042y7+AnHDr15i0f3zMP/wEvPPND5s1cik8NWtUwyuQpy0DegiO6JIpzqE4y8cfaJqfOHptwn+0ZMcZUe2/Fn/FdGaEujLOKWTMX8sPn/5NbPufb5aF1P2Pt6ntwVuGdwrnxGqRWzy+6A73ymLphYKiPC5cvTLiPU6ePonTWN0tVrSHlnyJNmswVm6CsYca0OTz64NQF0K5Y8Az33f0Qdd2Dt8X9GSl+r2bZxQDhYNmcXE2acpPd9my3iYi7D3VyNN7VMPTw2ENP8/j9t5aVJ3Q2InSEKaEsOJRSYwq0FStYk5vKi+BZh9aea43tHDz779n5yXs0/QD1bgUadGJKwsFN2KsmTEyh8Fw6Cl2qh2c3vcwDG35yW+d07OQR+vquYa3FWo+znrTlSW0Ick5TSK0ibYFNPWnLkbYczWZK2nLY1NNqWVrZ51op4d9NR6vpQqC0Vpy/fI6PP99zW8f41IN/h+c2/YDeZDZuVOUtNSBMEM6PbQVRqVxcCoz13mJdg7PnTt10v7kIcC7PtKv+mNxCUrXuadJRx9pVd9/W+X4VVq5YT3fXdFIX0pvLzUVDj7IYVF4EcZdjbLSGc+dPTrj9i1fOoRJVmqCLlgsxi0sZXbQvyCx/WiVo1cXihat44oHfmYKRKFi54m7mz1tG2grXNE1T0rRowhv6ZlVTv5VSeXPW6MpyE+sVgEoQf+zaXhZVhWU2ZmXGBU4ItFc+wbc0q5Zu4OUpsngJ3x1E6AhTRsW3XjZLZy6taPVpn/xM4ql1K85ePMaO3e9y+fpZTA3ILAblhyAwrhUnPBA9WE2rYZjeM4+nn/g+jz9waxlWZY4ePYy1HmtB2QTXqjE6Ao1hRWvEkDY0rVFDs2FIRw22kdBsGGyrTmvUhJ+GpjWqaAx7miPQHNY0RxTpMDRHHGnqqesu9u/fz6cHJt9zqswTD/weLz7zKrNnLII0QWd9joLFQlWsa/kEHkUOIS4jpvxbHNf7r3D41PguGu9DM80Y3KxCgAbl1OGyW6PyCPIK5zTTp89ixfK7butcvwqLF61g3tzFtJpFQ814X5mQQjcmRiT/jHKQOM6cGT8g+ei5XzI8PFRxwbZbKypNPCtxKYpa0sualeu/+kneIktnbeLudfcDBpsGoROOqWzxG5sdWf7vZLuC52OtxsbmTIQjLDCw0F2fzvp1903+5IRfG0ToCFNCXPHGgmMFZfdNIHRICOkWntCdeNT2sfPjrRw+8QWYrFFn5v4oWySstdlkErOb4gPXBLdNmuAbCZseepEfPPePvtI5DfQP49IatlHDNrrQrWmYdDomnU7iZ5K42Rg7i5qbifEzIZ1Gks4isbOoudloOwvSGRg7A5NORzV7odWLSqfhmt2oZg92uEba0AxcG+T0ydO3faxPP/JHvPjM32DmtEX4VhA7cWWe5XoFi4Uqu85CVeI4/6ZpE4dltDHM9b6r4+6nIjiJRQjjNsuB4uXyAcGqYVQCqWLZ4tXcv/7Ht32ut8uq+c+wctlqlA+uTZMXxcvil3T4PQaUQxZZ4jzWW8DTP3CdI2feHbPt631XabUaRDer9a40JtEFBjiFxmS5R1n2oE/o7Z7BqpVTL/4AVi1fw5wZ81A+yd1qeVkCRV4IMxDcW+0u5LKIG4/cypiXLSqy3KrEtutZ3FRWFsFZxcwZc1m9asNXO1mhI5E6OsKUoHJTf6guG0Ndy1aEPN25RLA6NDh58iipa4GxOD9x7ETen6e07Rj7oejCqF4eeHATrzz31YqsAfz0J7/LSHOAMAnqysO9qOTsShN6OBaLx+gazqe5WNO+5CbBo325y3jov/PQxh99peN9bOPvYm2LLdt/xfXhi2hdI05a3oPWpcaJLjT1dCq4n/JkKh0sO4OD18fdRwggL8YitLwomjrG18P2qhVtg2sPVixf/ZXO86uwaMEieuvTGbV9lANkY30Xr8cvdQDZ2PiUkZGBMe9d7buK8ymOtKhzUP7bMdadWIQvFE6cOWMOG1a+8pXO7Xa5a8n3WbzoTS73nQHGEzGhMW21zk01/uhmjXl9zMRTLneFTYbQgd2QqB6WLlwhRQCFcRGhI0wZZbO/9/EhmWUaxYkwpjTrrLmfD1lALdcgpjrbWMvD27wHTqWqaptrAUD5hNaIYt2a+/jZj/7rO3I+61e/cEe2M5VseuDvgk5474O/pm/4IqgmHptZ24C867POup5nE3yWKqzxYFOuD/TdcD9F+m+WVZaltysTU7dj+E/IgsNp0AnGaObNW/T1DcBNmDN7AT090xgZ6A+iWUE1/8yRhXDn4+SVy0YpWGuGR4bGbLd/sJ80r1TtgtVIx+2AUjrry5aJ2ywv0HuFa8K82Qu+7lO/IfPnLsA7FTuQ4rOiikbFsgpFxlQgE7TWYYLz84bbjyUMgLyvF9m/Au1CKVQdV17hU029u4flS1d/1dMUOhRxXQlTRm7C9jEIsxA+edZFyVJTjr0JlVltnsId/ibJP19eTZYtKEqpzGWlWbZkFU9temEKz/jbyabv/R7PbP4N6noaPk3wLlSTjXFME8WKRDyWRnNkwu3r2Eh0nFV8jNcox2rlVh4L03qmM2P6rDtwlrfH9J7p9PT0Zvde1UoXjle1CfZ4/OH+s67JcGN4zHZHRoYAn7feqJQXKN2v7dvGKYypMWf2/K/5zG/MnDnzgtWPIGaM0iTajFvrJhItOTeqadWOa/s+j7fNsa9BvdbDooXLJnk2wq8bInSEKaGSMeFi6fji9otZGvnnvUOTVeUt1dWJBe6iGyhm7+QP2qy+RvHg1TgL03tnsvnxp7l7zeQaZXY6Tz3wBzz/9G/SVZ+JbYGzIW4mpHdnAZ55wHK1HK33Pos3GUslbVpVr3ukOsmbSoxVT/c0urq6v45TnhRLZj/LtN5ZKEwWRB2zfLJMqLYU6yohfqfRGCsCh4YG8s7s8bNVHZhVoY5ixxaZTUlSY/r0mXfoDG+P3t5p+e+FuGkr3pdbdArXsstcsU7dWOi4rBdb/j3PFzlFDF9VdIb4HO1DscGurh5WL715x3bh1xMROsKUUn4oVh9o1ffH+/dEq0ag1DOo/Lcm/0yaNm8aJ/DrxguP/QMefuAhFLXcotNuIYOSWMGFisBGt1VYpvLZ2NBxTFxOZs9wVK0X5f3V690k6pv1qNdqXUDVSlg+zvK9VsSEubwQVLv14vz1ndg06xXlJxZ94465D9+Rer3+NZzp5DHGkCRJ3rZFq6Lu0njHH4nf8YksNOXtly0/5XsjMnYbxfe5XvvmxLHw7Uee/MKUMGZlr2IVZIq4BeVxPtQwKVt4yg/LwlWQrR51qKmRPxi1yqwKpU7HBkaaQ7zxzmt8+uXPv4Gz//Yyf95CIGZYFdfHZOMd4lQKi5rL4qQmnriyi9b2vvWu4uYoV2MGxmmi+c1hVEyLz+5EX7XExGPWWYXpanbf+GLcudDtu2KRKNURimPd/j1RKlgwv2mRXr6awcKn8tfKqfjlTuXlsSiC8yem3U1YfX38woMxY28y2xd+fRGhI0wJNi26M8es3TwzpxyTQLXOStGXauzqrjwBlT/Tvi0PeG25eOUMO3dt4fSlLV/z2X43OHn1bQ5+uQ/n0zETaWxD4UrCMndHODfhxJu7E7zP0qOrsRrlYgJj41+Cpehmq/+vmzSzvkAR51X+ia+X3w8U4rDMkjlPQt4vauxkXh7X9ntdOYv3ExfBnCqsS0vNTatFJccVZ22W25uKV19kSI7/XR8nNkd986JY+G4gQkeYMtpXglBUTo3dq40m6/Bd7i+k8uZ95X5DoMfE5OSr51IPJ49DGeiZUefI6S94f+ett1PoNC4O7GDLB6+z/9DnmBoo7dCm6CnmSzE5zpbcMd6j3M0nruiqChT1Tsa6OUKXcKM12of4ljRt3slTvWVarSzDj7EB8rGKsfc2C5CPQkfn7xtTG7PN7u7ukmAMP0X5gLQiEoJrDMK92yK1TUbHifuZSlqNUawNxxkFRvw99poqi5RqU8+bi5Ebub8gZmWN93osVzC5YGfh1xMROsKUEXtWldNQ4wMxPijH89GHEOQ6zhp8qsAH83h7tkplP5RXmCGY1qsU0wX7v/yYX73/j6filL+17ProffYf/ART93hli1YGGnRbtemyhS26X7oniIlwzlXK/VeuC6rivsrdZFl8htKe0cYwrW9Q6Fzo385oY3hMW4x2qlae6FYJqde1pGvM57u7e1FqvMdtUYOpiFuymWXL4nVYBPT1XbszJ3ibDAz2jbE8la2xULWulK0zk826UkqhJ3CLTvza+F3mBaGMCB1hSogZUxqVWWwC3ts8kyr0uMoaWzqwqSM09dbMn72IxYtWhcZ9qp6nRBcPufC3Wid5cbswqQYrEPlK2eEY4aO923ln9//vGxiJb543d/9TPtu3A9Pl0DrrrJ4H2BaVf8PEo/KaRRDq4CgM3d294257IvFZdfGULSPRohFiXRrNQfr6rnxNZ35zBgf7GR4dCoXr1Fg3VLQSFtl+Mc4mVIvRqj5u1lhPT0+bcCT/PRDdQmVBoPHe0bJNLl85f8fP9Vbo6+/PClwGC6r14Cgsre2xSjFWDoo4mhthEl265zIr7QQezLL1a7x4IEFoR4SOMGUUq7rCxK1V4Zsvdz3OV4IWnNVMnzaXJx99lqULV2FTTaK78no87fsYL44CyNtJOJXSP3CJ7Tvf5uP9/3pKzv3bwlt7/hlbd7zFcLOP1I7ivM0tKoFihVzOiitcBGBMjRnTZ0+4D+XK1zBWih7/UZM3//QWpxzNtMGpcyfu8FlPnotXzjMyMogxY+NO4r/LgfE5mXs1SepMmzZjzHZnzJgZBLcvLGXtNWjGm6zD+FiuXLnIuSvb79yJ3gLnB3Zw8dL5MQkBhevNVb+zbdawskVwIpQv7psbfq7NamR9tAYLwsRIqLowJViyjCivwBMCVb0LHcdj7ZUiIauShaO9wrU0Kxavgoc1W7a9w7WhCyh06I5deYjGjJik8tDUSpH64JrBe3TdMdy4xp6PtzKtdwYbVt16e4UvDr/BwMgVUClG+azuj87Sp6sF8aA9XVlhlM9TrSE8rsMkEeOWYm2bBGydmdMXcN+GF2/5OCOvb//HfPjp+7RsP0pbrLMoPN6HdHDnHGiNx1PkuEQLj0arcN0SXWfWjLnj7qM8V2tUqKGSNQ/VWodrPk7QqnWgvMcYOHfuNKcv7WT5gk23fa63y8XLp0jtCLqU5KNU6D3lnEMZQ9kLE+vrGBXu68R0Ma131pjtTuudEdp+lBK4nEuz+xTySsIuNs2MbRQUKEf/8FUuXT3Hknlfx1nfmGvXL3Hh8nlMTWNtsKQap1Dh7hkj0MrCLb+3/c1cV6XgZZ0Uvb/aCHF+4T5Vpe+3xOgIN0KEjjAlKKXwut2HnwUnex/6KjkXRI5zeB+ze2oopTAYFs14kUX3wUD/CO9u/yUN20QlLpi6J8hkaV+J58fjPVpbTp07zLZdb9M7bSbL5z97S+f0wbZ3+fzgburdHnxK3WhUYvAEN5DXCoOqWETyB7XXY/7tncNamwdeOkdoqukSmsOGl59/9baFzlu7/glbtv0SpxvoWsjiSRI9NsYiD+xuK+WfTSTGG2q1HubOufmMG2Mowtir/Jq3W9rCtkMau65rzpw9wYWLp6Zc6Jy89C7nL55F1Ty+zbo4XraU1joP0I1FMKfPmMFdi58es+25cxdS0zVSZ7LCgeP3axsT96LBGcdoY4ijxw7wwNQ3MOf0mWMMDF7D1BXeFy0f4jFDVeBWX68mH0yE9x5MgrKmYpVtJ96jIVg8MvHnBQHE5idMIZU4Da3CT5Y15VILrlRp1XsouT/S0qTw4pP/kO9teATtusHWQryOj1WUs6LLeVfolBj/oDX5T5JoVAK6nnLi3CE++ezW3QLLli2jVteQtFBJi1SPYk0Dn4zik1FIRnFmBKuHsXqYVA1g9SApQ7QYrPw7VUOkehjqTXytgTcjeD0CpknqGyxcuJD16+++rXF/76P/nq073sSqUXRSDeCMWVbKh/oxujKhBxGp85gdAxhmz5rHqqVP3XS/RR2komZOORW7HKxavJ7SSIc4cfLwbZ3rV+Hk2cNcvHo+9HFyRUdxnZhSfaYsjiar32SycjvKa5RVzJ89fp+ue5a/SnfXtLxjfIzriVRdfSGrS2W5+tqAVy3OXDjJyfNTWxrh5NV3OXR0Hxob7gVTdUOViyeGe6S4v+J5AZUA9ZsRx6XdSlMIylikQKYvYXLInSJMKVX3TbBmxNL47XV1igcnpTokgc2bXmLtqo3ga3hXQ5du5WptFp+JHF15DZUJIWVJGeHz/R/y1rb/4ZbOZcOGe5g/fz7d3d0kXRrTBUkXmLpHJRZtLLrmUIlF6RSMA5OCSVGJBRPe0zWHNhaTxPcdGBssC1rR2zOdZ55+ng1rnr+l44NoyXmdkVY/uuZAhSKNYzPTxo57+TNKKYxK0KrO0qUrb7hPp6oxG2ULTvvkFcVWuBdC5lVPT50jJw5w9Oxbt3y+t8u5gQ84ePhzBob6gjhWPq/+3B6DorTPBXpxXhp8jRUr1ky4jzlzFpC2qk0qvfd57aC83QZtcTsalGlx8dIZDh/Z//UMwAQcPraPc5dOZ9a/aoZT+f4YE7NE9fs8GdeSc65UkmBszNJ42VVFttr4lboFAUToCFNEEXTq84d7+WFuYtdsXGaZCRWSUQ5jVJhcSiyf/zTPPfUKc2YsxqUaTS3LAIG8FTpQ9MPyeW0SCNEPXoHDorRl1PfzwZ43+Wj/v530Oa1f8RJ3rdqAokaS1LMYJE+s4aOUx9sUnK0GWpcKnRWWA5dVeLbZsSYkphvtuli7eiPPPPZ3b3nM3//kj3l7y2v0D1/B0cLaVnYxylaUMD4x1qQ4zhBHZB24vC+Zxuhuli5ZMeE+xxSKK2XT5Rlw5cdOJhiiZcArT0qTwdHLbNn+xi2f8+1y+NheDh/fj9KWNIuTMUZVBA2E43S2mlVmdB28obd3JosXTdxYcsnCFaSpDbmHHnClisheZw0zIWZ1FX21wndgtDHAZ/t2cfzc21/LGLRz+Pwv2bf/YzxNSKJFLru3tc6rZFfi0EJ9AqqF/27uWvKUa/O40v1ZRdEmgG7SQ0sQQISOMEVUaoWUGxg6FeJT4kNRl0zjuVVhbJovwPoV3+el53/IgtlLsQ1QrvqArdY6UcVqPOyoEBs4PA1SRvhg15t8dujfT/q81q/byLSumaUS9C7PMik/rHOB54tMlbLwq9YmUYBCu4R5s5dw/72P3NJYA7y1/Z/w3ge/Cu6qmsO6Zm45aHcrxN+VUpn4qx4T6JDh5jQzps1i4dylE+7XOYf25WtQVEceb5+ROGZJkuBpYVWTYycP8Na2r78EwK79f8r7298mdU0gDSn144xR+bVwhSAUrVS4JixesJy7lj0z4X4WL1pOvdaLtSHmpxw3Fi2XE10bpzz1HsX5y6fY9eHX7746de09tu96h0vXzmISC4TsvKKekquUiRiP8cZuIop2GuOPQft2J0o9F4TxEKEjTAlFjZA2v7sKq8Dow/e59aC6CpzooffYPb/L4488j1Y9pC0NPlRSLlJc2wI/lcktLwBJkoSVuwalW5y9fJwtO17n8OnJWRMevee3WTBvCa2mQ5esFXlsAiqscjNifZDcIhBjlWIVaJWJBZfg0xob7trII/f91qSOJbJlzx/z/s63GBi5ik7C6jtJktCUcQzVLK+JUF7jWo6lC1eyctHmiT+nimaXxXkW1qssBL3tb2Lwc7Bc1Go6TK61Brs/e493dv/zWzn9W+KLkz/ngx1vc+nKaUzii2NXsYfSWMGqlAIVgs5jsUtNnWWLbuzSmzd7ISuWrMZbHYLwVem+Vq4iwuO+ohUF7fHaY3osXxz6iF9t+f9+DaMRuDS4nY8+28LhE3vxagR0qCwem5aWFw/ttN9DWil0ljp+IypC+AafLTcRqbioJ3Niwq8tInSEKcF7Hx54E/jY42eqk4pl7LQ4lucf/fs89tAzaNeFt6EsoTE1jDEYY8Z9MLssw6lsWXGEeJkzF4+y86MtnL++c1Lndteaexi4NgLOYHQy7jm216MpH0/ZAuRtcIXYVDNnxkLu3fDgpI4h8uH+f8WOPVsYtQOZyAmVh+v1ej4WcZ/jTVa5K6Ucs+MVhhpdyTTWrb33hvvPBZ6FcsowjF9LJ7iryi4vjzKgjEfpFiOtPvZ8soX39/yLWxqHyXD4/Gu8+c5fc/biCbp7a2jjSYwOQdlaV+6dyJisKGXQXjNnxjyW3MClB7BiwVOsX3cfijo4k2+vTLlYYx4onruFPNo4VD3ls/07+d/e/u/u2FhELg/tYOdH7/LpF7vxagRTU5mrKovTMqHYocKFdi15jEzVIgUUJQuYeKGSk1kQjR6bMVn9WNWlpcuLBkGYAEkvF6aEdouB8uT+de98sOgoQm0OP7YyagwMnYhHH3iOkaEh9h/dk1lngu0gpLeGeCDvVGZlUMRnZVlkKQVKWdBw+NgXTJs2jZ++fPMU57tW3s3a1fdy8epxVALONfEoYu2ZuEpVACqKjex8fKgVrfH4zNyhqdHdNYsH7n+cdStfmszwArDniz/nnW2/4PrwZZIEvG4L6C5RPe+S6PEebwsXgvcKjaHV0KxZcfdNrUsx1ia2+4gCLqZglY9Fa525McuCqHRceHTSZHj0Mu/v+iXXBi7x4P1Psmr+c5Mek4nYeeBP2L57CxeunMDUU7QJLlKVp07HTLFqUG24d0yeEq9QOGtYvmwNG9f+8Kb7XbViHbOmzeXa4DlMktWkMTqrPu2zPG2fX7eyRSmf31WTwdYVPv1iK8Mj/Tzy0FNsWPYbX3lM9p/6Sz7Zu40jJ/aTukHQocxDuC8MWdRcZtEqBF9+jaEUoB3cpFrpYP3SY0VLlWogvPdqjKiJ+y5cvL78xlc+f6FzEaEjTAnFg0kTJ/loPfA6NFCsfq60ktVqArdLwfIFm9i8qcXFK+e4cOUYXdMM6FBVFhXq0UCYWJwrAqHLD1OXFR/UJqVh+/nk850smvcnbH7oj26479WLn2XTw0d57a0LuOYI1E0Wv+CLwofxXEuTRdV6pfDe4Z0mMTWWLFjNS5v/z5Me32Pn32Drzre4dO0stbrHqVAMMMSCFJ9rnzzax6GafWXwDryv4WyNtavuuelxKOdzoRNETbb90mfKK/32Y4g25jBhhjH0xjPYuMKO3e9w/uJ5HnnwPI/d87uTHpsyJ6++zSef7+LTfbsYaQxQ6wLrdDa5ls5jHEtXfD3UeTEor8AmJKqbVSs3TGr/9yx/lWWLt3L+01P0zChbzrJ7IvaC89XvQS44CL3JUJ4U+OiLDzh+8jBPP3mK9es2snjGk7c8Jueuf8AXBz/m0727uHj1DN29gI5u5rYq0Mpld5XJBM7EgqQ8djeL0RmPsgAui5qysIrvl1P1BaEdETrClNCeYpyv2hzAWAuL9Q6PwnkwqJtadABWLXqGl5+7zjtbf8H1wbM4PQokeNKiqEse2BwflsV2tdY4LA4wicW6Ud7f9Qa6lrBp442znp569I84fuoIew/uQpks3VUH11EIgg4xGdr7YKbPLD5xMkErfEujVA2bJmy8hQDkXZ//Oe/t+AV9Q5eod0HLNcGGWkEBl2U+ccOVbyzUFi053oXsr7TlWbf6Xu5aMwmh0yaiXLbPaLEou6jCpB2CnzUGsMUE5j0ejbMp1nqcV+jEc/TU5xw/cZBtO95g7ar1LFu2klkz59HbPZ1Fs8fGDp27/j59g9e4cv0Ch499yelTRxhpDYK2aONoNJso5anVso7j0fIwkSfE21DKwCu0q5M2NWuWr2fzw79/07GJ3Hv3wxw+8gWN9DqqS+N9mulBVxI+0doZjscYnV8f78FZi8sqOF8dOMv/+qs/Z+HuJaxd/TpLl6xi4bzF9PbMYMmcsfWOzl3bwcjoIFeuXODEmaN8eeQL+vovo+ueWt3TSi2ooiSD1qHGdbgs4TWnfOY2cmHIsgB0X/oeB3dwkUV1I6LwzYtHZpWUFS67FoXbs7otPc5rglBFhI4wJeSp1b6oTTKhGbqE1hqXukpLiBuxce2PSdOUdz94jb7RC2EFWmqrEKrZ2sp8H46hsCiZBHAeU3cMjFxh54fvMGv6LO5Z9eMb7vvh+zdz6ep5Llw5gdIK61O887k1ynuLKpe6V4W1xdkgKkgT5s5dzBMP/N6kzveTg/8Lb235K/pGLpLUU1KXZiveKODGZsbcaLwLFw3gNa5lqNHLPXffP6lKxTcKUi3qrtjK5+P71ckss17kMUMeZ5toY/DacfLMQY6d3M/smfOYO2cBc2bOY9q0N9BJPRPTKaltMjIyxNXrl7l8/QItN0q9pkK14WziNkZVrv1N7zKfpXx7hbOKmT0LuP++R286LmUev+93OHpkLx/v2xaEgtEhw1CFfm8VV5AOmYlj6w9l73mL1456rc6Fqyc4ff4YM3pmsWjBEubMmce03reo17tRSpOmLRqNBkNDAwwM9nH58gUGR/owdU1SB3DYsjXPF25F5z26HN+VHYdut7agsHm7h8IiNBlivM2ttHMIQtqMe88JQkSEjjBlBN9+eDgbpYsYHYpJrhzk6VwIFtaKW3qQPXj3TxkY7GfLtl8x6ltYGqF5ZZJk7pysjkn2E2MOAlkAqA69iExiuHjpFL98/eckr9ZZd4NYiHvX/iaX+i7w/rYBhkcv430a6gF5n2WsuLBhwOjCBUI2Cs4ZpvfM5cknXpjUee754s95d/svGWhcJqmF2kOxrYPOvtrRVRYzfGIMVDsqrL2DJQdN2krRJBhXY/36jWx+YPIWi/YS/iHAFmJJgfFcErngcdHyVxU/QYAGKxO+Ra1HUVcJw+l1hi72cfrckTCuJgnWgCw+CBPEjKl7jDKEatmOImTEVIWfiwHY2du6muqcOotLg+uGBty14V6eeHDyYxO5f+MTnDp7kr7R85h6inMpzrtwfVwM1srGKRM7KhsYb0NPNWUUiQ7VqvHQ1aOpdxucG+Hc1aNcuHK8CILHkPqs4rNPMYSg4u7pYUyC26ycNRcDoCli3NrOIbeRep/Z48JntQrZUWG/N2/oCYVLMLaBycf9JvkyKqR0idARbohkXQlTgsZRKe5V+j2PsazEh4ztnn0rPPPoH3L/vY9hfDe4WpZ2PrbPUjvVAEeP8ymq5jh36SQ7d7/NuWs7brjf5x75e9y74UES1UtNd2FUkk+c5XOpVNvNGnemDcvyJXex6Xs3t+Z8fPB/YuvON7jSdw6dVVNur8Vys/MbL66iWK0n2FQzf84yHr5/8nEfZUsEWTE5IK9+HIJUq8UiYWxByXL2UWXbKrgDVeLRNUjqiloX1Ho9tV6P6U5Jehy1Hqj1OJIuh0paoTI1oR1IPKb2e6FqXZroHtHgE0gN03rn8uD3Hp/02JS5764fcfeGh0jMtJCFRdmdmu2nbVwLd1BRqiG2NEHZkGGXhOrcXd2aeq/HdKXoegtVb5LUW9R6LPUeSLo9ZNW7Q5ZbNSsuGGXKqfVV15EqjVf4r8OME/Q+2e+u96EKeMw0K7Y7SYxMZcLEyN0hTCljJi9C5d1YP6d4r7xKU1kMx63xk+//56xdfR+uYVDUwko4m2wrlYBLz1MdJ3oXso+st3ha1HvgwOFP+WD76zfd75OPvcjKFetR1DGmlgu2kFsTq90WE4QCSDWze+fzvXsevun2d+39l7z1/mucv3oKTysLYI1ZQtmPCj9ZMlveyyoXFvn6PBR+i9WPQ7d0A01NFzPY9Mhz3HfXb05muANZKnJFPOTWK1XpjVRNSy6ynArRYyvbyccrb3paEs46pF87HI60Umm62E81xT8WqasIHx1+vAr9rKIwCy6VUDGnprqZ2T2fF5/+IetXvTz5sWnjJy/+p6xb9T1Iu9GqKzuJIpbKO4WzYNNM4HiF8z4r3FeMWVFNO1rPfHH+8b+0QKV43yJWH4/nGePIyu0XnHNB7DhF8DRGIZbdJ1nVbJ8dq1Ohn1UU85Hy2N8QXcpsK8f5qBheN7YGV5mb1ekRfr0RoSN8I0w0+ZRXieUJaTLm7/F44uFnWbxgNa4ByifZU7PchLCoA9IeMJ2vZjVY1SL1o+w98BFvbvunN9zn0rmbePqJl1k4dzXadWHoQusEpap1WUJ39gSFwbYUd625l0fu++0bbnv3gT/lr9/4Cy5dP42nQTMdoZU2K32SypRfa7dU5ONPjHHQKGfwaULdzOSRBzaz+eG/M5lhLu0juBuVq1ZXbrea3IjqZFmIn7GiB8p1CAohpLIJvtxvS7X9d3zrXrtRItwDYXw0Gm+7SBuaBzdu5unH/oNbGpvxeOLR55g3aymulRCLXVoH1oZjdZllJb9njc7dOuVYnhjHVFQYzoJ5s6ag5VYN8b/F+dsxM0GI0QnWRmt9VnMqZC1W76n27MGx99tkCWLu1v8mHK+4roSJEaEjTAnlSWV811QRqFwRNVqFYENze+FkG1b+gKc3vcTCuSvRLvTD8qGBUxaPUW0bkU+AecXi7DC0Qteg5Qf4+Isd7N77r26433tW/yYvPftj5s9eiWvUwCaAJrWeZtrKAqJD+razCT1ds7l7/QM33OaOL/4l72z5RVEMMPHU6klYyXtCZpVTRYYV400AYVUeu5R777GesGq3GtIaNLu4/54n+K0f/pe3MNKBWJV6PIGjfNUKU0y6ZTdVYTWA6mreVE7F5RaMWP06TvRhXzrrJVXaVptwiJN0eDO6g8hrLcUf5xyahIRudNrFhjUP8urL/+iWx2Y81i99ic2PvIC2XbRGFc7rkGWWiQqyatnlMfQ2WOF8biVLcstHZSxLzVVj9/V87LOCf1oXwcXe2Vw4hmynwrXqUodtpblYdF7l7UyiJaoicqzL7zEImZOTIYhKU5xPpmO90tlPkUCpvAgcYXKI0BGmBjO2Tg6Mzb6Kr5Xfj393uzy28Xd5/OGn0L4b14xtIor3yxaCIkakWpnWGIM2HlWz9A1d5v0db/LF0f/1hvvduPZVXn7uRyyav4pWI6E5qkibKbblSitjjXPBmvPwvX9rwm3t2fenvLf1da4NXMbUCFV8E029nlCr1SrisTyW5bGL/y0sJmGyT1sW7xJ8K8H4GTz8vaf43Z/817cx0lnlGxdcGd6FYNJo2Ympw2Wqx2nQyuBsqKuklEFn9VrKqc7tYrkc19G+7bJFJz/GNhEW7zGdH0vWjiMTRsrVIE1wzTrrVz/AKy/9zdsam4l45L7f5pXnf0K3mUVzBPC1rH5R1h8trVoa4+/R2lQ+3/zcSrWqyv8d32oaXGBjrKZe473BWkWraWm10kqndXxRDyn+Ox5X2SpXuAknpt3lJQh3Esm6EqaE9iDYmLoaO4rncRtjnnXh4TmZOjo34tnH/o+cP3+evQd34X2Dph0lVSm1xOSr4HBwWZ2Q3FUSqsO6zIWl0CSJ5+rgOXZ+/B7TemeyevGLE+5349ofA5ptu9/i2MkDoG1YSWduIpRhWtdM7lq5fsJt7Nn3Z7zzwev0DV8Ek4YsGIBYTbl03OFVchdAnv4blr/gYzB0tvonwSiNb9aZ0T2PB+9/ildf+g9vd5grk7NOXNA1TuXuJAXZvuNEnB1+JoxmTp+DtZ7+/usk9Tqo2KssfF7F//chkyvfr9Jtk3oU1plbzitcFstSRaOz3mfWhawjH7edtb7A11G2l7vXPsBTT7zC8oW3XpTvZjz18B8yMjLCB7vfon/kEkm9hnONrIVHe9sJhfc6r+LsvQ/WF4KbKrwYm28WmWwhcyqOY3XhUcQpZbWtYiyONeA1S5cs49Llc1jfwNpWGNesHlXQOkVDWq11fmGVUiid4G62ps4qTse/1V4Fq2sUcs6ijMa5tBDpeTZmcX8IwniI0BGmBq9DGfhsIjQqyU3r42X/xOnIKF0xgX8VfufH/zdS+3/nswMfopJalhWkgHLl17KVYaw1SWtwpNS6axw/c5AtO7vhqYTVC56dcL8b175Kb28v23ZN5/DxzxkeuYaqaUyS4FLD3LmLWL7srnH/dtfeP2Xrjje5fP0cmBZgMTrWfrlRPEPRDTrH60wc6BB07ROghncJM2cuZvPjL/DMY3/7Btu8Oe2xGs6FSVQbQ6yNE16PwbRFA02XeubMWMi6tRvYu3cvly6fQ9c1TqXZ1os4naLrd7QQjl+TqXBNkV/riXowFfE4BJGjurBW053M5J51D/GzH/1XX2lsbsbLT/1DajXDtj3vcm3gcmjBgAVTtrxULTKuPQg3dyH53MJTvSZjBUfVChgakjivsalG+Tob1q9n7fqVvPHma7jU58Kw2Cbk92J09+poMfSFmr0BUSDlFicf6wlBjLsq2kuUsr4U+bkKwkSI60qYOrxG6yRv5Nhe6Cs+zMIDLbgrvA2BrVmXyK/MY488z7zZS/GthER34Xzh+w+ZH9GMT9tPqYcTDk+Krjm+PPo5ez7ectP9rlnyAn/3b/63PPP4D9BuBo0hFVxprYR5sxaO2xF8z74/5d1tv+Bi32kwLaxr4lyY9OOkVWSrFbEuxYSRddhWJtR9yT4frDjd0OqiNVhj5ZL7+dFv/N5XFjnFcZXcZZ5KdEaMe4muIevAulAwMU3B2zob1j7Is5u+z7SuBbRGNIaQpq9jYLop3C7OZ5WCvM2bTJYnTKMAZ/G5aA0WgvayBcGakKC8QjmDoZfWsMak03ny4Ze/dpETee7xf8Cr3/8ZS+atojEI2BpadaFKcVVxfIMo85lVNLjbQvROjC0CtIl5fRW3LPGH6Jqthe+mT1B0oW0XjX7P+lUbeeGZHzBv1sKsSnPYj1GFCzGTnuG6ep1b0bwi715+s4kmZgSWv2/h2MrxW67i4vKlRdOtBj4Lv16IRUeYErxXYMEZBTaLMowV+4jP3Lgiz2J3sgncOkuapjfY+uRZv+L7/OClYd7Y8lecu3ScWpcuMqx0OWulCJYND/EiRiKmPqssTfeLg58wveuf8sPn/5Ob7v/lp/4hs2fN4/Mv9nDixDHqKmHB/OVjPveLrf9vdu55l4YbRCcWT2h8GovegWkLoCb7PVaeLralssR2BWjdhXMa5buYP2cJ9657hFee/Qe3PZ7t6Lhv67GtkMKMI485Gbvy9lgcyodWE7iEhF4eWPf71Gsz2b77XU6cPgRJFDVpFqQaU+jjeJC5s6oWHj8mpkXRnsGFV3jXQlFDO4NzikQlrFmxjoe+t5knHrhxJtyd5oH1P6W3ZwZ7D3zMgaOf0T9wJbipTGgVYWMBvyxVvIi3KlKzYzWk2EU+Bg4bY0jTajxOcFc5jKqH+KCWprdrDo889QAPP/QEaxY8x/6zPwcMzkHasiGeKcaExaBhFbbjstWKTR3aJCEB4CZCxHuPs+HesdajvMLaqtVI68ylrEB5j8aHZ4orBKwgjIcIHWFKCBlGOtQF8dHCXQQia+WyuILwUGumFmMg9BaqBpN+Ve5f/ze4du0ab225zujodVQ9iJ0YC5H5r/DKZ5aQaH1XpYwcHT4GNEYG2fXRB8yYMYunH7l5yvGjG3/Goxt/xhvv/QtOnTzN4vmrK+//4v1/xpZtb5IyTK1b5yKsZpIxbrU4wRU9gmJl3zjRh35hypoQ1+FgxvS5bLznER68fxN3LXvmjoxpTmaxSdMwnioTOFa3tTbwpewZpfFWYVNwVrNgemg1cc+qV+npms1Hn+3k8/27aaYeUzMon+JJUWisKxpihm2RBcNmE338dxSrzoOPLrVQUVjrBGU1aepptTRzZi3m4fuf4NWX/uM7Oza3wLrlL7Nu+ct8eviv+OjTHRw9th9vR/FJk9xr6R0+i3eLY+vJArazHlnkYji4O60N7U5CVpfLYnUU2Bre18HWmT9rMY8+/BzPPlFUfDZ0YVNFY9SiE59lbOlcYBQhYEFM4UKDWqs0+MmkmmvS1JG2QHkTRE7mtgqWInBaESuXB42jUE5lzw1xTggTI0JHmBKMr5PoblIH2oAuFYhDQaI0Sps8q6OmQzl85UMlWkPtjh7Pc0/8EYODg+z86D0co8RuzcornMr2XXT0yVsp5NG0XmcTJhhdo9VK2bZtG8r38NSjP5vUMbzy/N8f89qb7/8J7777NroO3d09oFqgaqBCKbzomskL8KFx3pOUXAnOgdIG13Q4p9CqTr2rm96emaxZsY6N9z3CvWt+eEfGsR2lamhfx6heamjwDpeF5uhSVo5BZZN0aEuhlcajML5e2d6qxU+xavFTLF/+F+zd/xGXLp+k2RrCulEwkGRWtSJINdxbYeLVWWyQz6wK0eWhMstTsAgoV0eTMHPaDNasvo+HH3qCDStvvxDgneTBdT/mwXU/Zs/e/5kvDn7ChSsnGG0MhJYR2qJ1UXHcRcGbeXljvyooBaX72NdNZ/FvCfiEWtJNT30WSxeu4qEHN3Hf2u9XjkPRjbJ1bCPB6CRYB5XJW42EfWTxVtZjlMd5wGlcK8HZGy9UvEswvhvlekLrEaNK4s1jMNgsbgflgqHQBmul9+BaInSEiRGhI0wJc+csYdnCdei6RyeFVcLbMGEn2UOt0WoVD7gsDqUr6WHZkrV3/Jhefek/RqkaJ04fDT168qK0RYpsQOcuq2D5MZXCaVolGDSNhuXsmYtwaz0eKyhX466Vd9M/fInh0Ss0UotzNmt7UAsLeeVRKgm/+xCDgwuTmXPgLShdo8v0Mn3mLBYtXMHa1etYtnQVK76GjKEyKxY8xbJFW6klPSS1wtVQEGvVlNKJtQKncE3PwgUrxt3u4/f9LR6/72+xZ++/48iJA1y8dJqBoWs0moOg0jDpao3SwcWXecyCZS6TrNY5fOqxqQJvwBtmTpvN/DkLWbJ4ORvWbWTD6pe+xtG5fR773u/w2Pd+h72H/5ojRw9w7tIp+geuMDo6RMuNhntWq1ALJyPcnZmLU8XvVOhD7izUaz3UzXRmzZzPyqVruWvN3dy/4ZVx979+6fdZseRN5g71092ToBPVFiBcSiG3LiQeZNhUs3jByhue3+zpi1i2aAMjjYEQg5VZcxw+q2NUK4KmTShzGUVd2lIsWbT6NkdW+HVAeYniEr5lnLmyg2Xzvt4J+dvO/mOvc+nyaS5fOcO1gSuMDDdotEZJ05BervMsI4PRNWq1Lur1OklSo7dnOnNnLWT+vEXMn7eY1Uue/qZPJ+fk5Z0ArJx/807oN+Lw6Xc4d/E0586fYmDwGkNDgzQaI6S2mbnxssrImQBKVILWCTVTo7trOrNnzWfxgiUsXrSce+/6/k33923j5MUPuHTpHBcvnePS1QsMDvUx0hhmZGQE51JsmgZhl90jWmuSpE6tVqO7q4eenmksmLeYZYtWs3jRClYv+fX+vgmdjQgdQfiOcOT0FhrNkVBVOQZHe0VXVxf1etedj7f5DnH41BYGBwcYbQzTbDbz4HWvFLVajXq9m66ubmb0TmPdiue+4aO985y+sJOBoQGGhgcYaY7QGm3QbDYBcGh6u7vp6Z5G97RpTJ82k7VLx2b5CUKnIkJHEARBEISORSK4BEEQBEHoWEToCIIgCILQsYjQEQRBEAShYxGhIwiCIAhCxyJCRxAEQRCEjkWEjiAIgiAIHYsIHUEQBEEQOhYROoIgCIIgdCwidARBEARB6FhE6AiCIAiC0LGI0BEEQRAEoWMRoSMIgiAIQsciQkcQBEEQhI5FhI4gCIIgCB2LCB1BEARBEDoWETqCIAiCIHQsInQEQRAEQehYROgIgiAIgtCxiNARBEEQBKFjEaEjCIIgCELHIkJHEARBEISORYSOIAiCIAgdiwgdQRAEQRA6FhE6giAIgiB0LCJ0BEEQBEHoWEToCIIgCILQsYjQEQRBEAShYxGhIwiCIAhCxyJCRxAEQRCEjkWEjiAIgiAIHYsIHUEQBEEQOhYROoIgCIIgdCwidARBEARB6FhE6AiCIAiC0LGI0BEEQRAEoWMRoSMIgiAIQsciQkcQBEEQhI5FhI4gCIIgCB2LCB1BEARBEDoWETqCIAiCIHQsInQEQRAEQehYROgIgiAIgtCxiNARBEEQBKFjEaEjCIIgCELHIkJHEARBEISORYSOIAiCIAgdiwgdQRAEQRA6FhE6giAIgiB0LCJ0BEEQBEHoWEToCIIgCILQsYjQEQRBEAShYxGhIwiCIAhCxyJCRxAEQRCEjkWEjiAIgiAIHYsIHUEQBEEQOhYROoIgCIIgdCwidARBEARB6FhE6AiCIAiC0LGI0BEEQRAEoWMRoSMIgiAIQsciQkcQBEEQhI5FhI4gCIIgCB2LCB1BEARBEDoWETqCIAiCIHQsInQEQRAEQehYROgIgiAIgtCxiNARBEEQBKFjEaEjCIIgCELHIkJHEARBEISORYSOIAiCIAgdiwgdQRAEQRA6FhE6giAIgiB0LCJ0BEEQBEHoWEToCIIgCILQsYjQEQRBEAShYxGhIwiCIAhCxyJCRxAEQRCEjkWEjiAIgiAIHYsIHUEQBEEQOhYROoIgCIIgdCwidARBEARB6FhE6AiCIAiC0LGI0BEEQRAEoWMRoSMIgiAIQsciQkcQBEEQhI5FhI4gCIIgCB2LCB1BEARBEDoWETqCIAiCIHQsInQEQRAEQehYROgIgiAIgtCxiNARBEEQBKFjEaEjCIIgCELHIkJHEARBEISORYSOIAiCIAgdiwgdQRAEQRA6FhE6giAIgiB0LCJ0BEEQBEHoWEToCIIgCILQsYjQEQRBEAShYxGhIwiCIAhCxyJCRxAEQRCEjkWEjiAIgiAIHYsIHUEQBEEQOhYROoIgCIIgdCwidARBEARB6FhE6AiCIAiC0LGI0BEEQRAEoWMRoSMIgiAIQsciQkcQBEEQhI5FhI4gCIIgCB2LCB1BEARBEDqW/x2BESsZYOJsygAAAABJRU5ErkJggg==" id="about-logo" style="height:36px;margin-bottom:20px" />
      <h2 style="font-size:22px;font-weight:600;color:#76933C;margin-bottom:12px">Kobar Dijital Araçlar</h2>
      <p style="font-size:14px;color:#555;line-height:1.7;font-family:Roboto,sans-serif;margin-bottom:16px">
        Bu platform, iş süreçlerimizi kolaylaştırmak için geliştirilen dahili web araçlarını barındırmaktadır. Her proje, belirli bir ihtiyaca yönelik hızlı ve kullanılabilir çözümler sunmak amacıyla tasarlanmıştır.
      </p>
      <p style="font-size:14px;color:#555;line-height:1.7;font-family:Roboto,sans-serif;margin-bottom:24px">
        Projeler <strong style="color:#76933C">kobar.com.tr</strong> üzerinde yayınlanmakta, veriler güvenli bulut altyapısında saklanmaktadır.
      </p>
      <div style="border-top:1px solid #eee;padding-top:16px;font-size:12px;color:#aaa;font-family:Roboto,sans-serif">
        © 2025 Kobar · Tüm hakları saklıdır
      </div>
    </div>
  </div>
</div>

<footer>
    <span>kobar © 2025</span>
    <span id="footer-date"></span>
  </footer>
</div>

<script>
  // ── PROJELER ──
  // Yeni proje eklemek için buraya obje ekle!
  const projects = [
    {
      num: '001',
      name: 'Müşteri Yönetimi',
      desc: 'Kurumsal müşteri ilişkilerini tek ekrandan yönetin. Ziyaret geçmişi, teklif takibi ve hatırlatıcılar.',
      tags: ['ZİYARET', 'TEKLİF', 'TAKİP'],
      url: '/crm/index.html',
      active: true
    },
    {
      num: '002',
      name: 'Ne Yesek?',
      desc: 'Grup olarak yemek kararı verin. Oylayın, çarkı çevirin, yakın restoranları keşfedin.',
      tags: ['OYLAMA', 'ÇARKIFELEK', 'RESTORAN'],
      url: '/neyesek/index.html',
      active: true
    },
    {
      num: '003',
      name: 'TechSwipe',
      desc: 'TikTok tarzı teknoloji haber akışı. Hacker News haberleri, kaydır ve oku.',
      tags: ['HABERLER', 'TEKNOLOJİ', 'SWIPE'],
      url: '/techswipe/index.html',
      active: true
    },
    // Buraya yeni projeler ekle:
  ];

  function renderProjects() {
    const grid = document.getElementById('projects-grid');
    const count = String(projects.length).padStart(2, '0');
    document.getElementById('project-count').textContent = \`— \${count}\`;

    // Boş kartları da göster (grid dengesi için)
    const items = [...projects];
    // Eğer tek sayıysa yakında kartı ekle
    if (items.length % 2 !== 0) {
      items.push({ soon: true });
    }

    grid.innerHTML = items.map((p, i) => {
      if (p.soon) return \`
        <div class="project-card soon">
          <div class="project-num">\${String(i + 1).padStart(3, '0')}</div>
          <div class="project-name">Yakında</div>
          <div class="project-desc">Yeni proje geliyor...</div>
          <div class="project-footer">
            <div class="project-tags"></div>
            <span class="project-status">Hazırlanıyor</span>
          </div>
        </div>
      \`;
      return \`
        <div class="project-card \${p.active ? 'active' : ''}" onclick="goTo('\${p.url}')">
          <div class="project-num">\${p.num}</div>
          <div class="project-name">\${p.name}</div>
          <div class="project-desc">\${p.desc}</div>
          <div class="project-footer">
            <div class="project-tags">
              \${p.tags.map(t => \`<span class="project-tag">\${t}</span>\`).join('')}
            </div>
            <span class="project-status">\${p.active ? 'Aktif' : 'Pasif'}</span>
          </div>
          <span class="project-arrow">↗</span>
        </div>
      \`;
    }).join('');
  }

  function goTo(url) {
    window.location.href = url;
  }

  // ── ŞİFRE ──
  const PASSWORD = '102030';
  const SESSION_KEY = 'kobar_auth';

  function checkPassword() {
    const val = document.getElementById('password-input').value;
    const err = document.getElementById('login-error');
    if (val === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      sessionStorage.setItem('kobar_token', 'granted');
      document.getElementById('login-screen').classList.add('hidden');
      setTimeout(() => {
        document.getElementById('login-screen').style.display = 'none';
        showMain();
      }, 600);
    } else {
      err.classList.add('show');
      document.getElementById('password-input').value = '';
      document.getElementById('password-input').classList.add('shake');
      setTimeout(() => {
        err.classList.remove('show');
        document.getElementById('password-input').classList.remove('shake');
      }, 2000);
    }
  }

  function showMain() {
    document.getElementById('main-screen').classList.add('visible');
    renderProjects();
    document.getElementById('footer-date').textContent =
      new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('kobar_token');
    document.getElementById('main-screen').classList.remove('visible');
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('password-input').value = '';
  }

  // Oturum kontrolü
  window.showAbout = function() {
    document.getElementById('about-modal').style.display = 'flex';
  }

  window.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      document.getElementById('login-screen').style.display = 'none';
      showMain();
    }
  });
</script>

<style>
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-6px); }
    40%, 80% { transform: translateX(6px); }
  }
  .shake { animation: shake 0.4s ease; }
</style>

</body>
</html>`;

const HTML_CRM = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Müşteri CRM — Kobar</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Roboto:wght@400&display=swap" rel="stylesheet">

<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyDZersRBv1MFajvtGCpHg4CBLKTghGVRd0",
    authDomain: "crm-kurumsal.firebaseapp.com",
    projectId: "crm-kurumsal",
    storageBucket: "crm-kurumsal.firebasestorage.app",
    messagingSenderId: "904863092020",
    appId: "1:904863092020:web:1bb8d36055a33ba21aa961"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  let customers = [], reminders = [], currentCustomerId = null, editingCustomerId = null, editingItemId = null;

  async function loadCustomers() {
    const snap = await getDocs(collection(db, 'customers'));
    customers = []; snap.forEach(d => customers.push({ id: d.id, ...d.data() }));
    window._customers = customers; renderCustomers(); updateDashboard();
  }
  async function loadReminders() {
    const snap = await getDocs(collection(db, 'reminders'));
    reminders = []; snap.forEach(d => reminders.push({ id: d.id, ...d.data() }));
    renderReminders(); updateReminderBadge();
  }

  window.openCustomerModal = function(id=null) {
    editingCustomerId = id;
    const c = id ? customers.find(x=>x.id===id) : null;
    ['name','sector','city','phone','email','contact'].forEach(f => document.getElementById('cm-'+f).value = c?.[f]||'');
    document.getElementById('cm-contact-title').value = c?.contactTitle||'';
    document.getElementById('cm-notes').value = c?.notes||'';
    document.getElementById('cm-status').value = c?.status||'Aktif';
    document.getElementById('modal-customer').style.display='flex';
  }
  window.saveCustomer = async function() {
    const data = { name: document.getElementById('cm-name').value.trim(), sector: document.getElementById('cm-sector').value.trim(), city: document.getElementById('cm-city').value.trim(), phone: document.getElementById('cm-phone').value.trim(), email: document.getElementById('cm-email').value.trim(), contact: document.getElementById('cm-contact').value.trim(), contactTitle: document.getElementById('cm-contact-title').value.trim(), notes: document.getElementById('cm-notes').value.trim(), status: document.getElementById('cm-status').value, updatedAt: serverTimestamp() };
    if (!data.name) { alert('Firma adı zorunlu!'); return; }
    if (editingCustomerId) await updateDoc(doc(db,'customers',editingCustomerId), data);
    else { data.createdAt=serverTimestamp(); data.visits=[]; data.offers=[]; await addDoc(collection(db,'customers'),data); }
    closeModal('modal-customer'); loadCustomers();
  }
  window.deleteCustomer = async function(id) {
    if (!confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) return;
    await deleteDoc(doc(db,'customers',id));
    if (currentCustomerId===id) { currentCustomerId=null; showSection('customers'); }
    loadCustomers();
  }
  window.openCustomer = function(id) { currentCustomerId=id; showSection('detail'); renderDetail(); }

  function renderCustomers() {
    const search = document.getElementById('search-input')?.value.toLowerCase()||'';
    const sf = document.getElementById('status-filter')?.value||'';
    let list = customers.filter(c => (!search||c.name?.toLowerCase().includes(search)||c.contact?.toLowerCase().includes(search)||c.city?.toLowerCase().includes(search)) && (!sf||c.status===sf));
    const container = document.getElementById('customer-list');
    if (!container) return;
    if (!list.length) { container.innerHTML=\`<div class="empty-state">Müşteri bulunamadı.<br><small>+ Müşteri Ekle butonunu kullanın.</small></div>\`; return; }
    container.innerHTML = list.map(c=>\`
      <div class="customer-card" onclick="openCustomer('\${c.id}')">
        <div class="cc-header">
          <div class="cc-avatar">\${(c.name||'?')[0].toUpperCase()}</div>
          <div class="cc-info"><div class="cc-name">\${c.name}</div><div class="cc-sub">\${c.contact||'—'} \${c.contactTitle?'· '+c.contactTitle:''}</div></div>
          <span class="status-badge status-\${(c.status||'Aktif').toLowerCase()}">\${c.status||'Aktif'}</span>
        </div>
        <div class="cc-meta">\${c.sector?\`<span>🏭 \${c.sector}</span>\`:''} \${c.city?\`<span>📍 \${c.city}</span>\`:''} \${c.phone?\`<span>📞 \${c.phone}</span>\`:''}</div>
        <div class="cc-actions" onclick="event.stopPropagation()">
          <button class="btn-sm" onclick="openCustomerModal('\${c.id}')">✏️ Düzenle</button>
          <button class="btn-sm btn-danger" onclick="deleteCustomer('\${c.id}')">🗑️</button>
        </div>
      </div>\`).join('');
  }

  function renderDetail() {
    const c = customers.find(x=>x.id===currentCustomerId); if (!c) return;
    const visits=c.visits||[], offers=c.offers||[];
    document.getElementById('detail-content').innerHTML = \`
      <div class="detail-header">
        <button class="btn-back" onclick="showSection('customers')">← Geri</button>
        <div class="detail-title-row">
          <div class="detail-avatar">\${(c.name||'?')[0].toUpperCase()}</div>
          <div><h2>\${c.name}</h2><div class="detail-sub">\${c.sector||''} \${c.city?'· '+c.city:''}</div></div>
          <span class="status-badge status-\${(c.status||'Aktif').toLowerCase()}">\${c.status||'Aktif'}</span>
          <button class="btn btn-primary" style="margin-left:auto" onclick="openCustomerModal('\${c.id}')">✏️ Düzenle</button>
        </div>
        <div class="detail-info-grid">
          \${c.contact?\`<div class="info-item"><label>Yetkili</label><span>\${c.contact}</span></div>\`:''}
          \${c.contactTitle?\`<div class="info-item"><label>Unvan</label><span>\${c.contactTitle}</span></div>\`:''}
          \${c.phone?\`<div class="info-item"><label>Telefon</label><span>\${c.phone}</span></div>\`:''}
          \${c.email?\`<div class="info-item"><label>E-posta</label><span>\${c.email}</span></div>\`:''}
          \${c.notes?\`<div class="info-item full"><label>Notlar</label><span>\${c.notes}</span></div>\`:''}
        </div>
      </div>
      <div class="detail-tabs">
        <button class="tab-btn active" onclick="switchTab(this,'tab-visits')">🤝 Ziyaretler (\${visits.length})</button>
        <button class="tab-btn" onclick="switchTab(this,'tab-offers')">📋 Teklifler (\${offers.length})</button>
      </div>
      <div id="tab-visits" class="tab-content">
        <div class="section-toolbar"><h3>Ziyaret / Görüşme Geçmişi</h3><button class="btn btn-primary" onclick="openVisitModal()">+ Ziyaret Ekle</button></div>
        \${!visits.length?'<div class="empty-state">Henüz ziyaret kaydı yok.</div>':[...visits].reverse().map(v=>\`
          <div class="log-card">
            <div class="log-header"><span class="log-date">📅 \${v.date}</span><span class="log-type">\${v.type||'Yüz yüze'}</span>
              <div style="margin-left:auto;display:flex;gap:6px"><button class="btn-sm" onclick="openVisitModal('\${v.id}')">✏️</button><button class="btn-sm btn-danger" onclick="deleteSubItem('visits','\${v.id}')">🗑️</button></div>
            </div>
            \${v.contact?\`<div class="log-field"><b>Muhatap:</b> \${v.contact}</div>\`:''}
            \${v.ourside?\`<div class="log-field"><b>Bizden:</b> \${v.ourside}</div>\`:''}
            <div class="log-notes">\${v.notes||''}</div>
            \${v.actions?\`<div class="log-actions">📌 \${v.actions}</div>\`:''}
          </div>\`).join('')}
      </div>
      <div id="tab-offers" class="tab-content" style="display:none">
        <div class="section-toolbar"><h3>Teklif Takibi</h3><button class="btn btn-primary" onclick="openOfferModal()">+ Teklif Ekle</button></div>
        \${!offers.length?'<div class="empty-state">Henüz teklif kaydı yok.</div>':[...offers].reverse().map(o=>\`
          <div class="log-card">
            <div class="log-header"><span class="log-offer-title">\${o.title}</span><span class="offer-status offer-\${(o.status||'').toLowerCase().replace(' ','-')}">\${o.status||'—'}</span>
              <div style="margin-left:auto;display:flex;gap:6px"><button class="btn-sm" onclick="openReminderFromOffer('\${o.id}','\${o.title}')">🔔</button><button class="btn-sm" onclick="openOfferModal('\${o.id}')">✏️</button><button class="btn-sm btn-danger" onclick="deleteSubItem('offers','\${o.id}')">🗑️</button></div>
            </div>
            <div class="offer-meta">\${o.amount?\`<span>💰 \${Number(o.amount).toLocaleString('tr-TR')} ₺</span>\`:''} \${o.date?\`<span>📅 \${o.date}</span>\`:''} \${o.expiry?\`<span>⏳ \${o.expiry}</span>\`:''}</div>
            \${o.notes?\`<div class="log-notes">\${o.notes}</div>\`:''}
          </div>\`).join('')}
      </div>\`;
  }

  window.switchTab = function(btn,tabId) {
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t=>t.style.display='none');
    btn.classList.add('active'); document.getElementById(tabId).style.display='block';
  }

  window.openVisitModal = function(id=null) {
    editingItemId=id; const c=customers.find(x=>x.id===currentCustomerId);
    const v=id?(c?.visits||[]).find(x=>x.id===id):null;
    document.getElementById('v-date').value=v?.date||new Date().toISOString().split('T')[0];
    document.getElementById('v-type').value=v?.type||'Yüz yüze';
    document.getElementById('v-contact').value=v?.contact||'';
    document.getElementById('v-ourside').value=v?.ourside||'';
    document.getElementById('v-notes').value=v?.notes||'';
    document.getElementById('v-actions').value=v?.actions||'';
    document.getElementById('modal-visit').style.display='flex';
  }
  window.saveVisit = async function() {
    const data={id:editingItemId||Date.now().toString(),date:document.getElementById('v-date').value,type:document.getElementById('v-type').value,contact:document.getElementById('v-contact').value.trim(),ourside:document.getElementById('v-ourside').value.trim(),notes:document.getElementById('v-notes').value.trim(),actions:document.getElementById('v-actions').value.trim()};
    if (!data.notes) { alert('Görüşme notları zorunlu!'); return; }
    const c=customers.find(x=>x.id===currentCustomerId); let visits=[...(c.visits||[])];
    if (editingItemId) visits=visits.map(v=>v.id===editingItemId?data:v); else visits.push(data);
    await updateDoc(doc(db,'customers',currentCustomerId),{visits}); closeModal('modal-visit'); await loadCustomers(); renderDetail();
  }

  window.openOfferModal = function(id=null) {
    editingItemId=id; const c=customers.find(x=>x.id===currentCustomerId);
    const o=id?(c?.offers||[]).find(x=>x.id===id):null;
    document.getElementById('o-title').value=o?.title||''; document.getElementById('o-amount').value=o?.amount||'';
    document.getElementById('o-status').value=o?.status||'Hazırlanıyor'; document.getElementById('o-date').value=o?.date||new Date().toISOString().split('T')[0];
    document.getElementById('o-expiry').value=o?.expiry||''; document.getElementById('o-notes').value=o?.notes||'';
    document.getElementById('modal-offer').style.display='flex';
  }
  window.saveOffer = async function() {
    const data={id:editingItemId||Date.now().toString(),title:document.getElementById('o-title').value.trim(),amount:document.getElementById('o-amount').value,status:document.getElementById('o-status').value,date:document.getElementById('o-date').value,expiry:document.getElementById('o-expiry').value,notes:document.getElementById('o-notes').value.trim()};
    if (!data.title) { alert('Teklif konusu zorunlu!'); return; }
    const c=customers.find(x=>x.id===currentCustomerId); let offers=[...(c.offers||[])];
    if (editingItemId) offers=offers.map(o=>o.id===editingItemId?data:o); else offers.push(data);
    await updateDoc(doc(db,'customers',currentCustomerId),{offers}); closeModal('modal-offer'); await loadCustomers(); renderDetail();
  }

  window.deleteSubItem = async function(type,id) {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    const c=customers.find(x=>x.id===currentCustomerId);
    await updateDoc(doc(db,'customers',currentCustomerId),{[type]:(c[type]||[]).filter(x=>x.id!==id)});
    await loadCustomers(); renderDetail();
  }

  window.openReminderModal = function(customerId=null, title='') {
    const sel=document.getElementById('r-customer');
    while(sel.options.length>1) sel.remove(1);
    (window._customers||[]).sort((a,b)=>(a.name||'').localeCompare(b.name||'')).forEach(c=>{ const o=document.createElement('option'); o.value=c.id; o.textContent=c.name; sel.appendChild(o); });
    sel.value=customerId||currentCustomerId||'';
    document.getElementById('r-title').value=title; document.getElementById('r-date').value='';
    document.getElementById('r-note').value=''; document.getElementById('r-priority').value='Normal';
    document.getElementById('modal-reminder').style.display='flex';
  }
  window.openReminderFromOffer = function(offerId, offerTitle) {
    const c=customers.find(x=>x.id===currentCustomerId);
    window.openReminderModal(currentCustomerId,\`Teklif Takibi: \${offerTitle} — \${c?.name||''}\`);
    document.getElementById('r-priority').value='Yüksek';
  }
  window.saveReminder = async function() {
    const customerId=document.getElementById('r-customer').value;
    const customer=customers.find(x=>x.id===customerId);
    const data={customerId,customerName:customer?.name||'',title:document.getElementById('r-title').value.trim(),date:document.getElementById('r-date').value,note:document.getElementById('r-note').value.trim(),priority:document.getElementById('r-priority').value,done:false,createdAt:serverTimestamp()};
    if (!data.title||!data.date) { alert('Başlık ve tarih zorunlu!'); return; }
    await addDoc(collection(db,'reminders'),data); closeModal('modal-reminder'); loadReminders();
  }
  window.toggleReminderDone = async function(id,done) { await updateDoc(doc(db,'reminders',id),{done:!done}); loadReminders(); }
  window.deleteReminder = async function(id) { if (!confirm('Hatırlatıcıyı silmek istediğinize emin misiniz?')) return; await deleteDoc(doc(db,'reminders',id)); loadReminders(); }

  function renderReminders() {
    const container=document.getElementById('reminder-list'); if (!container) return;
    const today=new Date().toISOString().split('T')[0];
    const sorted=[...reminders].sort((a,b)=>(a.date||'')>(b.date||'')?1:-1);
    if (!sorted.length) { container.innerHTML='<div class="empty-state">Henüz hatırlatıcı yok.</div>'; return; }
    container.innerHTML=sorted.map(r=>{
      const ov=!r.done&&r.date<today, ds=!r.done&&r.date===today;
      return \`<div class="reminder-card \${r.done?'done':''} \${ov?'overdue':''} \${ds?'due-soon':''}">
        <div class="reminder-check" onclick="toggleReminderDone('\${r.id}',\${r.done})">\${r.done?'✅':'⬜'}</div>
        <div class="reminder-body">
          <div class="reminder-title">\${r.title}</div>
          <div class="reminder-meta">\${r.customerName?\`<span>🏢 \${r.customerName}</span>\`:''}<span class="\${ov?'text-danger':ds?'text-warn':''}">📅 \${r.date}</span><span class="priority-badge priority-\${(r.priority||'normal').toLowerCase()}">\${r.priority||'Normal'}</span></div>
          \${r.note?\`<div class="reminder-note">\${r.note}</div>\`:''}
        </div>
        <button class="btn-sm btn-danger" onclick="deleteReminder('\${r.id}')">🗑️</button>
      </div>\`;
    }).join('');
  }

  function updateReminderBadge() {
    const today=new Date().toISOString().split('T')[0];
    const count=reminders.filter(r=>!r.done&&r.date<=today).length;
    const badge=document.getElementById('reminder-badge');
    if (badge) { badge.textContent=count||''; badge.style.display=count?'inline-block':'none'; }
  }

  function updateDashboard() {
    const total=customers.length, active=customers.filter(c=>c.status==='Aktif').length;
    const totalOffers=customers.reduce((s,c)=>s+(c.offers?.length||0),0);
    const accepted=customers.reduce((s,c)=>s+(c.offers?.filter(o=>o.status==='Kabul')?.length||0),0);
    const totalVisits=customers.reduce((s,c)=>s+(c.visits?.length||0),0);
    const totalAmt=customers.reduce((s,c)=>s+(c.offers?.filter(o=>o.status==='Kabul')?.reduce((ss,o)=>ss+(parseFloat(o.amount)||0),0)||0),0);
    const set=(id,val)=>{const el=document.getElementById(id);if(el)el.textContent=val;};
    set('stat-total',total);set('stat-active',active);set('stat-offers',totalOffers);set('stat-accepted',accepted);set('stat-visits',totalVisits);set('stat-amount',totalAmt.toLocaleString('tr-TR')+' ₺');
  }

  window.showSection = function(section) {
    document.querySelectorAll('.section').forEach(s=>s.style.display='none');
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    const el=document.getElementById('section-'+section); if(el) el.style.display='block';
    const nav=document.querySelector(\`[data-section="\${section}"]\`); if(nav) nav.classList.add('active');
    if(section==='customers') renderCustomers();
    if(section==='reminders') renderReminders();
    if(section==='dashboard') updateDashboard();
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').style.display='none';
  }
  window.closeModal = function(id) { document.getElementById(id).style.display='none'; }
  window.filterCustomers = function() { renderCustomers(); }

  window.addEventListener('DOMContentLoaded', () => {
    loadCustomers(); loadReminders(); showSection('dashboard');
    document.getElementById('hamburger').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('overlay').style.display = document.getElementById('sidebar').classList.contains('open')?'block':'none';
    });
    document.getElementById('overlay').addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('overlay').style.display='none';
    });
  });
</script>

<style>
:root {
  --bg: #ffffff; --surface: #f8f9fa; --surface2: #f1f3f5; --border: #e9ecef;
  --accent: #76933C; --accent-light: #eef2e6; --text: #1a1a1a; --muted: #868e96;
  --danger: #e03131; --success: #2f9e44; --warn: #e67700;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Poppins', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; font-size: 14px; }
.app { display: flex; height: 100vh; overflow: hidden; }

/* SIDEBAR */
.sidebar { width: 220px; min-width: 220px; background: #fff; border-right: 1px solid var(--border); display: flex; flex-direction: column; transition: transform 0.25s ease; z-index: 200; }
.sidebar-logo { padding: 20px 18px 16px; border-bottom: 1px solid var(--border); }
.sidebar-logo .logo-name { font-size: 15px; font-weight: 600; color: var(--accent); }
.sidebar-logo .logo-sub { font-size: 11px; color: var(--muted); margin-top: 2px; font-family: 'Roboto', sans-serif; }
.nav { padding: 10px 0; flex: 1; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 18px; cursor: pointer; color: var(--muted); font-size: 13px; font-weight: 500; border-left: 3px solid transparent; transition: all 0.15s; position: relative; }
.nav-item:hover { color: var(--text); background: var(--surface); }
.nav-item.active { color: var(--accent); border-left-color: var(--accent); background: var(--accent-light); }
.nav-icon { width: 18px; text-align: center; font-size: 15px; }
.badge-count { margin-left: auto; background: var(--danger); color: #fff; font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 10px; display: none; }
.sidebar-footer { padding: 12px; border-top: 1px solid var(--border); }
.sidebar-footer .nav-item { border-radius: 8px; border-left: none; }
.sidebar-footer .nav-item:hover { color: var(--accent); background: var(--accent-light); }

/* TOPBAR */
.topbar { display: none; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid var(--border); background: #fff; position: sticky; top: 0; z-index: 100; }
.topbar-title { font-size: 14px; font-weight: 600; color: var(--accent); }
.hamburger { background: none; border: none; cursor: pointer; display: flex; flex-direction: column; gap: 5px; padding: 4px; }
.hamburger span { width: 22px; height: 2px; background: var(--text); border-radius: 2px; display: block; }
#overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 150; }

/* MAIN */
.main { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
.main-content { padding: 24px 28px; flex: 1; }
.section { display: none; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
.page-title { font-size: 22px; font-weight: 600; color: var(--accent); }
.page-sub { font-size: 12px; color: var(--muted); margin-top: 2px; font-family: 'Roboto', sans-serif; }

/* SEARCH */
.search-bar { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
.search-bar input, .search-bar select { background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 9px 14px; border-radius: 8px; font-size: 13px; font-family: 'Poppins', sans-serif; outline: none; transition: border 0.15s; }
.search-bar input { flex: 1; min-width: 180px; }
.search-bar input:focus, .search-bar select:focus { border-color: var(--accent); }

/* CARDS */
.customer-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.customer-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.15s; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.customer-card:hover { border-color: var(--accent); box-shadow: 0 4px 12px rgba(118,147,60,0.1); transform: translateY(-1px); }
.cc-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.cc-avatar { width: 40px; height: 40px; border-radius: 10px; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 600; flex-shrink: 0; }
.cc-name { font-size: 14px; font-weight: 600; }
.cc-sub { font-size: 12px; color: var(--muted); margin-top: 1px; font-family: 'Roboto', sans-serif; }
.cc-meta { display: flex; flex-wrap: wrap; gap: 8px; font-size: 12px; color: var(--muted); margin-bottom: 12px; font-family: 'Roboto', sans-serif; }
.cc-actions { display: flex; gap: 8px; }

/* STATUS */
.status-badge { font-size: 11px; padding: 3px 9px; border-radius: 20px; font-weight: 500; margin-left: auto; flex-shrink: 0; }
.status-aktif { background: rgba(47,158,68,0.1); color: var(--success); }
.status-pasif { background: rgba(224,49,49,0.1); color: var(--danger); }
.status-potansiyel { background: rgba(118,147,60,0.1); color: var(--accent); }
.offer-status { font-size: 11px; padding: 3px 9px; border-radius: 20px; font-weight: 500; }
.offer-kabul { background: rgba(47,158,68,0.1); color: var(--success); }
.offer-red { background: rgba(224,49,49,0.1); color: var(--danger); }
.offer-beklemede { background: rgba(230,119,0,0.1); color: var(--warn); }
.offer-sunuldu { background: rgba(118,147,60,0.1); color: var(--accent); }
.offer-hazırlanıyor { background: var(--surface2); color: var(--muted); }

/* DETAIL */
.btn-back { background: none; border: 1px solid var(--border); color: var(--muted); padding: 7px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; margin-bottom: 16px; font-family: 'Poppins', sans-serif; transition: all 0.15s; }
.btn-back:hover { color: var(--accent); border-color: var(--accent); }
.detail-title-row { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; flex-wrap: wrap; }
.detail-avatar { width: 50px; height: 50px; border-radius: 12px; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; }
.detail-title-row h2 { font-size: 18px; font-weight: 600; }
.detail-sub { color: var(--muted); font-size: 13px; margin-top: 2px; font-family: 'Roboto', sans-serif; }
.detail-info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px; margin-bottom: 20px; }
.info-item label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 3px; }
.info-item span { font-size: 13px; font-family: 'Roboto', sans-serif; }
.info-item.full { grid-column: 1 / -1; }
.detail-tabs { display: flex; gap: 4px; margin-bottom: 18px; border-bottom: 1px solid var(--border); }
.tab-btn { background: none; border: none; color: var(--muted); padding: 10px 18px; cursor: pointer; font-size: 13px; font-weight: 500; border-bottom: 2px solid transparent; margin-bottom: -1px; font-family: 'Poppins', sans-serif; transition: all 0.15s; }
.tab-btn:hover { color: var(--text); }
.tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); }

/* LOG CARDS */
.section-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 8px; }
.section-toolbar h3 { font-size: 14px; font-weight: 600; }
.log-card { background: #fff; border: 1px solid var(--border); border-radius: 10px; padding: 14px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.log-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap; }
.log-date { font-size: 12px; color: var(--muted); font-family: 'Roboto', sans-serif; }
.log-type { font-size: 11px; background: var(--accent-light); color: var(--accent); padding: 2px 8px; border-radius: 6px; font-weight: 500; }
.log-offer-title { font-weight: 600; font-size: 14px; }
.log-field { font-size: 13px; color: var(--muted); margin-bottom: 4px; font-family: 'Roboto', sans-serif; }
.log-notes { font-size: 13px; line-height: 1.6; font-family: 'Roboto', sans-serif; }
.log-actions { font-size: 12px; color: var(--warn); margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); }
.offer-meta { display: flex; gap: 14px; font-size: 12px; color: var(--muted); margin: 6px 0; flex-wrap: wrap; font-family: 'Roboto', sans-serif; }

/* REMINDERS */
.reminder-card { display: flex; align-items: flex-start; gap: 12px; background: #fff; border: 1px solid var(--border); border-radius: 10px; padding: 14px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.reminder-card.done { opacity: 0.5; }
.reminder-card.overdue { border-color: rgba(224,49,49,0.4); }
.reminder-card.due-soon { border-color: rgba(230,119,0,0.4); }
.reminder-check { font-size: 20px; cursor: pointer; flex-shrink: 0; }
.reminder-body { flex: 1; }
.reminder-title { font-size: 14px; font-weight: 500; margin-bottom: 6px; }
.reminder-meta { display: flex; gap: 12px; font-size: 12px; color: var(--muted); flex-wrap: wrap; font-family: 'Roboto', sans-serif; }
.reminder-note { font-size: 12px; color: var(--muted); margin-top: 6px; font-family: 'Roboto', sans-serif; }
.priority-badge { font-size: 10px; padding: 2px 7px; border-radius: 10px; font-weight: 600; }
.priority-yüksek { background: rgba(224,49,49,0.1); color: var(--danger); }
.priority-normal { background: var(--accent-light); color: var(--accent); }
.priority-düşük { background: var(--surface2); color: var(--muted); }
.text-danger { color: var(--danger) !important; }
.text-warn { color: var(--warn) !important; }

/* DASHBOARD */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
.stat-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.stat-label { font-size: 11px; color: var(--muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Roboto', sans-serif; }
.stat-value { font-size: 26px; font-weight: 600; }
.stat-value.accent { color: var(--accent); }
.stat-value.success { color: var(--success); }
.stat-value.warn { color: var(--warn); }

/* BUTTONS */
.btn { padding: 9px 18px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-family: 'Poppins', sans-serif; font-weight: 500; transition: all 0.15s; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: #5d7830; }
.btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--muted); }
.btn-ghost:hover { color: var(--text); border-color: var(--accent); }
.btn-sm { padding: 5px 10px; border-radius: 6px; border: 1px solid var(--border); background: transparent; color: var(--muted); cursor: pointer; font-size: 12px; font-family: 'Poppins', sans-serif; transition: all 0.15s; }
.btn-sm:hover { color: var(--text); border-color: var(--accent); }
.btn-danger { border-color: rgba(224,49,49,0.3) !important; color: var(--danger) !important; }
.btn-danger:hover { background: rgba(224,49,49,0.08) !important; }

/* MODALS */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(3px); padding: 16px; }
.modal { background: #fff; border: 1px solid var(--border); border-radius: 16px; width: 520px; max-width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border); font-size: 15px; font-weight: 600; }
.modal-close { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 18px; }
.modal-close:hover { color: var(--text); }
.modal-body { padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; }
.modal-footer { padding: 16px 22px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group label { font-size: 12px; color: var(--muted); font-weight: 500; }
.form-group input, .form-group select, .form-group textarea { background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 9px 12px; border-radius: 8px; font-size: 13px; font-family: 'Poppins', sans-serif; outline: none; transition: border 0.15s; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--accent); background: #fff; }
.form-group textarea { resize: vertical; min-height: 80px; }
.empty-state { text-align: center; color: var(--muted); padding: 40px 20px; font-size: 13px; line-height: 1.8; font-family: 'Roboto', sans-serif; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .sidebar { position: fixed; top: 0; left: 0; height: 100%; transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
  .topbar { display: flex; }
  .main-content { padding: 16px; }
  .form-row { grid-template-columns: 1fr; }
  .customer-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
</head>
<body>

<script>if (!sessionStorage.getItem('kobar_token')) window.location.href='/index.html';</script>

<div id="overlay"></div>
<div class="app">
  <div class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <div class="logo-name">CRM</div>
      <div class="logo-sub">Kurumsal Müşteri Takip</div>
    </div>
    <nav class="nav">
      <div class="nav-item active" data-section="dashboard" onclick="showSection('dashboard')"><span class="nav-icon">📊</span> Dashboard</div>
      <div class="nav-item" data-section="customers" onclick="showSection('customers')"><span class="nav-icon">🏢</span> Müşteriler</div>
      <div class="nav-item" data-section="reminders" onclick="showSection('reminders')"><span class="nav-icon">🔔</span> Hatırlatıcılar<span class="badge-count" id="reminder-badge"></span></div>
    </nav>
    <div class="sidebar-footer">
      <div class="nav-item" onclick="window.location.href='/index.html'"><span class="nav-icon">🏠</span> Ana Sayfa</div>
    </div>
  </div>

  <div class="main">
    <div class="topbar">
      <button class="hamburger" id="hamburger"><span></span><span></span><span></span></button>
      <div class="topbar-title">CRM</div>
      <div style="width:32px"></div>
    </div>
    <div class="main-content">
      <div class="section" id="section-customers">
        <div class="page-header"><div><div class="page-title">Müşteriler</div><div class="page-sub">Tüm kurumsal müşterileriniz</div></div><button class="btn btn-primary" onclick="openCustomerModal()">+ Müşteri Ekle</button></div>
        <div class="search-bar"><input id="search-input" placeholder="🔍 Firma, yetkili, şehir ara..." oninput="filterCustomers()" /><select id="status-filter" onchange="filterCustomers()"><option value="">Tüm Durumlar</option><option>Aktif</option><option>Pasif</option><option>Potansiyel</option></select></div>
        <div class="customer-grid" id="customer-list"></div>
      </div>
      <div class="section" id="section-detail"><div id="detail-content"></div></div>
      <div class="section" id="section-reminders">
        <div class="page-header"><div><div class="page-title">Hatırlatıcılar</div><div class="page-sub">Takip ve görev listesi</div></div><button class="btn btn-primary" onclick="openReminderModal()">+ Hatırlatıcı Ekle</button></div>
        <div id="reminder-list"></div>
      </div>
      <div class="section" id="section-dashboard">
        <div class="page-header"><div class="page-title">Dashboard</div></div>
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-label">Toplam Müşteri</div><div class="stat-value accent" id="stat-total">—</div></div>
          <div class="stat-card"><div class="stat-label">Aktif Müşteri</div><div class="stat-value success" id="stat-active">—</div></div>
          <div class="stat-card"><div class="stat-label">Toplam Teklif</div><div class="stat-value" id="stat-offers">—</div></div>
          <div class="stat-card"><div class="stat-label">Kabul Edilen</div><div class="stat-value success" id="stat-accepted">—</div></div>
          <div class="stat-card"><div class="stat-label">Toplam Ziyaret</div><div class="stat-value" id="stat-visits">—</div></div>
          <div class="stat-card"><div class="stat-label">Kabul Tutarı</div><div class="stat-value warn" id="stat-amount">—</div></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- MODAL: MÜŞTERİ -->
<div class="modal-overlay" id="modal-customer" style="display:none"><div class="modal">
  <div class="modal-header">Müşteri<button class="modal-close" onclick="closeModal('modal-customer')">✕</button></div>
  <div class="modal-body">
    <div class="form-row"><div class="form-group"><label>Firma Adı *</label><input id="cm-name" placeholder="Firma adı" /></div><div class="form-group"><label>Durum</label><select id="cm-status"><option>Aktif</option><option>Pasif</option><option>Potansiyel</option></select></div></div>
    <div class="form-row"><div class="form-group"><label>Sektör</label><input id="cm-sector" placeholder="Perakende, İnşaat..." /></div><div class="form-group"><label>Şehir</label><input id="cm-city" placeholder="İstanbul" /></div></div>
    <div class="form-row"><div class="form-group"><label>Yetkili Kişi</label><input id="cm-contact" placeholder="Ad Soyad" /></div><div class="form-group"><label>Unvan</label><input id="cm-contact-title" placeholder="Satın Alma Müdürü" /></div></div>
    <div class="form-row"><div class="form-group"><label>Telefon</label><input id="cm-phone" placeholder="0212 000 00 00" /></div><div class="form-group"><label>E-posta</label><input id="cm-email" placeholder="info@firma.com" /></div></div>
    <div class="form-group"><label>Notlar</label><textarea id="cm-notes" placeholder="Genel notlar..."></textarea></div>
  </div>
  <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal('modal-customer')">İptal</button><button class="btn btn-primary" onclick="saveCustomer()">Kaydet</button></div>
</div></div>

<!-- MODAL: ZİYARET -->
<div class="modal-overlay" id="modal-visit" style="display:none"><div class="modal">
  <div class="modal-header">Ziyaret / Görüşme<button class="modal-close" onclick="closeModal('modal-visit')">✕</button></div>
  <div class="modal-body">
    <div class="form-row"><div class="form-group"><label>Tarih</label><input id="v-date" type="date" /></div><div class="form-group"><label>Görüşme Tipi</label><select id="v-type"><option>Yüz yüze</option><option>Telefon</option><option>Video</option><option>E-posta</option></select></div></div>
    <div class="form-row"><div class="form-group"><label>Muhatap (Müşteri)</label><input id="v-contact" placeholder="Görüşülen kişi" /></div><div class="form-group"><label>Katılan (Bizden)</label><input id="v-ourside" placeholder="Bizden katılanlar" /></div></div>
    <div class="form-group"><label>Görüşme Notları *</label><textarea id="v-notes" rows="4" placeholder="Ne konuşuldu, ne karar alındı..."></textarea></div>
    <div class="form-group"><label>Aksiyon / Yapılacaklar</label><textarea id="v-actions" rows="2" placeholder="Takip edilecek maddeler..."></textarea></div>
  </div>
  <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal('modal-visit')">İptal</button><button class="btn btn-primary" onclick="saveVisit()">Kaydet</button></div>
</div></div>

<!-- MODAL: TEKLİF -->
<div class="modal-overlay" id="modal-offer" style="display:none"><div class="modal">
  <div class="modal-header">Teklif<button class="modal-close" onclick="closeModal('modal-offer')">✕</button></div>
  <div class="modal-body">
    <div class="form-group"><label>Teklif Konusu *</label><input id="o-title" placeholder="Ürün grubu / hizmet" /></div>
    <div class="form-row"><div class="form-group"><label>Tutar (₺)</label><input id="o-amount" type="number" placeholder="0" /></div><div class="form-group"><label>Durum</label><select id="o-status"><option>Hazırlanıyor</option><option>Sunuldu</option><option>Beklemede</option><option>Kabul</option><option>Red</option></select></div></div>
    <div class="form-row"><div class="form-group"><label>Teklif Tarihi</label><input id="o-date" type="date" /></div><div class="form-group"><label>Geçerlilik Tarihi</label><input id="o-expiry" type="date" /></div></div>
    <div class="form-group"><label>Notlar</label><textarea id="o-notes" rows="3"></textarea></div>
  </div>
  <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal('modal-offer')">İptal</button><button class="btn btn-primary" onclick="saveOffer()">Kaydet</button></div>
</div></div>

<!-- MODAL: HATIRLATICI -->
<div class="modal-overlay" id="modal-reminder" style="display:none"><div class="modal">
  <div class="modal-header">Hatırlatıcı<button class="modal-close" onclick="closeModal('modal-reminder')">✕</button></div>
  <div class="modal-body">
    <div class="form-group"><label>Müşteri</label><select id="r-customer"><option value="">— Müşteri seçin —</option></select></div>
    <div class="form-group"><label>Başlık *</label><input id="r-title" placeholder="Hatırlatıcı başlığı" /></div>
    <div class="form-row"><div class="form-group"><label>Tarih *</label><input id="r-date" type="date" /></div><div class="form-group"><label>Öncelik</label><select id="r-priority"><option>Normal</option><option>Yüksek</option><option>Düşük</option></select></div></div>
    <div class="form-group"><label>Not</label><textarea id="r-note" rows="2" placeholder="Ek bilgi..."></textarea></div>
  </div>
  <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal('modal-reminder')">İptal</button><button class="btn btn-primary" onclick="saveReminder()">Kaydet</button></div>
</div></div>

</body>
</html>`;

const HTML_NEYESEK = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ne Yesek?</title>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">



<style>
:root {
  --orange: #ff6b35; --yellow: #ffd166; --green: #06d6a0;
  --bg: #fffbf5; --card: #ffffff; --border: #f0e6d3;
  --text: #1a1a1a; --muted: #9e9e9e;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Nunito', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
.app { max-width: 480px; margin: 0 auto; padding: 20px 16px 40px; }
.screen { display: none; animation: fadeUp 0.3s ease; }
@keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

/* HOME */
.home-hero { text-align: center; padding: 36px 0 28px; }
.home-emoji { font-size: 68px; display: block; margin-bottom: 10px; animation: bounce 1.8s infinite; }
@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
.home-title { font-size: 34px; font-weight: 900; color: var(--orange); }
.home-sub { font-size: 14px; color: var(--muted); margin-top: 6px; }

/* HISTORY LINK */
.history-link { text-align: center; margin-top: 20px; }
.history-link a { font-size: 13px; color: var(--muted); font-weight: 700; cursor: pointer; text-decoration: none; }
.history-link a:hover { color: var(--orange); }

/* CARD */
.card { background: var(--card); border: 1.5px solid var(--border); border-radius: 20px; padding: 18px; margin-bottom: 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); }
.card-title { font-size: 12px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px; }

/* INPUTS */
.input-row { display: flex; flex-direction: column; gap: 10px; }
input[type=text] { width: 100%; padding: 12px 16px; border: 1.5px solid var(--border); border-radius: 12px; font-size: 15px; font-family: 'Nunito', sans-serif; outline: none; background: var(--bg); transition: border 0.2s; }
input[type=text]:focus { border-color: var(--orange); }
.divider { text-align: center; color: var(--muted); font-size: 12px; margin: 4px 0; }

/* BUTTONS */
.btn { width: 100%; padding: 13px; border: none; border-radius: 14px; font-size: 15px; font-weight: 800; font-family: 'Nunito', sans-serif; cursor: pointer; transition: all 0.15s; }
.btn-orange { background: var(--orange); color: #fff; }
.btn-orange:hover { background: #e85a26; transform: translateY(-1px); }
.btn-outline { background: transparent; border: 2px solid var(--orange); color: var(--orange); }
.btn-outline:hover { background: var(--orange); color: #fff; }
.btn-green { background: var(--green); color: #fff; }
.btn-green:hover { background: #04b885; }
.btn-yellow { background: var(--yellow); color: #1a1a1a; }
.btn-yellow:hover { background: #f5c200; }
.btn-ghost { background: transparent; border: 2px solid var(--border); color: var(--muted); }
.btn-sm { width: auto; padding: 7px 14px; font-size: 12px; border-radius: 10px; }

/* SESSION BAR */
.session-bar { display: flex; align-items: center; justify-content: space-between; background: var(--card); border: 1.5px solid var(--border); border-radius: 14px; padding: 10px 16px; margin-bottom: 14px; }
.session-code { font-size: 24px; font-weight: 900; color: var(--orange); letter-spacing: 0.12em; }
.session-label { font-size: 10px; color: var(--muted); font-weight: 700; text-transform: uppercase; }

/* MEMBERS */
.members-row { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 14px; }
.member-chip { display: flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 20px; font-size: 12px; font-weight: 700; background: #f0e6d3; }
.member-chip.voted { background: #d4f7ed; color: #0a7a5a; }
.vote-count { background: var(--green); color: #fff; border-radius: 8px; padding: 1px 5px; font-size: 10px; }

/* CATEGORY GRID */
#cat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 9px; margin-bottom: 16px; }
.cat-btn { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 12px 6px; border: 2px solid var(--border); border-radius: 16px; background: var(--card); cursor: pointer; font-family: 'Nunito', sans-serif; transition: all 0.15s; }
.cat-btn:hover { border-color: var(--cat-color); transform: translateY(-2px); }
.cat-btn.selected { border-color: var(--cat-color); background: #fff8f0; }
.cat-emoji { font-size: 26px; }
.cat-label { font-size: 10px; font-weight: 700; text-align: center; }
.cat-btn.selected .cat-label { color: var(--cat-color); }

/* RESULTS */
.result-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 8px; border-radius: 10px; transition: background 0.2s; }
.result-row.top { background: #fffbf0; }
.result-emoji { font-size: 22px; flex-shrink: 0; }
.result-info { flex: 1; }
.result-label { font-size: 13px; font-weight: 700; }
.result-bar-wrap { height: 7px; background: var(--border); border-radius: 4px; margin-top: 4px; overflow: hidden; }
.result-bar { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
.result-count { font-size: 12px; font-weight: 800; color: var(--muted); flex-shrink: 0; }
.empty-votes { text-align: center; color: var(--muted); padding: 16px; font-size: 13px; }

/* WHEEL */
.wheel-wrap { display: flex; justify-content: center; margin: 16px 0 8px; }
#wheel-canvas { border-radius: 50%; box-shadow: 0 8px 32px rgba(0,0,0,0.12); max-width: 100%; }

/* WINNER BOX */
#wheel-winner-box { display: none; margin-top: 12px; }
.winner-box { border: 3px solid; border-radius: 20px; padding: 20px; text-align: center; background: #fffbf5; animation: pop 0.5s cubic-bezier(0.175,0.885,0.32,1.275); }
@keyframes pop { from{transform:scale(0.6);opacity:0} to{transform:scale(1);opacity:1} }
.winner-emoji { font-size: 52px; }
.winner-label { font-size: 22px; font-weight: 900; margin-top: 6px; }
.winner-sub { font-size: 14px; color: var(--muted); margin-top: 6px; font-weight: 600; }

/* NEARBY */
.place-card { display: block; text-decoration: none; color: inherit; background: var(--card); border: 1.5px solid var(--border); border-radius: 14px; padding: 12px 14px; margin-bottom: 9px; transition: all 0.15s; }
.place-card:hover { border-color: var(--orange); transform: translateY(-1px); }
.place-name { font-size: 14px; font-weight: 800; }
.place-addr { font-size: 12px; color: var(--muted); margin-top: 2px; }
.place-link { display: inline-block; margin-top: 7px; font-size: 12px; color: var(--orange); font-weight: 700; }
.loading { text-align: center; color: var(--muted); padding: 16px; font-size: 13px; }

/* FINISHED */
.finished-wrap { text-align: center; padding: 40px 0; }
.finished-emoji { font-size: 80px; display: block; animation: bounce 2s infinite; }
.finished-title { font-size: 28px; font-weight: 900; color: var(--orange); margin-top: 12px; }
.finished-winner-name { font-size: 22px; font-weight: 800; margin-top: 8px; }
.finished-members { font-size: 13px; color: var(--muted); margin-top: 10px; }

/* HISTORY */
.history-card { background: var(--card); border: 1.5px solid var(--border); border-radius: 16px; padding: 14px 16px; margin-bottom: 12px; }
.history-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.history-code { font-size: 14px; font-weight: 900; color: var(--orange); letter-spacing: 0.1em; }
.history-date { font-size: 12px; color: var(--muted); font-weight: 600; }
.history-winner { font-size: 16px; font-weight: 800; margin-bottom: 6px; }
.history-members { font-size: 12px; color: var(--muted); }

/* BACK */
.back-btn { display: inline-flex; align-items: center; gap: 6px; background: none; border: none; color: var(--muted); font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Nunito', sans-serif; padding: 0; margin-bottom: 16px; }
.back-btn:hover { color: var(--orange); }

/* HOST BADGE */
.host-badge { display: inline-block; background: #fff3e0; color: var(--orange); font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; margin-left: 8px; }
</style>
</head>
<body>
<div class="app">

  <!-- HOME -->
  <div class="screen" id="screen-home">
    <div class="home-hero">
      <span class="home-emoji">🍽️</span>
      <div class="home-title">Ne Yesek?</div>
      <div class="home-sub">Grupça karar verin, çarkı çevirin!</div>
    </div>

    <div class="card">
      <div class="card-title">✨ Yeni Oturum Aç</div>
      <div class="input-row">
        <input type="text" id="name-input" placeholder="Adınız" />
        <button class="btn btn-orange" onclick="createSession()">Oturum Başlat →</button>
      </div>
    </div>

    <div class="divider">— ya da mevcut oturuma katıl —</div>

    <div class="card">
      <div class="card-title">🔗 Oturuma Katıl</div>
      <div class="input-row">
        <input type="text" id="name-input-join" placeholder="Adınız" />
        <input type="text" id="code-input" placeholder="Oturum Kodu (örn: AB3XY)" style="text-transform:uppercase;letter-spacing:0.1em" />
        <button class="btn btn-outline" onclick="joinSession()">Katıl →</button>
      </div>
    </div>

    <div class="history-link">
      <a onclick="showScreen('history')">📋 Geçmiş Oturumlar</a>
    </div>
  </div>

  <!-- VOTING -->
  <div class="screen" id="screen-voting">
    <div class="session-bar">
      <div>
        <div class="session-label">Oturum Kodu</div>
        <div class="session-code" id="session-code-display">—</div>
      </div>
      <button class="btn btn-outline btn-sm" id="copy-btn" onclick="copyCode()">📋 Kopyala</button>
    </div>

    <div class="card" style="padding:12px 14px">
      <div class="card-title" style="margin-bottom:8px">👥 Katılımcılar</div>
      <div class="members-row" id="members-list"></div>
    </div>

    <div class="card-title" style="padding:0 2px 10px;font-size:12px;font-weight:800;color:#9e9e9e;text-transform:uppercase;letter-spacing:0.08em">🍴 Ne yemek istersin?</div>
    <div id="cat-grid"></div>

    <div class="card">
      <div class="card-title">📊 Anlık Oylar</div>
      <div id="results-list"></div>
    </div>

    <button id="finish-btn" class="btn btn-green" onclick="finishVoting()" style="display:none;margin-top:4px">🎉 Oylamayı Bitir</button>
  </div>

  <!-- RESULT -->
  <div class="screen" id="screen-result">
    <div class="card">
      <div class="card-title">🏆 Oylama Sonuçları</div>
      <div id="results-list-final"></div>
    </div>

    <div class="card">
      <div class="card-title">🎡 Çarkıfelek <span style="font-size:11px;font-weight:600;color:#aaa">(En çok oy alan seçenekler)</span></div>
      <div class="wheel-wrap">
        <canvas id="wheel-canvas" width="300" height="300"></canvas>
      </div>
      <div id="wheel-winner-box"></div>
      <button id="spin-btn" class="btn btn-yellow" onclick="triggerSpin()" style="display:none;margin-top:14px">🎰 Çarkı Çevir!</button>
      <div id="nearby-list" style="margin-top:14px"></div>
    </div>
  </div>

  <!-- FINISHED -->
  <div class="screen" id="screen-finished">
    <div class="finished-wrap">
      <span class="finished-emoji">🎉</span>
      <div class="finished-title">Afiyet Olsun!</div>
      <div class="finished-winner-name" id="finished-winner"></div>
      <div class="finished-members" id="finished-members"></div>
    </div>
    <button class="btn btn-orange" onclick="newSession()" style="margin-top:24px">Ana Sayfaya Dön</button>
  </div>

  <!-- GEÇMİŞ OTURUMLAR -->
  <div class="screen" id="screen-history">
    <button class="back-btn" onclick="showScreen('home')">← Geri</button>
    <div style="font-size:20px;font-weight:900;margin-bottom:16px">📋 Geçmiş Oturumlar</div>
    <div id="history-list"><div class="loading">Yükleniyor...</div></div>
  </div>

</div>

<div style="text-align:center;padding:28px 0 12px;margin-top:16px">
  <a href="http://kobar.com.tr/index.html" style="text-decoration:none;display:inline-flex;align-items:center;gap:8px;opacity:0.45;transition:opacity 0.2s" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.45">
    <img src="data:image/png;base64,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" style="height:16px;width:auto" />
    <span style="font-family:Poppins,sans-serif;font-size:11px;color:#aaa;font-weight:600">powered by kobar</span>
  </a>
</div>
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getFirestore, collection, doc, addDoc, updateDoc, getDocs, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyDZersRBv1MFajvtGCpHg4CBLKTghGVRd0",
    authDomain: "crm-kurumsal.firebaseapp.com",
    projectId: "crm-kurumsal",
    storageBucket: "crm-kurumsal.firebasestorage.app",
    messagingSenderId: "904863092020",
    appId: "1:904863092020:web:1bb8d36055a33ba21aa961"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  let currentSession = null;
  let myName = '';
  let isHost = false;
  let wheelAngle = 0;
  let wheelAnimFrame = null;

  const CATEGORIES = [
    { id: 'et',      label: 'Et & Izgara',     emoji: '🥩', color: '#e63946' },
    { id: 'tavuk',   label: 'Tavuk',           emoji: '🍗', color: '#f4a261' },
    { id: 'pizza',   label: 'Pizza',           emoji: '🍕', color: '#e9c46a' },
    { id: 'burger',  label: 'Burger',          emoji: '🍔', color: '#f77f00' },
    { id: 'balik',   label: 'Balık & Deniz',   emoji: '🐟', color: '#457b9d' },
    { id: 'kebap',   label: 'Kebap',           emoji: '🌮', color: '#6d4c41' },
    { id: 'pide',    label: 'Pide & Lahmacun', emoji: '🫓', color: '#8d6e63' },
    { id: 'salata',  label: 'Salata & Hafif',  emoji: '🥗', color: '#2d6a4f' },
    { id: 'makarna', label: 'Makarna',         emoji: '🍝', color: '#c9853a' },
    { id: 'doner',   label: 'Döner',           emoji: '🌯', color: '#bc6c25' },
    { id: 'sushi',   label: 'Sushi & Asya',    emoji: '🍱', color: '#264653' },
    { id: 'tatli',   label: 'Tatlı & Kahvaltı',emoji: '🥞', color: '#d4a373' },
  ];

  // ── SESSION CREATE ──
  window.createSession = async function() {
    myName = document.getElementById('name-input').value.trim();
    if (!myName) { alert('İsim girin!'); return; }
    const code = Math.random().toString(36).substring(2,7).toUpperCase();
    const ref = await addDoc(collection(db, 'neyesek_sessions'), {
      code, host: myName, status: 'voting',
      wheelSpin: null, wheelWinner: null,
      members: [{ name: myName, votes: [] }],
      createdAt: serverTimestamp()
    });
    isHost = true;
    currentSession = { id: ref.id, code, myName };
    window.currentSession = currentSession;
    sessionStorage.setItem('ny_session', JSON.stringify({ ...currentSession, isHost: true }));
    listenSession(ref.id);
    showScreen('voting');
    document.getElementById('session-code-display').textContent = code;
  }

  // ── SESSION JOIN ──
  window.joinSession = async function() {
    myName = document.getElementById('name-input-join').value.trim();
    const code = document.getElementById('code-input').value.trim().toUpperCase();
    if (!myName || !code) { alert('İsim ve kod gerekli!'); return; }
    const snap = await getDocs(collection(db, 'neyesek_sessions'));
    let found = null;
    snap.forEach(d => { if (d.data().code === code) found = { id: d.id, ...d.data() }; });
    if (!found) { alert('Oturum bulunamadı! Kodu kontrol edin.'); return; }
    if (found.status === 'finished') { alert('Bu oturum sona ermiş.'); return; }
    const members = found.members || [];
    if (!members.find(m => m.name === myName)) {
      members.push({ name: myName, votes: [] });
      await updateDoc(doc(db, 'neyesek_sessions', found.id), { members });
    }
    isHost = false;
    currentSession = { id: found.id, code, myName };
    window.currentSession = currentSession;
    sessionStorage.setItem('ny_session', JSON.stringify({ ...currentSession, isHost: false }));
    listenSession(found.id);
    showScreen('voting');
    document.getElementById('session-code-display').textContent = code;
  }

  // ── LISTEN SESSION ──
  function listenSession(id) {
    onSnapshot(doc(db, 'neyesek_sessions', id), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const session = currentSession;

      // Buton görünürlükleri
      const finishBtn = document.getElementById('finish-btn');
      const spinBtn = document.getElementById('spin-btn');
      if (finishBtn) finishBtn.style.display = (data.host === session?.myName && data.status === 'voting') ? 'block' : 'none';
      if (spinBtn) spinBtn.style.display = (data.host === session?.myName && data.status === 'result') ? 'block' : 'none';

      // Üyeler & oylar
      renderMembers(data.members || []);
      renderVotingUI(data.members || []);
      renderResults(data.members || [], 'results-list');

      // Durum geçişleri
      if (data.status === 'result' && document.getElementById('screen-voting').style.display !== 'none') {
        showScreen('result');
        renderResults(data.members || [], 'results-list-final');
        buildWheel(data.members || []);
      }

      // Çark dönüyor mu? (Firebase'den senkronize)
      if (data.status === 'result') {
        renderResults(data.members || [], 'results-list-final');
        if (data.wheelSpin && data.wheelSpin !== window._lastSpin) {
          window._lastSpin = data.wheelSpin;
          const winners = getWinners(data.members || []);
          animateWheel(winners, data.wheelSpin);
        }
        if (data.wheelWinner) {
          showWheelWinner(data.wheelWinner, data.members || []);
        }
      }

      if (data.status === 'finished') {
        showScreen('finished');
        document.getElementById('finished-winner').textContent = data.wheelWinner?.emoji + ' ' + data.wheelWinner?.label || '🍽️';
        document.getElementById('finished-members').textContent = (data.members||[]).map(m=>m.name).join(', ');
      }
    });
  }

  // ── VOTING ──
  window.castVote = async function(catId) {
    if (!currentSession) return;
    const snap = await getDocs(collection(db, 'neyesek_sessions'));
    let sessionData = null;
    snap.forEach(d => { if (d.id === currentSession.id) sessionData = { id: d.id, ...d.data() }; });
    if (!sessionData || sessionData.status !== 'voting') return;
    const members = sessionData.members.map(m => {
      if (m.name === currentSession.myName) {
        const votes = [...(m.votes||[])];
        const idx = votes.indexOf(catId);
        if (idx > -1) votes.splice(idx, 1); else votes.push(catId);
        return { ...m, votes };
      }
      return m;
    });
    await updateDoc(doc(db, 'neyesek_sessions', currentSession.id), { members });
  }

  function renderVotingUI(members) {
    const me = members.find(m => m.name === currentSession?.myName);
    const myVotes = me?.votes || [];
    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.classList.toggle('selected', myVotes.includes(btn.dataset.id));
    });
  }

  function renderMembers(members) {
    const container = document.getElementById('members-list');
    if (!container) return;
    container.innerHTML = members.map(m => \`
      <div class="member-chip \${m.votes?.length ? 'voted' : ''}">
        \${m.votes?.length ? '✅' : '⏳'} \${m.name}
        \${m.votes?.length ? \`<span class="vote-count">\${m.votes.length}</span>\` : ''}
      </div>\`).join('');
  }

  function renderResults(members, containerId) {
    const tally = {};
    members.forEach(m => (m.votes||[]).forEach(v => tally[v] = (tally[v]||0)+1));
    const sorted = Object.entries(tally).sort((a,b) => b[1]-a[1]);
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!sorted.length) { container.innerHTML = '<div class="empty-votes">Henüz oy kullanılmadı</div>'; return; }
    const max = sorted[0][1];
    container.innerHTML = sorted.map(([id, count]) => {
      const cat = CATEGORIES.find(c => c.id === id);
      if (!cat) return '';
      const pct = Math.round((count / members.length) * 100);
      const isTop = count === max;
      return \`<div class="result-row \${isTop?'top':''}">
        <span class="result-emoji">\${cat.emoji}</span>
        <div class="result-info">
          <span class="result-label">\${cat.label} \${isTop?'🏆':''}</span>
          <div class="result-bar-wrap"><div class="result-bar" style="width:\${pct}%;background:\${cat.color}"></div></div>
        </div>
        <span class="result-count">\${count} oy</span>
      </div>\`;
    }).join('');
  }

  function getWinners(members) {
    const tally = {};
    members.forEach(m => (m.votes||[]).forEach(v => tally[v] = (tally[v]||0)+1));
    if (!Object.keys(tally).length) return CATEGORIES.slice(0,8);
    const max = Math.max(...Object.values(tally));
    return Object.entries(tally).filter(([,c])=>c===max).map(([id])=>CATEGORIES.find(c=>c.id===id)).filter(Boolean);
  }

  // ── HOST ACTIONS ──
  window.finishVoting = async function() {
    if (!currentSession) return;
    await updateDoc(doc(db, 'neyesek_sessions', currentSession.id), { status: 'result' });
  }

  window.triggerSpin = async function() {
    if (!currentSession) return;
    // Firebase'e spin sinyali gönder — herkes aynı anda görür
    const spinId = Date.now().toString();
    await updateDoc(doc(db, 'neyesek_sessions', currentSession.id), { wheelSpin: spinId, wheelWinner: null });
  }

  // ── WHEEL ──
  function buildWheel(members) {
    const winners = getWinners(members);
    window._wheelItems = winners.length >= 2 ? winners : CATEGORIES.slice(0,8);
    drawWheel(0);
  }

  function drawWheel(angle) {
    const canvas = document.getElementById('wheel-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const items = window._wheelItems || CATEGORIES.slice(0,8);
    const total = items.length;
    const arc = (2 * Math.PI) / total;
    const cx = canvas.width/2, cy = canvas.height/2, r = cx - 8;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    items.forEach((item, i) => {
      const start = angle + i * arc;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + arc); ctx.closePath();
      ctx.fillStyle = item.color; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(start + arc/2);
      ctx.textAlign = 'right'; ctx.fillStyle = '#fff';
      ctx.font = \`bold \${total > 6 ? 12 : 14}px Nunito\`;
      ctx.fillText(item.emoji + ' ' + item.label, r - 10, 5);
      ctx.restore();
    });
    // Ok (sağda)
    ctx.beginPath();
    ctx.moveTo(cx + r + 14, cy);
    ctx.lineTo(cx + r - 2, cy - 12);
    ctx.lineTo(cx + r - 2, cy + 12);
    ctx.closePath(); ctx.fillStyle = '#1a1a1a'; ctx.fill();
  }

  function animateWheel(items, spinId) {
    window._wheelItems = items;
    if (wheelAnimFrame) cancelAnimationFrame(wheelAnimFrame);
    let speed = Math.random() * 8 + 14;
    let angle = wheelAngle;

    const animate = async () => {
      angle += speed * (Math.PI / 180);
      speed *= 0.987;
      wheelAngle = angle;
      drawWheel(angle);

      if (speed > 0.25) {
        wheelAnimFrame = requestAnimationFrame(animate);
      } else {
        // Kazananı hesapla
        const total = items.length;
        const arc = (2 * Math.PI) / total;
        const norm = ((angle % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
        const winIdx = Math.floor(((2*Math.PI - norm) % (2*Math.PI)) / arc) % total;
        const winner = items[winIdx];
        // Firebase'e yaz (sadece host)
        if (isHost && currentSession) {
          await updateDoc(doc(db, 'neyesek_sessions', currentSession.id), {
            wheelWinner: { id: winner.id, label: winner.label, emoji: winner.emoji, color: winner.color }
          });
        }
      }
    };
    wheelAnimFrame = requestAnimationFrame(animate);
  }

  function showWheelWinner(winner, members) {
    const el = document.getElementById('wheel-winner-box');
    if (!el || el.dataset.shown === winner.id) return;
    el.dataset.shown = winner.id;
    el.innerHTML = \`<div class="winner-box" style="border-color:\${winner.color}">
      <div class="winner-emoji">\${winner.emoji}</div>
      <div class="winner-label">\${winner.label}</div>
      <div class="winner-sub">Herkese afiyet olsun! 🎉</div>
    </div>\`;
    el.style.display = 'block';
    // Spin butonunu bitir butona çevir (sadece host)
    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn && isHost) {
      spinBtn.textContent = '✅ Oturumu Bitir';
      spinBtn.onclick = () => finishSession(winner, members);
    }
    // Yakın restoranları ara
    searchNearby(winner.label);
  }

  window.finishSession = async function(winner, members) {
    if (!currentSession) return;
    await updateDoc(doc(db, 'neyesek_sessions', currentSession.id), {
      status: 'finished',
      finishedAt: serverTimestamp()
    });
  }

  // ── NEARBY ──
  window.searchNearby = function(query) {
    const container = document.getElementById('nearby-list');
    if (!container) return;
    container.innerHTML = '<div class="loading">📍 Konum alınıyor...</div>';
    if (!navigator.geolocation) {
      container.innerHTML = \`<a class="place-card" href="https://www.google.com/maps/search/\${encodeURIComponent(query+' restoran')}" target="_blank"><div class="place-name">Google Maps'te Ara</div><div class="place-addr">\${query} restoranları</div><span class="place-link">Ara ↗</span></a>\`;
      return;
    }
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lon } = pos.coords;
      fetch(\`https://nominatim.openstreetmap.org/search?q=\${encodeURIComponent(query+' restoran')}&format=json&limit=5&lat=\${lat}&lon=\${lon}&addressdetails=1\`)
        .then(r => r.json())
        .then(data => {
          if (!data.length) throw new Error('no results');
          container.innerHTML = data.map(p => \`
            <a class="place-card" href="https://www.google.com/maps/search/?api=1&query=\${encodeURIComponent(p.display_name)}" target="_blank">
              <div class="place-name">\${p.display_name.split(',')[0]}</div>
              <div class="place-addr">\${p.display_name.split(',').slice(1,3).join(',')}</div>
              <span class="place-link">Haritada Aç ↗</span>
            </a>\`).join('');
        })
        .catch(() => {
          container.innerHTML = \`<a class="place-card" href="https://www.google.com/maps/search/\${encodeURIComponent(query+' restoran')}" target="_blank"><div class="place-name">Google Maps'te Ara</div><div class="place-addr">\${query} restoranları yakınında</div><span class="place-link">Ara ↗</span></a>\`;
        });
    }, () => {
      container.innerHTML = \`<a class="place-card" href="https://www.google.com/maps/search/\${encodeURIComponent(query+' restoran')}" target="_blank"><div class="place-name">Google Maps'te Ara</div><div class="place-addr">\${query} restoranları</div><span class="place-link">Ara ↗</span></a>\`;
    });
  }

  // ── GEÇMİŞ OTURUMLAR ──
  window.loadHistory = async function() {
    const container = document.getElementById('history-list');
    container.innerHTML = '<div class="loading">Yükleniyor...</div>';
    const snap = await getDocs(collection(db, 'neyesek_sessions'));
    const sessions = [];
    snap.forEach(d => { const data = d.data(); if (data.status === 'finished') sessions.push({ id: d.id, ...data }); });
    sessions.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
    if (!sessions.length) { container.innerHTML = '<div class="empty-votes">Henüz tamamlanmış oturum yok.</div>'; return; }
    container.innerHTML = sessions.map(s => {
      const date = s.createdAt?.seconds ? new Date(s.createdAt.seconds*1000).toLocaleDateString('tr-TR') : '—';
      const members = (s.members||[]).map(m=>m.name).join(', ');
      const winner = s.wheelWinner;
      return \`<div class="history-card">
        <div class="history-header">
          <span class="history-code">#\${s.code}</span>
          <span class="history-date">\${date}</span>
        </div>
        \${winner ? \`<div class="history-winner">\${winner.emoji} <strong>\${winner.label}</strong></div>\` : ''}
        <div class="history-members">👥 \${members}</div>
      </div>\`;
    }).join('');
  }

  // ── SCREENS ──
  window.showScreen = function(name) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById('screen-' + name).style.display = 'block';
    if (name === 'voting') renderCategoryGrid();
    if (name === 'history') loadHistory();
  }

  function renderCategoryGrid() {
    const grid = document.getElementById('cat-grid');
    if (!grid) return;
    grid.innerHTML = CATEGORIES.map(c => \`
      <button class="cat-btn" data-id="\${c.id}" onclick="castVote('\${c.id}')" style="--cat-color:\${c.color}">
        <span class="cat-emoji">\${c.emoji}</span>
        <span class="cat-label">\${c.label}</span>
      </button>\`).join('');
  }

  window.newSession = function() {
    sessionStorage.removeItem('ny_session');
    currentSession = null; isHost = false;
    if (wheelAnimFrame) cancelAnimationFrame(wheelAnimFrame);
    showScreen('home');
  }

  window.copyCode = function() {
    if (!currentSession) return;
    navigator.clipboard.writeText(currentSession.code).catch(()=>{});
    const btn = document.getElementById('copy-btn');
    btn.textContent = '✅ Kopyalandı!';
    setTimeout(() => btn.textContent = '📋 Kopyala', 2000);
  }

  window.addEventListener('DOMContentLoaded', () => {
    const saved = sessionStorage.getItem('ny_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      currentSession = parsed; window.currentSession = parsed;
      myName = parsed.myName; isHost = parsed.isHost || false;
      listenSession(parsed.id);
      showScreen('voting');
      document.getElementById('session-code-display').textContent = parsed.code || '—';
    } else {
      showScreen('home');
    }
  });
</script>
</body>
</html>`;

// ── ROTALAR ──

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(HTML_ANASAYFA);
});

app.get('/crm', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(HTML_CRM);
});

app.get('/crm/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(HTML_CRM);
});

app.get('/neyesek', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(HTML_NEYESEK);
});

app.get('/neyesek/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(HTML_NEYESEK);
});

// ── API ──

app.get('/api/rss', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL gerekli' });
  try {
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&api_key=free&count=20`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'RSS alinamadi' });
  }
});

app.post('/api/translate', async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Baslik gerekli' });
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Asagidaki teknoloji haberini Turkcey cevir. Sadece JSON formatinda yanit ver:\n{"title": "cevrilmis baslik", "description": "cevrilmis aciklama (max 2 cumle)"}\n\nBaslik: ${title}\nAciklama: ${description || ''}`
        }]
      })
    });
    const data = await response.json();
    const text = data.content[0].text.trim();
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'Ceviri basarisiz' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Kobar sunucu port ${PORT}'de calisiyor`));
