export default ({ app }) => {

    // if (process.browser) {
    //     // manually add the scripts to the DOM
    //     const script1 = document.createElement('script')
    //     script1.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest'
    //     document.body.appendChild(script1);

    //     const script2 = document.createElement('script')
    //     script2.src = '/js/theta.js'
    //     document.body.appendChild(script2);
        
    //     const script3 = document.createElement('script')
    //     script3.src = '/js/theta-hls-plugin.js'
    //     document.body.appendChild(script3);

    //     const script4 = document.createElement('script')
    //     script4.src = '/js/videojs-theta-plugin.js'
    //     document.body.appendChild(script4);

    //     console.log("HELLO I AM A PLUGIN MADE BY KEVIN");
    // }

    if (process.browser) {
            // const script0 = document.createElement("script");
            // script0.src = "https://vjs.zencdn.net/7.10.2/video.min.js";
            // document.head.appendChild(script0);

            // const script1 = document.createElement("script");
            // script1.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
            // document.head.appendChild(script1);

            const script2 = document.createElement("script");
            script2.src =
                "https://d1ktbyo67sh8fw.cloudfront.net/js/theta.umd.min.js";
            document.head.appendChild(script2);

            const script3 = document.createElement("script");
            script3.src =
                "https://d1ktbyo67sh8fw.cloudfront.net/js/theta-hls-plugin.umd.min.js";
            document.head.appendChild(script3);

            const script4 = document.createElement("script");
            script4.src =
                "https://d1ktbyo67sh8fw.cloudfront.net/js/videojs-theta-plugin.min.js";
            document.head.appendChild(script4);

            console.log("HELLO THIS IS A THETA PLUGIN KEVIN");
    }

}