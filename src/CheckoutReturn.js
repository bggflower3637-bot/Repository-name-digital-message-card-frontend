import React,{useEffect,useState} from "react";
export default function CheckoutReturn({apiBase,enabled}) {
 const localTest=apiBase.startsWith("http://127.0.0.1:");
 const params=new URLSearchParams(window.location.search);
 const orderId=params.get("order_id")||"";
 const sessionId=params.get("session_id")||"";
 const cancelled=window.location.pathname==="/cancel";
 const [state,setState]=useState(null),[error,setError]=useState(""),[retry,setRetry]=useState(0);
 useEffect(()=>{
  if(!enabled || cancelled || !orderId)return;
  let stopped=false,timer,controller;
  const poll=async()=>{
   controller=new AbortController();
   const timeout=setTimeout(()=>controller.abort(),20000);
   try{
    let token="";try{token=sessionStorage.getItem("dmc:order:"+orderId)||"";}catch{}
    const url=apiBase+"/orders/"+encodeURIComponent(orderId)+(sessionId?"?session_id="+encodeURIComponent(sessionId):"");
    const response=await fetch(url,{headers:token?{Authorization:"Bearer "+token}:{},signal:controller.signal,cache:"no-store"});
    if(!response.ok)throw Error(response.status===404?"This order link could not be verified. Use the link from your checkout confirmation.":"We could not check your order right now. Please try again.");
    const data=await response.json();if(stopped)return;
    setState(data);setError("");
    if(data.status==="completed"){try{sessionStorage.removeItem("dmc:draft");}catch{}}
    if(!["completed","error","interrupted"].includes(data.status))timer=setTimeout(poll,5000);
   }catch(e){if(!stopped)setError(e.name==="AbortError"?"The connection timed out. Your order has not been charged again. Try checking its status again.":e.message);}
   finally{clearTimeout(timeout);}
  };
  poll();return()=>{stopped=true;clearTimeout(timer);controller?.abort();};
 },[apiBase,cancelled,orderId,sessionId,retry,enabled]);
 const failed=state?.needsHelp;
 const title=!enabled?"Order status preview.":cancelled?"Your message is still yours.":failed?"Your order needs our attention.":state?.status==="completed"?(localTest?"Your test video is ready.":"Your video is ready."):state?.paymentStatus==="paid"?"Your message is coming to life.":"Checking your payment.";
 const detail=!enabled?"This design preview does not connect to payment or video services.":cancelled?"You returned from checkout. No new payment has been requested. Your text is saved in this tab; please choose your photo again when you return.":failed?"Please keep your order reference. Do not pay again. We need to review the video processing before continuing.":state?.status==="completed"?(state.emailSent?(localTest?"The test video is ready. A test email was saved locally; nothing was sent to a real inbox.":"Your video is ready to watch, and the email has been sent."):"Your video is ready to watch below. Email delivery is still pending; you do not need to pay again."):"You can leave this page once payment is confirmed. We’ll email your video when it is ready.";
 return <div className="return-page">{localTest && <p className="preview-banner">LOCAL TEST · NO REAL PAYMENT OR EMAIL</p>}<a className="brand-mark" href="/">dmc<span>✦</span></a><div className="return-card"><p className="eyebrow muted">YOUR DIGITAL MESSAGE CARD</p><h1>{title}</h1><p>{detail}</p>
 {!orderId&&!cancelled&&<p role="alert" className="form-error">The order reference is missing. Please return using your checkout confirmation link.</p>}
 {state&&<><p className="order-reference">Order reference: {state.reference}</p>{!failed&&state.status!=="completed"&&<><progress max="100" value={state.progress||0}/><p className="field-hint">{state.paymentStatus==="paid"?"Payment confirmed · Preparing your video":"Waiting for payment confirmation"}</p></>}</>}
 {state?.videoUrl&&<><video controls playsInline preload="metadata" src={new URL(state.videoUrl,apiBase).href} aria-label="Your completed video"/><a className="primary-button" href={new URL(state.videoUrl,apiBase).href} target="_blank" rel="noopener noreferrer">Open your video ↗</a></>}
 {error&&<div role="alert"><p className="form-error">{error}</p><button type="button" className="secondary-button" onClick={()=>setRetry(v=>v+1)}>Check again</button></div>}
 <a href="/" className="return-link">{cancelled?"Return to your message":"Back to DMC"} →</a>
 </div><p className="return-footnote">Payment confirmation and video delivery are separate steps. Please keep your order reference.</p></div>;
}
