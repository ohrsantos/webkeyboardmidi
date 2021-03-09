var g_midiNoteIndex, g_equivMultiple, g_noteMidiOctave;

var pitchName = [ 'C', 'C#','D','D#','E','F','F#','G','G#','A','A#','B'];

const secondNote = 1;
var notesBuffer = notesBufferOff = notesBufferAfterOff = [];
var noteIndex = notesOffIdx = notesAfterOffIdx = 0;

function setExtThird() {
    var extThird = document.getElementById("extThird");
    console.log(extThird.checked);
}

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a,b) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

function sendNotes() {
    if ( (noteIndex > 2 ) && (noteIndex < 4 ) && (extThird.checked)) {
        notesBuffer.sort(dynamicSort("data"));
    //console.log('keys.js::notesBuffer:aftersort', notesBuffer);
        for (i = 0; i < noteIndex; i++)
            if ( i != secondNote )
            WebMidi.outputs[1].send(notesBuffer[i].data[0], notesBuffer[i].data.slice(1), 0);

        WebMidi.outputs[1].send( notesBuffer[secondNote].data[0],
                                 [ notesBuffer[secondNote].data[1] + 12,
                                   notesBuffer[secondNote].data[2]
                                 ],
                                 0
                               );
        notesBufferAfterOff[ notesBuffer[ secondNote].data[1] ]= [ notesBuffer[secondNote].data[0] - 16,
                                                                   notesBuffer[secondNote].data[1] + 12,
                                                                   notesBuffer[secondNote].data[2]
                                                                 ];
     } else
        for (i = 0; i < noteIndex; i++)
            WebMidi.outputs[1].send(notesBuffer[i].data[0], notesBuffer[i].data.slice(1), 0);

    noteIndex = 0;
}
function sendNotesOff() {
    //console.log('keys.js::notesBufferOff:', notesBuffer);
    for (i = 0; i < notesOffIdx; i++) {
        if (notesBufferOff[i].type == 'noteoff') {

            WebMidi.outputs[1].send(notesBufferOff[i].data[0], notesBufferOff[i].data.slice(1), 0);

            if (notesBufferAfterOff[ notesBufferOff[i].data[1] ]) {

                let tmpArray = notesBufferAfterOff[ notesBufferOff[i].data[1] ];

                WebMidi.outputs[1].send( tmpArray[0], 
                                         tmpArray.slice(1),
                                         0
                                       );
                notesBufferAfterOff = [];
            }
        }
    }
    notesOffIdx = 0;
}

WebMidi.enable(function (err) {
    if (err)
        console.log("WebMidi could not be enabled.", err);
    else {
        console.log("keys.js::WebMidi enabled!");
        console.log("keys.js::I/O:", WebMidi.inputs, WebMidi.outputs);
    }
    // Reacting when a new device becomes available
    WebMidi.addListener("connected", function(e) {});
    
    // Reacting when a device becomes unavailable
    WebMidi.addListener("disconnected", function(e) {});

    // Listen for a 'note on' message on all channels
    WebMidi.inputs[0].addListener( 'noteon',
                                   "all",
                                   function (e) {
                                       if(!noteIndex)
                                           window.setTimeout(sendNotes, 35);

                                       notesBuffer[noteIndex++] = e;
                                       console.log( e.timestamp.toFixed(1),
                                                    e.target._midiInput.id,
                                                    'nOn',
                                                    e.channel,
                                                    e.note.name.trim(),
                                                    e.note.octave,
                                                    e.rawVelocity
                                                  );
                                       //console.log(e);

                                   }
                                 );

    WebMidi.inputs[0].addListener( 'noteoff',
                                   "all",
                                   function (e) {
                                       notesBufferOff[notesOffIdx++] = e;
                                       sendNotesOff();
                                   }
                                 );
});


  // Display the current time
//console.log(WebMidi.time);

    // Set up synth
  

function rgb(r, g, b) {
  return "rgb(" + r + "," + g + "," + b + ")";
}

function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v; g = t; b = p;
      break;
    case 1:
      r = q; g = v; b = p;
      break;
    case 2:
      r = p; g = v; b = t;
      break;
    case 3:
      r = p; g = q; b = v;
      break;
    case 4:
      r = t; g = p; b = v;
      break;
    case 5:
      r = v; g = p; b = q;
      break;
  }
  return rgb(Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255));
}

function HSVtoRGB2(h, s, v) {
  var r, g, b, i, f, p, q, t;
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v; g = t; b = p;
      break;
    case 1:
      r = q; g = v; b = p;
      break;
    case 2:
      r = p; g = v; b = t;
      break;
    case 3:
      r = p; g = q; b = v;
      break;
    case 4:
      r = t; g = p; b = v;
      break;
    case 5:
      r = v; g = p; b = q;
      break;
  }

  return {
    red: Math.floor(r * 255),
    green: Math.floor(g * 255),
    blue: Math.floor(b * 255)
  };
}

function sendMidiNoteOn(cents) {
    
     if (WebMidi.enabled) { 
        pitchBend = ((cents - g_equivMultiple * 1200 )  - 100 * g_midiNoteIndex) * 0.005 ;
        g_noteMidiOctave = g_equivMultiple + 4;
        WebMidi.outputs[0].playNote(`${pitchName[g_midiNoteIndex]}${g_noteMidiOctave}`,
                                    g_midiNoteIndex + 1, { velocity: 1}).sendPitchBend(pitchBend, g_midiNoteIndex + 1) ;
     }
}

function sendMidiNoteOff() {
     if (WebMidi.enabled) {    
        WebMidi.outputs[0].stopNote(`${pitchName[g_midiNoteIndex]}${g_noteMidiOctave}`, g_midiNoteIndex + 1, { velocity: 1});
     }
}



function tempAlert(msg, duration) {
  var el = document.createElement("div");
  el.setAttribute("style", "position:absolute;top:40%;left:20%;background-color:white; font-size:25px;");
  el.innerHTML = msg;
  setTimeout(function() {
    el.parentNode.removeChild(el);
  }, duration);
  document.body.appendChild(el);
}


function nameToHex(colour) {
  var colours = {
    "aliceblue": "#f0f8ff",
    "antiquewhite": "#faebd7",
    "aqua": "#00ffff",
    "aquamarine": "#7fffd4",
    "azure": "#f0ffff",
    "beige": "#f5f5dc",
    "bisque": "#ffe4c4",
    "black": "#000000",
    "blanchedalmond": "#ffebcd",
    "blue": "#0000ff",
    "blueviolet": "#8a2be2",
    "brown": "#a52a2a",
    "burlywood": "#deb887",
    "cadetblue": "#5f9ea0",
    "chartreuse": "#7fff00",
    "chocolate": "#d2691e",
    "coral": "#ff7f50",
    "cornflowerblue": "#6495ed",
    "cornsilk": "#fff8dc",
    "crimson": "#dc143c",
    "cyan": "#00ffff",
    "darkblue": "#00008b",
    "darkcyan": "#008b8b",
    "darkgoldenrod": "#b8860b",
    "darkgray": "#a9a9a9",
    "darkgreen": "#006400",
    "darkkhaki": "#bdb76b",
    "darkmagenta": "#8b008b",
    "darkolivegreen": "#556b2f",
    "darkorange": "#ff8c00",
    "darkorchid": "#9932cc",
    "darkred": "#8b0000",
    "darksalmon": "#e9967a",
    "darkseagreen": "#8fbc8f",
    "darkslateblue": "#483d8b",
    "darkslategray": "#2f4f4f",
    "darkturquoise": "#00ced1",
    "darkviolet": "#9400d3",
    "deeppink": "#ff1493",
    "deepskyblue": "#00bfff",
    "dimgray": "#696969",
    "dodgerblue": "#1e90ff",
    "firebrick": "#b22222",
    "floralwhite": "#fffaf0",
    "forestgreen": "#228b22",
    "fuchsia": "#ff00ff",
    "gainsboro": "#dcdcdc",
    "ghostwhite": "#f8f8ff",
    "gold": "#ffd700",
    "goldenrod": "#daa520",
    "gray": "#808080",
    "green": "#008000",
    "greenyellow": "#adff2f",
    "honeydew": "#f0fff0",
    "hotpink": "#ff69b4",
    "indianred": "#cd5c5c",
    "indigo": "#4b0082",
    "ivory": "#fffff0",
    "khaki": "#f0e68c",
    "lavender": "#e6e6fa",
    "lavenderblush": "#fff0f5",
    "lawngreen": "#7cfc00",
    "lemonchiffon": "#fffacd",
    "lightblue": "#add8e6",
    "lightcoral": "#f08080",
    "lightcyan": "#e0ffff",
    "lightgoldenrodyellow": "#fafad2",
    "lightgrey": "#d3d3d3",
    "lightgreen": "#90ee90",
    "lightpink": "#ffb6c1",
    "lightsalmon": "#ffa07a",
    "lightseagreen": "#20b2aa",
    "lightskyblue": "#87cefa",
    "lightslategray": "#778899",
    "lightsteelblue": "#b0c4de",
    "lightyellow": "#ffffe0",
    "lime": "#00ff00",
    "limegreen": "#32cd32",
    "linen": "#faf0e6",
    "magenta": "#ff00ff",
    "maroon": "#800000",
    "mediumaquamarine": "#66cdaa",
    "mediumblue": "#0000cd",
    "mediumorchid": "#ba55d3",
    "mediumpurple": "#9370d8",
    "mediumseagreen": "#3cb371",
    "mediumslateblue": "#7b68ee",
    "mediumspringgreen": "#00fa9a",
    "mediumturquoise": "#48d1cc",
    "mediumvioletred": "#c71585",
    "midnightblue": "#191970",
    "mintcream": "#f5fffa",
    "mistyrose": "#ffe4e1",
    "moccasin": "#ffe4b5",
    "navajowhite": "#ffdead",
    "navy": "#000080",
    "oldlace": "#fdf5e6",
    "olive": "#808000",
    "olivedrab": "#6b8e23",
    "orange": "#ffa500",
    "orangered": "#ff4500",
    "orchid": "#da70d6",
    "palegoldenrod": "#eee8aa",
    "palegreen": "#98fb98",
    "paleturquoise": "#afeeee",
    "palevioletred": "#d87093",
    "papayawhip": "#ffefd5",
    "peachpuff": "#ffdab9",
    "peru": "#cd853f",
    "pink": "#ffc0cb",
    "plum": "#dda0dd",
    "powderblue": "#b0e0e6",
    "purple": "#800080",
    "red": "#ff0000",
    "rosybrown": "#bc8f8f",
    "royalblue": "#4169e1",
    "saddlebrown": "#8b4513",
    "salmon": "#fa8072",
    "sandybrown": "#f4a460",
    "seagreen": "#2e8b57",
    "seashell": "#fff5ee",
    "sienna": "#a0522d",
    "silver": "#c0c0c0",
    "skyblue": "#87ceeb",
    "slateblue": "#6a5acd",
    "slategray": "#708090",
    "snow": "#fffafa",
    "springgreen": "#00ff7f",
    "steelblue": "#4682b4",
    "tan": "#d2b48c",
    "teal": "#008080",
    "thistle": "#d8bfd8",
    "tomato": "#ff6347",
    "turquoise": "#40e0d0",
    "violet": "#ee82ee",
    "wheat": "#f5deb3",
    "white": "#ffffff",
    "whitesmoke": "#f5f5f5",
    "yellow": "#ffff00",
    "yellowgreen": "#9acd32"
  };

  if (typeof colours[colour.toLowerCase()] != 'undefined') {
    return colours[colour.toLowerCase()];
  } else if (colour.indexOf("#") == 0) {
    return colour;
  } else if (colour.length == 6 && colour.indexOf("#") == -1) {
    return "#" + colour;
  }


  return "#EDEDE4"; //default button color!

}

function hex2rgb(col) {
  var r, g, b;
  if (col.charAt(0) == '#') {
    col = col.substr(1);
  }
  r = col.charAt(0) + col.charAt(1);
  g = col.charAt(2) + col.charAt(3);
  b = col.charAt(4) + col.charAt(5);
  r = parseInt(r, 16);
  g = parseInt(g, 16);
  b = parseInt(b, 16);
  return [r, g, b];
}

function rgb2hsv(r1, g1, b1) {
  var rr, gg, bb,
    r = arguments[0] / 255,
    g = arguments[1] / 255,
    b = arguments[2] / 255,
    h, s,
    v = Math.max(r, g, b),
    diff = v - Math.min(r, g, b),
    diffc = function(c) {
      return (v - c) / 6 / diff + 1 / 2;
    };

  if (diff == 0) {
    h = s = 0;
  } else {
    s = diff / v;
    rr = diffc(r);
    gg = diffc(g);
    bb = diffc(b);

    if (r === v) {
      h = bb - gg;
    } else if (g === v) {
      h = (1 / 3) + rr - bb;
    } else if (b === v) {
      h = (2 / 3) + gg - rr;
    }
    if (h < 0) {
      h += 1;
    } else if (h > 1) {
      h -= 1;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
}

function getContrastYIQ(hexcolor) {
  hexcolor = hexcolor.replace("#", "");
  var r = parseInt(hexcolor.substr(0, 2), 16);
  var g = parseInt(hexcolor.substr(2, 2), 16);
  var b = parseInt(hexcolor.substr(4, 2), 16);
  var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
