/* Foswig.js | (c) Glenn Conner. | https://github.com/mrsharpoblunto/foswig.js/blob/master/LICENSE */ (function(e){e.foswig={};e.foswig.MarkovChain=function(e){function r(a){a=a.toLowerCase();for(var b=k,c=0;c<a.length;++c)if(b=b.children[a[c]],!b)return!1;return!0}function l(a){1<a.length&&l(a.substr(1));for(var b=k,c=0;c<a.length;++c){var d=b.children[a[c]];d||(d=new m,b.children[a[c]]=d);b=d}}function n(a){this.b=a;this.a=[]}function m(){this.children=[]}var k=new m,h=new n(""),p={};this.addWordsToChain=function(a){for(var b=0;b<a.length;++b)this.addWordToChain(a[b])};this.addWordToChain=function(a){l(a.toLowerCase()); for(var b=h,c="",d=0;d<a.length;++d){var q=a[d],c=c+q;c.length>e&&(c=c.substr(1));var f=p[c];f||(f=new n(q),p[c]=f);b.a.push(f);b=f}b.a.push(null)};this.generateWord=function(a,b,c){var d,e;do{e=!1;var f=Math.floor(Math.random()*h.a.length),g=h.a[f];for(d="";g&&d.length<=b;)d+=g.b,f=Math.floor(Math.random()*g.a.length),g=g.a[f];if(d.length>b||d.length<a)e=!0}while(e||!c&&r(d));return d}};"function"===typeof e.define&&e.define.amd&&e.define("foswig",[],function(){return e.foswig})})("undefined"!== typeof window?window:this);

var SpatialHash = function(cellSize) {
  this.idx = {};
  this.cellSize = cellSize;
}  
 
SpatialHash.prototype.insert = function(x, y, obj) {
  var cell = [];
  var keys = this.keys(x,y);
  for(var i in keys) {
    var key = keys[i];
    if(key in this.idx) {
      cell = this.idx[key];
    } else {
      this.idx[key] = cell;   
    }
    if(cell.indexOf(obj) == -1)
      cell.push(obj);
  }
}

SpatialHash.prototype.query = function(x, y) {
  var key = this.key(x, y);
  if(this.idx[key] != undefined)
    return this.idx[key];
  return [];
}

SpatialHash.prototype.keys = function (x, y)  {
  var o = this.cellSize / 2;
  return [this.key(x-o, y+0), 
    this.key(x-0, y+0),
    this.key(x+o, y+0),
    this.key(x-o, y+o),
    this.key(x-0, y+o),
    this.key(x+o, y+o),
    this.key(x-o, y-o),
    this.key(x-0, y-o),
    this.key(x+o, y-o)];
}

SpatialHash.prototype.key = function(x, y) {
  var cellSize = this.cellSize;
  x = Math.floor(x/cellSize)*cellSize;
  y = Math.floor(y/cellSize)*cellSize;
  return x.toString() + ":" + y.toString();
}

///////////////////////////

UniverseMap = function (canvas) {
  this.hash = new SpatialHash(25);
  this.chain = new foswig.MarkovChain(2);
  this.chain.addWordsToChain([
    'Centaury', 'Comet', 'Blazing', 'Breach', 'Minautaurus', 'Hull', 'Titanium', 'Uranium', 'Death', 'Valley',
    'Cypia', 'Circubol', 'Nenix', 'Multidrius', 'Taracle', 'Sucad', 'Dynamara', 'Vorfen', 'Shadosapian',
    'Thundercom', 'Wicise', 'Zanol', 'Starcat', 'Ronon', 'Ketek', 'Nexucat', 'Vedor', 'Apilope', 'Kedeo', 
    'Aeronus', 'Placenix', 'Ropath', 'Pheanate', 'Irolius', 'Capira', 'Ripnara', 'Betaron', 'Hicil', 'Aprinix', 
    'Hyro', 'Carbovore', 'Phador', 'Xinon', 'Tanet', 'Ultranon', 'Polywipe', 'Cryonus', 'Granus', 'Torponico', 
    'Cryogepha', 'Paragene', 'Mofrag', 'Cryonia', 'Oxyrion', 'Mosaurus', 'Skynoid', 'Bioroid'
  ]);
  this.text = "";
  this.canvas = canvas;
  this.canvas.width = 400;
  this.canvas.height = 700;
  this.context = this.canvas.getContext('2d');
  this.sectors = [];
  this.currentSector = [];
  this.canvas.addEventListener('mousemove', 
    function(e) {
      this.hoverSectors(e)
    }.bind(this)
    , false
  );
};

UniverseMap.prototype = {
  
  addSector: function(id, x, y, s) {
    this.sectors.push([id, x, y, s]);
    if (s === true)
      this.hash.insert(x, y, [id, x, y]);
  },

  addSectors: function(sectors) {
    for (var i = sectors.length - 1; i >= 0; i--) {
      var s = sectors[i];
      this.addSector(s.player_name || s.name, s.x, s.y, s.won);
    };
    this.draw();
  },

  showCurrentSector: function(sector) {
    this.currentSector = [ sector.name, sector.x, sector.y];
    this.draw();
  },

  sectorId: function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for( var i=0; i < 3; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  },

  removeSector: function(sector) {
    this.sectors = this.sectors.filter(function(e) { 
      return !(e[0] == sector[0] && e[1] == sector[1] && e[2] == sector[2]);
    });
    this.hash.idx = {};
    for (var i = this.sectors.length - 1; i >= 0; i--) {
      var s = this.sectors[i];
      this.hash.insert(s[1], s[2], [s[0], s[1], s[2]]);
    };
    this.draw();
  },

  toggleSector: function(evt) {
    var mousePos = this.getMousePos(evt);
    var possibleSectors = this.hash.query(mousePos.x, mousePos.y);
    for (var i = possibleSectors.length - 1; i >= 0; i--) {
      var s = possibleSectors[i];
      if (this.inFocus(mousePos.x, mousePos.y, s[1], s[2], 2, 2)) {
        this.removeSector(s);
        this.draw();
        console.log(this.sectors.length);
        return;
      }
    };
    this.addSector("", mousePos.x, mousePos.y);
    console.log(this.sectors.length);
  },

  hoverSectors: function(evt) {
    this.text = "";
    var mousePos = this.getMousePos(evt);
    var possibleSectors = this.hash.query(mousePos.x, mousePos.y);
    for (var i = possibleSectors.length - 1; i >= 0; i--) {
      var s = possibleSectors[i];
      if (this.inFocus(mousePos.x, mousePos.y, s[1] - 2, s[2] - 2 , 4, 4))
        this.text = s[0];
        $("#sectorName").html(this.text);
    };
  },

  inFocus: function(px, py, x, y, w, h) {
    return (
       (x <= px) &&
       (px <= x + w) &&
       (y <= py) &&
       (py <= y + h)
    );
  },

  getMousePos: function (evt) {
    var rect = this.canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  },

  clear: function() {
    this.context.fillStyle = "#001c00";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  },

  draw: function() {
    // this.clear();
    this.randomSpace();
    this.context.save();
    for (var i = this.sectors.length - 1; i >= 0; i--) {
      var s = this.sectors[i];
      if (s[3]) {
        this.context.fillStyle = "#F00";
        this.context.fillRect(s[1]-2, s[2]-2, 4, 4);  
      } else {
        this.context.fillStyle = "#FF0";
        this.context.fillRect(s[1], s[2], 1, 1);
      }
    };
    if (this.currentSector) {
      this.context.fillStyle = "#FF0";
      this.context.fillRect(this.currentSector[1]-2, this.currentSector[2]-2, 4, 4);
    }
    this.context.restore();
    this.context.save();
    this.context.fillStyle = "#FFF";
    this.context.font = 'bold 11px Arial';
    this.context.fillText(this.text, 20, 20);
    this.context.restore();
  },

  randomSpace: function() {
    var x = x || 0;
    var y = y || 0;
    var width = width || this.canvas.width;
    var height = height || this.canvas.height;
    var alpha = alpha || 255;
    var colors = [
      [0, 28, 0],
      [0, 255, 102],
      [153, 153, 153],
      [102, 255, 102],
      [153, 255, 102]
    ];
    var g = this.canvas.getContext("2d"),
      imageData = g.getImageData(x, y, width, height),
      random = Math.random,
      pixels = imageData.data,
      n = pixels.length,
      i = 0,
      c = colors[0];
    while (i < n) {
      var r = Math.random();
      if( r < 0.955)
        c = colors[0];
      else if (r < 0.97)
        c = colors[1];
      else if (r < 0.98)
        c = colors[2];
      else if (r < 0.99)
        c = colors[3];
      else if (r < 1)
        c = colors[4];
      pixels[i++] = c[0];
      pixels[i++] = c[1];
      pixels[i++] = c[2];
      pixels[i++] = alpha;
    }
    g.putImageData(imageData, x, y);
  }

};
window.uMap = new UniverseMap(document.getElementById("universeMap"));
