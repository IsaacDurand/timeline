// Here's what I want to do:
// Grab a list of attractions (using request?) from https://touringplans.com/disneyland/attractions.json. This will be an array of attraction objects, each with a name, short_name, and permalink.
// For each attraction, make a new request to https://touringplans.com/disneyland/attractions/ + permalink + .json. Get the opened_on date and add it to my original object.
// Look at how beautiful my new object is! Maybe send it as json?
// Compare it to lists on Disneyland.com and Wikipedia.

var fs = require('fs');
var request = require('request');

request('https://touringplans.com/disneyland/attractions.json', function(error, response, json) {
  if (error) return console.log('error on first request:', error);

  // Create an object with the attractions data.
  var attractionsArray = JSON.parse(json);
  // console.log(attractionsObject); // For testing only

  // Use a loop to create promises?

  var promise = new Promise(function(resolve, reject) {
    var linkToVisit = 'https://touringplans.com/disneyland/attractions/' + attractionsArray[0].permalink + '.json';

    request(linkToVisit, function(error, response, json) {
      if (error) {
        console.log('error on request for', attractionsArray[0].name, '-', error);
      } else {
        attractionsArray[0].opened_on = json.opened_on;
      }
    });

    if (attractionsArray[0].opened_on) {
      resolve('Request successful!');
    } else {
      reject(Error('Request unsuccessful'));
    }
  });

  promise.then(function(result) {
    console.log('result in .then:', result);
  }, function(err) {
    console.log('error in .then:', err)
  });

  // Modify each attraction in this array.
  // attractionsArray.forEach(function(attraction) {
  //   var linkToVisit = 'https://touringplans.com/disneyland/attractions/' + attraction.permalink + '.json';
  //   request(linkToVisit, function(error, response, json) {
  //     if (error) return console.log('error on request for', attraction.name, '-', error);
  //     attraction.opened_on = json.opened_on;
  //   });
  // });

  // console.log(attractionsArray);
  // fs.writeFile('attractions.json', json, function() {
  //   console.log('Finished writing data from first request to file');
  // });
});
