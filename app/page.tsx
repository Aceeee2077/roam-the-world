"use client";

import { useMemo, useRef, useState } from "react";

type Place = {
  name: string;
  country: string;
  region: string;
  x: number;
  y: number;
  note: string;
  tag: string;
};

const places: Place[] = [
  { name: "长城", country: "中国 · 北京", region: "亚洲", x: 76, y: 40, note: "穿越群山的古老奇迹", tag: "历史" },
  { name: "富士山", country: "日本 · 山梨", region: "亚洲", x: 86, y: 44, note: "湖泊与雪峰相映成景", tag: "自然" },
  { name: "圣托里尼", country: "希腊 · 爱琴海", region: "欧洲", x: 54, y: 47, note: "悬崖上的蓝白岛屿", tag: "海岛" },
  { name: "塞伦盖蒂", country: "坦桑尼亚", region: "非洲", x: 57, y: 65, note: "追随旷野上的生命迁徙", tag: "野生动物" },
  { name: "大峡谷", country: "美国 · 亚利桑那", region: "北美洲", x: 18, y: 44, note: "被时间雕刻的壮阔峡谷", tag: "自然" },
  { name: "马丘比丘", country: "秘鲁 · 库斯科", region: "南美洲", x: 30, y: 72, note: "云端上的印加遗迹", tag: "遗迹" },
  { name: "悉尼歌剧院", country: "澳大利亚 · 悉尼", region: "大洋洲", x: 87, y: 77, note: "海港边的建筑艺术", tag: "城市" },
  { name: "雷克雅未克", country: "冰岛", region: "欧洲", x: 43, y: 27, note: "追逐极光与冰川", tag: "极地" },
  { name: "金字塔", country: "埃及 · 吉萨", region: "非洲", x: 55, y: 54, note: "沙漠中的文明印记", tag: "历史" },
  { name: "巴黎铁塔", country: "法国 · 巴黎", region: "欧洲", x: 49, y: 40, note: "塞纳河畔的浪漫地标", tag: "城市" },
];

const continents = [
  { name: "北美洲", className: "north", x: 8, y: 24 },
  { name: "南美洲", className: "south", x: 27, y: 57 },
  { name: "欧洲", className: "europe", x: 46, y: 29 },
  { name: "非洲", className: "africa", x: 48, y: 46 },
  { name: "亚洲", className: "asia", x: 59, y: 25 },
  { name: "大洋洲", className: "oceania", x: 79, y: 64 },
];

export default function Home() {
  const [zoom, setZoom] = useState(28);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Place | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const moved = useRef(false);
  const globe = zoom >= 58;

  const suggestions = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    return places.filter((place) =>
      `${place.name}${place.country}${place.region}${place.tag}`.toLowerCase().includes(value),
    );
  }, [query]);

  const selectPlace = (place: Place) => {
    setActive(place);
    setQuery("");
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: position.x,
      baseY: position.y,
    };
    moved.current = false;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.startX;
    const dy = event.clientY - drag.current.startY;
    if (Math.abs(dx) + Math.abs(dy) > 5) moved.current = true;

    if (globe) {
      setPosition({
        x: drag.current.baseX + dx * 0.7,
        y: Math.max(-160, Math.min(160, drag.current.baseY + dy * 0.7)),
      });
    } else {
      setPosition({
        x: Math.max(-360, Math.min(360, drag.current.baseX + dx)),
        y: Math.max(-180, Math.min(180, drag.current.baseY + dy)),
      });
    }
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const changeZoom = (next: number) => setZoom(Math.max(0, Math.min(100, next)));

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="topbar-search">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && suggestions[0]) selectPlace(suggestions[0]);
            }}
            placeholder="搜索城市、国家或景点"
            aria-label="搜索旅游景点"
          />
          <span className="shortcut">ENTER</span>
          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((place) => (
                <button key={place.name} onClick={() => selectPlace(place)}>
                  <span><b>{place.name}</b><small>{place.note}</small></span>
                  <em>{place.country}</em>
                </button>
              ))}
            </div>
          )}
        </div>

        <a className="brand" href="#map" aria-label="漫游地球首页">
          <span className="brand-mark">●</span>
          <strong>漫游地球</strong>
        </a>

        <div className="marquee" aria-label="travel around the world">
          <div className="marquee-track">
            <span>travel around the world</span><i>✦</i>
            <span>travel around the world</span><i>✦</i>
            <span>travel around the world</span><i>✦</i>
          </div>
        </div>
      </header>

      <section
        id="map"
        className={`map-viewport ${globe ? "globe-mode" : "flat-mode"} ${dragging ? "dragging" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={(event) => changeZoom(zoom - event.deltaY * 0.06)}
      >
        <div className="map-background" />
        <div
          className="world-map"
          style={{
            transform: globe
              ? `translate(-50%, -50%) perspective(1200px) rotateX(${-position.y * 0.09}deg) rotateY(${position.x * 0.11}deg)`
              : `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${1 + zoom * 0.004})`,
          }}
        >
          <div className="map-grid" />
          <div className="ocean-name pacific">太平洋</div>
          <div className="ocean-name atlantic">大西洋</div>
          <div className="ocean-name indian">印度洋</div>

          {continents.map((continent) => (
            <div
              key={continent.name}
              className={`continent ${continent.className}`}
              style={{ left: `${continent.x}%`, top: `${continent.y}%` }}
            >
              <span>{continent.name}</span>
            </div>
          ))}

          {places.map((place) => (
            <button
              key={place.name}
              className={`map-pin ${active?.name === place.name ? "selected" : ""}`}
              style={{ left: `${place.x}%`, top: `${place.y}%` }}
              onClick={() => { if (!moved.current) selectPlace(place); }}
              aria-label={`${place.name}，${place.country}`}
            >
              <span />
              <label>{place.name}</label>
            </button>
          ))}
        </div>

        <div className="map-title">
          <span>EXPLORE THE WORLD</span>
          <h1>{globe ? "转动地球，去往远方" : "拖动地图，发现世界"}</h1>
          <p>{globe ? "按住并拖动球体改变视角" : "按住任意位置拖动 · 滚轮缩放"}</p>
        </div>

        <div className="zoom-panel" onPointerDown={(event) => event.stopPropagation()}>
          <button onClick={() => changeZoom(zoom + 12)} aria-label="放大地图">+</button>
          <input
            type="range"
            min="0"
            max="100"
            value={zoom}
            onChange={(event) => changeZoom(Number(event.target.value))}
            aria-label="地图缩放"
          />
          <button onClick={() => changeZoom(zoom - 12)} aria-label="缩小地图">−</button>
        </div>

        <div className="mode-switch" onPointerDown={(event) => event.stopPropagation()}>
          <button className={!globe ? "active" : ""} onClick={() => changeZoom(28)}>2D 地图</button>
          <button className={globe ? "active" : ""} onClick={() => changeZoom(76)}>3D 地球</button>
        </div>

        <div className="drag-tip"><span>↔</span>{dragging ? "正在探索" : "按住拖动地图"}</div>

        {active && (
          <article className="place-card" onPointerDown={(event) => event.stopPropagation()}>
            <button className="close-card" onClick={() => setActive(null)} aria-label="关闭景点信息">×</button>
            <div className="place-color"><span>{active.region}</span></div>
            <div className="place-info">
              <small>{active.tag} · 精选目的地</small>
              <h2>{active.name}</h2>
              <p>{active.country}</p>
              <strong>{active.note}</strong>
              <button className="detail-button">探索这里 <span>→</span></button>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}
