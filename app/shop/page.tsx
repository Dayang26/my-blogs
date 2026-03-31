'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useBlogLanguage } from '@/hooks/useBlogLanguage';

// --- Types ---
type Category = 'all' | 'weapon' | 'treasure' | 'consumable';
type Rarity = 'common' | 'rare' | 'legendary';

interface ShopItem {
  id: string;
  category: Category;
  rarity: Rarity;
  title: { en: string; zh: string };
  description: { en: string; zh: string };
  price: number;
  icon: string;
  stats: { label: { en: string; zh: string }; value: string }[];
}

// --- Data ---
const categories: { id: Category; name: { en: string; zh: string } }[] = [
  { id: 'all', name: { en: 'All Items', zh: '全部商品' } },
  { id: 'weapon', name: { en: 'Weapons', zh: '武器装备' } },
  { id: 'treasure', name: { en: 'Treasures', zh: '稀世珍宝' } },
  { id: 'consumable', name: { en: 'Consumables', zh: '各类补给' } },
];

const shopItems: ShopItem[] = [
  {
    id: 'weapon-1',
    category: 'weapon',
    rarity: 'rare',
    title: { en: 'Pixel Greatsword', zh: '像素巨剑' },
    description: { en: 'A heavy blade forged from refined 8-bit ore.', zh: '由精炼的8位矿石锻造而成的沉重利刃。' },
    price: 450,
    icon: '⚔️',
    stats: [
      { label: { en: 'Attack', zh: '攻击' }, value: '+45' },
      { label: { en: 'Weight', zh: '重量' }, value: '12kg' },
    ],
  },
  {
    id: 'treasure-1',
    category: 'treasure',
    rarity: 'legendary',
    title: { en: 'Void Crystal', zh: '虚空水晶' },
    description: { en: 'A crystal containing the essence of the dark cosmos.', zh: '蕴含黑暗宇宙精华的神奇水晶。' },
    price: 1200,
    icon: '💎',
    stats: [
      { label: { en: 'Mana', zh: '魔力' }, value: '+500' },
      { label: { en: 'Rarity', zh: '品质' }, value: 'Ancient' },
    ],
  },
  {
    id: 'consumable-1',
    category: 'consumable',
    rarity: 'common',
    title: { en: 'Health Potion', zh: '生命药水' },
    description: { en: 'Restores health instantly upon consumption.', zh: '饮用后立即恢复生命值。' },
    price: 80,
    icon: '🧪',
    stats: [
      { label: { en: 'Heal', zh: '治疗' }, value: '100 HP' },
      { label: { en: 'CD', zh: '冷却' }, value: '30s' },
    ],
  },
  {
    id: 'weapon-2',
    category: 'weapon',
    rarity: 'common',
    title: { en: 'Starter Dagger', zh: '新手短剑' },
    description: { en: 'Simple but reliable for early adventures.', zh: '简单而可靠，适合初期冒险使用。' },
    price: 120,
    icon: '🔪',
    stats: [
      { label: { en: 'Attack', zh: '攻击' }, value: '+15' },
      { label: { en: 'Speed', zh: '攻速' }, value: 'Fast' },
    ],
  },
  {
    id: 'treasure-2',
    category: 'treasure',
    rarity: 'rare',
    title: { en: 'Dragon Egg', zh: '巨龙之蛋' },
    description: { en: 'Warm to the touch. Whispers can be heard.', zh: '触手生温，隐约能听到细碎的低语。' },
    price: 850,
    icon: '🥚',
    stats: [
      { label: { en: 'Weight', zh: '重量' }, value: '5kg' },
      { label: { en: 'Origin', zh: '产地' }, value: 'Fire Peaks' },
    ],
  },
];

// --- Components ---

function RarityBadge({ rarity, lang }: { rarity: Rarity; lang: string }) {
  const styles = {
    common: 'border-slate-500 text-slate-400 bg-slate-900/40',
    rare: 'border-cyan-400 text-cyan-400 bg-cyan-900/20',
    legendary: 'border-amber-400 text-amber-400 bg-amber-900/20 shadow-[0_0_10px_rgba(251,191,36,0.3)]',
  };

  const label = {
    common: { en: 'Common', zh: '普通' },
    rare: { en: 'Rare', zh: '稀有' },
    legendary: { en: 'Legendary', zh: '史诗' },
  };

  return (
    <span className={`border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[rarity]}`}>
      {lang === 'en' ? label[rarity].en : label[rarity].zh}
    </span>
  );
}

export default function ShopPage() {
  const { lang } = useBlogLanguage('en');
  const isZh = lang === 'zh';
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return shopItems;
    return shopItems.filter(item => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#020617] font-mono text-slate-100">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.1)_0%,transparent_50%)]" />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')]" />

      {/* --- Navbar --- */}
      <nav className="sticky top-0 z-50 border-b-2 border-slate-800/80 bg-[#020617]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2">
              <span className="text-2xl">🏪</span>
              <span className="text-lg font-black uppercase tracking-[.25em] text-cyan-400 group-hover:text-cyan-300 transition">
                {isZh ? '数字商店' : 'Pixel Shop'}
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-400">
              <Link href="/" className="hover:text-cyan-400 transition">{isZh ? '首页' : 'Home'}</Link>
              <Link href="/blog" className="hover:text-cyan-400 transition">{isZh ? '日志' : 'Blog'}</Link>
              <Link href="/labs" className="hover:text-cyan-400 transition">{isZh ? '实验室' : 'Labs'}</Link>
              <span className="text-cyan-400">{isZh ? '商店' : 'Shop'}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 border-2 border-slate-800 px-3 py-1 bg-slate-900/50">
               <span className="text-xs text-amber-500 font-bold">2,450</span>
               <span className="text-[10px] text-slate-500 uppercase font-black">Pts</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-8 py-12">
        {/* --- Header & Summary --- */}
        <div className="mb-12">
          <h2 className="mb-4 text-3xl font-black uppercase tracking-[.15em] text-cyan-200">
            {isZh ? '高级像素资源中心' : 'Premium Pixel Hub'}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
            {isZh 
              ? '发现稀有装备与独特收藏。所有商品均采用 8-bit 精炼技术打造，为您的虚拟冒险提供最强支持。' 
              : 'Discover rare gear and unique collectibles. All items are crafted with 8-bit precision to support your virtual adventures.'}
          </p>
        </div>

        {/* --- Category Bar --- */}
        <div className="mb-10 flex flex-wrap items-center gap-4 border-b-2 border-slate-800 pb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`border-2 px-6 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                activeCategory === cat.id
                  ? 'border-cyan-400 bg-cyan-400 text-slate-950 shadow-[4px_4px_0px_white]'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              {isZh ? cat.name.zh : cat.name.en}
            </button>
          ))}
        </div>

        {/* --- Product Grid --- */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col border-2 border-slate-800 bg-slate-900/60 p-6 transition-all hover:border-cyan-400/50 hover:bg-slate-900/90 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]"
            >
              {/* Header: Icon & Rarity */}
              <div className="mb-6 flex items-start justify-between">
                <div className="text-5xl drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-transform group-hover:scale-110">
                  {item.icon}
                </div>
                <RarityBadge rarity={item.rarity} lang={lang} />
              </div>

              {/* Title & Description */}
              <h3 className="mb-3 text-lg font-black uppercase tracking-wider text-slate-100">
                {isZh ? item.title.zh : item.title.en}
              </h3>
              <p className="mb-6 text-xs leading-relaxed text-slate-400 h-12 overflow-hidden line-clamp-3">
                {isZh ? item.description.zh : item.description.en}
              </p>

              {/* Stats Block */}
              <div className="mb-8 grid grid-cols-2 gap-2">
                {item.stats.map((stat, i) => (
                  <div key={i} className="flex flex-col border border-slate-800 bg-slate-950/40 p-2">
                    <span className="text-[10px] uppercase text-slate-500 font-bold">
                       {isZh ? stat.label.zh : stat.label.en}
                    </span>
                    <span className="text-xs font-black text-cyan-400">{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Footer: Price & Action */}
              <div className="mt-auto flex items-end justify-between">
                <div className="flex flex-col">
                   <span className="text-[10px] uppercase font-bold text-slate-500">{isZh ? '价格' : 'Price'}</span>
                   <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-amber-500">{item.price}</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Pts</span>
                   </div>
                </div>
                <a
                  href="https://www.paypal.com/ncp/payment/S3VBBNMW3YJ3G"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-cyan-400 bg-cyan-400/90 px-6 py-2 text-xs font-black uppercase tracking-widest text-slate-950 transition hover:bg-cyan-300 active:translate-y-1 active:bg-cyan-500 active:shadow-inner"
                >
                  {isZh ? '立即购买' : 'Buy Now'}
                </a>
              </div>
            </div>
          ))}

          {/* Coming Soon Placeholder */}
          <div className="flex min-h-[300px] flex-col items-center justify-center border-2 border-dashed border-slate-800 bg-slate-950/20 text-center p-8">
             <div className="mb-4 text-4xl grayscale opacity-30">📦</div>
             <p className="text-[10px] uppercase font-black tracking-widest text-slate-600">
               {isZh ? '更多史诗装备正在研发中...' : 'More Epic Gear In Dev...'}
             </p>
          </div>
        </div>
      </main>

      {/* --- Professional Footer --- */}
      <footer className="mt-20 border-t-2 border-slate-800 bg-[#010409]">
        <div className="mx-auto max-w-7xl px-8 py-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {/* Info Column */}
            <div className="flex flex-col gap-6">
               <div className="flex items-center gap-2">
                  <span className="text-xl">🏪</span>
                  <span className="text-sm font-black uppercase tracking-widest text-cyan-400">Digital Shop v1.0</span>
               </div>
               <p className="text-xs leading-relaxed text-slate-500">
                 {isZh 
                   ? '由 HandTrack 3D 实验室提供支持。我们致力于为数字探险家提供最高品质的像素化资产与神秘道具。' 
                   : 'Powered by HandTrack 3D Labs. Dedicated to providing top-quality pixelated assets and mystic items for digital explorers.'}
               </p>
            </div>

            {/* Contact Column */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 underline underline-offset-8 decoration-cyan-400">
                {isZh ? '联系我们' : 'Contact Details'}
              </h4>
              <div className="flex flex-col gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400">📧</span>
                  <a href="mailto:flyhsyy@gmail.com" className="hover:text-cyan-300 transition">flyhsyy@gmail.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400">📞</span>
                  <span>+86 15623228013</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400">📍</span>
                  <span>China, ShenZhen, Nanshan Digital Hub</span>
                </div>
              </div>
            </div>

            {/* Links Column */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 underline underline-offset-8 decoration-cyan-400">
                {isZh ? '快速链接' : 'Quick Access'}
              </h4>
              <div className="flex flex-col gap-2 text-xs text-slate-500 font-bold uppercase tracking-wider">
                <Link href="/" className="hover:text-cyan-400 transition">Home</Link>
                <Link href="/blog" className="hover:text-cyan-400 transition">Latest Blog</Link>
                <Link href="/labs" className="hover:text-cyan-400 transition">Experiment Labs</Link>
                <a href="https://github.com/Dayang26" target="_blank" className="hover:text-cyan-400 transition">Github Source</a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 flex flex-col items-center justify-between border-t border-slate-900 pt-8 gap-4 md:flex-row">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-600 italic">
               © 2026 HandTrack Hub. All Rights Reserved. Secure Pixel Protocol Enabled.
            </span>
            <div className="flex items-center gap-4 text-sm opacity-50 grayscale hover:grayscale-0 transition">
               <span>🛸</span>
               <span>👾</span>
               <span>🕹️</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
