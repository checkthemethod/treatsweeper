
//<![CDATA[
var cm_map;
var cm_openInfowindow;
var cm_mapMarkers = [];
var cm_mapHTMLS = [];
var currentMarker= null;
var currentBox;
// Change these parameters to customize map
var param_wsId = "od6";
var param_ssKey = "0AgNYvEec4OOZdGdGVXFVNXNWUlZxRjVaR2ZocWE4SUE";
var param_useSidebar = true;
var param_titleColumn = "title";
var param_descriptionColumn = "description";
var param_bestchoice = "type"
var param_latColumn = "latitude";
var param_lngColumn = "longitude";

var param_image = "images";

var param_imagesource = "imagesource";
var param_imagesourcelink = "imagesourcelink";
var param_yelp = "yelp";
var param_map = "map";

var param_rankColumn = "rank";
var param_iconType = "green";
var param_iconOverType = "orange";



function CreateElement(tagName, properties) {
    var elem = document.createElement(tagName);
    for (var prop in properties) {
        if (prop == "style")
            elem.style.cssText = properties[prop];
        else if (prop == "class")
            elem.className = properties[prop];
        else
            elem.setAttribute(prop, properties[prop]);
    }
    return elem;
}

/**
* @constructor
* @param {google.maps.Map} map
*/
function ZoomPanControl(map) {
    this.map = map;
    this.originalCenter = map.getCenter();

    var t = this;
    var zoomPanContainer = CreateElement("div", { 'style': "position: relative; padding: 5px;" });


    //Zoom Controls
    var zoomContainer = CreateElement("div", { 'style': "position: relative; width: 58px; height: 100px; -moz-user-select: none; overflow: hidden;" });
    zoomPanContainer.appendChild(zoomContainer);
    div = CreateElement("div", { 'style': "position: absolute; left: 0px; top: 0px; width: 40px; height: 37px; overflow: hidden; background-image: url('mapcontrols3d5.png'); background-position: -10px -65px; background-repeat: no-repeat; cursor: pointer;", 'title': 'Zoom in' });
    google.maps.event.addDomListener(div, "click", function() { t.zoom(ZoomDirection.IN); });
    zoomContainer.appendChild(div);
    div = CreateElement("div", { 'style': "position: absolute; left: 0px; top: 38px; width: 80px; height: 37px; overflow: hidden; background-image: url('mapcontrols3d5.png'); background-position: -10px -345px; background-repeat: no-repeat; cursor: pointer;", 'title': 'Zoom out' });
    google.maps.event.addDomListener(div, "click", function() { t.zoom(ZoomDirection.OUT); });
    zoomContainer.appendChild(div);

    return zoomPanContainer;
}

/** @param {PanDirection} direction */
ZoomPanControl.prototype.pan = function(direction) {
    var panDistance = 50;
    if (direction == PanDirection.UP || direction == PanDirection.DOWN) {
        panDistance = Math.round(this.map.getDiv().offsetHeight / 2);
        this.map.panBy(0, direction == PanDirection.DOWN ? panDistance : -1 * panDistance);
    }
    else {
        panDistance = Math.round(this.map.getDiv().offsetWidth / 2);
        this.map.panBy(direction == PanDirection.RIGHT ? panDistance : -1 * panDistance, 0);
    }
}

/** @param {ZoomDirection} direction */
ZoomPanControl.prototype.zoom = function(direction) {
    var zoom = this.map.getZoom();
    if (direction == ZoomDirection.IN && zoom < 19)
        this.map.setZoom(zoom + 1);
    else if (direction == ZoomDirection.OUT && zoom > 1)
        this.map.setZoom(zoom - 1);
}

/** @enum */
var PanDirection = {
    LEFT: 0,
    RIGHT: 1,
    UP: 3,
    DOWN: 4
}

/** @enum */
var ZoomDirection = {
    IN: 0,
    OUT: 1
}

window["richmedialab"] = window["richmedialab"] || {};
window["richmedialab"]["web"] = window["richmedialab"]["web"] || {};
window["richmedialab"]["web"]["ZoomPanControl"] = ZoomPanControl;



/**
 * Loads map and calls function to load in worksheet data.
 */
function cm_load() {  
  var myLatlng = new google.maps.LatLng(43.907787,-79.359741);
  var myOptions = {
    zoom: 4,
zoomControl: false,
       navigationControl: false,
       streetControl:false,

  streetViewControl: false,


    /*panControl: false,
    zoomControl: true,


    scaleControl: true,

*/
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP,

style: [ { featureType: "road", stylers: [ { hue: "#ffc300" } ] },{ featureType: "poi", stylers: [ { hue: "#00ff99" } ] },{ featureType: "water", stylers: [ { hue: "#00e5ff" }, { lightness: 20 } ] },{ elementType: "geometry", stylers: [ { visibility: "on" } ] } ]


  }
  cm_map = new google.maps.Map(document.getElementById("map_container"), myOptions);


        var ZoomPanControl = new richmedialab.web.ZoomPanControl(cm_map);
       ZoomPanControl.index = -1;
        cm_map.controls[google.maps.ControlPosition.TOP_LEFT].push(ZoomPanControl);


  cm_getJSON();
}

/**
 * Function called when marker on the map is clicked.
 * Opens an info window (bubble) above the marker.
 * @param {Number} markerNum Number of marker in global array
 */
function cm_markerClicked(markerNum) {
  if(currentBox!=undefined){
currentBox.setMap(null);


}

  if(currentMarker!=undefined ){
        //CUSTOMICON   currentMarker.setIcon(markerImageOut);
        }


 //CUSTOMICONcm_mapMarkers[markerNum].setIcon(markerImageOver);
     var infoboxOptions = {

        content: cm_mapHTMLS[markerNum],
        latlng: cm_mapMarkers[markerNum].getPosition(),
        map: cm_map


      }

      var infoBox = new InfoBox(infoboxOptions);
      currentBox = infoBox;
currentMarker = cm_mapMarkers[markerNum];
      //infoBox.setMap(null);
}


function showInfo(){

  
}

/**
 * Function that sorts 2 worksheet rows from JSON feed
 * based on their rank column. Only called if column is defined.
 * @param {rowA} Object Represents row in JSON feed
 * @param {rowB} Object Represents row in JSON feed
 * @return {Number} Difference between row values
 */
function cm_sortRows(rowA, rowB) {
  var rowAValue = parseFloat(rowA["gsx$" + param_rankColumn].$t);
  var rowBValue = parseFloat(rowB["gsx$" + param_rankColumn].$t);

  return rowAValue - rowBValue;
}

/** 
 * Called when JSON is loaded. Creates sidebar if param_sideBar is true.
 * Sorts rows if param_rankColumn is valid column. Iterates through worksheet rows, 
 * creating marker and sidebar entries for each row.
 * @param {JSON} json Worksheet feed
 */       
function cm_loadMapJSON(json) {
  var usingRank = false;

  if(param_useSidebar == true) {
    var sidebarTD = document.createElement("td");
    var sidebarDIV = document.createElement("div");
    sidebarDIV.id = "cm_sidebarDIV";
    sidebarTD.appendChild(sidebarDIV);
    document.getElementById("data-list").appendChild(sidebarTD);
  }

  var bounds = new google.maps.LatLngBounds();

  if(json.feed.entry[0]["gsx$" + param_rankColumn]) {
    usingRank = false;
    json.feed.entry.sort(cm_sortRows);
  }

  for (var i = 0; i < json.feed.entry.length; i++) {
    var entry = json.feed.entry[i];
    if(entry["gsx$" + param_latColumn]) {
      var lat = parseFloat(entry["gsx$" + param_latColumn].$t);
      var lng = parseFloat(entry["gsx$" + param_lngColumn].$t);
      var point = new google.maps.LatLng(lat,lng);
      var html = "<div style='font-size:12px'>"; 
      html += "<h2><strong>" + entry["gsx$"+param_titleColumn].$t 
              + "</strong></h2>";
      html+="<div class='crop'><img class='thumb-image' src='"+entry["gsx$"+param_image].$t+"'/></div>";

      if(entry["gsx$" + param_imagesourcelink]) {
      html+="<p class='imagesource'>(photo credit:  <a href='"+entry["gsx$"+param_imagesourcelink].$t+"'>"+entry["gsx$"+param_imagesource].$t+"</a>)</p>";
     }

  if(entry["gsx$" + param_descriptionColumn]) {
        html += "<br/>" + entry["gsx$"+param_descriptionColumn].$t+"<br/>";
      }

        if(entry["gsx$" + param_bestchoice]) {
        html += "<br/>Recommended treat: " + entry["gsx$"+param_bestchoice].$t+"<br/>";
      }
         if(entry["gsx$" + param_yelp]) {
      html+="<div id='external-links'><a href='"+entry["gsx$"+param_yelp].$t+"'><img src='images/yelp.jpg'/></a></div>";
     }

   //   if(entry["gsx$" + param_map]) {
     // html+="<div id='external-links'><a href='"+entry["gsx$"+param_map].$t+"'><img src='images/map.jpg'/></a></div>";
    // }
      var label = entry["gsx$"+param_titleColumn].$t;
      var rank = 0;
      if(usingRank && entry["gsx$" + param_rankColumn]) {
        rank = parseInt(entry["gsx$"+param_rankColumn].$t);
      }
    
      html += "</div>";


      // create the marker
      var marker = cm_createMarker(cm_map,point,label,html,rank);
      // cm_map.addOverlay(marker);
      cm_mapMarkers.push(marker);
      cm_mapHTMLS.push(html);
      bounds.extend(point);
    
      if(param_useSidebar == true) {
        var markerA = document.createElement("a");
        markerA.setAttribute("href","javascript:cm_markerClicked('" + i +"')");
        var sidebarText= "";
        if(usingRank) {
          sidebarText += rank + ") ";
        } 
        sidebarText += label;
        markerA.appendChild(document.createTextNode(sidebarText));
        sidebarDIV.appendChild(markerA);
        sidebarDIV.appendChild(document.createElement("br"));
        sidebarDIV.appendChild(document.createElement("br"));
      } 
    }
  }

  cm_map.fitBounds(bounds);
  cm_map.setCenter(bounds.getCenter());
}

function cm_setInfowindow(newInfowindow) {
  if (cm_openInfowindow != undefined) {
    cm_openInfowindow.close();

  }

  cm_openInfowindow = newInfowindow;
}

/**
 * Creates marker with ranked Icon or blank icon,
 * depending if rank is defined. Assigns onclick function.
 * @param {GLatLng} point Point to create marker at
 * @param {String} title Tooltip title to display for marker
 * @param {String} html HTML to display in InfoWindow
 * @param {Number} rank Number rank of marker, used in creating icon
 * @return {GMarker} Marker created
 */


  var iconSize = new google.maps.Size(20, 34);
  var iconShadowSize = new google.maps.Size(37, 34);
  var iconHotSpotOffset = new google.maps.Point(9, 0); // Should this be (9, 34)?
  var iconPosition = new google.maps.Point(0, 0);
  var infoWindowAnchor = new google.maps.Point(9, 2);
  var infoShadowAnchor = new google.maps.Point(18, 25);


  var iconSize = new google.maps.Size(20, 34);
  var iconShadowSize = new google.maps.Size(37, 34);
  var iconHotSpotOffset = new google.maps.Point(9, 0); // Should this be (9, 34)?
  var iconPosition = new google.maps.Point(0, 0);
  var infoWindowAnchor = new google.maps.Point(9, 2);
  var infoShadowAnchor = new google.maps.Point(18, 25);



  var iconOutSize = new google.maps.Size(50, 50);
  var iconShadowSize = new google.maps.Size(37, 34);
  var iconOutHotSpotOffset = new google.maps.Point(20, 14); // Should this be (9, 34)?
  var iconOutPosition = new google.maps.Point(0, 0);
  var infoOutWindowAnchor = new google.maps.Point(9, 2);
  var infoShadowAnchor = new google.maps.Point(18, 25);


  var iconShadowUrl = "images/cookie_small_shadow.png";

   var iconImageOutUrl = "images/cookie_small.png";
  var  iconImageOverUrl = "images/cookie_hover.png";
  var  iconImageUrl = "images/cookie_small.png";




  

  var markerShadow =
      new google.maps.MarkerImage(iconShadowUrl, iconShadowSize,
                                  iconPosition, iconHotSpotOffset);

  var markerImage =
      new google.maps.MarkerImage(iconImageUrl, iconSize,
                                  iconPosition, iconHotSpotOffset);

  var markerImageOver =
      new google.maps.MarkerImage(iconImageOverUrl, iconOutSize,
                                  iconOutPosition, iconOutHotSpotOffset);

  var markerImageOut =
      new google.maps.MarkerImage(iconImageOutUrl, iconSize,
                                  iconPosition, iconHotSpotOffset);



function cm_createMarker(map, latlng, title, html, rank) {




  var markerOptions = {
    title: title,
     //CUSTOMICONicon: markerImage,
     //CUSTOMICONshadow: markerShadow,
    position: latlng,
    animation: google.maps.Animation.DROP,
    map: map
  }

  var marker = new google.maps.Marker(markerOptions);



    google.maps.event.addListener(marker, "click", function(e) {
      //if(currentBox!=undefined){
      //if(markerNum!=undefined){
       //CUSTOMICONthis.setIcon(markerImageOver);
    //}
    
      //cm_markerClicked();
       if(currentBox!=undefined){
          currentBox.setMap(null);
          if(currentMarker!=undefined && currentMarker!=this ){
           //CUSTOMICONcurrentMarker.setIcon(markerImageOut);
        }
         // marker.setIcon(markerImageOut);
      }

     var infoboxOptions = {

        content: html,
        latlng: marker.getPosition(),
        map: map


      }



      var infoBox = new InfoBox(infoboxOptions);


    currentMarker = this;

         // 




    });
    //google.maps.event.trigger(marker, "click");



  google.maps.event.addListener(marker, "mouseover", function() {

          if(currentMarker!=undefined){
         // currentMarker.setIcon(markerImageOut);
        }
   // marker.setIcon(markerImageOver);
  });
  /*google.maps.event.addListener(marker, "mouseout", function() {
    marker.setIcon(markerImageOut);
  });*/



  return marker;
}


function InfoBox(opts) {

  google.maps.OverlayView.call(this);
  this.latlng_ = opts.latlng;
  this.map_ = opts.map;
  //CUSTOMICOthis.offsetVertical_ = -195;
  //CUSTOMICOthis.offsetHorizontal_ = 40;

  this.offsetVertical_ = -225;
  this.offsetHorizontal_ = 20;
  this.height_ = 460;
  this.width_ = 300;
  this.content_ = opts.content;

  var me = this;

    currentBox = this;
  this.boundsChangedListener_ =
    google.maps.event.addListener(this.map_, "bounds_changed", function() {
      return me.panMap.apply(me);
    });


  this.setMap(this.map_);
}


InfoBox.prototype = new google.maps.OverlayView();

/* Creates the DIV representing this InfoBox
 */
InfoBox.prototype.remove = function() {
  if (this.div_) {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
  }
};

/* Redraw the Bar based on the current projection and zoom level
 */
InfoBox.prototype.draw = function() {
  // Creates the element if it doesn't exist already.
  this.createElement();
  if (!this.div_) return;


  // Calculate the DIV coordinates of two opposite corners of our bounds to
  // get the size and position of our Bar
  var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
  if (!pixPosition) return;

  // Now position our DIV based on the DIV coordinates of our bounds
  this.div_.style.width = this.width_ + "px";
  this.div_.style.left = (pixPosition.x + this.offsetHorizontal_) + "px";
  this.div_.style.height = this.height_ + "px";
  this.div_.style.top = (pixPosition.y + this.offsetVertical_) + "px";
  this.div_.style.display = 'block';
};

/* Creates the DIV representing this InfoBox in the floatPane.  If the panes
 * object, retrieved by calling getPanes, is null, remove the element from the
 * DOM.  If the div exists, but its parent is not the floatPane, move the div
 * to the new pane.
 * Called from within draw.  Alternatively, this can be called specifically on
 * a panes_changed event.
 */
InfoBox.prototype.createElement = function() {
  var panes = this.getPanes();
  var div = this.div_;
  if (!div) {
    // This does not handle changing panes.  You can set the map to be null and
    // then reset the map to move the div.
    div = this.div_ = document.createElement("div");
    div.id = "infobox";
    div.style.border = "0px none";
    div.style.position = "absolute";
    div.style.background = "url('images/infobox.png')";
    div.style.width = this.width_ + "px";
    div.style.height = this.height_ + "px";
    var contentDiv = document.createElement("div");
    contentDiv.style.padding = "0px 50px"
    contentDiv.innerHTML = this.content_;

    var topDiv = document.createElement("div");
    topDiv.style.textAlign = "right";
    topDiv.style.padding = "10px 14px 0px 0px";
    var closeImg = document.createElement("img");
    closeImg.style.width = "58px";
    closeImg.style.height = "25px";

    closeImg.style.cursor = "pointer";
    closeImg.src = "images/closebox.gif";
    topDiv.appendChild(closeImg);




   function removeInfoBox(ib) {
      return function() {
        ib.setMap(null);
        //CUSTOMICON currentMarker.setIcon(markerImageOut);
      };
    }
  

    google.maps.event.addDomListener(closeImg, 'click', removeInfoBox(this));

    div.appendChild(topDiv);
    div.appendChild(contentDiv);
    div.style.display = 'none';
    panes.floatPane.appendChild(div);
    this.panMap();
  } else if (div.parentNode != panes.floatPane) {
    // The panes have changed.  Move the div.
    div.parentNode.removeChild(div);
    panes.floatPane.appendChild(div);
  } else {
    // The panes have not changed, so no need to create or move the div.
  }
}



/* Pan the map to fit the InfoBox.
 */
InfoBox.prototype.panMap = function() {
  // if we go beyond map, pan map
  var map = this.map_;
  var bounds = map.getBounds();
  if (!bounds) return;

  // The position of the infowindow
  var position = this.latlng_;


  // The dimension of the infowindow
  var iwWidth = this.width_;
  var iwHeight = this.height_;

  // The offset position of the infowindow
  var iwOffsetX = this.offsetHorizontal_;
  var iwOffsetY = this.offsetVertical_;

  // Padding on the infowindow
  var padX = 40;
  var padY = 40;

  // The degrees per pixel
  var mapDiv = map.getDiv();
  var mapWidth = mapDiv.offsetWidth;
  var mapHeight = mapDiv.offsetHeight;
  var boundsSpan = bounds.toSpan();
  var longSpan = boundsSpan.lng();
  var latSpan = boundsSpan.lat();
  var degPixelX = longSpan / mapWidth;
  var degPixelY = latSpan / mapHeight;

var listboxoffset= .1;
  // The bounds of the map
  var mapWestLng = bounds.getSouthWest().lng();
  var mapEastLng = bounds.getNorthEast().lng()-listboxoffset;
  var mapNorthLat = bounds.getNorthEast().lat();
  var mapSouthLat = bounds.getSouthWest().lat();

  // The bounds of the infowindow
  var iwWestLng = (position.lng() + (iwOffsetX - padX) * degPixelX);
  var iwEastLng = position.lng() + (iwOffsetX + iwWidth + padX) * degPixelX;
  var iwNorthLat = position.lat() - (iwOffsetY - padY) * degPixelY;
  var iwSouthLat = position.lat() - (iwOffsetY + iwHeight + padY) * degPixelY;

  // calculate center shift
  var shiftLng =
      (iwWestLng < mapWestLng ? mapWestLng - iwWestLng : 0) +
      (iwEastLng > mapEastLng ? mapEastLng - iwEastLng : 0);
  var shiftLat =
      (iwNorthLat > mapNorthLat ? mapNorthLat - iwNorthLat : 0) +
      (iwSouthLat < mapSouthLat ? mapSouthLat - iwSouthLat : 0);

  // The center of the map
  var center = map.getCenter();


  // The new map center
  var centerX = center.lng() - shiftLng;
  var centerY = center.lat() - shiftLat;


  //alert('shiftLng: '+ shiftLng ' || shiftLat: '+shiftLat);

  // center the map to the new shifted center
  map.setCenter(new google.maps.LatLng(centerY, centerX));

  // Remove the listener after panning is complete.
  google.maps.event.removeListener(this.boundsChangedListener_);
  this.boundsChangedListener_ = null;
};


/**
 * Creates a script tag in the page that loads in the 
 * JSON feed for the specified key/ID. 
 * Once loaded, it calls cm_loadMapJSON.
 */


function cm_getJSON() {

  // Retrieve the JSON feed.
  var script = document.createElement('script');

  script.setAttribute('src', 'http://spreadsheets.google.com/feeds/list'
                         + '/' + param_ssKey + '/' + param_wsId + '/public/values' +
                        '?alt=json-in-script&callback=cm_loadMapJSON');
  script.setAttribute('id', 'jsonScript');
  script.setAttribute('type', 'text/javascript');
  document.documentElement.firstChild.appendChild(script);
}

setTimeout('cm_load()', 500); 

//]]>