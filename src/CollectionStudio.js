import React, {useRef} from "react";
export const collection = {
 warm:{name:"Olive & Ivory",label:"Warm",copy:"Soft olive, warm paper, and a gentle instrumental.",color:"#d6ddce"},
 romantic:{name:"Rose Letter",label:"Romantic",copy:"Dusty rose and a delicate, unhurried melody.",color:"#e1c7c3"},
 sympathy:{name:"Quiet Grace",label:"Sympathy",copy:"Quiet stone tones with a restrained, comforting score.",color:"#d4d8d3"},
 playful:{name:"Golden Hour",label:"Playful",copy:"A touch of gold and a light, bright instrumental.",color:"#e9d6a6"},
 calm:{name:"Still Blue",label:"Calm",copy:"Airy blue and spacious, peaceful notes.",color:"#cddbdd"}
};
export function CollectionPicker({tone,onChange,compact=false}) {
 return <div className={"collection-picker "+(compact?"compact":"")} role="group" aria-label="Card atmosphere">{Object.entries(collection).map(([id,item])=><button key={id} type="button" className={tone===id?"chosen":""} aria-pressed={tone===id} onClick={()=>onChange(id)}><span className="collection-swatch" style={{background:item.color}}><img src={"/collection/"+id+".png"} alt="" loading="lazy" /></span><strong>{item.name}</strong><small>{item.label}</small></button>)}</div>;
}
export default function CollectionStudio({tone,onChange,musicEnabled,setMusicEnabled}) {
 const item=collection[tone]||collection.warm;
 const audioRef=useRef(null),videoRef=useRef(null);
 return <section className="collection-studio" id="examples" aria-label="Explore the new collection"><div className="collection-editorial"><p className="eyebrow muted">THE DMC COLLECTION · 01</p><h2>A softer setting.<br/><em>A more personal feeling.</em></h2><p>Five thoughtfully paired backdrops and instrumental scores. Choose the atmosphere; your familiar face and words stay at the heart of it.</p><CollectionPicker tone={tone} onChange={onChange}/><div className="collection-detail"><span className="collection-number">0{Object.keys(collection).indexOf(tone)+1}</span><div><h3>{item.name}</h3><p>{item.copy}</p></div></div><label className="music-toggle"><input type="checkbox" checked={musicEnabled} onChange={e=>setMusicEnabled(e.target.checked)}/><span>Include background music<small>The voice stays in the foreground.</small></span></label><audio ref={audioRef} onPlay={()=>videoRef.current?.pause()} key={tone} controls preload="none" src={"/collection/"+tone+".mp3"} aria-label={item.name+" instrumental preview"}/><p className="collection-note">Listen to the new instrumental on its own. Playback starts only when you press play.</p><a className="collection-create" href="#create-card">Create with this atmosphere <span>↗</span></a></div><div className="collection-screen"><video ref={videoRef} muted={!musicEnabled} onPlay={()=>audioRef.current?.pause()} key={tone} controls playsInline preload="metadata" poster={"/collection/"+tone+"-poster.jpg"} src={"/collection/"+tone+"-study.mp4"} aria-label={item.name+" layout study"}/><p><span>LAYOUT & MUSIC STUDY</span>Still portrait for design review. Your photo becomes a talking video after payment.</p></div></section>;
}
