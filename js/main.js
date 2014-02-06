(function($){

    var GetNautMiles = (function(){

        function GetNautMiles(gMap) {
            var self = this;
            self.gMap = gMap;
 
            //lat and lng coordinates
            self.coordinates = {
                source : { lat: "", lng: ""},
                destination : { lat: "", lng: ""}
            };

            //all the targets elms
            self.elms = {
                search1 : "#autocomplete1",
                search2 : "#autocomplete2",
                output1 : ".outputcontent1",
                output2 : ".outputcontent2",
                answer  : ".nauticalMiles"
            };

            self.searchBoxes();
        }

        GetNautMiles.prototype.searchBoxes = function(){
            var self = this, elms = self.elms, coord = self.coordinates;
            $(elms.search1).autocomplete({
                lookup: window.AirportData,
                onSelect: function (suggestion) { 
                    coord.source.lat = suggestion.latitude;
                    coord.source.lng = suggestion.longitude;
                    $(elms.output1).html(self.displayData(suggestion,"Source"));
                }
            });

           $(elms.search2).autocomplete({
                lookup: window.AirportData,
                onSelect: function (suggestion) {
                    coord.destination.lat = suggestion.latitude;
                    coord.destination.lng = suggestion.longitude;
                    $(elms.output2).html(self.displayData(suggestion,"Destination"));
                }
            });
        };

        GetNautMiles.prototype.displayData = function(data,direction){
            var self = this, elms = self.elms, coord = self.coordinates;
            var htmlData = ''+
            '<p><strong>'+direction+':</strong> '+data.value+'</p>'+
            '<p><strong>Latitude: </strong> '+ data.latitude + '</p>'+
            '<p><strong>Longitude: </strong> '+ data.longitude + '</p>';

            if( $(elms.search1).val() !== "" && $(elms.search2).val() !== "" ){
                self.findDistance(coord);
                self.addToMap(coord);
            }  
            return htmlData;
        };

        GetNautMiles.prototype.findDistance = function(dataObj) {
            var elms = this.elms;
            var t1, n1, t2, n2, lat1, lon1, lat2, lon2, dlat, dlon, a, c, dm, mi;
            var Rm = 3961; // mean radius of the earth (miles) at 39 degrees from the equator
            // get all lat/lng
            t1 = dataObj.source.lat;
            n1 = dataObj.source.lng;
            t2 = dataObj.destination.lat;
            n2 = dataObj.destination.lng;
           
            // convert degrees to radians
            var deg2rad = function(deg) {
                var rad = deg * Math.PI/180; // radians = degrees * pi/180
                return rad;
            };

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
           
            // round to the nearest 1/1000
            var round = function (x) {
                return Math.round( x * 1000) / 1000;
            };

            // round the results down to the nearest 1/1000
            mi = round(dm);
           
            // miles to nautical miles
            var nautMiles = mi * 0.86897624;
            nautMiles = Math.round(nautMiles*10)/10;

            var answerHTML = ''+
            '<h2>Nautical Miles:</h2>'+
            '<div class="nauticalmiles">'+nautMiles+'</div>';
            $(elms.answer).html(answerHTML);
        };

        GetNautMiles.prototype.addToMap = function(obj){         
            this.gMap.addLine(obj); return;
        };

        return GetNautMiles;
    }());


    GMap = (function () {

        function GMap(target) {
            var self = this;
            self.target = target;
            self.map = {};
            self.pointLoaded = false;
            this.init();
        }

        GMap.prototype.init = function () {
            var self = this;
            function initializeMap() {
                var mapOptions = {
                    center: new google.maps.LatLng(39.50, -98.35),
                    zoom: 4
                };
                self.map = new google.maps.Map(document.getElementById(self.target), mapOptions);
            }
            google.maps.event.addDomListener(window, 'load', initializeMap);
        };

        GMap.prototype.addLine = function(obj) {
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
        };

        return GMap;
    })();

    $(document).ready(function(){
        var gMap = new GMap('map-canvas'),
        getNautMiles = new GetNautMiles(gMap);
    });

}(jQuery));
