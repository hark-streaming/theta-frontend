// ----
// THIS SCRIPT IS NO LONGER USED, USE thetaplayer.js PLUGIN INSTEAD
// ----

// taken from https://medium.com/@asimmittal/sequential-script-loading-in-javascript-a0b77ca9467c
    
(function(){
  
    //three JS files that need to be loaded one after the other
    var libs = [
        "https://vjs.zencdn.net/7.10.2/video.min.js",
        "https://cdn.jsdelivr.net/npm/hls.js@latest",
        "https://d1ktbyo67sh8fw.cloudfront.net/js/theta.umd.min.js",
        "https://d1ktbyo67sh8fw.cloudfront.net/js/theta-hls-plugin.umd.min.js",
        "https://d1ktbyo67sh8fw.cloudfront.net/js/videojs-theta-plugin.min.js",
    ];
    
    var injectLibFromStack = function(){
        if(libs.length > 0){
          
          //grab the next item on the stack
          var nextLib = libs.shift();
          var headTag = document.getElementsByTagName('head')[0];
          
          //create a script tag with this library
          var scriptTag = document.createElement('script');
          scriptTag.src = nextLib;
          
          //when successful, inject the next script
          scriptTag.onload = function(e){
            console.log("---> loaded: " + e.target.src);
            injectLibFromStack();
          };    
          
          //append the script tag to the <head></head>
          headTag.appendChild(scriptTag);
          console.log("injecting: " + nextLib);
        }
        else return;
    }
    
    //start script injection
    injectLibFromStack();
  })();