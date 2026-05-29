// =============================================
// DATA & FIREBASE CONFIG
// =============================================

const DATA = {
  "couple": {"name1":"Ajing","name2":"Ansan","name1_alt":"El","name2_alt":"Ri","start_date":"2025-02-14","initials":"R&E"},
  "themes": {
    "default": "purple",
    "options": {
      "purple":{"name":"Royal Purple","bg_primary":"#403F6F","bg_secondary":"#3f4b6f","bg_card":"#2c344e","text_primary":"#e6edf3","text_secondary":"#8b949e","text_muted":"#6e7681","accent_warm":"#c9a58f","accent_gold":"#e8b84a","accent_pink":"#e06080","accent_blue":"#e8b84a"},
      "pink":{"name":"Blush Pink","bg_primary":"#4a2c4a","bg_secondary":"#3d2340","bg_card":"#2e1a30","text_primary":"#fce4ec","text_secondary":"#e8b4c8","text_muted":"#b07f96","accent_warm":"#f4a4c4","accent_gold":"#ffd54f","accent_pink":"#ff6b9d","accent_blue":"#80cbc4"},
      "gold":{"name":"Golden Hour","bg_primary":"#2d2a1a","bg_secondary":"#3a3522","bg_card":"#272418","text_primary":"#fff8e1","text_secondary":"#e6ce8c","text_muted":"#a8925e","accent_warm":"#e6c27a","accent_gold":"#ffd54f","accent_pink":"#ff8a65","accent_blue":"#81d4fa"},
      "rose":{"name":"Rose Garden","bg_primary":"#3d1f26","bg_secondary":"#4a2630","bg_card":"#311a20","text_primary":"#fce4ec","text_secondary":"#d4a0b0","text_muted":"#a07080","accent_warm":"#e8a0b0","accent_gold":"#f0c060","accent_pink":"#e04070","accent_blue":"#90b4c8"},
      "ocean":{"name":"Deep Ocean","bg_primary":"#1a2a3d","bg_secondary":"#1e3450","bg_card":"#162030","text_primary":"#e0f0ff","text_secondary":"#88b0d0","text_muted":"#6080a0","accent_warm":"#c0a080","accent_gold":"#f0d060","accent_pink":"#d07090","accent_blue":"#60b8ff"},
      "emerald":{"name":"Emerald Dream","bg_primary":"#1a2d22","bg_secondary":"#1e3828","bg_card":"#14241a","text_primary":"#e0f5e8","text_secondary":"#88c0a0","text_muted":"#60a080","accent_warm":"#c0b088","accent_gold":"#e0d050","accent_pink":"#d09080","accent_blue":"#70c8c8"}
    }
  },
  "monthsaries": [
    {"number":1,"date":"2026-04-14","theme":"purple","title":"Happy 14th Monthsary Baby","subtitle":"A year and 2 months of love and adventure","letter":"Made for you my Bao, my partner in crime, my best friend. I know this month we didn't make much memories together. But I hope we can make more memories together in the future. I love you so much and I'm so grateful to have you in my life. Here's to many more months and years of adventures together.","photos":[{"file":"images/14th/1.jfif","caption":"You & Octopus"},{"file":"images/14th/7.jfif","caption":"US TOGETHER"},{"file":"images/14th/5.jfif","caption":"Sleepy You"},{"file":"images/14th/4.jfif","caption":"Octopus On Your Shoulder"},{"file":"images/14th/10.jfif","caption":"You Smiling"},{"file":"images/14th/1.jfif","caption":"Our Moment"},{"file":"images/14th/2.jfif","caption":"Us"},{"file":"images/14th/3.jfif","caption":"Another Memory"},{"file":"images/14th/6.jfif","caption":"Cute Ka Talaga"},{"file":"images/14th/8.jfif","caption":"My Favorite"},{"file":"images/14th/9.jfif","caption":"Beautiful"},{"file":"images/14th/12.jfif","caption":"Precious"},{"file":"images/14th/13.jfif","caption":"My Love"},{"file":"images/14th/11.jfif","caption":"My Baby"}],"songs":[{"file":"music/howl.mp3","title":"Howl","artist":"Joe Hisaishi"},{"file":"music/snowspring.mp3","title":"Spring Snow","artist":"10CM"},{"file":"music/riskitall.mp3","title":"Risk It All","artist":"Bruno Mars"}],"dreams_life":["Get a pet together","Cook a full meal from scratch","Learn something new together","Build our home library","Grow old together, still laughing"],"dreams_month":["Rewatch every Studio Ghibli film together","Dance in the rain","Me painting your nails","Create our own traditions","Do something spontaneous together"]},
    {"number":2,"date":"2026-05-14","theme":"purple","title":"Happy 15th Monthsary Baby","subtitle":"A year and 3 months of love and adventure","letter":"My Ri, my Love, my Bao, my Ansan... 15 months, imagine mo un 15 months. That's 15 months of you making my world brighter just by being in it. I love you more than words can say. Here's to our 15th month, and then forever.","photos":[{"file":"images/15th/1.jfif","caption":"Cutie You"},{"file":"images/15th/2.jfif","caption":"SELFIEE"},{"file":"images/15th/3.jfif","caption":"NEW STYLE WITH LILY"},{"file":"images/15th/4.jfif","caption":"HEY AKO YAN AH"},{"file":"images/15th/5.jfif","caption":"YOUR SO BEAUTIFUL"},{"file":"images/15th/6.jfif","caption":"Hey Baby Girl ;)"},{"file":"images/15th/7.jfif","caption":"US ON A CAMERA YAHU"},{"file":"images/15th/8.jfif","caption":"CUTE MOOOOOOOOO"},{"file":"images/15th/9.jfif","caption":"UY SHOCKED AKO"},{"file":"images/15th/10.jfif","caption":"Me with the number"},{"file":"images/15th/11.jfif","caption":"Uy iusang magsasaka"},{"file":"images/15th/12.jfif","caption":"Precious selfie"},{"file":"images/15th/13.jfif","caption":"CUTIE STYLE ULIT"},{"file":"images/15th/14.jfif","caption":"Uy PFP ko"},{"file":"images/15th/15.jfif","caption":"In love ako lalo ah"}],"songs":[{"file":"music/gugma.mp3","title":"Gugma","artist":"Cedie"},{"file":"music/gustokolamangsabuhay.mp3","title":"Gusto Ko Lamang Sa Buhay","artist":"The Itchyworms"},{"file":"music/mysb.mp3","title":"MSYB (Miss You so Bad)","artist":"Kira, OCDawgs"},{"file":"music/orasan.mp3","title":"Orasan","artist":"HEY JUNE!"},{"file":"music/paraluman.mp3","title":"Paraluman","artist":"Adie"},{"file":"music/pariwara.mp3","title":"Pariwara","artist":"Ely Buendia, The Itchyworms"}],"dreams_life":["Get a pet together","Cook a full meal from scratch","Learn something new together","Build our home library","Grow old together, still laughing"],"dreams_month":["Go on a picnic together","Watch the sunset somewhere beautiful","Take new photos together","Try a new restaurant","Write each other letters"]}
  ]
};

// =============================================
// FIREBASE CONFIG
// =============================================
// Replace with your Firebase project config from console.firebase.google.com
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCdyv3DIVk-ify10jz9uhNeYtRG3LBfjoY",
    authDomain: "ri-el-b3370.firebaseapp.com",
    databaseURL: "https://ri-el-b3370-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ri-el-b3370",
    storageBucket: "ri-el-b3370.firebasestorage.app",
    messagingSenderId: "280839438074",
    appId: "1:280839438074:web:9fa678677fbff8101b9343"
};
