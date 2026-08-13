"use client";

import { useMemo, useRef, useState } from "react";

type Place = { name: string; country: string; region: string; x: number; y: number; note: string; tag: string };

const places: Place[] = [
  { name: "长城", country: "中国 · 北京", region: "亚洲", x: 77, y: 42, note: "穿越群山的古老奇迹", tag: "历史" },
  { name: "富士山", country: "日本 · 山梨", region: "亚洲", x: 86, y: 46, note: "湖泊与雪峰相映成景", tag: "自然" },
  { name: "圣托里尼", country: "希腊 · 爱琴海", region: "欧洲", x: 54, y: 49, note: "悬崖上的蓝白岛屿", tag: "海岛" },
  { name: "塞伦盖蒂", country: "坦桑尼亚", region: "非洲", x: 57, y: 66, note: "追随旷野上的生命迁徙", tag: "野生动物" },
  { name: "大峡谷", country: "美国 · 亚利桑那", region: "北美洲", x: 18, y: 46, note: "被时间雕刻的壮阔峡谷", tag: "自然" },
  { name: "马丘比丘", country: "秘鲁 · 库斯科", region: "南美洲", x: 31, y: 72, note: "云端上的印加遗迹", tag: "遗迹" },
  { name: "悉尼歌剧院", country: "澳大利亚 · 悉尼", region: "大洋洲", x: 88, y: 78, note: "海港边的建筑艺术", tag: "城市" },
  { name: "雷克雅未克", country: "冰岛", region: "欧洲", x: 43, y: 30, note: "追逐极光与冰川", tag: "极地" },
];

const continents = [
  { n: "北美洲", c: "north", x: 9, y: 27 }, { n: "南美洲", c: "south", x: 27, y: 59 },
  { n: "欧洲", c: "europe", x: 47, y: 30 }, { n: "非洲", c: "africa", x: 48, y: 47 },
  { n: "亚洲", c: "asia", x: 59, y: 27 }, { n: "大洋洲", c: "oceania", x: 79, y: 65 },
];

export default function Home() {
  const [zoom, setZoom] = useState(0);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Place | null>(places[0]);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; rx: number; ry: number } | null>(null);
  const globe = zoom >= 55;
  const suggestions = useMemo(() => query.trim() ? places.filter(p => `${p.name}${p.country}${p.region}`.toLowerCase().includes(query.toLowerCase())) : [], [query]);

  const select = (p: Place) => { setActive(p); setQuery(""); setZoom(Math.max(zoom, 65)); };
  const pointerDown = (e: React.PointerEvent) => { drag.current = { x: e.clientX, y: e.clientY, rx: rotation.x, ry: rotation.y }; e.currentTarget.setPointerCapture(e.pointerId); };
  const pointerMove = (e: React.PointerEvent) => { if (!drag.current) return; setRotation({ x: drag.current.rx + e.clientX - drag.current.x, y: Math.max(-55, Math.min(55, drag.current.ry + e.clientY - drag.current.y)) }); };

  return (
    <main className="shell">
      <header>
        <a className="brand" href="#" aria-label="漫游地球首页"><span>◉</span> 漫游地球</a>
        <nav><a className="active" href="#explore">探索</a><a href="#inspire">灵感</a><a href="#about">关于</a></nav>
        <button className="avatar" aria-label="个人中心">游</button>
      </header>

      <section className="hero" id="explore">
        <div className="intro">
          <div className="eyebrow"><i /> THE WORLD IS YOURS</div>
          <h1>下一站，<br /><em>去哪里？</em></h1>
          <p>转动地球，发现那些让你心动的地方。<br />每一次探索，都是一段故事的开始。</p>
          <div className="search-wrap">
            <span>⌕</span>
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && suggestions[0]) select(suggestions[0]); }} placeholder="搜索城市、国家或景点" aria-label="搜索旅游景点" />
            <kbd>↵</kbd>
            {suggestions.length > 0 && <div className="suggestions">{suggestions.map(p => <button key={p.name} onClick={() => select(p)}><b>{p.name}</b><small>{p.country}</small></button>)}</div>}
          </div>
          <div className="quick"><span>热门：</span>{places.slice(0,4).map(p => <button key={p.name} onClick={() => select(p)}>{p.name}</button>)}</div>
        </div>

        <div className={`map-stage ${globe ? "is-globe" : "is-flat"}`}>
          <div className="map-hint">{globe ? "拖动地球，寻找目的地" : "拖动地图，缩放进入地球模式"}</div>
          <div className="map-wrap" style={{ transform: globe ? `perspective(900px) rotateX(${-rotation.y * .08}deg) rotateY(${rotation.x * .08}deg)` : `translate(${rotation.x * .12}px, ${rotation.y * .12}px)` }} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={() => drag.current = null} onPointerCancel={() => drag.current = null}>
            <div className="grid" />
            {continents.map(c => <div key={c.n} className={`continent ${c.c}`} style={{ left: `${c.x}%`, top: `${c.y}%` }}><span>{c.n}</span></div>)}
            {places.map(p => <button key={p.name} onClick={() => select(p)} className={`pin ${active?.name === p.name ? "selected" : ""}`} style={{ left: `${p.x}%`, top: `${p.y}%` }} aria-label={`${p.name}，${p.country}`}><i /><label>{p.name}</label></button>)}
          </div>

          <div className="controls">
            <button onClick={() => setZoom(Math.min(100, zoom + 20))} aria-label="放大">＋</button>
            <div className="range"><input aria-label="地图缩放" type="range" min="0" max="100" value={zoom} onChange={e => setZoom(Number(e.target.value))} /><span style={{ height: `${zoom}%` }} /></div>
            <button onClick={() => setZoom(Math.max(0, zoom - 20))} aria-label="缩小">−</button>
          </div>

          <div className="mode-switch"><button className={!globe ? "on" : ""} onClick={() => setZoom(20)}>▤ 2D 地图</button><button className={globe ? "on" : ""} onClick={() => setZoom(75)}>● 地球</button></div>

          {active && <article className="place-card">
            <button className="close" onClick={() => setActive(null)} aria-label="关闭">×</button>
            <div className="place-visual"><span>{active.region === "亚洲" ? "日出东方" : active.region === "欧洲" ? "漫步旧城" : "抵达远方"}</span></div>
            <div className="place-copy"><small>{active.tag} · {active.region}</small><h2>{active.name}</h2><p>{active.country}</p><strong>{active.note}</strong><button className="discover">查看目的地 <span>→</span></button></div>
          </article>}
        </div>
      </section>

      <footer><span>滚动或拖动探索</span><i /> <p><b>{places.length}</b> 个精选目的地 · 初版数据</p></footer>
    </main>
  );
}
