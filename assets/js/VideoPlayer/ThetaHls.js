import videojs from 'video.js';

function examplePlugin(options) {

    if (options.customClass) {
      this.addClass(options.customClass);
    }
  
    this.on('playing', function() {
      videojs.log('playback began!');
    });
}

videojs.registerPlugin('examplePlugin', examplePlugin);