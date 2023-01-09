

self.methods = null;


/////////////////////////////
//
// WASM installation variable:
//

self.Module = {
	onRuntimeInitialized: function() {
			methods = new verovioCalls();
			methods.vrvToolkit = new verovio.toolkit();
			console.log(`Verovio (WASM) ${methods.vrvToolkit.getVersion()} loaded`);
			postMessage({method: "ready"});
		// postMessage(["loaded", false, {}]);
	}
};

//
// WASM
//
//////////////////////////////

// Replace with your own scripts hosted on your server/CDN
// importScripts("http://localhost:5000/vite-scaffold/scripts/local/verovio-toolkit-wasm.js");
// importScripts("http://localhost:5000/vite-scaffold/scripts/local/humdrumValidator.js");
// importScripts("http://localhost:5000/vite-scaffold/scripts/local/verovio-calls.js");

importScripts("https://cdn.jsdelivr.net/gh/DimMilios/vite-scaffold/public/scripts/local/verovio-toolkit-wasm.js");
importScripts("https://cdn.jsdelivr.net/gh/DimMilios/vite-scaffold/public/scripts/local/humdrumValidator.js");
importScripts("https://cdn.jsdelivr.net/gh/DimMilios/vite-scaffold/public/scripts/local/verovio-calls.js");


//////////////////////////////
//
// resolve --
//

function resolve(data, result) {
	postMessage({
		method: data.method,
		idx: data.idx,
		result: result,
		success: true
	});
};



//////////////////////////////
//
// reject --
//

function reject(data, result) {
	postMessage({
		method: data.method,
		idx: data.idx,
		result: result,
		success: false
	});
};


//////////////////////////////
//
// message event listener --
//

addEventListener("message", function(oEvent) {
	try {
		resolve(oEvent.data, methods[oEvent.data.method].apply(methods, oEvent.data.args));
	} catch(err) {
		reject(oEvent.data, err);
	};
});


// non-wasm:
// methods = new verovioCalls();
// methods.vrvToolkit = new verovio.toolkit();
// postMessage({method: "ready"});



