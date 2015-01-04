var sections = [];
var splitSections;
var singleSection;
var watch; // Timer
var count = 0;
var isRunning = false;
var attemptCounter = 1;
var tempTime1, tempTime2, secondsTime1, secondsTime2
var milliseconds;
var totalSavings = 0
var convert;

$(function() {
	$("#changeTitle").submit(function(event) {
		event.preventDefault();
		$("h1 span").html($("#gameTitle").val());
	    $(document).attr('title', $("#gameTitle").val()); 
	});
	
	// Adds new section
	$("#newSection").click(function() {
		newSection();
	});
		
	// Something Else
	$("#splitSection").click(function() {
		splitSection();
	});
	
	$("#saveTime").click(function() {
		saveRun();
	});
	
	// Starts Timer
	$("#startTimer").click(function(){
		startTimer();
		$(this).blur();
		$(this).off('click');		
	});
	
	// Resets timer and Pause/Play
	$("#resetTimer").click(function() {
		reset();
	});
	
	// Play -> Pause & Play -> Pause
	$("#playPause").click(function() {
		playPause();
	});
	
	//Keypress Shortcuts
	$(document).keyup(function(event) {
		var tag = event.target.tagName.toLowerCase();
		if(event.keyCode == 32 && isRunning == true && tag != 'input') {
			splitSection();
		}
		
		if(event.keyCode == 83 && isRunning == false && tag != 'input') {
			startTimer();
			$("#startTimer").off('click');
		}
		
		if(event.keyCode == 82 && tag != 'input') {
			reset();
		}
		
		if(event.keyCode == 80 && tag != 'input') {
			playPause();
		}
		
		if(event.keyCode == 86 && isRunning == false && tag != 'input') {
			saveRun();
		}
		
		if(event.keyCode == 78 && isRunning == false && tag != 'input') {
			newSection();
		}
	});
	
	for(var i = 0, len = localStorage.length; i < len; ++i ) {
		$("#savedRuns").append('<option value="' + localStorage.key(i) + '">' + localStorage.key(i) + '</option>');
  	}
  	
  	$("#savedRuns").change(function() {
  		$(this).blur();
		if($(this).val()) {
			$("h1 span").html($(this).val());
			$("#gameTitle").val($(this).val());
			$(document).attr('title', $("#gameTitle").val());	
			
			sections = JSON.parse(localStorage.getItem($(this).val()));
			$("#gameSections").empty();
			for(var i = 0; i < sections.length; i++) {
				$("#gameSections").append('<li><input type="text" class="sectionInputTitle" value="' + sections[i][0] + '" /><input type="text" class="sectionInputTime" value="' + sections[i][1] + '" /></li>');
			}
		} else {
			$("#gameSections").empty();
			$("#gameSections").append('<li><input type="text" class="sectionInputTitle" placeholder="Enter Milestone" /><input type="text" class="sectionInputTime" placeholder="hh:mm:ss" /></li>');
			sections = [];
			$("h1 span").html("Enter New Title");
			$("#gameTitle").val("");
		}
  	});
});

function newSection() {
	$("#gameSections").append('<li><input type="text" class="sectionInputTitle" placeholder="Enter Milestone" /><input type="text" class="sectionInputTime" placeholder="hh:mm:ss" /></li>');
}

function playPause() {
	if($("#playPause").html() === "Pause" && isRunning == true) {
		watch.stop();
		isRunning = false;
		$("#playPause").html("Play");
	} else if($("#playPause").html() === "Play" && isRunning == false) {
		watch.start();
		isRunning = true;
		$("#playPause").html("Pause");
	}
}

function reset() {
	if(isRunning == true) {
		$("#startTimer").on('click', function() {
			startTimer();
		});
	}
	
	isRunning = false;
	attemptCounter++;
	$("#attempts").html(attemptCounter);
	$("#timer").html("00:00:00");
	$("#playPause").html("Pause");
	$("#savedTime").html("Total Savings: 0");
	watch.stop();
	watch.reset();
	count = 0;
	totalSavings = 0;
	
	$("#splitSection").html("Split");
	splitSections = $("#gameSections").children();
	for(var i=1; i<=splitSections.length; i++) {
		singleSection = $("#gameSections li:nth-child(" + i + ") span").remove();
	}
}


// Split Section
function splitSection() {
	if(count < sections.length) {
		if(sections[count][1] == "") {
			singleSection = $("#gameSections li:nth-child(" + (count + 1) + ")");
			tempTime2 = watch.toString();
			secondsTime2 = tempTime2.split(':');
			secondsTime2 = (+secondsTime2[0]) * 60 * 60 + (+secondsTime2[1]) * 60 + (+secondsTime2[2]);
			singleSection[0].childNodes[1].value = watch.toString();
			sections[count][1] = watch.toString();
		} else {
			singleSection = $("#gameSections li:nth-child(" + (count + 1) + ")");
			tempTime2 = watch.toString();
			milliseconds = watch.getElapsed().milliseconds;
			secondsTime2 = tempTime2.split(':');
			secondsTime2 = (+secondsTime2[0]) * 60 * 60 + (+secondsTime2[1]) * 60 + (+secondsTime2[2]);
			tempTime1 = sections[count][1];
			secondsTime1 = tempTime1.split(':');
			secondsTime1 = (+secondsTime1[0]) * 60 * 60 + (+secondsTime1[1]) * 60 + (+secondsTime1[2]);
			if(secondsTime2 < secondsTime1) {
				convert = (secondsTime1 - secondsTime2).toString() + "." + milliseconds;
				totalSavings -= parseFloat(convert);
				singleSection.append("<span class=\"under\">- " + (secondsTime1 - secondsTime2) + "." + milliseconds.toString().substr(0, 1) + "</span>");
				sections[count][1] =  secondsTime2.toString().toHHMMSS();
			} else if(secondsTime2 > secondsTime1) {
				convert = (secondsTime2 - secondsTime1).toString() + "." + milliseconds;
				totalSavings += parseFloat(convert);
				singleSection.append("<span class=\"over\">+ " + (secondsTime2 - secondsTime1) + "." + milliseconds.toString().substr(0, 1) + "</span>");
			} else {
				singleSection.append("<span>-</span>");
			}
		}
		if(totalSavings > 0) {
			$("#savedTime").html("Total Savings: +" + totalSavings.toFixed(1) + " s").addClass("over").removeClass("under");
		} else if(totalSavings < 0) {
			$("#savedTime").html("Total Savings:" + totalSavings.toFixed(1) + " s").addClass("under").removeClass("over");
		}
	}
	
	if(count == (sections.length - 2)) {
		$("#splitSection").html("Stop");
	}
	
	if(count == (sections.length - 1)) {
		isRunning = false;
		watch.stop();
	}
	
	count++;
}

// Updates Timer on Page
function updateTimer(watch) {
	$("#timer").html(watch.toString() + "." + parseInt(watch.getElapsed().milliseconds/100));
}

// Starts Timer & Reads in Section Times
function startTimer () {
	isRunning = true;
	sections = [];
	splitSections = $("#gameSections").children();
	for(var i=1; i<=splitSections.length; i++) {
		singleSection = $("#gameSections li:nth-child(" + i + ")");
		sections.push([singleSection[0].childNodes[0].value,singleSection[0].childNodes[1].value]);
	}
	
	if(attemptCounter == 1) {
		watch = new Stopwatch(updateTimer, 50);
	}
	watch.start();
	tempTime1 = watch.toString();
	
	if((count + 1) == splitSections.length) {
		$("#splitSection").html("Stop");
	}
}

String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}

function saveRun() {
	if(isRunning == false && $("#gameTitle").val() !== "") {
		var gameTitle = $("#gameTitle").val();
		var run = JSON.parse(localStorage.getItem(gameTitle));
		run = sections;
		localStorage.setItem(gameTitle, JSON.stringify(run));
		
		$("#gameSections").empty();
		for(var i = 0; i < sections.length; i++) {
			$("#gameSections").append('<li><input type="text" class="sectionInputTitle" value="' + sections[i][0] + '" /><input type="text" class="sectionInputTime" value="' + sections[i][1] + '" /></li>');
		}
		
		$("#saveResponse").fadeOut(500, function() {
			$("#saveResponse").html(gameTitle + " saved").fadeIn(1000, function() {
				$("#saveResponse").fadeOut(2000);
			});
		});
		
		reset();
	}
	
	if($("#gameTitle").val() === "") {
		$("#saveResponse").fadeOut(500, function() {
			$("#saveResponse").html("Please enter a game title").fadeIn(1000, function() {
				$("#saveResponse").fadeOut(2000);
			});
		});
	}
}
