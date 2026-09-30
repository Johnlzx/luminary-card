function e(e,{placement:n=`bottom`,variant:r=`edge`}={}){let i=matchMedia(`(prefers-reduced-motion: reduce)`),a=matchMedia(`(pointer: coarse)`),o=new AbortController,s={signal:o.signal},c=null,l=null,u=null,d=null,f=null,p=null,m=0,h=0,g,_=!1,v=!1,y=!1,b=!1,x=!1,S=1,C=0,w=0,T=0;function E(){let t=a.matches?1.5:2;S=Math.min(window.devicePixelRatio||1,t),C=Math.max(1,Math.round(e.clientWidth*S)),w=Math.max(1,Math.round(e.clientHeight*S)),T=Math.min(480,Math.max(240,window.innerHeight*.45))*S}function D(){cancelAnimationFrame(m),m=0,g=void 0}function O(){c?.deleteBuffer(u),c?.deleteProgram(l),u=null,l=null,x=!1,e.removeAttribute(`data-ready`)}function k(){D(),y=!0,O()}function A(){if(c??=e.getContext(`webgl`,{alpha:!1,antialias:!1,depth:!1,stencil:!1}),!c)throw Error(`WebGL unavailable`);if(l=c.createProgram(),!l)throw Error(`Aurora program unavailable`);for(let[e,n]of[[`
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`,c.VERTEX_SHADER],[t,c.FRAGMENT_SHADER]]){let t=c.createShader(n);if(!t)throw Error(`Aurora shader unavailable`);try{if(c.shaderSource(t,e),c.compileShader(t),!c.getShaderParameter(t,c.COMPILE_STATUS))throw Error(`Aurora shader compilation failed`);c.attachShader(l,t)}finally{c.deleteShader(t)}}if(c.linkProgram(l),!c.getProgramParameter(l,c.LINK_STATUS))throw Error(`Aurora shader linking failed`);if(c.useProgram(l),u=c.createBuffer(),!u)throw Error(`Aurora buffer unavailable`);c.bindBuffer(c.ARRAY_BUFFER,u),c.bufferData(c.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),c.STATIC_DRAW);let i=c.getAttribLocation(l,`position`);c.enableVertexAttribArray(i),c.vertexAttribPointer(i,2,c.FLOAT,!1,0,0),d=c.getUniformLocation(l,`resolution`),p=c.getUniformLocation(l,`time`),f=c.getUniformLocation(l,`fadeDistance`),c.uniform1i(c.getUniformLocation(l,`attachToTop`),+(n===`top`)),c.uniform1i(c.getUniformLocation(l,`fillOverlap`),+(r===`overlap`));for(let[e,t]of Object.entries({auroraScale:r===`overlap`?4.8:2.2,grainStrength:r===`overlap`?.023529411764705882:.025,overlapCenterX:r===`overlap`?.075:0,rayOpacity:.34,rayOriginInset:0,rayBaseWidthScale:1,rayUpperStrength:1}))c.uniform1f(c.getUniformLocation(l,e),t);c.uniform1i(c.getUniformLocation(l,`mixRays`),0),c.uniform3fv(c.getUniformLocation(l,`rayColorTip`),[.48,.64,1]),c.uniform3fv(c.getUniformLocation(l,`rayColorEdge`),[.85,.97,1]),c.uniform1f(c.getUniformLocation(l,`grainFrame`),0),c.uniform3f(c.getUniformLocation(l,`backgroundColor`),17/255,17/255,17/255);for(let[e,t]of Object.entries({blobColorBlue:[25,30,255],blobColorRed:[235,0,215],blobColorGold:[250,178,241],blobColorMint:[0,239,234],blobColorCyan:[0,182,255],blobColorCream:[255,255,255]}))c.uniform3fv(c.getUniformLocation(l,e),t.map(e=>e/255))}function j(t){if(m=0,b||y||!v||document.hidden||!l||!c){D();return}if(c.isContextLost()){k();return}try{if(!i.matches&&g!==void 0&&(h+=Math.min(Math.max((t-g)/1e3,0),.05)),g=i.matches?void 0:t,(e.width!==C||e.height!==w)&&(e.width=C,e.height=w),c.viewport(0,0,C,w),c.uniform2f(d,C,w),c.uniform1f(f,T),c.uniform1f(p,h*12),c.drawArrays(c.TRIANGLES,0,3),!x){if(c.isContextLost()||c.getError()!==c.NO_ERROR)throw Error(`Aurora first render failed`);x=!0,e.setAttribute(`data-ready`,``)}i.matches||(m=requestAnimationFrame(j))}catch{k()}}function M(){if(!b&&(E(),(document.hidden||!v||i.matches)&&D(),!(y||document.hidden))){if(!l&&_)try{A()}catch{k();return}v&&l&&!m&&(m=requestAnimationFrame(j))}}let N=new IntersectionObserver(([e])=>{e&&(_=e.isIntersecting,M())},{rootMargin:`300px`}),P=new IntersectionObserver(([e])=>{e&&(v=e.isIntersecting&&e.intersectionRect.width>0&&e.intersectionRect.height>0,M())}),F=new ResizeObserver(M);return N.observe(e),P.observe(e),F.observe(e),window.addEventListener(`resize`,M,s),window.addEventListener(`pageshow`,M,s),window.addEventListener(`pagehide`,D,s),document.addEventListener(`visibilitychange`,M,s),i.addEventListener(`change`,M,s),e.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),k()},s),e.addEventListener(`webglcontextrestored`,()=>{y=!1,M()},s),()=>{b=!0,D(),N.disconnect(),P.disconnect(),F.disconnect(),o.abort(),O()}}var t=`
  precision highp float;
  uniform vec2 resolution;
  uniform float time;
  uniform float grainFrame;
  uniform bool attachToTop;
  uniform bool fillOverlap;
  uniform vec3 backgroundColor;
  uniform float auroraScale;
  uniform float grainStrength;
  uniform float overlapCenterX;
  uniform float fadeDistance;
  uniform vec3 blobColorBlue;
  uniform vec3 blobColorRed;
  uniform vec3 blobColorGold;
  uniform vec3 blobColorMint;
  uniform vec3 blobColorCyan;
  uniform vec3 blobColorCream;

  uniform float rayOpacity;
  uniform float rayOriginInset;
  uniform float rayBaseWidthScale;
  uniform float rayUpperStrength;
  uniform bool mixRays;
  uniform vec3 rayColorTip;
  uniform vec3 rayColorEdge;
  const float blobAnimationSpeed = 1.6;
  const float rayAnimationSpeed = 1.1;
  const vec4 blobGeometryBlue = vec4(-0.006, 0.047, 0.389, 0.155);
  const vec4 blobGeometryRed = vec4(-0.134, -0.01, 0.255, 0.093);
  const vec4 blobGeometryGold = vec4(-0.086, -0.018, 0.14, 0.065);
  const vec4 blobGeometryMint = vec4(0.079, -0.006, 0.219, 0.107);
  const vec4 blobGeometryCyan = vec4(0.165, -0.023, 0.197, 0.081);
  const vec4 blobGeometryCream = vec4(0.0, -0.008, 0.193, 0.036);

  void addBlob(inout vec3 blobs, inout float coverage,
               vec2 p, vec2 center, vec2 radius,
               vec3 tint, float strength, vec2 drift, float phase) {
    float driftTime = (time * blobAnimationSpeed) * 0.035;
    center += drift * vec2(
      sin(driftTime + phase) - sin(phase),
      sin(driftTime * 0.7 + phase) - sin(phase)
    );
    radius *= 1.0 + 0.075 * sin(driftTime * 0.8) * cos(phase);
    vec2 q = (p - center) / radius;
    float alpha = clamp(strength * exp(-dot(q, q) * 2.0), 0.0, 1.0);
    blobs = mix(blobs, tint, alpha);
    coverage += (1.0 - coverage) * alpha;
  }

  void addRay(inout float rays, vec2 p, float root, float width,
              float height, float strength, float speed, float phase) {
    float rayTime = time * rayAnimationSpeed;
    height *= 1.0 + 0.22 * sin(rayTime * speed + phase);
    // Soften the visible base, then measure height from the inset origin.
    float baseWidthScale = mix(rayBaseWidthScale, 1.0,
                               smoothstep(0.0, 0.35, p.y / height));
    // Boost only above the softened base, using distance from the visible edge.
    float upperStrength = mix(1.0, rayUpperStrength,
                              smoothstep(0.35, 0.65, p.y / height));
    p.y += height * rayOriginInset;
    float axis = root * (1.0 + p.y * 0.85);
    float distanceToAxis = (p.x - axis) / (width * 1.5 * baseWidthScale);
    if (p.y >= height || abs(distanceToAxis) > 3.0) return;
    float beam = exp(-distanceToAxis * distanceToAxis);
    float fade = pow(max(0.0, 1.0 - p.y / height), 1.7);
    // Reduce overlapping light at the roots without dimming the upper spikes.
    float rootBrightness = mix(0.25, 1.0, smoothstep(0.0, 0.2, p.y / height));
    float opacityVariation = 0.60 + 0.40 * sin(rayTime * speed * 0.43 + phase * 1.7);
    rays += beam * fade * rootBrightness * strength * opacityVariation * upperStrength;
  }

  vec3 composeLayers(vec2 p, vec3 blobs, float rays) {
    vec3 rayColor = mix(rayColorTip, rayColorEdge, exp(-p.y * 30.0));
    if (mixRays) {
      return mix(blobs, rayColor, clamp(rays * rayOpacity, 0.0, 1.0));
    }
    vec3 rayLight = rayColor * rays * rayOpacity;
    return blobs + rayLight;
  }

  void main() {
    float coordinateScale = min(resolution.x, resolution.y * 2.88) * auroraScale;
    float distanceFromEdge = gl_FragCoord.y;

    if (attachToTop) {
      distanceFromEdge = resolution.y - gl_FragCoord.y;
    }
    // Center the same light field inside the small Venn intersection.
    // The signup placements continue to rise from their selected edge.
    if (fillOverlap) {
      distanceFromEdge = (gl_FragCoord.y - resolution.y * 0.35) * 0.35;
    }

    vec2 p = vec2(gl_FragCoord.x - resolution.x * 0.49,
                  distanceFromEdge * 1.65) / coordinateScale;
    /* Zooming about the field's own centre lands on the mint/cyan blobs and
       drops the warm half out of frame. Slide the crop toward gold and red so
       the magnified slice still reads as the same aurora. */
    p.x -= overlapCenterX;
    vec3 blobs = backgroundColor;
    float blobCoverage = 0.0;

    addBlob(blobs, blobCoverage, p, blobGeometryBlue.xy, blobGeometryBlue.zw,
            blobColorBlue, 0.56, vec2(0.025, 0.005), -0.528);
    addBlob(blobs, blobCoverage, p, blobGeometryRed.xy, blobGeometryRed.zw,
            blobColorRed, 0.68, vec2(0.025, 0.005), -3.912);
    addBlob(blobs, blobCoverage, p, blobGeometryGold.xy, blobGeometryGold.zw,
            blobColorGold, 0.80, vec2(0.025, 0.005), -1.992);
    addBlob(blobs, blobCoverage, p, blobGeometryMint.xy, blobGeometryMint.zw,
            blobColorMint, 0.76, vec2(0.025, 0.005), 0.840);
    addBlob(blobs, blobCoverage, p, blobGeometryCyan.xy, blobGeometryCyan.zw,
            blobColorCyan, 0.68, vec2(0.025, 0.005), 3.912);
    addBlob(blobs, blobCoverage, p, blobGeometryCream.xy, blobGeometryCream.zw,
            blobColorCream, 0.82, vec2(0.025, 0.005), -0.480);

    float rays = 0.0;
    addRay(rays, p, -0.310, 0.005, 0.055, 0.48, 0.19, 0.7);
    addRay(rays, p, -0.277, 0.009, 0.078, 0.70, 0.27, 4.1);
    addRay(rays, p, -0.249, 0.006, 0.066, 0.55, 0.16, 2.3);
    addRay(rays, p, -0.214, 0.011, 0.104, 0.85, 0.23, 5.5);
    addRay(rays, p, -0.184, 0.008, 0.128, 0.62, 0.29, 1.4);
    addRay(rays, p, -0.152, 0.013, 0.113, 0.95, 0.18, 3.8);
    addRay(rays, p, -0.119, 0.009, 0.176, 0.76, 0.25, 0.2);
    addRay(rays, p, -0.082, 0.016, 0.213, 1.10, 0.15, 4.7);
    addRay(rays, p, -0.045, 0.013, 0.188, 0.90, 0.22, 2.8);
    addRay(rays, p, -0.010, 0.019, 0.263, 1.15, 0.17, 5.9);
    addRay(rays, p,  0.027, 0.017, 0.244, 1.05, 0.26, 1.0);
    addRay(rays, p,  0.063, 0.011, 0.192, 0.80, 0.20, 3.3);
    addRay(rays, p,  0.096, 0.015, 0.218, 1.00, 0.14, 5.1);
    addRay(rays, p,  0.131, 0.009, 0.153, 0.66, 0.28, 0.5);
    addRay(rays, p,  0.164, 0.012, 0.132, 0.88, 0.21, 4.4);
    addRay(rays, p,  0.193, 0.007, 0.112, 0.58, 0.16, 2.0);
    addRay(rays, p,  0.225, 0.010, 0.093, 0.78, 0.24, 5.7);
    addRay(rays, p,  0.258, 0.006, 0.076, 0.52, 0.30, 1.7);
    addRay(rays, p,  0.286, 0.008, 0.069, 0.64, 0.18, 3.6);
    addRay(rays, p,  0.316, 0.005, 0.048, 0.42, 0.23, 0.9);

    vec3 color = composeLayers(p, blobs, rays);
    float falloff = fillOverlap ? 1.0 : 1.0 - smoothstep(0.0, fadeDistance, distanceFromEdge);
    color = mix(backgroundColor, color, falloff);

    float grainSeed = dot(gl_FragCoord.xy, vec2(12.9898, 78.233));
    float grain = fract(sin(grainSeed + grainFrame * 37.719) * 43758.5453);
    // Dither after fading: at least one output level of noise breaks up 8-bit
    // bands in the dark tail, while retaining the original grain near the edge.
    color += (grain - 0.5) * max(grainStrength * blobCoverage * falloff, 1.0 / 255.0);

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;export{e as t};