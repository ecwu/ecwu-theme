(() => {
    const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
    const fmt=(n,d=2)=>n==null?'—':n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
    const lengths={2048:'2K',8192:'8K',32768:'32K',64512:'64K',131072:'128K',261120:'262K'};
    const defs={ttft:{name:'首个文本等待时间 · TTFT',unit:'秒'},decode_tps:{name:'单请求 decode 速度',unit:'tok/s'},output_throughput:{name:'整轮输出吞吐',unit:'tok/s'},end_to_end:{name:'端到端耗时',unit:'秒'},cached_tokens:{name:'命中缓存',unit:'tokens'},ttft_saved:{name:'比首次节省的 TTFT',unit:'秒'},ttft_speedup:{name:'相对首次的 TTFT 加速比',unit:'倍'}};
    const concurrencyStyles=[{concurrency:1,shape:'circle'},{concurrency:2,shape:'rect'},{concurrency:4,shape:'triangle'}];
    const identities=[{key:'qwen27',label:'Qwen3.8-27B',color:'var(--sb-gold)',shape:'circle'},{key:'qwen36',label:'Qwen3.6-35B-A3B',color:'var(--sb-blue)',shape:'diamond'},{key:'flash-next',label:'Qwen3.8-Flash-Next',color:'var(--sb-rust)',shape:'triangle'}];
    function initCache(root,data){
      const $=s=>root.querySelector(s),plot=$('.sb-plot'),canvas=el('canvas');
      canvas.setAttribute('role','img');canvas.setAttribute('aria-label','三个模型的缓存复用气泡图。纵轴为 TTFT，气泡面积代表 decode TPS。完整数值可查阅 CSV / JSON 原始数据。');plot.append(canvas);
      const labels=['首次','重复 1','重复 2'];let chart;const hiddenModels=new Set();
      const rows=identities.map(m=>[1,2,3].map(round=>data.cache.find(r=>r.model===m.key&&r.round===round)));
      function render(){
        const style=getComputedStyle(root),color=v=>style.getPropertyValue(v).trim(),ink=color('--sb-ink'),muted=color('--sb-muted'),grid=color('--sb-line'),bg=color('--sb-bg');
        const baseRadius=Math.max(9,14*Math.min(1,plot.getBoundingClientRect().width/500));
        const radius=tps=>baseRadius*Math.sqrt(tps/100);
        const colors=identities.map(m=>color(m.color.slice(4,-1)));
        const datasets=identities.map((m,i)=>({label:m.label,hidden:hiddenModels.has(m.key),data:rows[i].map((r,j)=>({x:i+1+(j-1)*.28,y:r.ttft,r:radius(r.decode_tps)})),backgroundColor:colors[i]+'22',borderColor:colors[i],borderWidth:2,hoverBorderWidth:3,hitRadius:5}));
        const annotation={id:'cacheRequestOrder',beforeDatasetsDraw(c){const ctx=c.ctx;ctx.save();ctx.lineWidth=1.5;datasets.forEach((d,i)=>{if(!c.isDatasetVisible(i))return;const a=c.getDatasetMeta(i).data;for(let j=0;j<2;j++){const p=a[j],q=a[j+1],dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len,from=d.data[j].r+3,to=d.data[j+1].r+5;if(len<=from+to)continue;const x=q.x-ux*to,y=q.y-uy*to;ctx.strokeStyle=colors[i];ctx.beginPath();ctx.moveTo(p.x+ux*from,p.y+uy*from);ctx.lineTo(x,y);ctx.moveTo(x-ux*6-uy*3,y-uy*6+ux*3);ctx.lineTo(x,y);ctx.lineTo(x-ux*6+uy*3,y-uy*6-ux*3);ctx.stroke();}});ctx.restore();},afterDatasetsDraw(c){const ctx=c.ctx;ctx.save();ctx.fillStyle=ink;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`600 11px ${style.fontFamily}`;datasets.forEach((d,i)=>{if(c.isDatasetVisible(i))c.getDatasetMeta(i).data.forEach((p,j)=>ctx.fillText(String(j+1),p.x,p.y));});ctx.restore();}};
        const config={type:'bubble',data:{datasets},plugins:[annotation],options:{responsive:true,maintainAspectRatio:false,animation:false,interaction:{mode:'nearest',intersect:true},plugins:{legend:{display:true,labels:{color:ink,font:{family:style.fontFamily},usePointStyle:true},onClick(e,item,legend){const c=legend.chart,index=item.datasetIndex,key=identities[index].key,visible=c.isDatasetVisible(index);if(visible)hiddenModels.add(key);else hiddenModels.delete(key);c.setDatasetVisibility(index,!visible);c.update();}},tooltip:{backgroundColor:bg,titleColor:ink,bodyColor:ink,borderColor:grid,borderWidth:1,cornerRadius:3,padding:10,titleFont:{family:style.fontFamily},bodyFont:{family:style.fontFamily},callbacks:{title:items=>items[0]?`${items[0].dataset.label} · ${labels[items[0].dataIndex]}`:'',label:ctx=>{const r=rows[ctx.datasetIndex][ctx.dataIndex];return [`TTFT：${fmt(r.ttft)} 秒`,`decode：${fmt(r.decode_tps)} tok/s`,`命中 ${fmt(r.cached_tokens,0)} / 8192 tokens`,...(ctx.dataIndex?[`比首次节省 ${fmt(r.ttft_saved)} 秒`]:[])];}}}},scales:{x:{type:'linear',min:.45,max:3.55,afterBuildTicks:axis=>{axis.ticks=[1,2,3].map(value=>({value}));},ticks:{color:muted,font:{family:style.fontFamily},autoSkip:false,maxRotation:0,callback:v=>[[],['Qwen3.8','27B'],['Qwen3.6','35B-A3B'],['Qwen3.8','Flash-Next']][v]},grid:{display:false},border:{color:ink}},y:{beginAtZero:true,suggestedMax:4,ticks:{color:muted,font:{family:style.fontFamily}},grid:{color:grid},border:{color:ink},title:{display:true,text:'首个文本等待时间 · TTFT（秒）',color:ink,font:{family:style.fontFamily}}}}}};
        if(chart)chart.destroy();chart=new Chart(canvas,config);
      }
      $('.sb-interactive').hidden=false;$('.sb-loading').hidden=true;render();
      new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
      let width=plot.getBoundingClientRect().width;new ResizeObserver(entries=>{const next=entries[0].contentRect.width;if(Math.abs(next-width)>1){width=next;render();}}).observe(plot);
    }
    function init(root,data){
      if(root.dataset.sparkChart==='B'){initCache(root,data);return;}
      const $=s=>root.querySelector(s),plot=$('.sb-plot');
      const canvas=el('canvas');canvas.setAttribute('role','img');plot.append(canvas);plot.classList.add('sb-dot-plot');let chart;
      const hiddenModels=new Set(),hiddenConcurrencies=new Set();
      function applyVisibility(){
        chart.data.datasets.forEach((dataset,index)=>chart.setDatasetVisibility(index,!hiddenModels.has(dataset.modelKey)&&!hiddenConcurrencies.has(dataset.concurrency)));
        chart.update();
      }
      function legendButton(label,hidden,key){
        const button=el('button',undefined,'sb-legend-item');button.type='button';button.setAttribute('aria-pressed','true');button.setAttribute('aria-label',`显示 ${label}`);
        button.addEventListener('click',()=>{if(hidden.has(key))hidden.delete(key);else hidden.add(key);button.setAttribute('aria-pressed',String(!hidden.has(key)));applyVisibility();});
        return button;
      }
      identities.forEach(m=>{const item=legendButton(m.label,hiddenModels,m.key),swatch=el('span',undefined,'sb-model-swatch');swatch.style.background=m.color;item.append(swatch,el('span',m.label));$('.sb-legend').append(item);});
      concurrencyStyles.forEach(c=>{const item=legendButton(`并发 ${c.concurrency}`,hiddenConcurrencies,c.concurrency),symbol=el('span',undefined,`sb-symbol sb-symbol-${c.shape}`);item.append(symbol,el('span',`并发 ${c.concurrency}`));$('.sb-concurrency-legend').append(item);});
      function render(){
        const k=$('.sb-metric').value,def=defs[k],isLog=$('.sb-scale').value==='log',targets=data.input_lengths;
        const style=getComputedStyle(root),color=v=>style.getPropertyValue(v).trim(),ink=color('--sb-ink'),muted=color('--sb-muted'),grid=color('--sb-line'),bg=color('--sb-bg');
        const speedScales=targets.map(()=>({max:200}));
        const speedY=(i,speed)=>i+.38-.76*speed/speedScales[i].max;
        const series=identities.flatMap(m=>concurrencyStyles.map(c=>({...m,...c,points:targets.flatMap((x,i)=>{const row=data.cells.find(r=>r.model===m.key&&r.concurrency===c.concurrency&&r.input_tokens===x);return row?.status==='completed'?[{x:row.metrics[k].mean,y:speedY(i,row.metrics.decode_tps.mean),row}]:[]})})));
        const datasets=series.map(m=>({label:`${m.label} · 并发 ${m.concurrency}`,modelKey:m.key,concurrency:m.concurrency,hidden:hiddenModels.has(m.key)||hiddenConcurrencies.has(m.concurrency),data:m.points,borderColor:color(m.color.slice(4,-1)),backgroundColor:color(m.color.slice(4,-1)),pointStyle:m.shape,pointRadius:4,pointHoverRadius:6,pointHitRadius:8,showLine:false}));
        const bands={id:'inputLengthBands',beforeDatasetsDraw(c){const {ctx,chartArea,scales}=c;ctx.save();ctx.fillStyle=grid;ctx.globalAlpha=.18;targets.forEach((_,i)=>{if(i%2===0){const top=scales.y.getPixelForValue(i-.46),bottom=scales.y.getPixelForValue(i+.46);ctx.fillRect(chartArea.left,top,chartArea.width,bottom-top);}});ctx.restore();}};
        const connections={id:'concurrencyConnections',beforeDatasetsDraw(c){
          const {ctx,scales}=c;ctx.save();ctx.lineWidth=1.5;ctx.globalAlpha=.65;
          identities.forEach(m=>targets.forEach(input=>{
            const points=concurrencyStyles.map(({concurrency})=>{const index=series.findIndex(v=>v.key===m.key&&v.concurrency===concurrency);return c.isDatasetVisible(index)?series[index].points.find(p=>p.row.input_tokens===input):undefined;});
            ctx.strokeStyle=color(m.color.slice(4,-1));
            for(let i=0;i<points.length-1;i++){
              const a=points[i],b=points[i+1];if(!a||!b)continue;
              ctx.beginPath();ctx.moveTo(scales.x.getPixelForValue(a.x),scales.y.getPixelForValue(a.y));ctx.lineTo(scales.x.getPixelForValue(b.x),scales.y.getPixelForValue(b.y));ctx.stroke();
            }
          }));ctx.restore();
        }};
        const speedAxes={id:'groupSpeedAxes',afterDraw(c){
          const {ctx,chartArea,scales}=c;ctx.save();ctx.strokeStyle=muted;ctx.fillStyle=muted;ctx.lineWidth=1;ctx.font=`11px ${style.fontFamily}`;ctx.textAlign='left';ctx.textBaseline='middle';
          const x=chartArea.right+8;
          targets.forEach((_,i)=>{
            const top=scales.y.getPixelForValue(speedY(i,speedScales[i].max)),bottom=scales.y.getPixelForValue(speedY(i,0));
            ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,bottom);ctx.stroke();
            [0,speedScales[i].max/2,speedScales[i].max].forEach(speed=>{
              const y=scales.y.getPixelForValue(speedY(i,speed));ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+4,y);ctx.stroke();ctx.fillText(fmt(speed,0),x+8,y);
            });
            ctx.fillText('tok/s',x+8,top-15);
          });ctx.restore();
        }};
        if(chart)chart.destroy();
        chart=new Chart(canvas,{type:'scatter',data:{datasets},plugins:[bands,connections,speedAxes],options:{layout:{padding:{right:72,top:20}},responsive:true,maintainAspectRatio:false,animation:false,interaction:{mode:'nearest',intersect:true},plugins:{legend:{display:false},tooltip:{backgroundColor:bg,titleColor:ink,bodyColor:ink,borderColor:grid,borderWidth:1,titleFont:{family:style.fontFamily},bodyFont:{family:style.fontFamily},callbacks:{title:items=>items[0]?.dataset.label||'',label:ctx=>`${lengths[ctx.raw.row.input_tokens]} · ${fmt(ctx.parsed.x)} ${def.unit}`,afterLabel:ctx=>{const r=ctx.raw.row.metrics[k];const speed=ctx.raw.row.metrics.decode_tps;return [`三轮范围 ${fmt(r.min)}–${fmt(r.max)} ${def.unit}`,`decode：${fmt(speed.mean)} tok/s`,`decode 三轮范围 ${fmt(speed.min)}–${fmt(speed.max)} tok/s`];}}}},scales:{x:{type:isLog?'logarithmic':'linear',beginAtZero:!isLog,ticks:{color:muted,font:{family:style.fontFamily}},grid:{color:grid},border:{color:ink},title:{display:true,text:`${def.name}（${def.unit}，${isLog?'对数':'线性'}刻度）`,color:ink,font:{family:style.fontFamily}}},y:{type:'linear',reverse:true,min:-.5,max:targets.length-.5,afterBuildTicks:axis=>{axis.ticks=targets.map((_,value)=>({value}));},ticks:{color:ink,font:{family:style.fontFamily},autoSkip:false,callback:v=>lengths[targets[v]]||''},grid:{display:false},border:{display:false},title:{display:true,text:'输入长度（tokens）',color:ink,font:{family:style.fontFamily}}}}}});
        canvas.setAttribute('aria-label',`${def.name}分组点图。输入长度按组排列，每组纵向表示 decode 生成速度，越高越快，右侧统一为 0–200 tok/s 刻度；颜色区分模型，圆形、方形、三角形分别为并发 1、2、4，同长度同模型的并发点依次连线。完整数据可通过下方 CSV 或 JSON 链接下载。`);
        $('.sb-status').textContent=`每一组是一个输入长度；纵向为单请求 decode 生成速度，越高越快，右侧统一使用 0–200 tok/s 刻度，不同输入长度之间也可直接比较点的高度。同一输入长度、同一模型的并发 1 → 2 → 4 用细线连接。${k==='decode_tps'||k==='output_throughput'?'越靠右速度越快':'越靠左等待越短'}。27B 和 Flash-Next 只测到 64K；35B-A3B 的 262K 只运行了单请求实验。`;
      }
      root.querySelectorAll('select').forEach(n=>n.addEventListener('change',render));
      $('.sb-interactive').hidden=false;$('.sb-loading').hidden=true;render();
      new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
    }
    function load(){const roots=[...document.querySelectorAll('[data-spark-chart]')];if(!roots.length)return;fetch(new URL(roots[0].dataset.chartSource,document.baseURI)).then(r=>{if(!r.ok)throw new Error('Data unavailable');return r.json();}).then(data=>roots.forEach(root=>init(root,data))).catch(()=>roots.forEach(root=>root.querySelector('.sb-loading').textContent='图表暂时无法加载，可下载 CSV / JSON 查看结果。'));}
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
  })();
