

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



importScripts("/scripts/local/verovio-toolkit-wasm.js");
importScripts("/scripts/local/humdrumValidator.js");
importScripts("/scripts/local/verovio-calls.js");


// force local:
//importScripts("/scripts/verovio-toolkit.js");
//importScripts("/scripts/humdrumValidator.js");
//importScripts("/scripts/verovio-calls.js");


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
		console.log(oEvent.data)
		resolve(oEvent.data, methods[oEvent.data.method].apply(methods, oEvent.data.args));
	} catch(err) {
		reject(oEvent.data, err);
	};
});


// non-wasm:
// methods = new verovioCalls();
// methods.vrvToolkit = new verovio.toolkit();
// postMessage({method: "ready"});



