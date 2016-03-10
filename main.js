// Here's what I want to do:
// Grab a list of attractions (using request?) from https://touringplans.com/disneyland/attractions.json. This will be an array of attraction objects, each with a name, short_name, and permalink.
// For each attraction, make a new request to https://touringplans.com/disneyland/attractions/ + permalink + .json. Get the opened_on date and add it to my original object.
// Look at how beautiful my new object is! Maybe send it as json?
// Compare it to lists on Disneyland.com and Wikipedia.

console.log('main.js is running');
var axios = require('axios');
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
  var url = attraction.fullLink;

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

// I tested this function, and it works.
// function getOpeningDate(url) {
//   return new Promise(function(resolve, reject) {
//
//     axios.get(url)
//       .then(function(response) {
//         resolve(response.data.opened_on);
//       })
//       .catch(function(response) {
//         reject(Error(response));
//       });
//   });
// }

// getOpeningDate('https://touringplans.com/disneyland/attractions/tarzans-treehouse.json')
//   .then(function(response) {
//     console.log('opening date:', response);
//   }, function(error) {
//     console.log('Request for opening date failed.');
//   });

var attractions; // I need to declare attractions outside the chain so that it's defined throughout.

get('https://touringplans.com/disneyland/attractions.json')
  .then(function(response) {
    console.log('Request for attractions list successful!');
    // response.data is an array containing attraction objects.

    attractions = response.data;
    attractions.forEach(function(attraction) {
      attraction.fullLink = 'https://touringplans.com/disneyland/attractions/' + attraction.permalink + '.json';
    });
    // Now atttractions contains the fullLink of each attraction.

    return Promise.all(
      attractions.map(getOpeningDate)
    );

  }).then(function(openingDates) {
    attractions.forEach(function(attraction, index) {
      attraction.opened_on = openingDates[index];
    })
    // Now attractions contains the opening date of each attraction. 

  }).catch(function(err) {
    console.log('error:', err);
  });


// var attractionsPromise;
//
// function getOpeningDateForAttraction(i) {
//   console.log('in getOpeningDateForAttraction. i is', i);
//   attractionsPromise = attractionsPromise || get('https://touringplans.com/disneyland/attractions.json');
//   return attractionsPromise.then(function(attractions) {
//     return get('https://touringplans.com/disneyland/attractions/' + attractions[i].permalink + '.json');
//   });
// }
//
// getOpeningDateForAttraction(0).then(function(attraction) {
//   console.log(attraction);
//   return getOpeningDateForAttraction(1);
// }).then(function(attraction) {
//   console.log(attraction);
// })

// OLD
// var fs = require('fs');
// var request = require('request');
//
// request('https://touringplans.com/disneyland/attractions.json', function(error, response, json) {
//   if (error) return console.log('error on first request:', error);
//
//   // Create an object with the attractions data.
//   var attractionsArray = JSON.parse(json);
//   // console.log(attractionsObject); // For testing only
//
//   // Use a loop to create promises?
//
//   var promise = new Promise(function(resolve, reject) {
//     var linkToVisit = 'https://touringplans.com/disneyland/attractions/' + attractionsArray[0].permalink + '.json';
//
//     request(linkToVisit, function(error, response, json) {
//       if (error) {
//         console.log('error on request for', attractionsArray[0].name, '-', error);
//       } else {
//         attractionsArray[0].opened_on = json.opened_on;
//       }
//     });
//
//     if (attractionsArray[0].opened_on) {
//       resolve('Request successful!');
//     } else {
//       reject(Error('Request unsuccessful'));
//     }
//   });
//
//   promise.then(function(result) {
//     console.log('result in .then:', result);
//   }, function(err) {
//     console.log('error in .then:', err)
//   });

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
// });
