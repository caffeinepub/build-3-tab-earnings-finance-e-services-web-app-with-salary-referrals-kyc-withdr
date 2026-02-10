import type { AdCreative } from '../../hooks/useTapToEarnAdScheduler';

const AD_CREATIVES: AdCreative[] = [
  {
    id: 'ad-1',
    imagePath: '/assets/ads/ad-creative-1.svg',
    title: 'আরও পুরস্কার অর্জন করুন!',
    description: 'টাস্ক সম্পন্ন করুন এবং বন্ধুদের রেফার করুন আপনার আয় সর্বাধিক করতে।',
  },
  {
    id: 'ad-2',
    imagePath: '/assets/ads/ad-creative-1.svg',
    title: 'ব্যাংকিং ও ফিন্যান্স সেবা',
    description: 'যাচাইকৃত অ্যাকাউন্ট দিয়ে মাইক্রো লোন এবং ডিপিএস স্কিমের জন্য আবেদন করুন।',
  },
];

let rotationIndex = 0;

export function getNextAdCreative(): AdCreative {
  const creative = AD_CREATIVES[rotationIndex % AD_CREATIVES.length];
  rotationIndex += 1;
  return creative;
}

export function getRandomAdCreative(): AdCreative {
  const randomIndex = Math.floor(Math.random() * AD_CREATIVES.length);
  return AD_CREATIVES[randomIndex];
}

export function getAdCreativeByThreshold(tapCount: number): AdCreative {
  // Deterministic selection based on tap count
  const index = Math.floor(tapCount / 45) % AD_CREATIVES.length;
  return AD_CREATIVES[index];
}
