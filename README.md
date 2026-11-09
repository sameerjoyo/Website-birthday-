# 🐞 Happy Birthday, Fateem

A birthday gift website for Fatimaa's 25th birthday (25 December 2026), made with love by Sameer.

## What's inside

1. **Blow out the candles.** A "25" cake opens the site. Tap the flames or blow into the mic.
2. **Hero** with a live countdown to her birthday, plus a hidden ladybug 🐞.
3. **Every Second With You**: a live counter of days, hours, minutes and heartbeats since Feb 2024.
4. **Our Story**: a timeline with photos.
5. **A Letter For You**: a sealed envelope that opens into a letter that types itself.
6. **Why You're So Rare**: her eyes, smile, heart, voice and strength.
7. **25 Reasons I Love You**: a jar of notes she picks one by one.
8. **Us, In Pictures**: a polaroid gallery with tap-to-enlarge.
9. **Our Little Sky**: memory stars that form a heart once she opens all of them.
10. **Open When…**: 8 letters for every mood.
11. **Scratch & Smile**: gold scratch cards.
12. **Love Coupons**: redeemable, and they stay redeemed on her phone.
13. **How Well Do You Know Us?**: a quiz.
14. **Our Forever List**: future dreams she can tick off.
15. **Wishes For You**: a wishes wall from family and friends.
16. **Little Notes**: notes you keep adding.
17. **Send Your Wish**: floating lanterns.
18. **The Last Page**: heart fireworks, your video message and a signature.

Background music plays your song (button at the top right). The menu at the top left jumps to any chapter. There are 3 hidden ladybugs with secret messages.

## ✏️ How to edit (only one file!)

Open **`js/content.js`**. Every word, photo, quiz question, letter, coupon, wish and note is there.
To add more, copy a `{ ... }` block, paste it below, put a comma between them, and change the text.

- Photos → `assets/photos/` (see the README in that folder)
- Song → `assets/music/our-song.mp3`
- Video → `assets/video/message.mp4`
- Exact start date of your story → `togetherSince` in content.js
- Lock the site until her birthday → set `lockUntilBirthday: true`.
  You can still preview it by adding `?preview` to the link.

## 🌐 Put it online for free (GitHub Pages)

1. On GitHub open this repository → **Settings** → **Pages**.
2. Under "Build and deployment", set Source to **Deploy from a branch**.
3. Choose the branch with the website (e.g. `main`), folder **/ (root)**, and click **Save**.
4. After 1–2 minutes your link appears there, like `https://<username>.github.io/<repo-name>/`.
5. Send her that link 🤍

Note: on a free account the repository must be **public** for Pages to work, so anyone with the link can open the site.
`noindex` is set so search engines won't list it.
