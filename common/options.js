var gPreferenceTypes = ["abstractStyle", "noteHeight", "fontColor", "backgroundColor", "notePosition", "showConnectionPrompt"];

function isChrome(){
   return /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
}

function pushPreferences(preferences){
  if(isChrome()){
    $.each(gPreferenceTypes, function(index, key){
        localStorage[key] = preferences[key];
    });
  }
  else {  //firefox
    self.port.emit("SGN_options", {"action": "push_preferences", "preferences":preferences});
  }
}

function pullPreferences(){
  var preferences = {};

  if(isChrome()){
    updateDefaultPreferences(localStorage);
    $.each(gPreferenceTypes, function(index, key){
      preferences[key] = localStorage[key];
    });

    updateControls(preferences);
  }
  else {  //firefox
    //ask background script to post the preferences
    self.port.emit("SGN_options", {action:"pull_preferences"});
    //result would be posted as update_preferences
  }
}

//for firefox only
if(!isChrome()){
  self.port.on("SGN_options", function(request){
    switch(request.action){
      case "update_preferences":
        updateControls(request.preferences);
        return;
      default:
        //ignore it
        return
    };
  });
}

function showSavedPrompt(){
  $("#status").html("Preferences saved.<br/><br/>Please refresh browser to make the changes effective.<br/><br/>");
  //clean up the text after 0.75 seconds
  setTimeout(function() { 
    $("#status").text("");
  }, 3000);
}

function savePreferences() {
  //var hideListingNotes = $("#hide_listing_notes").is(":checked");
  //localStorage["hideListingNotes"] = hideListingNotes;

  var preferences = {}

  preferences["abstractStyle"] = $("#abstract_style").val();
  preferences["noteHeight"] = $("#note_height").val();
  preferences["fontColor"] = $("#font_color").val();
  preferences["backgroundColor"] = $("#background_color").val();
  preferences["notePosition"] = $("#note_position").val();
  preferences["showConnectionPrompt"] = $("#show_connection_prompt").is(":checked");

  pushPreferences(preferences);

  showSavedPrompt();
}


function resetPreferences() {
  pushPreferences({});  //clear all existing values

  setTimeout(pullPreferences, 200);  //get the default values
  setTimeout(savePreferences, 400);  //push back the default values
  setTimeout(showSavedPrompt, 600);
}

function updateControls(preferences){
  var abstractStyle = preferences["abstractStyle"];
  $("#abstract_style").val(abstractStyle);


  var noteHeight = preferences["noteHeight"];
  $("#note_height").val(noteHeight);


  var fontColor = preferences["fontColor"];
  $("#font_color").setColor(fontColor);
  $("#font_color").val(fontColor);


  var backgroundColor = preferences["backgroundColor"];
  $("#background_color").setColor(backgroundColor);
  $("#background_color").val(backgroundColor);

  var notePosition = preferences["notePosition"];
  $("#note_position").val(notePosition);

  var showConnectionPrompt = (preferences["showConnectionPrompt"] !== "false");
  $("#show_connection_prompt").prop("checked", showConnectionPrompt);
}


function initPreferences(){
  for(var i=2; i<=30; i++){
    $("#abstract_style").append("<option value=" + i + ">First " + i + " Characters</option>");
  }

  for(var i=1; i<=8; i++){
    $("#note_height").append("<option>" + i + "</option>");
  }

}

$(document).ready(function(){
  initPreferences();

  $("#save").click(savePreferences);
  $("#reset").click(resetPreferences);
  $("#font_color").simpleColor({ displayColorCode: true });
  $("#background_color").simpleColor({ displayColorCode: true });

  pullPreferences();
});