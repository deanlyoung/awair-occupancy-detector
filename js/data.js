// file:///Users/home/Documents/awair-occupancy-detector/index.html?menDevType=awair-glow&menDevId=142&womenDevType=awair-glow&womenDevId=1405&orgToken=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwidXNlcl9pZCI6MH0.04eu6w12ZfTX9hUXGEvVd5fRdXgFToOnR1FdPqStNAI&desc=true&limit=1&refreshTime=10&occupancyDelay=60&menFromTime=2017-10-19T19:51:29.000Z&womenFromTime=2017-10-19T19:51:01.000Z&menOccupied=true&womenOccupied=true

function getParameterByName(name) {
	var url = window.location.search;
	var hash = location.hash;
	url = url.replace(hash, '');
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

//setInterval(getParameterByName, 1000);

var womenDevType = getParameterByName('womenDevType');
sessionStorage.womenDevType = womenDevType;
var womenDevId = getParameterByName('womenDevId');
sessionStorage.womenDevId = womenDevId;
var womenFromTime = getParameterByName('womenFromTime');
sessionStorage.womenFromTime = womenFromTime;

var menDevType = getParameterByName('menDevType');
sessionStorage.menDevType = menDevType;
var menDevId = getParameterByName('menDevId');
sessionStorage.menDevId = menDevId;
var menFromTime = getParameterByName('menFromTime');
sessionStorage.menFromTime = menFromTime;

function occupancy() {
	if (sessionStorage.womenOccupied == undefined) {
		sessionStorage.womenOccupied = false;
	} else if (sessionStorage.menOccupied == undefined) {
		sessionStorage.menOccupied = false;
	}
	
	var womenClasses = document.getElementById("women-symbol");
	womenOccupied = sessionStorage.womenOccupied;
	console.log('"womenOccupied": ' + womenOccupied);
	if (womenOccupied === 'true') {
		if (womenClasses.classList.contains("occupied")) {
			// skipping
			console.log('women occupied class name exists; skipping');
		} else {
			console.log('adding occupied class name to women');
			womenClasses.classList.add("occupied");
		}
	} else {
		if (womenClasses.classList.contains("occupied")) {
			console.log('removing occupied class name from women');
			womenClasses.classList.remove("occupied");
		} else {
			// skipping
			console.log('no women occupied class name; skipping');
		}
	}
	
	var menClasses = document.getElementById("men-symbol");
	menOccupied = sessionStorage.menOccupied;
	console.log('"menOccupied": ' + menOccupied);
	if (menOccupied === 'true') {
		if (menClasses.classList.contains("occupied")) {
			// skipping
			console.log('men occupied class name exists; skipping');
		} else {
			console.log('adding occupied class name to men');
			menClasses.classList.add("occupied");
		}
	} else {
		if (menClasses.classList.contains("occupied")) {
			console.log('removing occupied class name from men');
			menClasses.classList.remove("occupied");
		} else {
			// skipping
			console.log('no men occupied class name; skipping');
		}
	}
	
	console.log('"womenOccupied": ' + womenOccupied + ' (' + womenClasses.classList + '), "menOccupied": ' + menOccupied + ' (' + menClasses.classList + ')');
}

setInterval(occupancy, 1000);

var orgToken = getParameterByName('orgToken');
sessionStorage.orgToken = orgToken;
var limit = getParameterByName('limit');
sessionStorage.limit = limit;
var refreshTime = getParameterByName('refreshTime');
sessionStorage.refreshTime = refreshTime;
var occupancyDelay = getParameterByName('occupancyDelay');
sessionStorage.occupancyDelay = occupancyDelay;
occupancyDelay = sessionStorage.occupancyDelay;

var submitted = getParameterByName('submit-button');
sessionStorage.submitted = submitted;


if (submitted != undefined && submitted != null && submitted != true) {
	var fromTime = new Date();
	fromTime = fromTime.toISOString();
	sessionStorage.menFromTime = fromTime;
	sessionStorage.womenFromTime = fromTime;
	console.log('new menFromTime value: ' + menFromTime + ' new womenFromTime value: ' + womenFromTime);
	
	sessionStorage.womenOccupied = false;
	sessionStorage.menOccupied = false;
	
	window.location = 'index.html?menDevType=' + menDevType + '&menDevId=' + menDevId + '&womenDevType=' + womenDevType + '&womenDevId=' + womenDevId + '&orgToken=' + orgToken + '&desc=true' + '&limit=' + limit + '&refreshTime=' + refreshTime + '&occupancyDelay=' + occupancyDelay + '&menFromTime=' + menFromTime + '&womenFromTime=' + womenFromTime;
	sessionStorage.submitted = true;
}

refreshTime = Number(sessionStorage.refreshTime);

if (refreshTime != null && refreshTime != undefined) {
	refreshTime = refreshTime * 1000;
} else {
	refreshTime = 1000;
}

var count = 1;
sessionStorage.count = count;

function getCurrentTime() {
	occupancy();
	// every 'refreshTime' seconds
	if (count % (refreshTime / 1000) == 0) {
		getWomenOccupancy();
		getMenOccupancy();
	}
	count = sessionStorage.count;
	var counter = (count  % (refreshTime / 1000));
	console.log('count: ' + counter);
	sessionStorage.counter = counter;
	sessionStorage.count = Number(sessionStorage.count) + 1;
}

setInterval(getCurrentTime, 1000);

function getWomenOccupancy() {
	occupancy();
	console.log('checking women motion data');
	womenFromTime = sessionStorage.womenFromTime;
	console.log('getWomenOccupancy womenFromTime: ' + womenFromTime);
	womenDevType = sessionStorage.womenDevType;
	womenDevId = sessionStorage.womenDevId;
	limit = sessionStorage.limit;
	$.ajax({
		url: 'https://awair-occupancy.herokuapp.com/?callback=womenCallback&url=http://elb-prd-awair-msg-strg-service-955455319.us-west-2.elb.amazonaws.com/v2/devices/' + womenDevType + '/' + womenDevId + '/events/motion?desc=true&limit=' + limit + '&from=' + womenFromTime,
		type: 'GET',
		dataType: 'jsonp',
		success: function womenRequestSuccess(data) {
			console.log('women callback success!');
			console.log('women data: ' + data.data[0]);
			womenCallback(data);
		},
		error: function womenRequestError(a, b, c) {
			console.log(arguments);
		}
	});
	console.log('women waiting...');
}

function getMenOccupancy() {
	occupancy();
	console.log('checking men motion data');
	menFromTime = sessionStorage.menFromTime;
	console.log('getMenOccupancy menFromTime: ' + menFromTime);
	menDevType = sessionStorage.menDevType;
	menDevId = sessionStorage.menDevId;
	limit = sessionStorage.limit;
	$.ajax({
		url: 'https://awair-occupancy.herokuapp.com/?callback=menCallback&url=http://elb-prd-awair-msg-strg-service-955455319.us-west-2.elb.amazonaws.com/v2/devices/' + menDevType + '/' + menDevId + '/events/motion?desc=true&limit=' + limit + '&from=' + menFromTime,
		type: 'GET',
		dataType: 'jsonp',
		success: function menRequestSuccess(data) {
			console.log('men callback success!');
			console.log('men data: ' + data.data[0]);
			menCallback(data);
		},
		error: function menRequestError(a, b, c) {
			console.log(arguments);
		}
	});
	console.log('men waiting...');
}

function womenCallback(data) {
	var womenCurrentTime = new Date();
	womenCurrentTime = Date.parse(womenCurrentTime); // in msec
	console.log('womenCurrentTime: ' + womenCurrentTime);
	
	womenFromTime = sessionStorage.womenFromTime;
	womenFromTime = Date.parse(womenFromTime); // in msec
	console.log('womenFromTime: ' + womenFromTime);
	
	var womenLastTime = data.data[0].timestamp;
	womenLastTime = Date.parse(womenLastTime); // in msec;
	sessionStorage.womenLastTime = womenLastTime;
	console.log('womenLastTime: ' + womenLastTime);
	
	var womenTimeDiff = Math.floor((womenCurrentTime - womenLastTime) / 1000); // in seconds
	sessionStorage.womenTimeDiff = womenTimeDiff;
	console.log('womenTimeDiff: ' + womenTimeDiff);
	
	var womenTimeLeft = Math.floor(occupancyDelay - womenTimeDiff); // in seconds
	if (womenTimeLeft < 0) {
		womenTimeLeft = 0
	}
	sessionStorage.womenTimeLeft = womenTimeLeft;
	console.log('womenTimeLeft: ' + womenTimeLeft);
	
	womenOccupied = sessionStorage.womenOccupied;
	
	// check against occupancyDelay threshold
	if (womenTimeDiff <= occupancyDelay) {
		// woman could still be in there, check against occupancyDelay
		console.log('hold it cowgirl... still occupied ' + womenTimeDiff + ' <= ' + occupancyDelay);
		// check to see if "womenOccupied" is true
		if (womenOccupied === 'true') {
			// "womenOccupied" correct
			console.log('"womenOccupied" true; "womenOccupied" correct');
			console.log(womenTimeLeft + ' seconds left for women')
			// checking again
			console.log('checking women again');
			getWomenOccupancy();
		} else {
			// "womenOccupied" wrong; update to true
			sessionStorage.womenOccupied = 'true';
			womenOccupied = sessionStorage.womenOccupied;
			console.log('"womenOccupied" false; updating womenOccupied to ' + womenOccupied);
			// checking again
			console.log('checking women again');
			getWomenOccupancy();
		}
	} else {
		// it's been too long, woman has probably left
		console.log('women timeDiff: ' + womenTimeDiff + ' > ' + occupancyDelay + '?');
		// update last occupied time
		womenCurrentTime = new Date(womenCurrentTime).toISOString(); // in ISO 8601 format
		// check to see if "womenOccupied" is true
		if (womenOccupied === 'true') {
			// "womenOccupied" wrong; update to false
			sessionStorage.womenOccupied = 'false';
			womenOccupied = sessionStorage.womenOccupied;
			console.log('"womenOccupied" true; updating to ' + womenOccupied + '; updating womenFromTime to womenCurrentTime');
		} else {
			// "womenOccupied" correct
			console.log('"womenOccupied" false; "womenOccupied" correct; updating womenFromTime to womenCurrentTime');
		}
		
		// update "womenFromTime" to "womenCurrentTime"
		sessionStorage.womenFromTime = womenCurrentTime;
		console.log('new womenFromTime value: ' + womenCurrentTime);
	}
}

function menCallback(data) {
	var menCurrentTime = new Date();
	menCurrentTime = Date.parse(menCurrentTime); // in msec
	console.log('menCurrentTime: ' + menCurrentTime);
	
	menFromTime = sessionStorage.menFromTime;
	menFromTime = Date.parse(menFromTime); // in msec
	console.log('menFromTime: ' + menFromTime);
	
	var menLastTime = data.data[0].timestamp;
	menLastTime = Date.parse(menLastTime); // in msec;
	sessionStorage.menLastTime = menLastTime;
	console.log('menLastTime: ' + menLastTime);
	
	var menTimeDiff = Math.floor((menCurrentTime - menLastTime) / 1000); // in seconds
	sessionStorage.menTimeDiff = menTimeDiff;
	console.log('menTimeDiff: ' + menTimeDiff);
	
	var menTimeLeft = Math.floor(occupancyDelay - menTimeDiff); // in seconds
	if (menTimeLeft < 0) {
		menTimeLeft = 0
	}
	sessionStorage.menTimeLeft = menTimeLeft;
	console.log('menTimeLeft: ' + menTimeLeft);
	
	menOccupied = sessionStorage.menOccupied;
	
	// check against occupancyDelay threshold
	if (menTimeDiff <= occupancyDelay) {
		// man could still be in there, check against occupancyDelay
		console.log('hold it cowboy... still occupied ' + menTimeDiff + ' <= ' + occupancyDelay);
		// check to see if "menOccupied" is true
		if (menOccupied === 'true') {
			// "menOccupied" correct;
			console.log('"menOccupied" true; "menOccupied" correct');
			console.log(menTimeLeft + ' seconds left for men')
			// checking again
			console.log('checking men again');
			getMenOccupancy();
		} else {
			// "menOccupied" wrong; update to true
			sessionStorage.menOccupied = 'true';
			menOccupied = sessionStorage.menOccupied;
			console.log('"menOccupied" false; updating "menOccupied" to ' + menOccupied);
			// checking again
			console.log('checking men again');
			getMenOccupancy();
		}
	} else {
		// it's been too long, man has probably left
		console.log('men timeDiff: ' + menTimeDiff + ' > ' + occupancyDelay + '?');
		// update last occupied time
		menCurrentTime = new Date(menCurrentTime).toISOString(); // in ISO 8601 format
		// check to see if "menOccupied" is true
		if (menOccupied === 'true') {
			// "menOccupied" wrong; update to false
			sessionStorage.menOccupied = 'false';
			menOccupied = sessionStorage.menOccupied;
			console.log('"menOccupied" true; updating to ' + menOccupied +'; updating menFromTime to menCurrentTime');
		} else {
			// "menOccupied" correct
			console.log('"menOccupied" false; "menOccupied" correct; updating menFromTime to menCurrentTime');
		}
		
		// update "menFromTime" to "menCurrentTime"
		sessionStorage.menFromTime = menCurrentTime;
		console.log('new menFromTime value: ' + menCurrentTime);
	}
}