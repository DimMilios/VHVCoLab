(function(){"use strict";self.methods=null,self.Module={onRuntimeInitialized:function(){methods=new verovioCalls,methods.vrvToolkit=new verovio.toolkit,console.log(`Verovio (WASM) ${methods.vrvToolkit.getVersion()} loaded`),postMessage({method:"ready"})}},importScripts("/scripts/local/verovio-toolkit-wasm.js"),importScripts("/scripts/local/humdrumValidator.js"),importScripts("/scripts/local/verovio-calls.js");function e(o,s){postMessage({method:o.method,idx:o.idx,result:s,success:!0})}function t(o,s){postMessage({method:o.method,idx:o.idx,result:s,success:!1})}addEventListener("message",function(o){try{e(o.data,methods[o.data.method].apply(methods,o.data.args))}catch(s){t(o.data,s)}})})();
//# sourceMappingURL=verovio-worker-dev.9a914a6b.js.map