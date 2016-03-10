// Here's what I want to do:
// Grab a list of attractions (using request?) from https://touringplans.com/disneyland/attractions.json. This will be an array of attraction objects, each with a name, short_name, and permalink.
// For each attraction, make a new request to https://touringplans.com/disneyland/attractions/ + permalink + .json. Get the opened_on date and add it to my original object.
// Look at how beautiful my new object is! Maybe send it as json?
// Compare it to lists on Disneyland.com and Wikipedia.

// This code must run on the server side.

console.log('main.js is running');
var axios = require('axios');
var cheerio = require('cheerio');
var fs = require('fs');

// inspired by http://www.html5rocks.com/en/tutorials/es6/promises/ and https://github.com/mzabriskie/axios
function get(url) {
  return new Promise(function(resolve, reject) {

    axios.get(url)
      .then(function(response) {
        resolve(response);
      })
      .catch(function(response) {
        reject(Error(response));
      });
  });
}

function getOpeningDate(attraction) {
  var url = attraction.jsonLink;

  return new Promise(function(resolve, reject) {

    axios.get(url)
      .then(function(response) {
        resolve(response.data.opened_on);
      })
      .catch(function(response) {
        reject(Error(response));
      });
  });
}

function getLand(attraction) {
  var url = attraction.htmlLink;

  return new Promise(function(resolve, reject) {

    axios.get(url)
      .then(function(response) {
        $ = cheerio.load(response.data);
        var land = $('h4').eq(0).text().slice(21);
        resolve(land);
      })
      .catch(function(response) {
        reject(Error(response));
      });
  });
}

var attractions; // I need to declare attractions outside the chain so that it's defined throughout.

get('https://touringplans.com/disneyland/attractions.json')
  .then(function(response) {
    console.log('Request for attractions list successful!');
    // response.data is an array containing attraction objects.

    attractions = response.data;
    attractions.forEach(function(attraction) {
      attraction.htmlLink = 'https://touringplans.com/disneyland/attractions/' + attraction.permalink;
      attraction.jsonLink = attraction.htmlLink + '.json';

    });
    // Now atttractions contains the jsonLink of each attraction.

    return Promise.all(
      attractions.map(getOpeningDate)
    );

  }).then(function(openingDates) {
    attractions.forEach(function(attraction, index) {
      attraction.opened_on = openingDates[index];
    });
    // Now attractions contains the opening date of each attraction.

    return Promise.all(
      attractions.map(getLand)
    );
    // getLand(attractions[0]).then(function(response) {
    //   console.log(response);
  }).then(function(lands) {
    attractions.forEach(function(attraction, index) {
      attraction.land = lands[index];
    });

    fs.writeFile('attractions.json', JSON.stringify(attractions), function() {
      console.log('finished writing');
    });

  }).catch(function(err) {
    console.log('error:', err);
  });
