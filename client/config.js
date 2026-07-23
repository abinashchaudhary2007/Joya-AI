const CONFIG = {
    API_URL: (window.location.origin && window.location.origin !== 'null' && !window.location.protocol.startsWith('file'))
        ? window.location.origin
        : "http://localhost:5000"
};