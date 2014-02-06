(function($){
    //Airports by Nautical Distance
    var AND = (function(){

        //lat/lng 
        var coordinatesObj = {
            source : { lat: "", lng: ""},
            destination : { lat: "", lng: ""}
        };

        //all the targets elms
        var elms = {
            search1 : "#autocomplete1",
            search2 : "#autocomplete2",
            output1 : "#outputcontent1",
            output2 : "#outputcontent2",
            answer  : "#nauticalmiles",
            label   : "#label"
        };

        return {
            init: function(){
                var self = this;
                self.grabUserData();
            },
            grabUserData: function(){
                var self = this;
                $(elms.search1).autocomplete({
                    lookup: data,
                    onSelect: function (suggestion) { 
                        coordinatesObj.source.lat = suggestion.latitude;
                        coordinatesObj.source.lng = suggestion.longitude;
                        $(elms.output1).html(self.displayData(suggestion,"Source"));
                    }
                });
  
               $(elms.search2).autocomplete({
                    lookup: data,
                    onSelect: function (suggestion) {
                        coordinatesObj.destination.lat = suggestion.latitude;
                        coordinatesObj.destination.lng = suggestion.longitude;
                        $(elms.output2).html(self.displayData(suggestion,"Destination"));
                    }
                });
            },
            displayData: function(data,direction){
                var self = this;
                var htmlData = ''+
                '<p>'+direction+' : '+data.value+'</p>'+
                '<p><strong>Latitude: </strong> '+ data.latitude + '</p>'+
                '<p><strong>Longitude: </strong> '+ data.longitude + '</p>';

                if( $(elms.search1).val() != "" && $(elms.search2).val() != "" ){
                    self.findDistance(coordinatesObj);
                    self.addToMap(coordinatesObj);
                }  
                return htmlData;
            },
            findDistance: function(dataObj) {console.log(dataObj)
                var t1, n1, t2, n2, lat1, lon1, lat2, lon2, dlat, dlon, a, c, dm, dk, mi, km;
                var Rm = 3961; // mean radius of the earth (miles) at 39 degrees from the equator
                var Rk = 6373; // mean radius of the earth (km) at 39 degrees from the equator
                // get all lat/lng
                t1 = dataObj.source.lat;
                n1 = dataObj.source.lng;
                t2 = dataObj.destination.lat;
                n2 = dataObj.destination.lng;
               
                // convert degrees to radians
                var deg2rad = function(deg) {
                    rad = deg * Math.PI/180; // radians = degrees * pi/180
                    return rad;
                }

                // convert coordinates to radians
                lat1 = deg2rad(t1);
                lon1 = deg2rad(n1);
                lat2 = deg2rad(t2);
                lon2 = deg2rad(n2);
               
                // find the differences between the coordinates
                dlat = lat2 - lat1;
                dlon = lon2 - lon1;
               
                a  = Math.pow(Math.sin(dlat/2),2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon/2),2);
                c  = 2 * Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); // great circle distance in radians
                dm = c * Rm; // great circle distance in miles
                dk = c * Rk; // great circle distance in km
               
                // round to the nearest 1/1000
                var round = function (x) {
                    return Math.round( x * 1000) / 1000;
                }

                // round the results down to the nearest 1/1000
                mi = round(dm);
               
                // display the result
                nautMiles = mi * 0.86897624;
                console.log(nautMiles,"miles");
                $(elms.answer).text(nautMiles);
                $(elms.label).show();
            },
            displayMap: function(){
                var self = this;
                self.flightPath;
                self.map;
                
                function initialize() {
                    var mapOptions = {
                        center: new google.maps.LatLng(39.50, -98.35),
                        zoom: 4
                    };
                    self.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
                }
                google.maps.event.addDomListener(window, 'load', initialize);
            },
            addToMap: function(obj){
                var self = this;

                if(self.pointLoaded){
                    self.flightPath.setMap(null);
                }

                var flightPlanCoordinates = [
                    new google.maps.LatLng(obj.source.lat,obj.source.lng),
                    new google.maps.LatLng(obj.destination.lat, obj.destination.lng)
                ];

                self.flightPath = new google.maps.Polyline({
                    path: flightPlanCoordinates,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });

                self.flightPath.setMap(self.map);
                self.pointLoaded = true;
            }
        }
    }());


    $(document).ready(function(){
        AND.init();
        AND.displayMap();
    })

}(jQuery));
