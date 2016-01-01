chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    'minWidth': 960,
    'minHeight': 500,
    'bounds': {
      'width': 1200,
      'height': 655
    }
  });
});
