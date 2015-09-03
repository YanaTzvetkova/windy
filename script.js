var app = {};

app.selectedCountry = "";  
// These two work for some reason, but I still don't understand exactly why?
app.selectedCity = "";

app.storeCountry = function(){
  $(".country").change(function(){
    // Always remove the submit button when a new country is selected
    $(".form").children("input[type='submit']").remove();
    // Always remove the city <select> tag when a new country is selected
    $(".city").remove();
    // The value of user's country selection is stored in a variable called selectedCountry
    app.selectedCountry = $(".country").val();
    // We call the getCities method and pass it the value stored in the selectedCountry variable
    console.log(app.selectedCountry);
    app.getCities(app.selectedCountry);
    app.searchWeather();
  });
};

app.getCities = function(countryState){
  console.log(countryState);
  $.ajax({
    url: "https://api.wunderground.com/api/ef1b2e74e6edaa70/conditions/q/" + countryState + "/" + ".json" ,
    dataType: "jsonp",
    success: function(cityList) {
      // Using the selectedCountry, we send an AJAX request which returns an Object which we're calling cityList
      // Inside of this cityList object we choose the response property, also an Object
      // Inside of this response Object we choose the results property, an array
      console.log(cityList);
      app.queryCity(cityList.response.results);
    }
  });
};

app.queryCity = function(cityArray){
  //Dynamically create a <select> tag with a class of city
  var $citySelect =  $("<select>").attr("class", "city");
  // Dynamically create an <option> that is disabled and selected and set the text to "Choose a city"
  var $disabledSearch = $("<option>").attr({
    value:"",
    disabled:"disabled", 
    selected:"selected"}).text("Choose a city");
  // Append disabled <option> inside <select> tag
  $citySelect.append($disabledSearch);
  // We loop through the cityArray using the .each(); method
  $.each(cityArray, function(index, item){
    // We create an <option> tag for each item inside of the cityArray and give it a value of the name of the city, and add text inside of the <option> tag that is also the name of the city
    var $cityOption = $("<option>").attr("value", item.name).text(item.name);
    //We append the <option>s that we've created inside of the <select> tag
    $citySelect.append($cityOption);
  }); 
  $("form").append($citySelect); 
  // Append the <select> tag inside of the form, thus dynamically generating a second drop-down menu with all the cities that have available data through Wunderground
  // By dynamically creating this second drop-down menu, we remove the need for users to manually input data - reducing the margin of error - and ensuring we only provide users with options for which Wunderground can actually provide data
  
};

app.storeCity = function(){ 
  // When a city has been selected, store that value in a variable called app.selectedCity
  $(document.body).on("change", ".city", function(){
    // Always remove the submit button when a new city is selected
    $(".form").children("input[type='submit']").remove();
    app.selectedCity = $(".city").val();
    // Dynamically create a submit button and append it to the form
    $citySubmit = $('<input type="submit">');
    $(".form").append($citySubmit);
  });
  app.storeCountry();

};

app.searchWeather = function(){
    // Prevent the page from reloading when the form is submitted
    $('body').on("submit", ".form", function(e){
      e.preventDefault();
      // When the submit button is clicked, the form is hidden
      $(".form").addClass("hidden");

      // The hidden class is removed from loading graphic for 5s, then it is hidden again
      $(".loading-graphic").removeClass("hidden").delay(5000).queue(function() {
          $(this).addClass("hidden");
          $(this).dequeue();
      });
      // Finally, we remove the hidden class from the div with a class of reveal, and show our search results
      $(".reveal").delay(5000).queue(function(){
          $(this).removeClass("hidden");
          $(this).dequeue();
      });
      app.getWeather(); // Why do we call this down here, again?
    });
};

// Once the user has selected a country and a city, a second AJAX request is sent to retrieve the weather data

app.getWeather = function() {
  $.ajax({
    url: "https://api.wunderground.com/api/ef1b2e74e6edaa70/conditions/q/" + app.selectedCountry + "/" + app.selectedCity + ".json" ,
    dataType: "jsonp",
    success: function(windy){
      // Inside of the object we get back, called windy, we select another object called current_observation
      console.log(windy);
      app.displayWeather(windy.current_observation);
    }
  });
}

app.displayWeather = function(weather){
  // Every time we make a new request, the paragraph with a class of suggestion is emptied, and ready to accept new info
	$(".suggestionText").empty();
  // Grab the location string and add it into the paragraph with a class of locationFull
  $(".locationFull").text(weather.display_location.full);
  // Grab the weather string and add it into the paragraph with a class of weather
  $(".weather").text(weather.weather);
  // Grab the temperature in C string and add it into the paragraph with a class of celcius
  $(".celcius").text(weather.temp_c);
    // If the temperature in C is less that 18 degrees, add text to the paragraph with a class of suggestion
    if (weather.temp_c < 18) {
      $(".suggestionText").text("How about a nice pair of slacks?");
    }
    // Otherwise add other text to the paragraph with a class of suggestion
    else {
      $(".suggestionText").text("Say yes to the dress!");
    }

  // Grab the temperature in F string and add it into the paragraph with a class of fahrenheit
  $(".fahrenheit").text(weather.temp_f);
  // Grab wind_string string and add it into the paragraph with a class of windString
  $(".windString").text(weather.wind_string);
};

app.init = function(){
  // And why do we call these three methods down here, and not the other ones?
   app.storeCity();
   console.log("working?");
};

$(function(){
  app.init();
  // Refresh the page when the reload button is clicked
  $(".reload").on("click", function(){
    location.reload(true);
  });
});