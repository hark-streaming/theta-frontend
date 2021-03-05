export default(context, inject) => {
    // manually add the script to the DOM
    const script = document.createElement('script')
    script.src = 'https://example.com/tracker.js'
    document.getElementsByTagName('head')[0].appendChild(script)
  
    // call whatever js the external script needs.
    console.log("TEST MAN OH YEAH");
    inject('hello', msg => console.log(msg));
  }