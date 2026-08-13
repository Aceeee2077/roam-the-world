"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoEquirectangular, geoGraticule10, geoOrthographic, geoPath, type GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import countries110m from "world-atlas/countries-110m.json";

type Place = { name:string; country:string; region:string; lng:number; lat:number; note:string; tag:string };
type DragState = { x:number; y:number; rotate:[number,number,number]; translate:[number,number] };

const places: Place[] = [
  { name:"长城",country:"中国 · 北京",region:"亚洲",lng:116.57,lat:40.43,note:"穿越群山的古老奇迹",tag:"历史" },
  { name:"富士山",country:"日本 · 山梨",region:"亚洲",lng:138.73,lat:35.36,note:"湖泊与雪峰相映成景",tag:"自然" },
  { name:"圣托里尼",country:"希腊 · 爱琴海",region:"欧洲",lng:25.46,lat:36.39,note:"悬崖上的蓝白岛屿",tag:"海岛" },
  { name:"塞伦盖蒂",country:"坦桑尼亚",region:"非洲",lng:34.83,lat:-2.33,note:"追随旷野上的生命迁徙",tag:"野生动物" },
  { name:"大峡谷",country:"美国 · 亚利桑那",region:"北美洲",lng:-112.11,lat:36.1,note:"被时间雕刻的壮阔峡谷",tag:"自然" },
  { name:"马丘比丘",country:"秘鲁 · 库斯科",region:"南美洲",lng:-72.55,lat:-13.16,note:"云端上的印加遗迹",tag:"遗迹" },
  { name:"悉尼歌剧院",country:"澳大利亚 · 悉尼",region:"大洋洲",lng:151.22,lat:-33.86,note:"海港边的建筑艺术",tag:"城市" },
  { name:"雷克雅未克",country:"冰岛",region:"欧洲",lng:-21.94,lat:64.15,note:"追逐极光与冰川",tag:"极地" },
  { name:"金字塔",country:"埃及 · 吉萨",region:"非洲",lng:31.13,lat:29.98,note:"沙漠中的文明印记",tag:"历史" },
  { name:"埃菲尔铁塔",country:"法国 · 巴黎",region:"欧洲",lng:2.29,lat:48.86,note:"塞纳河畔的浪漫地标",tag:"城市" },
];

const world = feature(
  countries110m as unknown as Parameters<typeof feature>[0],
  (countries110m as unknown as { objects:{ countries:Parameters<typeof feature>[1] } }).objects.countries,
);

export default function Home() {
  const stageRef = useRef<HTMLDivElement|null>(null);
  const dragRef = useRef<DragState|null>(null);
  const [size,setSize] = useState({ width:1440,height:800 });
  const [query,setQuery] = useState("");
  const [active,setActive] = useState<Place|null>(null);
  const [globe,setGlobe] = useState(false);
  const [zoom,setZoom] = useState(1);
  const [rotation,setRotation] = useState<[number,number,number]>([-8,-12,0]);
  const [translation,setTranslation] = useState<[number,number]>([0,0]);
  const [dragging,setDragging] = useState(false);

  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const update = () => setSize({ width:element.clientWidth,height:element.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const projection = useMemo<GeoProjection>(() => {
    const { width,height } = size;
    if (globe) {
      return geoOrthographic()
        .translate([width/2,height/2])
        .scale(Math.min(width,height)*.39*zoom)
        .rotate(rotation)
        .clipAngle(90)
        .precision(.25);
    }
    return geoEquirectangular()
      .translate([width/2+translation[0],height/2+translation[1]])
      .scale(Math.min(width/(2*Math.PI),height/Math.PI)*.98*zoom)
      .precision(.25);
  },[globe,rotation,size,translation,zoom]);

  const path = useMemo(() => geoPath(projection),[projection]);
  const suggestions = useMemo(() => {
    const value=query.trim().toLowerCase();
    return value ? places.filter(p=>`${p.name}${p.country}${p.region}${p.tag}`.toLowerCase().includes(value)) : [];
  },[query]);

  const selectPlace=(place:Place)=>{
    setActive(place); setQuery("");
    if(globe) setRotation([-place.lng,-place.lat,0]);
    else {
      const point=projection([place.lng,place.lat]);
      if(point) setTranslation([translation[0]+size.width/2-point[0],translation[1]+size.height/2-point[1]]);
      setZoom(Math.max(zoom,1.6));
    }
  };
  const beginDrag=(event:React.PointerEvent<HTMLDivElement>)=>{
    if(event.button!==0) return;
    dragRef.current={x:event.clientX,y:event.clientY,rotate:rotation,translate:translation};
    setDragging(true); event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag=(event:React.PointerEvent<HTMLDivElement>)=>{
    const start=dragRef.current; if(!start) return;
    const dx=event.clientX-start.x,dy=event.clientY-start.y;
    if(globe) setRotation([start.rotate[0]+dx*.28,start.rotate[1]-dy*.28,0]);
    else setTranslation([start.translate[0]+dx,start.translate[1]+dy]);
  };
  const endDrag=(event:React.PointerEvent<HTMLDivElement>)=>{
    dragRef.current=null; setDragging(false);
    if(event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const changeZoom=(value:number)=>setZoom(Math.max(.65,Math.min(4,value)));
  const toggleProjection=(next:boolean)=>{ setGlobe(next);setZoom(1);setTranslation([0,0]);setRotation([-8,-12,0]); };

  return <main className="app-shell">
    <header className="topbar">
      <div className="topbar-search">
        <span className="search-icon">⌕</span>
        <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&suggestions[0])selectPlace(suggestions[0]);}} placeholder="搜索城市、国家或景点" aria-label="搜索旅游景点" />
        <span className="shortcut">ENTER</span>
        {suggestions.length>0&&<div className="suggestions">{suggestions.map(place=><button key={place.name} onClick={()=>selectPlace(place)}><span><b>{place.name}</b><small>{place.note}</small></span><em>{place.country}</em></button>)}</div>}
      </div>
      <a className="brand" href="#map"><span className="brand-mark">●</span><strong>漫游地球</strong></a>
      <div className="marquee"><div className="marquee-track"><span>travel around the world</span><i>✦</i><span>travel around the world</span><i>✦</i><span>travel around the world</span><i>✦</i></div></div>
    </header>

    <section id="map" ref={stageRef} className={`map-stage ${globe?"globe-mode":"flat-mode"} ${dragging?"dragging":""}`} onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onWheel={e=>changeZoom(zoom-e.deltaY*.0015)}>
      <svg className="world-svg" width={size.width} height={size.height} viewBox={`0 0 ${size.width} ${size.height}`} aria-label="真实世界轮廓旅游地图">
        <defs><filter id="land-shadow"><feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#386f66" floodOpacity=".2"/></filter></defs>
        {globe&&<path className="globe-ocean" d={path({type:"Sphere"})||""}/>} 
        <path className="graticule" d={path(geoGraticule10())||""}/>
        <path className="countries" d={path(world)||""}/>
        <path className="country-borders" d={path(world)||""}/>
        {places.map(place=>{
          const point=projection([place.lng,place.lat]);
          if(!point) return null;
          const visible=!globe||geoOrthographic().rotate(rotation)([place.lng,place.lat])!==null;
          return visible?<g key={place.name} className="svg-pin" transform={`translate(${point[0]} ${point[1]})`} onPointerDown={e=>e.stopPropagation()} onClick={()=>selectPlace(place)} role="button" aria-label={`${place.name}，${place.country}`}><circle className="pin-halo" r="12"/><circle className="pin-ring" r="8"/><circle className="pin-core" r="4"/><text x="15" y="4">{place.name}</text></g>:null;
        })}
      </svg>

      <div className="map-heading"><span>EXPLORE THE WORLD</span><h1>{globe?"转动地球，去往远方":"拖动地图，发现世界"}</h1><p>{globe?"拖动旋转 · 滚轮缩放":"拖动平移 · 滚轮缩放 · 点击景点"}</p></div>
      <div className="zoom-controls" onPointerDown={e=>e.stopPropagation()}><button onClick={()=>changeZoom(zoom+.25)}>+</button><input type="range" min=".65" max="4" step=".05" value={zoom} onChange={e=>changeZoom(Number(e.target.value))}/><button onClick={()=>changeZoom(zoom-.25)}>−</button></div>
      <div className="mode-switch" onPointerDown={e=>e.stopPropagation()}><button className={!globe?"active":""} onClick={()=>toggleProjection(false)}>2D 地图</button><button className={globe?"active":""} onClick={()=>toggleProjection(true)}>3D 地球</button></div>
      <div className="drag-tip"><span>↔</span>{dragging?"正在探索":"按住拖动地图"}</div>
      {active&&<article className="place-card" onPointerDown={e=>e.stopPropagation()}><button className="close-card" onClick={()=>setActive(null)}>×</button><div className="place-photo"><span>{active.region}</span></div><div className="place-info"><small>{active.tag} · 精选目的地</small><h2>{active.name}</h2><p>{active.country}</p><strong>{active.note}</strong><button className="detail-button">探索这里 <span>→</span></button></div></article>}
    </section>
  </main>;
}
