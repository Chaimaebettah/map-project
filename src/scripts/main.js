'use strict';

/* eslint no-undef: "off" */

// if google map doesn’t load you need to tell the user something went wrong
function googleError() {
  var errorMessage = 'Google Maps currently unavailable. Check internet or try later';
  document.getElementById('map').innerHTML = errorMessage;
  console.log(errorMessage);
  alert(errorMessage);
}


function googleSucces() {

  var myMap;
  var myLatLng = {lat: 41.4173, lng: -90.9071};
  var myMarkers = [];
  var myInfowindows = [];

  function createMarker(map, location, contentString) {
    // console.log(location);
    // if there is no contentString add the paragraph and the location lat and lng into infowindow
    var coordinates = location.myLatLng;
    var infoWindowContent = contentString;
    if (!infoWindowContent) {
      infoWindowContent = '<div class="content">' +
        '<p>this is ' + location.name + '  </p>' +
        coordinates.lat + ' ' + coordinates.lng +
        '</div>';
    }

    // create infowindow that will have the infoWindowContent content inside of it
    var infowindow = new google.maps.InfoWindow({
      content: infoWindowContent
    });

    // keep track of infowindows so we can use it later
    myInfowindows.push(infowindow);


    // add a simple marker to a map  by creating a new instance that contain different attributes,
    // like the position that the marker will be in. It will also add the animation to the marker.
    var marker = new google.maps.Marker({
      position: coordinates,
      map: map,
      title: location.name,
      draggable: false,
      animation: google.maps.Animation.DROP
    });

    // add click handler to the marker
    marker.addListener('click', function() {
      // when you click on a marker on the map an infowindow will pop up
      myInfowindows.forEach(function(myInfoWindow) {
        myInfoWindow.close();
      });
      infowindow.open(map, marker);

      // invoke the toggleBounce function
      toggleBounce(marker);
    });
    return marker;
  }

  // add animation to the marker
  function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        toggleBounce(marker);
      }, 1400);
    }
  }

// adds markers to the map
  function addMarkers(map, markers) {
    // loop through the markers
    markers.forEach(function(marker) {
      // add marker to the myMap by calling setmyMap
      marker.setMap(map);
    });

    return markers;
  }

  // create a removeMarkers function with markers parameter
  function removeMarkers(markers) {
    // loop through all markers and delete them from the map
    markers.forEach(function (marker) {
      marker.setMap(null);
    });
    return [];
  }


  function initMap() {
    // get the map element
    var mapDiv = document.getElementById('map');

    // create a new instance of map and make it center in myLatLng latitude and longitude
    myMap = new google.maps.Map(mapDiv, {
      center: myLatLng,
      zoom: 4
    });

    // invoke the addMarker function that accept two parameter map and an array of markers
    // addMarkers(myMap, [createMarker(myMap, myLatLng)]);
  }

  // invoke the initMap that will create the map on the screen
  initMap();

  // create  arr variable that contain an array of many objects
  var arr = [
    {
      id: 1,
      name: 'New York',
      myLatLng: {lat: 40.730610, lng: -73.935242}
    },
    {
      id: 2,
      name: 'NewPort',
      myLatLng: {lat: 41.490102, lng: -71.312829}
    },
    {
      id: 3,
      name: 'Nova Scotia ',
      myLatLng: {lat: 44.681987, lng: -63.744311}
    },
    {
      id: 4,
      name: 'Gjelina',
      myLatLng: {lat: 33.990590, lng: -118.464999}
    },
    {
      id: 5,
      name: 'Ohio',
      myLatLng: {lat: 40.4173, lng: -82.9071}
    },
    {
      id: 6,
      name: 'Chicago',
      myLatLng: {lat: 41.8781, lng: -87.6298}
    },
    {
      id: 7,
      name: 'Boston',
      myLatLng: {lat: 42.364506, lng: -71.038887}
    },
    {
      id: 8,
      name: 'Montana',
      myLatLng: {lat: 46.8797, lng: -110.3626}
    },
    {
      id: 9,
      name: 'Nebraska',
      myLatLng: {lat: 41.4925, lng: -99.9018}
    },
    {
      id: 10,
      name: 'Colorado',
      myLatLng: {lat: 39.5501, lng: -105.7821}
    },
    {
      id: 11,
      name: 'Canada',
      myLatLng: {lat: 56.1304, lng: -106.3468}
    }


  ];

  // create a view model
  // declare the query knockout variable to be observable
  var viewModel = {
    query: ko.observable(''),
    locationListIsOpen: ko.observable(false)
  };

  viewModel.toggleList = function () {
    this.locationListIsOpen(!this.locationListIsOpen());
  };

  viewModel.focusLocation = function(location) {
    myInfowindows.forEach(function(infowindow, index) {
      infowindow.close();
      var locationIndex = location.id - 1;
      if (locationIndex === index) {
        var markerIndex = locationIndex;
        var marker = myMarkers[markerIndex];
        infowindow.open(myMap, marker);
        toggleBounce(marker);
      }
    });
  };

  viewModel.showList = ko.computed(function() {
    return this.locationListIsOpen() ? 'on' : 'off';
  }, viewModel);

  viewModel.arr = ko.computed(function() {
    var search = this.query().toLowerCase();
    // filter the locations array and return a new filtered locations array
    var locations = ko.utils.arrayFilter(arr, function(array) {
      // return the array if the items matches
      return array.name.toLowerCase().indexOf(search) >= 0;
    });
    // remove the markers from the map
    myMarkers = removeMarkers(myMarkers);
    locations.forEach(function(location) {
      // console.log(location.name);
      ajaxFn(location);
    });
    // add the marker on the myMap
    addMarkers(myMap, myMarkers);
    // return the locations array
    return locations;
  }, viewModel);


  // bind the view model to the view
  ko.applyBindings(viewModel);


  function ajaxFn(location) {
    // store the Client Id and Client Secret to a variable to use them in for the Foursquare URL
    var CLIENT_ID = 'N2FFM3D25CFAUDWCU5AQFSCKPKEHXI142VVHRNBUHWX0JIKK';
    var CLIENT_SECRET = 'R54NBKMBB3M534D4I5ACHMTPUU5CMILIC4UI21JW2BGOREFC';

    // foursquare and wikipedia url
    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + location.name + '&limit=1&redirects=return&format=json';
    var fourSquareUrl = 'https://api.foursquare.com/v2/venues/search' +
      '?client_id=' + CLIENT_ID +
      '&client_secret=' + CLIENT_SECRET +
      '&v=20130815' +
      '&limit=4' +
      '&ll=' + location.myLatLng.lat + ',' + location.myLatLng.lng +
      '&query=Shopping';

    function handleWikiResponse(response) {
      if (!response) {
        myMarkers.push(createMarker(myMap, location));
        return;
      }

      var contentString = '<div class="content">';

      // we need to check for error first before checking for info
      // if we check for info without checking for info first, javascript will throw an exception (error)
      // and your application will stop working.
      if (response.error && response.error.info) {
        alert(response.error.info);
        return contentString;
      }
      var articleStr;
      var articleList = response[1];
      if (articleList.length > 0) {
        for (var i = 0; i < articleList.length; i++) {
          articleStr = articleList[i];
          var url = 'http://en.wikipedia.org/wiki/' + articleStr;
          contentString += location.name + '<p>' + response[2] + '</p>' + '<a href=" ' + url + '">' + url + '</a>';
        }
        contentString += '</div>';
        contentString += '<h3 class="location-name">' + location.name + '</h3>';
      } else {
        contentString = '<div class="content">' + location.name + '<p>' + 'No articles found on Wikipedia' + '</p>' + '</div>';
        myMarkers.push(createMarker(myMap, location, contentString));
      }

      return contentString;
    }

    function handleFourSquareResponse(response, contentString) {
      if (!response || !contentString) {
        myMarkers.push(createMarker(myMap, location));
        return;
      }

      if (response.meta.errorDetail) {
        myMarkers.push(createMarker(myMap, location));
        alert(response.meta.errorDetail);
        return;
      }

      var infoWindowContent = contentString;
      if (response.response.venues.length) {
        response.response.venues.forEach(function(venue) {
          infoWindowContent += '<li class="venue-style">' + venue.name + '<br>' + 'Address:' + ' ' + venue.location.formattedAddress + '</li>';

          venue.categories.forEach(function(category) {
            infoWindowContent += '<img  src=' + category.icon.prefix + 'bg_64' + category.icon.suffix + ' />';
          });
        });
      }
      myMarkers.push(createMarker(myMap, location, infoWindowContent));
    }
    var wikiResponse = $.ajax({
      url: wikiUrl,
      dataType: 'jsonp',
      timeout: 3000
    });

    var fourSquareResponse = $.ajax({
      url: fourSquareUrl,
      dataType: 'jsonp',
      timeout: 3000
    });

    // return the wikiResponse and fourSquareResponse promises that  resolved
    Promise
      .all([wikiResponse, fourSquareResponse])
      .then(function(response) {
        handleFourSquareResponse(response[1], handleWikiResponse(response[0]));
      })
      .catch(function() {
        console.log('here');
        handleFourSquareResponse(null, handleWikiResponse(null));
        $('body').append('<div class="api-alert">could not get additional data for locations</div>');
        setTimeout(function() {
          $('.api-alert').remove();
        }, 4000);
      });
  }
}
